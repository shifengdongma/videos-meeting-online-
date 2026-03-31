import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { createVote, endVote, fetchVotes, submitVote } from '../../api/votes';
import MediaTile from '../../components/media/MediaTile.vue';
import VotePanel from '../../components/meeting/VotePanel.vue';
import RoomControlBar from '../../components/room/RoomControlBar.vue';
import { useAuthStore } from '../../stores/auth';
import { WsClient } from '../../utils/ws';
const route = useRoute();
const authStore = useAuthStore();
const meetingId = Number(route.params.id);
const roomCode = route.query.code || 'N/A';
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
const onlineUsers = ref([]);
const roomControlBarRef = ref(null);
const activeSidePanel = ref(null);
const canStartVote = computed(() => ['admin', 'host'].includes(authStore.role));
const canEndVote = computed(() => canStartVote.value && activeVote.value?.status === 'voting');
const activeVote = computed(() => votes.value[0] || null);
const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`;
const selfName = authStore.user?.username || '匿名用户';
const getUserDisplayName = (connId) => {
    const user = onlineUsers.value.find(u => u.id === connId);
    return user?.display_name || `远端成员 ${connId.slice(-4)}`;
};
const isHandRaised = (connId) => {
    const user = onlineUsers.value.find(u => u.id === connId);
    return user?.hand_raised || false;
};
const setVideoStream = (el, stream) => {
    if (el)
        el.srcObject = stream;
};
const checkMediaDevices = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        ElMessage.error('摄像头/麦克风不可用：请使用 HTTPS 或 localhost 访问');
        return false;
    }
    return true;
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
    if (!checkMediaDevices())
        return;
    try {
        localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setVideoStream(localVideoRef.value, localStream.value);
        addStreamToPeers(localStream.value);
        ElMessage.success('已打开摄像头和麦克风');
    }
    catch (error) {
        console.error('Failed to access camera/microphone:', error);
        ElMessage.error('无法访问摄像头或麦克风，请检查权限设置');
    }
};
const shareScreen = async () => {
    if (screenStream.value)
        return;
    if (!checkMediaDevices())
        return;
    try {
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
    }
    catch (error) {
        console.error('Failed to share screen:', error);
        ElMessage.error('无法开启屏幕共享，请检查权限设置');
    }
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
    // Handle user management messages
    if (payload.type === 'user-list') {
        onlineUsers.value = payload.users || [];
        return;
    }
    if (payload.type === 'user-joined') {
        const exists = onlineUsers.value.find(u => u.id === payload.from);
        if (!exists) {
            onlineUsers.value.push({
                id: payload.from,
                user_id: payload.user_id,
                display_name: payload.display_name,
                role: payload.role,
                hand_raised: false
            });
        }
        return;
    }
    if (payload.type === 'user-left') {
        onlineUsers.value = onlineUsers.value.filter(u => u.id !== payload.from);
        // Remove remote stream
        remoteStreams.value = remoteStreams.value.filter(s => s.id !== payload.from);
        // Close peer connection
        const pc = peerConnections.get(payload.from);
        if (pc) {
            pc.close();
            peerConnections.delete(payload.from);
        }
        return;
    }
    if (payload.type === 'raise-hand') {
        const user = onlineUsers.value.find(u => u.id === payload.from);
        if (user) {
            user.hand_raised = true;
        }
        return;
    }
    if (payload.type === 'lower-hand') {
        const user = onlineUsers.value.find(u => u.id === payload.from);
        if (user) {
            user.hand_raised = false;
        }
        return;
    }
    // WebRTC signaling
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
        if (payload.type === 'vote-ended' && activeVote.value?.id === payload.voteId) {
            const currentVote = activeVote.value;
            if (currentVote) {
                currentVote.status = 'ended';
                currentVote.results = payload.results;
            }
            voteResults.value = payload.results;
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
const connectRoom = async () => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    await wsClient.connect(`${wsProtocol}//${window.location.host}/ws/meetings/${meetingId}`, handleSignalMessage);
    // Send join with user metadata
    wsClient.send({
        type: 'join',
        from: selfId,
        user_id: authStore.user?.id || 0,
        display_name: selfName,
        role: authStore.role || 'user'
    });
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
const handleEndVote = async () => {
    if (!activeVote.value)
        return;
    const voteId = activeVote.value.id;
    const result = await endVote(voteId);
    if (activeVote.value?.id === voteId) {
        const currentVote = activeVote.value;
        if (currentVote) {
            currentVote.status = 'ended';
            currentVote.results = result.results;
        }
        voteResults.value = result.results;
    }
    ElMessage.success('表决已结束');
};
const handlePanelChange = (panel) => {
    if (panel) {
        activeSidePanel.value = panel;
    }
    else {
        activeSidePanel.value = null;
    }
};
const handleRaiseHandChange = (raised) => {
    // Update local user state
    const localUser = onlineUsers.value.find(u => u.id === selfId);
    if (localUser) {
        localUser.hand_raised = raised;
    }
};
const handleCleanup = () => {
    stopCamera();
    stopScreenShare();
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
    ...{ class: "room-page app-page with-control-bar" },
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
    ...{ class: "room-code-display" },
});
const __VLS_0 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    type: "info",
    size: "large",
}));
const __VLS_2 = __VLS_1({
    type: "info",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
(__VLS_ctx.roomCode);
var __VLS_3;
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
(__VLS_ctx.onlineUsers.length);
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
const __VLS_4 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
    ...{ class: "media-tile-main" },
    title: "本地画面",
    subtitle: "摄像头与麦克风",
    empty: (!__VLS_ctx.localStream),
    emptyText: "尚未开启本地设备",
}));
const __VLS_5 = __VLS_4({
    ...{ class: "media-tile-main" },
    title: "本地画面",
    subtitle: "摄像头与麦克风",
    empty: (!__VLS_ctx.localStream),
    emptyText: "尚未开启本地设备",
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_6.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
    ref: "localVideoRef",
    autoplay: true,
    muted: true,
    playsinline: true,
});
/** @type {typeof __VLS_ctx.localVideoRef} */ ;
var __VLS_6;
/** @type {[typeof MediaTile, typeof MediaTile, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
    ...{ class: "media-tile-main" },
    title: "桌面共享",
    subtitle: "屏幕内容同步",
    empty: (!__VLS_ctx.screenStream),
    emptyText: "尚未开启桌面共享",
    icon: "◌",
}));
const __VLS_8 = __VLS_7({
    ...{ class: "media-tile-main" },
    title: "桌面共享",
    subtitle: "屏幕内容同步",
    empty: (!__VLS_ctx.screenStream),
    emptyText: "尚未开启桌面共享",
    icon: "◌",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_9.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
    ref: "screenVideoRef",
    autoplay: true,
    muted: true,
    playsinline: true,
});
/** @type {typeof __VLS_ctx.screenVideoRef} */ ;
var __VLS_9;
for (const [stream] of __VLS_getVForSourceType((__VLS_ctx.remoteStreams))) {
    /** @type {[typeof MediaTile, typeof MediaTile, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
        key: (stream.id),
        title: (__VLS_ctx.getUserDisplayName(stream.id)),
        subtitle: "实时参会流",
    }));
    const __VLS_11 = __VLS_10({
        key: (stream.id),
        title: (__VLS_ctx.getUserDisplayName(stream.id)),
        subtitle: "实时参会流",
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_12.slots.default;
    {
        const { 'header-extra': __VLS_thisSlot } = __VLS_12.slots;
        if (__VLS_ctx.isHandRaised(stream.id)) {
            const __VLS_13 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
                type: "warning",
                size: "small",
                ...{ class: "raised-hand-tag" },
            }));
            const __VLS_15 = __VLS_14({
                type: "warning",
                size: "small",
                ...{ class: "raised-hand-tag" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            __VLS_16.slots.default;
            var __VLS_16;
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        autoplay: true,
        playsinline: true,
        ref: ((el) => __VLS_ctx.bindRemoteVideo(el, stream.mediaStream)),
    });
    var __VLS_12;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "media-toolbar" },
});
const __VLS_17 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_19 = __VLS_18({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
let __VLS_21;
let __VLS_22;
let __VLS_23;
const __VLS_24 = {
    onClick: (__VLS_ctx.toggleCamera)
};
__VLS_20.slots.default;
(__VLS_ctx.localStream ? '关闭摄像头/麦克风' : '打开摄像头/麦克风');
var __VLS_20;
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
    onClick: (__VLS_ctx.toggleScreenShare)
};
__VLS_28.slots.default;
(__VLS_ctx.screenStream ? '停止桌面共享' : '桌面共享');
var __VLS_28;
if (__VLS_ctx.canStartVote) {
    const __VLS_33 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        ...{ 'onClick': {} },
        type: "success",
    }));
    const __VLS_35 = __VLS_34({
        ...{ 'onClick': {} },
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    let __VLS_37;
    let __VLS_38;
    let __VLS_39;
    const __VLS_40 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canStartVote))
                return;
            __VLS_ctx.showVoteDialog = true;
        }
    };
    __VLS_36.slots.default;
    var __VLS_36;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "side-section" },
});
if (__VLS_ctx.activeSidePanel !== 'vote') {
    const __VLS_41 = {}.ElTabs;
    /** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        modelValue: (__VLS_ctx.activeSidePanel),
        ...{ class: "side-tabs" },
    }));
    const __VLS_43 = __VLS_42({
        modelValue: (__VLS_ctx.activeSidePanel),
        ...{ class: "side-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    const __VLS_45 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        label: "聊天",
        name: "chat",
    }));
    const __VLS_47 = __VLS_46({
        label: "聊天",
        name: "chat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    const __VLS_49 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        description: "聊天功能开发中...",
    }));
    const __VLS_51 = __VLS_50({
        description: "聊天功能开发中...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    var __VLS_48;
    const __VLS_53 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        label: "文档",
        name: "doc",
    }));
    const __VLS_55 = __VLS_54({
        label: "文档",
        name: "doc",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    __VLS_56.slots.default;
    const __VLS_57 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        description: "文档功能开发中...",
    }));
    const __VLS_59 = __VLS_58({
        description: "文档功能开发中...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    var __VLS_56;
    const __VLS_61 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        label: "会议纪要",
        name: "minutes",
    }));
    const __VLS_63 = __VLS_62({
        label: "会议纪要",
        name: "minutes",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_64.slots.default;
    const __VLS_65 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        description: "会议纪要功能开发中...",
    }));
    const __VLS_67 = __VLS_66({
        description: "会议纪要功能开发中...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    var __VLS_64;
    var __VLS_44;
}
if (__VLS_ctx.activeSidePanel === 'vote' || !__VLS_ctx.activeSidePanel) {
    /** @type {[typeof VotePanel, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(VotePanel, new VotePanel({
        ...{ 'onSubmit': {} },
        ...{ 'onEnd': {} },
        activeVote: (__VLS_ctx.activeVote),
        results: (__VLS_ctx.voteResults),
        submitted: (__VLS_ctx.submitted),
        canEndVote: (__VLS_ctx.canEndVote),
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onSubmit': {} },
        ...{ 'onEnd': {} },
        activeVote: (__VLS_ctx.activeVote),
        results: (__VLS_ctx.voteResults),
        submitted: (__VLS_ctx.submitted),
        canEndVote: (__VLS_ctx.canEndVote),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onSubmit: (__VLS_ctx.handleVoteSubmit)
    };
    const __VLS_76 = {
        onEnd: (__VLS_ctx.handleEndVote)
    };
    var __VLS_71;
}
const __VLS_77 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    modelValue: (__VLS_ctx.showVoteDialog),
    title: "发起表决",
    width: "560px",
}));
const __VLS_79 = __VLS_78({
    modelValue: (__VLS_ctx.showVoteDialog),
    title: "发起表决",
    width: "560px",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
const __VLS_81 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    labelWidth: "90px",
    ...{ class: "dialog-form" },
}));
const __VLS_83 = __VLS_82({
    labelWidth: "90px",
    ...{ class: "dialog-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
const __VLS_85 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    label: "主题",
}));
const __VLS_87 = __VLS_86({
    label: "主题",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
__VLS_88.slots.default;
const __VLS_89 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    modelValue: (__VLS_ctx.voteForm.topic),
    placeholder: "请输入表决主题",
}));
const __VLS_91 = __VLS_90({
    modelValue: (__VLS_ctx.voteForm.topic),
    placeholder: "请输入表决主题",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
var __VLS_88;
const __VLS_93 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    label: "选项",
}));
const __VLS_95 = __VLS_94({
    label: "选项",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
const __VLS_97 = {}.ElSpace;
/** @type {[typeof __VLS_components.ElSpace, typeof __VLS_components.elSpace, typeof __VLS_components.ElSpace, typeof __VLS_components.elSpace, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    direction: "vertical",
    ...{ style: {} },
}));
const __VLS_99 = __VLS_98({
    direction: "vertical",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.voteForm.options))) {
    const __VLS_101 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        key: (index),
        modelValue: (item.content),
    }));
    const __VLS_103 = __VLS_102({
        key: (index),
        modelValue: (item.content),
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
}
var __VLS_100;
var __VLS_96;
var __VLS_84;
{
    const { footer: __VLS_thisSlot } = __VLS_80.slots;
    const __VLS_105 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        ...{ 'onClick': {} },
    }));
    const __VLS_107 = __VLS_106({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    let __VLS_109;
    let __VLS_110;
    let __VLS_111;
    const __VLS_112 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showVoteDialog = false;
        }
    };
    __VLS_108.slots.default;
    var __VLS_108;
    const __VLS_113 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_115 = __VLS_114({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    let __VLS_117;
    let __VLS_118;
    let __VLS_119;
    const __VLS_120 = {
        onClick: (__VLS_ctx.startVote)
    };
    __VLS_116.slots.default;
    var __VLS_116;
}
var __VLS_80;
/** @type {[typeof RoomControlBar, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(RoomControlBar, new RoomControlBar({
    ...{ 'onPanelChange': {} },
    ...{ 'onRaiseHandChange': {} },
    ref: "roomControlBarRef",
    roomType: "meeting",
    roomId: (__VLS_ctx.meetingId),
    roomCode: (__VLS_ctx.roomCode),
    wsClient: (__VLS_ctx.wsClient),
    peerConnections: (__VLS_ctx.peerConnections),
    localStream: (__VLS_ctx.localStream),
    selfId: (__VLS_ctx.selfId),
    onCleanup: (__VLS_ctx.handleCleanup),
}));
const __VLS_122 = __VLS_121({
    ...{ 'onPanelChange': {} },
    ...{ 'onRaiseHandChange': {} },
    ref: "roomControlBarRef",
    roomType: "meeting",
    roomId: (__VLS_ctx.meetingId),
    roomCode: (__VLS_ctx.roomCode),
    wsClient: (__VLS_ctx.wsClient),
    peerConnections: (__VLS_ctx.peerConnections),
    localStream: (__VLS_ctx.localStream),
    selfId: (__VLS_ctx.selfId),
    onCleanup: (__VLS_ctx.handleCleanup),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
let __VLS_124;
let __VLS_125;
let __VLS_126;
const __VLS_127 = {
    onPanelChange: (__VLS_ctx.handlePanelChange)
};
const __VLS_128 = {
    onRaiseHandChange: (__VLS_ctx.handleRaiseHandChange)
};
/** @type {typeof __VLS_ctx.roomControlBarRef} */ ;
var __VLS_129 = {};
var __VLS_123;
/** @type {__VLS_StyleScopedClasses['room-page']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
/** @type {__VLS_StyleScopedClasses['with-control-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['room-head']} */ ;
/** @type {__VLS_StyleScopedClasses['room-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['room-code-display']} */ ;
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
/** @type {__VLS_StyleScopedClasses['raised-hand-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['media-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['side-section']} */ ;
/** @type {__VLS_StyleScopedClasses['side-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-form']} */ ;
// @ts-ignore
var __VLS_130 = __VLS_129;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MediaTile: MediaTile,
            VotePanel: VotePanel,
            RoomControlBar: RoomControlBar,
            meetingId: meetingId,
            roomCode: roomCode,
            wsClient: wsClient,
            peerConnections: peerConnections,
            remoteStreams: remoteStreams,
            localStream: localStream,
            screenStream: screenStream,
            localVideoRef: localVideoRef,
            screenVideoRef: screenVideoRef,
            showVoteDialog: showVoteDialog,
            submitted: submitted,
            voteResults: voteResults,
            voteForm: voteForm,
            onlineUsers: onlineUsers,
            roomControlBarRef: roomControlBarRef,
            activeSidePanel: activeSidePanel,
            canStartVote: canStartVote,
            canEndVote: canEndVote,
            activeVote: activeVote,
            selfId: selfId,
            getUserDisplayName: getUserDisplayName,
            isHandRaised: isHandRaised,
            bindRemoteVideo: bindRemoteVideo,
            toggleCamera: toggleCamera,
            toggleScreenShare: toggleScreenShare,
            startVote: startVote,
            handleVoteSubmit: handleVoteSubmit,
            handleEndVote: handleEndVote,
            handlePanelChange: handlePanelChange,
            handleRaiseHandChange: handleRaiseHandChange,
            handleCleanup: handleCleanup,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
