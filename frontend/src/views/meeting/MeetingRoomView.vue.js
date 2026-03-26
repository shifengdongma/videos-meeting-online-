import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { createVote, fetchVotes, submitVote } from '../../api/votes';
import MediaTile from '../../components/media/MediaTile.vue';
import VotePanel from '../../components/meeting/VotePanel.vue';
import { useAuthStore } from '../../stores/auth';
import { WsClient } from '../../utils/ws';
const route = useRoute();
const authStore = useAuthStore();
const meetingId = Number(route.params.id);
const wsClient = new WsClient();
const peerConnections = new Map();
const remoteStreams = ref([]);
const localStream = ref(null);
const screenStream = ref(null);
const localVideoRef = ref(null);
const screenVideoRef = ref(null);
const showVoteDialog = ref(false);
const submitted = ref(false);
const votes = ref([]);
const voteResults = ref([]);
const voteForm = reactive({
    topic: '',
    options: [{ content: '赞成' }, { content: '反对' }, { content: '弃权' }]
});
const canStartVote = computed(() => ['admin', 'host'].includes(authStore.role));
const activeVote = computed(() => votes.value[0] || null);
const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`;
const setVideoStream = (el, stream) => {
    if (el)
        el.srcObject = stream;
};
const addStreamToPeers = (stream) => {
    peerConnections.forEach((pc) => {
        const senderTrackIds = new Set(pc.getSenders().map((sender) => sender.track?.id).filter(Boolean));
        stream.getTracks().forEach((track) => {
            if (!senderTrackIds.has(track.id)) {
                pc.addTrack(track, stream);
            }
        });
    });
};
const removeStreamFromPeers = (stream) => {
    if (!stream)
        return;
    const trackIds = new Set(stream.getTracks().map((track) => track.id));
    peerConnections.forEach((pc) => {
        pc.getSenders()
            .filter((sender) => sender.track && trackIds.has(sender.track.id))
            .forEach((sender) => pc.removeTrack(sender));
    });
};
const cleanupStream = (streamRef, videoRef) => {
    removeStreamFromPeers(streamRef.value);
    streamRef.value?.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
    });
    streamRef.value = null;
    setVideoStream(videoRef.value, null);
};
const resetVoteState = () => {
    submitted.value = false;
    voteResults.value = [];
};
const syncVoteState = (vote) => {
    submitted.value = !!vote?.submitted;
    voteResults.value = vote?.results ?? [];
};
const upsertVote = (vote) => {
    votes.value = [vote, ...votes.value.filter((item) => item.id !== vote.id)];
};
const createPeerConnection = (peerId) => {
    if (peerConnections.has(peerId))
        return peerConnections.get(peerId);
    const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    localStream.value?.getTracks().forEach((track) => pc.addTrack(track, localStream.value));
    screenStream.value?.getTracks().forEach((track) => pc.addTrack(track, screenStream.value));
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            wsClient.send({ type: 'ice-candidate', from: selfId, to: peerId, candidate: event.candidate });
        }
    };
    pc.ontrack = (event) => {
        const [stream] = event.streams;
        const exists = remoteStreams.value.find((item) => item.id === peerId);
        if (!exists) {
            remoteStreams.value.push({ id: peerId, mediaStream: stream });
        }
    };
    peerConnections.set(peerId, pc);
    return pc;
};
const bindRemoteVideo = (el, stream) => {
    setVideoStream(el, stream);
};
const stopCamera = () => {
    cleanupStream(localStream, localVideoRef);
};
const stopScreenShare = () => {
    cleanupStream(screenStream, screenVideoRef);
};
const openCamera = async () => {
    if (localStream.value)
        return;
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setVideoStream(localVideoRef.value, localStream.value);
    addStreamToPeers(localStream.value);
    ElMessage.success('已打开摄像头和麦克风');
};
const shareScreen = async () => {
    if (screenStream.value)
        return;
    screenStream.value = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const [screenTrack] = screenStream.value.getVideoTracks();
    if (screenTrack) {
        screenTrack.onended = () => {
            stopScreenShare();
        };
    }
    setVideoStream(screenVideoRef.value, screenStream.value);
    addStreamToPeers(screenStream.value);
    ElMessage.success('已开启桌面共享');
};
const toggleCamera = async () => {
    if (localStream.value) {
        stopCamera();
        ElMessage.success('已关闭摄像头和麦克风');
        return;
    }
    await openCamera();
};
const toggleScreenShare = async () => {
    if (screenStream.value) {
        stopScreenShare();
        ElMessage.success('已停止桌面共享');
        return;
    }
    await shareScreen();
};
const handleSignalMessage = async (raw) => {
    const payload = JSON.parse(raw.data);
    if (payload.from === selfId)
        return;
    if (payload.type === 'join') {
        const pc = createPeerConnection(payload.from);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsClient.send({ type: 'offer', from: selfId, to: payload.from, sdp: offer });
    }
    if (payload.to !== selfId) {
        if (payload.type === 'vote-started') {
            upsertVote(payload.vote);
        }
        if (payload.type === 'vote-result' && activeVote.value?.id === payload.voteId) {
            voteResults.value = payload.options;
        }
        return;
    }
    if (payload.type === 'offer') {
        const pc = createPeerConnection(payload.from);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsClient.send({ type: 'answer', from: selfId, to: payload.from, sdp: answer });
    }
    if (payload.type === 'answer') {
        const pc = createPeerConnection(payload.from);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    }
    if (payload.type === 'ice-candidate') {
        const pc = createPeerConnection(payload.from);
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
    }
};
const connectRoom = () => {
    wsClient.connect(`ws://127.0.0.1:8001/ws/meetings/${meetingId}`, handleSignalMessage);
    setTimeout(() => wsClient.send({ type: 'join', from: selfId }), 300);
};
const loadVotes = async () => {
    votes.value = await fetchVotes(meetingId);
};
watch(activeVote, (vote) => {
    syncVoteState(vote);
}, { immediate: true });
const startVote = async () => {
    await createVote({
        meeting_id: meetingId,
        topic: voteForm.topic,
        options: voteForm.options
    });
    showVoteDialog.value = false;
    voteForm.topic = '';
    resetVoteState();
    ElMessage.success('表决已发起');
};
const handleVoteSubmit = async (optionId) => {
    if (!activeVote.value)
        return;
    const voteId = activeVote.value.id;
    const result = await submitVote(voteId, optionId);
    if (activeVote.value?.id === voteId) {
        voteResults.value = result.options;
        submitted.value = true;
        const currentVote = activeVote.value;
        if (currentVote) {
            currentVote.submitted = true;
            currentVote.results = result.options;
        }
    }
    ElMessage.success('投票成功');
};
onMounted(async () => {
    await loadVotes();
    connectRoom();
});
onBeforeUnmount(() => {
    stopCamera();
    stopScreenShare();
    wsClient.close();
    peerConnections.forEach((pc) => pc.close());
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['room-head']} */ ;
/** @type {__VLS_StyleScopedClasses['room-head']} */ ;
/** @type {__VLS_StyleScopedClasses['room-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['room-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['video-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['media-tile-main']} */ ;
/** @type {__VLS_StyleScopedClasses['room-head']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-page app-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.meetingId);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-summary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-value" },
});
(__VLS_ctx.localStream ? '已接入' : '未开启');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-value" },
});
(__VLS_ctx.screenStream ? '共享中' : '未共享');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-value" },
});
(__VLS_ctx.remoteStreams.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "media-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "video-grid" },
});
/** @type {[typeof MediaTile, typeof MediaTile, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
    ...{ class: "media-tile-main" },
    title: "本地画面",
    subtitle: "摄像头与麦克风",
    empty: (!__VLS_ctx.localStream),
    emptyText: "尚未开启本地设备",
}));
const __VLS_1 = __VLS_0({
    ...{ class: "media-tile-main" },
    title: "本地画面",
    subtitle: "摄像头与麦克风",
    empty: (!__VLS_ctx.localStream),
    emptyText: "尚未开启本地设备",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
    ref: "localVideoRef",
    autoplay: true,
    muted: true,
    playsinline: true,
});
/** @type {typeof __VLS_ctx.localVideoRef} */ ;
var __VLS_2;
/** @type {[typeof MediaTile, typeof MediaTile, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
    ...{ class: "media-tile-main" },
    title: "桌面共享",
    subtitle: "屏幕内容同步",
    empty: (!__VLS_ctx.screenStream),
    emptyText: "尚未开启桌面共享",
    icon: "◌",
}));
const __VLS_4 = __VLS_3({
    ...{ class: "media-tile-main" },
    title: "桌面共享",
    subtitle: "屏幕内容同步",
    empty: (!__VLS_ctx.screenStream),
    emptyText: "尚未开启桌面共享",
    icon: "◌",
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_5.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
    ref: "screenVideoRef",
    autoplay: true,
    muted: true,
    playsinline: true,
});
/** @type {typeof __VLS_ctx.screenVideoRef} */ ;
var __VLS_5;
for (const [stream] of __VLS_getVForSourceType((__VLS_ctx.remoteStreams))) {
    /** @type {[typeof MediaTile, typeof MediaTile, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
        key: (stream.id),
        title: (`远端成员 ${stream.id.slice(-4)}`),
        subtitle: "实时参会流",
    }));
    const __VLS_7 = __VLS_6({
        key: (stream.id),
        title: (`远端成员 ${stream.id.slice(-4)}`),
        subtitle: "实时参会流",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_8.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        autoplay: true,
        playsinline: true,
        ref: ((el) => __VLS_ctx.bindRemoteVideo(el, stream.mediaStream)),
    });
    var __VLS_8;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "floating-toolbar" },
});
const __VLS_9 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_11 = __VLS_10({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onClick: (__VLS_ctx.toggleCamera)
};
__VLS_12.slots.default;
(__VLS_ctx.localStream ? '关闭摄像头/麦克风' : '打开摄像头/麦克风');
var __VLS_12;
const __VLS_17 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ 'onClick': {} },
}));
const __VLS_19 = __VLS_18({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
let __VLS_21;
let __VLS_22;
let __VLS_23;
const __VLS_24 = {
    onClick: (__VLS_ctx.toggleScreenShare)
};
__VLS_20.slots.default;
(__VLS_ctx.screenStream ? '停止桌面共享' : '桌面共享');
var __VLS_20;
if (__VLS_ctx.canStartVote) {
    const __VLS_25 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        ...{ 'onClick': {} },
    }));
    const __VLS_27 = __VLS_26({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_29;
    let __VLS_30;
    let __VLS_31;
    const __VLS_32 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canStartVote))
                return;
            __VLS_ctx.showVoteDialog = true;
        }
    };
    __VLS_28.slots.default;
    var __VLS_28;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "side-section" },
});
/** @type {[typeof VotePanel, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(VotePanel, new VotePanel({
    ...{ 'onSubmit': {} },
    activeVote: (__VLS_ctx.activeVote),
    results: (__VLS_ctx.voteResults),
    submitted: (__VLS_ctx.submitted),
}));
const __VLS_34 = __VLS_33({
    ...{ 'onSubmit': {} },
    activeVote: (__VLS_ctx.activeVote),
    results: (__VLS_ctx.voteResults),
    submitted: (__VLS_ctx.submitted),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onSubmit: (__VLS_ctx.handleVoteSubmit)
};
var __VLS_35;
const __VLS_40 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.showVoteDialog),
    title: "发起表决",
    width: "560px",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.showVoteDialog),
    title: "发起表决",
    width: "560px",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    labelWidth: "90px",
    ...{ class: "dialog-form" },
}));
const __VLS_46 = __VLS_45({
    labelWidth: "90px",
    ...{ class: "dialog-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "主题",
}));
const __VLS_50 = __VLS_49({
    label: "主题",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.voteForm.topic),
    placeholder: "请输入表决主题",
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.voteForm.topic),
    placeholder: "请输入表决主题",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
const __VLS_56 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "选项",
}));
const __VLS_58 = __VLS_57({
    label: "选项",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElSpace;
/** @type {[typeof __VLS_components.ElSpace, typeof __VLS_components.elSpace, typeof __VLS_components.ElSpace, typeof __VLS_components.elSpace, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    direction: "vertical",
    ...{ style: {} },
}));
const __VLS_62 = __VLS_61({
    direction: "vertical",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.voteForm.options))) {
    const __VLS_64 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        key: (index),
        modelValue: (item.content),
    }));
    const __VLS_66 = __VLS_65({
        key: (index),
        modelValue: (item.content),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
}
var __VLS_63;
var __VLS_59;
var __VLS_47;
{
    const { footer: __VLS_thisSlot } = __VLS_43.slots;
    const __VLS_68 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showVoteDialog = false;
        }
    };
    __VLS_71.slots.default;
    var __VLS_71;
    const __VLS_76 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        onClick: (__VLS_ctx.startVote)
    };
    __VLS_79.slots.default;
    var __VLS_79;
}
var __VLS_43;
/** @type {__VLS_StyleScopedClasses['room-page']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
/** @type {__VLS_StyleScopedClasses['room-head']} */ ;
/** @type {__VLS_StyleScopedClasses['room-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['room-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['room-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['media-section']} */ ;
/** @type {__VLS_StyleScopedClasses['video-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['media-tile-main']} */ ;
/** @type {__VLS_StyleScopedClasses['media-tile-main']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['side-section']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-form']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MediaTile: MediaTile,
            VotePanel: VotePanel,
            meetingId: meetingId,
            remoteStreams: remoteStreams,
            localStream: localStream,
            screenStream: screenStream,
            localVideoRef: localVideoRef,
            screenVideoRef: screenVideoRef,
            showVoteDialog: showVoteDialog,
            submitted: submitted,
            voteResults: voteResults,
            voteForm: voteForm,
            canStartVote: canStartVote,
            activeVote: activeVote,
            bindRemoteVideo: bindRemoteVideo,
            toggleCamera: toggleCamera,
            toggleScreenShare: toggleScreenShare,
            startVote: startVote,
            handleVoteSubmit: handleVoteSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
