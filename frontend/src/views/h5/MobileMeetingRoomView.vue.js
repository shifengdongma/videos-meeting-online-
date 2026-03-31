import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';
import { createVote, endVote, fetchVotes, submitVote } from '../../api/votes';
import VotePanel from '../../components/meeting/VotePanel.vue';
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
const activeSidePanel = ref(null);
// Mobile specific state
const showMoreSheet = ref(false);
const showMembersDrawer = ref(false);
const showChatDrawer = ref(false);
const showVoteDrawer = ref(false);
const showScreenInMain = ref(false);
const isMuted = ref(false);
const isHandRaisedLocal = ref(false);
const canStartVote = computed(() => ['admin', 'host'].includes(authStore.role));
const canEndVote = computed(() => canStartVote.value && activeVote.value?.status === 'voting');
const activeVote = computed(() => votes.value[0] || null);
const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`;
const selfName = authStore.user?.username || '匿名用户';
const moreActions = computed(() => [
    { name: '成员列表', icon: 'friends-o' },
    { name: '聊天', icon: 'chat-o' },
    { name: '表决', icon: 'todo-list-o' },
    { name: '桌面共享', icon: 'tv-o' }
]);
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
        showToast('摄像头/麦克风不可用：请使用 HTTPS 或 localhost 访问');
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
        showToast('已打开摄像头和麦克风');
    }
    catch (error) {
        console.error('Failed to access camera/microphone:', error);
        showToast('无法访问摄像头或麦克风');
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
        showToast('已开启桌面共享');
    }
    catch (error) {
        console.error('Failed to share screen:', error);
        showToast('无法开启屏幕共享');
    }
};
const toggleCamera = async () => {
    if (localStream.value) {
        stopCamera();
        showToast('已关闭摄像头和麦克风');
        return;
    }
    await openCamera();
};
const toggleScreenShare = async () => {
    if (screenStream.value) {
        stopScreenShare();
        showToast('已停止桌面共享');
        return;
    }
    await shareScreen();
};
const toggleMute = () => {
    if (localStream.value) {
        const audioTrack = localStream.value.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            isMuted.value = !audioTrack.enabled;
            showToast(isMuted.value ? '已静音' : '已取消静音');
        }
    }
};
const toggleRaiseHand = () => {
    isHandRaisedLocal.value = !isHandRaisedLocal.value;
    wsClient.send({
        type: isHandRaisedLocal.value ? 'raise-hand' : 'lower-hand',
        from: selfId
    });
    showToast(isHandRaisedLocal.value ? '已举手' : '已放下');
};
const switchMainVideo = (stream) => {
    // Could implement switching main video to selected remote stream
    console.log('Switch to:', stream.id);
};
const handleLeave = () => {
    stopCamera();
    stopScreenShare();
    wsClient.send({ type: 'leave', from: selfId });
    wsClient.close();
    peerConnections.forEach((pc) => pc.close());
    window.history.back();
};
const onMoreActionSelect = (action) => {
    showMoreSheet.value = false;
    if (action.name === '成员列表') {
        showMembersDrawer.value = true;
    }
    else if (action.name === '聊天') {
        showChatDrawer.value = true;
    }
    else if (action.name === '表决') {
        showVoteDrawer.value = true;
    }
    else if (action.name === '桌面共享') {
        toggleScreenShare();
    }
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
        remoteStreams.value = remoteStreams.value.filter(s => s.id !== payload.from);
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
    showToast('表决已发起');
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
    showToast('投票成功');
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
    showToast('表决已结束');
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
/** @type {__VLS_StyleScopedClasses['pip-item']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mobile-meeting-room" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-video-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-video-container" },
});
if (__VLS_ctx.localStream) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        ref: "localVideoRef",
        autoplay: true,
        muted: true,
        playsinline: true,
        'webkit-playsinline': "true",
        'x5-playsinline': "true",
        'x5-video-player-type': "h5",
        'x5-video-player-fullscreen': "false",
        ...{ class: "main-video" },
    });
    /** @type {typeof __VLS_ctx.localVideoRef} */ ;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "video-placeholder" },
    });
    const __VLS_0 = {}.VanIcon;
    /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        name: "video",
        size: "48",
        color: "#ccc",
    }));
    const __VLS_2 = __VLS_1({
        name: "video",
        size: "48",
        color: "#ccc",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "video-label" },
});
if (__VLS_ctx.screenStream) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.screenStream))
                    return;
                __VLS_ctx.showScreenInMain = !__VLS_ctx.showScreenInMain;
            } },
        ...{ class: "screen-share-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        ref: "screenVideoRef",
        autoplay: true,
        muted: true,
        playsinline: true,
        'webkit-playsinline': "true",
        'x5-playsinline': "true",
        'x5-video-player-type': "h5",
        'x5-video-player-fullscreen': "false",
        ...{ class: "screen-video" },
    });
    /** @type {typeof __VLS_ctx.screenVideoRef} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "video-label" },
    });
}
if (__VLS_ctx.remoteStreams.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pip-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pip-scroll" },
    });
    for (const [stream] of __VLS_getVForSourceType((__VLS_ctx.remoteStreams))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.remoteStreams.length > 0))
                        return;
                    __VLS_ctx.switchMainVideo(stream);
                } },
            key: (stream.id),
            ...{ class: "pip-item" },
            ...{ class: ({ 'has-raised-hand': __VLS_ctx.isHandRaised(stream.id) }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
            autoplay: true,
            playsinline: true,
            'webkit-playsinline': "true",
            'x5-playsinline': "true",
            'x5-video-player-type': "h5",
            'x5-video-player-fullscreen': "false",
            ref: ((el) => __VLS_ctx.bindRemoteVideo(el, stream.mediaStream)),
            ...{ class: "pip-video" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pip-name" },
        });
        (__VLS_ctx.getUserDisplayName(stream.id));
        if (__VLS_ctx.isHandRaised(stream.id)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "raised-hand-indicator" },
            });
            const __VLS_4 = {}.VanIcon;
            /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
            // @ts-ignore
            const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
                name: "guide",
            }));
            const __VLS_6 = __VLS_5({
                name: "guide",
            }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "room-title" },
});
(__VLS_ctx.meetingId);
const __VLS_8 = {}.VanTag;
/** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    type: "primary",
}));
const __VLS_10 = __VLS_9({
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
(__VLS_ctx.roomCode);
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "online-count" },
});
const __VLS_12 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    name: "friends-o",
}));
const __VLS_14 = __VLS_13({
    name: "friends-o",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.onlineUsers.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-control-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.toggleCamera) },
    ...{ class: "control-btn" },
    ...{ class: ({ active: __VLS_ctx.localStream }) },
});
const __VLS_16 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    name: (__VLS_ctx.localStream ? 'video' : 'video-o'),
    size: "24",
}));
const __VLS_18 = __VLS_17({
    name: (__VLS_ctx.localStream ? 'video' : 'video-o'),
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.localStream ? '关闭' : '摄像头');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.toggleMute) },
    ...{ class: "control-btn" },
    ...{ class: ({ active: !__VLS_ctx.isMuted }) },
});
const __VLS_20 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    name: (__VLS_ctx.isMuted ? 'volume-mute-o' : 'volume-o'),
    size: "24",
}));
const __VLS_22 = __VLS_21({
    name: (__VLS_ctx.isMuted ? 'volume-mute-o' : 'volume-o'),
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.isMuted ? '静音' : '麦克风');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.toggleRaiseHand) },
    ...{ class: "control-btn" },
});
const __VLS_24 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    name: (__VLS_ctx.isHandRaisedLocal ? 'guide' : 'guide-o'),
    size: "24",
    color: (__VLS_ctx.isHandRaisedLocal ? '#ff9800' : ''),
}));
const __VLS_26 = __VLS_25({
    name: (__VLS_ctx.isHandRaisedLocal ? 'guide' : 'guide-o'),
    size: "24",
    color: (__VLS_ctx.isHandRaisedLocal ? '#ff9800' : ''),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.isHandRaisedLocal ? '已举手' : '举手');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showMoreSheet = true;
        } },
    ...{ class: "control-btn" },
});
const __VLS_28 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    name: "ellipsis",
    size: "24",
}));
const __VLS_30 = __VLS_29({
    name: "ellipsis",
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleLeave) },
    ...{ class: "control-btn end-call" },
});
const __VLS_32 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    name: "phone-o",
    size: "24",
    color: "#fff",
}));
const __VLS_34 = __VLS_33({
    name: "phone-o",
    size: "24",
    color: "#fff",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_36 = {}.VanActionSheet;
/** @type {[typeof __VLS_components.VanActionSheet, typeof __VLS_components.vanActionSheet, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onSelect': {} },
    show: (__VLS_ctx.showMoreSheet),
    title: "更多操作",
    actions: (__VLS_ctx.moreActions),
}));
const __VLS_38 = __VLS_37({
    ...{ 'onSelect': {} },
    show: (__VLS_ctx.showMoreSheet),
    title: "更多操作",
    actions: (__VLS_ctx.moreActions),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onSelect: (__VLS_ctx.onMoreActionSelect)
};
var __VLS_39;
const __VLS_44 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    show: (__VLS_ctx.showMembersDrawer),
    position: "bottom",
    ...{ style: ({ height: '70%' }) },
    round: true,
}));
const __VLS_46 = __VLS_45({
    show: (__VLS_ctx.showMembersDrawer),
    position: "bottom",
    ...{ style: ({ height: '70%' }) },
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.onlineUsers.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "member-list" },
});
for (const [user] of __VLS_getVForSourceType((__VLS_ctx.onlineUsers))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (user.id),
        ...{ class: "member-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "member-avatar" },
    });
    const __VLS_48 = {}.VanIcon;
    /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        name: "user-circle-o",
        size: "32",
    }));
    const __VLS_50 = __VLS_49({
        name: "user-circle-o",
        size: "32",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "member-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "member-name" },
    });
    (user.display_name);
    if (user.role === 'host') {
        const __VLS_52 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            type: "primary",
        }));
        const __VLS_54 = __VLS_53({
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        var __VLS_55;
    }
    if (user.role === 'admin') {
        const __VLS_56 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            type: "warning",
        }));
        const __VLS_58 = __VLS_57({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        var __VLS_59;
    }
    if (user.hand_raised) {
        const __VLS_60 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            type: "warning",
        }));
        const __VLS_62 = __VLS_61({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_63.slots.default;
        const __VLS_64 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            name: "guide",
        }));
        const __VLS_66 = __VLS_65({
            name: "guide",
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        var __VLS_63;
    }
}
var __VLS_47;
const __VLS_68 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    show: (__VLS_ctx.showChatDrawer),
    position: "bottom",
    ...{ style: ({ height: '70%' }) },
    round: true,
}));
const __VLS_70 = __VLS_69({
    show: (__VLS_ctx.showChatDrawer),
    position: "bottom",
    ...{ style: ({ height: '70%' }) },
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-area" },
});
const __VLS_72 = {}.VanEmpty;
/** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    description: "聊天功能开发中...",
}));
const __VLS_74 = __VLS_73({
    description: "聊天功能开发中...",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
var __VLS_71;
const __VLS_76 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    show: (__VLS_ctx.showVoteDrawer),
    position: "bottom",
    ...{ style: ({ height: '80%' }) },
    round: true,
}));
const __VLS_78 = __VLS_77({
    show: (__VLS_ctx.showVoteDrawer),
    position: "bottom",
    ...{ style: ({ height: '80%' }) },
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "vote-area" },
});
/** @type {[typeof VotePanel, ]} */ ;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(VotePanel, new VotePanel({
    ...{ 'onSubmit': {} },
    ...{ 'onEnd': {} },
    activeVote: (__VLS_ctx.activeVote),
    results: (__VLS_ctx.voteResults),
    submitted: (__VLS_ctx.submitted),
    canEndVote: (__VLS_ctx.canEndVote),
}));
const __VLS_81 = __VLS_80({
    ...{ 'onSubmit': {} },
    ...{ 'onEnd': {} },
    activeVote: (__VLS_ctx.activeVote),
    results: (__VLS_ctx.voteResults),
    submitted: (__VLS_ctx.submitted),
    canEndVote: (__VLS_ctx.canEndVote),
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
let __VLS_83;
let __VLS_84;
let __VLS_85;
const __VLS_86 = {
    onSubmit: (__VLS_ctx.handleVoteSubmit)
};
const __VLS_87 = {
    onEnd: (__VLS_ctx.handleEndVote)
};
var __VLS_82;
if (__VLS_ctx.canStartVote && !__VLS_ctx.activeVote) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "start-vote-btn" },
    });
    const __VLS_88 = {}.VanButton;
    /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        type: "primary",
        block: true,
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        type: "primary",
        block: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    let __VLS_94;
    const __VLS_95 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canStartVote && !__VLS_ctx.activeVote))
                return;
            __VLS_ctx.showVoteDialog = true;
        }
    };
    __VLS_91.slots.default;
    var __VLS_91;
}
var __VLS_79;
if (!__VLS_ctx.screenStream) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.toggleScreenShare) },
        ...{ class: "screen-share-fab" },
    });
    const __VLS_96 = {}.VanIcon;
    /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        name: "tv-o",
        size: "20",
    }));
    const __VLS_98 = __VLS_97({
        name: "tv-o",
        size: "20",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
const __VLS_100 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    show: (__VLS_ctx.showVoteDialog),
    position: "bottom",
    round: true,
    ...{ style: ({ padding: '20px' }) },
}));
const __VLS_102 = __VLS_101({
    show: (__VLS_ctx.showVoteDialog),
    position: "bottom",
    round: true,
    ...{ style: ({ padding: '20px' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "vote-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_104 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.voteForm.topic),
    label: "主题",
    placeholder: "请输入表决主题",
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.voteForm.topic),
    label: "主题",
    placeholder: "请输入表决主题",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "options-label" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.voteForm.options))) {
    const __VLS_108 = {}.VanField;
    /** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        key: (index),
        modelValue: (item.content),
        placeholder: (`选项 ${index + 1}`),
    }));
    const __VLS_110 = __VLS_109({
        key: (index),
        modelValue: (item.content),
        placeholder: (`选项 ${index + 1}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "vote-form-actions" },
});
const __VLS_112 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    ...{ 'onClick': {} },
    block: true,
}));
const __VLS_114 = __VLS_113({
    ...{ 'onClick': {} },
    block: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
let __VLS_116;
let __VLS_117;
let __VLS_118;
const __VLS_119 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showVoteDialog = false;
    }
};
__VLS_115.slots.default;
var __VLS_115;
const __VLS_120 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
}));
const __VLS_122 = __VLS_121({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
let __VLS_124;
let __VLS_125;
let __VLS_126;
const __VLS_127 = {
    onClick: (__VLS_ctx.startVote)
};
__VLS_123.slots.default;
var __VLS_123;
var __VLS_103;
/** @type {__VLS_StyleScopedClasses['mobile-meeting-room']} */ ;
/** @type {__VLS_StyleScopedClasses['main-video-area']} */ ;
/** @type {__VLS_StyleScopedClasses['main-video-container']} */ ;
/** @type {__VLS_StyleScopedClasses['main-video']} */ ;
/** @type {__VLS_StyleScopedClasses['video-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['video-label']} */ ;
/** @type {__VLS_StyleScopedClasses['screen-share-container']} */ ;
/** @type {__VLS_StyleScopedClasses['screen-video']} */ ;
/** @type {__VLS_StyleScopedClasses['video-label']} */ ;
/** @type {__VLS_StyleScopedClasses['pip-container']} */ ;
/** @type {__VLS_StyleScopedClasses['pip-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['pip-item']} */ ;
/** @type {__VLS_StyleScopedClasses['has-raised-hand']} */ ;
/** @type {__VLS_StyleScopedClasses['pip-video']} */ ;
/** @type {__VLS_StyleScopedClasses['pip-name']} */ ;
/** @type {__VLS_StyleScopedClasses['raised-hand-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['top-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['room-info']} */ ;
/** @type {__VLS_StyleScopedClasses['room-title']} */ ;
/** @type {__VLS_StyleScopedClasses['online-count']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-control-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['end-call']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['member-list']} */ ;
/** @type {__VLS_StyleScopedClasses['member-item']} */ ;
/** @type {__VLS_StyleScopedClasses['member-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['member-info']} */ ;
/** @type {__VLS_StyleScopedClasses['member-name']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-area']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['vote-area']} */ ;
/** @type {__VLS_StyleScopedClasses['start-vote-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['screen-share-fab']} */ ;
/** @type {__VLS_StyleScopedClasses['vote-form']} */ ;
/** @type {__VLS_StyleScopedClasses['options-label']} */ ;
/** @type {__VLS_StyleScopedClasses['vote-form-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            VotePanel: VotePanel,
            meetingId: meetingId,
            roomCode: roomCode,
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
            showMoreSheet: showMoreSheet,
            showMembersDrawer: showMembersDrawer,
            showChatDrawer: showChatDrawer,
            showVoteDrawer: showVoteDrawer,
            showScreenInMain: showScreenInMain,
            isMuted: isMuted,
            isHandRaisedLocal: isHandRaisedLocal,
            canStartVote: canStartVote,
            canEndVote: canEndVote,
            activeVote: activeVote,
            moreActions: moreActions,
            getUserDisplayName: getUserDisplayName,
            isHandRaised: isHandRaised,
            bindRemoteVideo: bindRemoteVideo,
            toggleCamera: toggleCamera,
            toggleScreenShare: toggleScreenShare,
            toggleMute: toggleMute,
            toggleRaiseHand: toggleRaiseHand,
            switchMainVideo: switchMainVideo,
            handleLeave: handleLeave,
            onMoreActionSelect: onMoreActionSelect,
            startVote: startVote,
            handleVoteSubmit: handleVoteSubmit,
            handleEndVote: handleEndVote,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
