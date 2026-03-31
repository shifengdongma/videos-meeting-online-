import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchLiveStream, fetchSubVenues } from '../../api/live';
import { useAuthStore } from '../../stores/auth';
import { WsClient } from '../../utils/ws';
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const initialLiveId = Number(route.params.id);
const wsClient = new WsClient();
const peerConnections = new Map();
const remoteStreams = ref([]);
const localStream = ref(null);
const localVideoRef = ref(null);
const onlineUsers = ref([]);
// Venue state
const currentVenueId = ref(initialLiveId);
const currentVenue = ref(null);
const mainVenue = ref(null);
const subVenues = ref([]);
// Mobile specific state
const showMembersDrawer = ref(false);
const showChatInput = ref(false);
const showVenueSwitcher = ref(false);
const chatInput = ref('');
const chatMessages = ref([]);
const isMuted = ref(false);
const isHandRaisedLocal = ref(false);
const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`;
const selfName = authStore.user?.username || '匿名用户';
const canPublish = computed(() => ['admin', 'host'].includes(authStore.role));
const venueActions = computed(() => {
    const actions = [];
    if (mainVenue.value) {
        actions.push({
            name: mainVenue.value.title || `主会场 ${mainVenue.value.id}`,
            subname: mainVenue.value.room_code,
            value: mainVenue.value.id
        });
    }
    subVenues.value.forEach(venue => {
        actions.push({
            name: venue.title || `分会场 ${venue.id}`,
            subname: venue.room_code,
            value: venue.id
        });
    });
    return actions;
});
const getUserDisplayName = (connId) => {
    const user = onlineUsers.value.find(u => u.id === connId);
    return user?.display_name || `用户 ${connId.slice(-4)}`;
};
const isHandRaised = (connId) => {
    const user = onlineUsers.value.find(u => u.id === connId);
    return user?.hand_raised || false;
};
const bindRemoteVideo = (el, stream) => {
    if (el)
        el.srcObject = stream;
};
const createPeerConnection = (peerId) => {
    if (peerConnections.has(peerId))
        return peerConnections.get(peerId);
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    localStream.value?.getTracks().forEach((track) => pc.addTrack(track, localStream.value));
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            wsClient.send({ type: 'ice-candidate', from: selfId, to: peerId, candidate: event.candidate });
        }
    };
    pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (!remoteStreams.value.find((item) => item.id === peerId)) {
            remoteStreams.value.push({ id: peerId, mediaStream: stream });
        }
    };
    peerConnections.set(peerId, pc);
    return pc;
};
const startPublish = async () => {
    try {
        localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.value)
            localVideoRef.value.srcObject = localStream.value;
        showToast('主播流已准备');
    }
    catch (error) {
        console.error('Failed to start publish:', error);
        showToast('无法访问摄像头或麦克风');
    }
};
const toggleCamera = async () => {
    if (localStream.value) {
        const videoTrack = localStream.value.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
        }
    }
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
const sendChatMessage = () => {
    if (!chatInput.value.trim())
        return;
    wsClient.send({
        type: 'chat',
        from: selfId,
        user: selfName,
        text: chatInput.value
    });
    chatMessages.value.push({
        user: selfName,
        text: chatInput.value
    });
    chatInput.value = '';
    showChatInput.value = false;
};
const handleLeave = () => {
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop());
    }
    wsClient.send({ type: 'leave', from: selfId });
    wsClient.close();
    peerConnections.forEach((pc) => pc.close());
    window.history.back();
};
const handleSignalMessage = async (raw) => {
    const payload = JSON.parse(raw.data);
    if (payload.from === selfId)
        return;
    // Handle chat messages
    if (payload.type === 'chat') {
        chatMessages.value.push({
            user: payload.user || '匿名用户',
            text: payload.text
        });
        // Keep only last 50 messages
        if (chatMessages.value.length > 50) {
            chatMessages.value = chatMessages.value.slice(-50);
        }
        return;
    }
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
    if (payload.type === 'join' && canPublish.value) {
        const pc = createPeerConnection(payload.from);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsClient.send({ type: 'offer', from: selfId, to: payload.from, sdp: offer });
        return;
    }
    if (payload.to !== selfId)
        return;
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
    await wsClient.connect(`${wsProtocol}//${window.location.host}/ws/live/${currentVenueId.value}`, handleSignalMessage);
    wsClient.send({
        type: 'join',
        from: selfId,
        user_id: authStore.user?.id || 0,
        display_name: selfName,
        role: canPublish.value ? 'host' : 'user'
    });
};
const disconnectRoom = () => {
    wsClient.send({ type: 'leave', from: selfId });
    wsClient.close();
    peerConnections.forEach((pc) => pc.close());
    peerConnections.clear();
    remoteStreams.value = [];
    onlineUsers.value = [];
};
const loadVenueData = async () => {
    try {
        currentVenue.value = await fetchLiveStream(currentVenueId.value);
        if (currentVenue.value?.parent_id) {
            mainVenue.value = await fetchLiveStream(currentVenue.value.parent_id);
            const allSubs = await fetchSubVenues(mainVenue.value.id);
            subVenues.value = allSubs;
        }
        else {
            mainVenue.value = currentVenue.value;
            subVenues.value = await fetchSubVenues(currentVenueId.value);
        }
    }
    catch (error) {
        console.error('Failed to load venue data:', error);
        showToast('加载直播间数据失败');
    }
};
const onVenueSelect = async (action) => {
    if (action.value === currentVenueId.value) {
        showVenueSwitcher.value = false;
        return;
    }
    disconnectRoom();
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop());
        localStream.value = null;
        if (localVideoRef.value)
            localVideoRef.value.srcObject = null;
    }
    currentVenueId.value = action.value;
    router.replace(`/live/${action.value}`);
    await loadVenueData();
    await connectRoom();
    showVenueSwitcher.value = false;
    showToast(`已切换到 ${currentVenue.value?.title || '直播间'}`);
};
onMounted(async () => {
    await loadVenueData();
    await connectRoom();
});
onBeforeUnmount(() => {
    disconnectRoom();
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop());
    }
});
// Watch for route changes
watch(() => route.params.id, async (newId) => {
    const newLiveId = Number(newId);
    if (newLiveId !== currentVenueId.value && newId) {
        disconnectRoom();
        currentVenueId.value = newLiveId;
        await loadVenueData();
        await connectRoom();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['video-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input-area']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mobile-live-room" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fullscreen-video" },
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
        ...{ class: "live-video" },
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
        size: "64",
        color: "#666",
    }));
    const __VLS_2 = __VLS_1({
        name: "video",
        size: "64",
        color: "#666",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.canPublish ? '点击开始采集' : '等待主播推流...');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-title" },
});
(__VLS_ctx.currentVenue?.title || `直播间 #${__VLS_ctx.currentVenueId}`);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-meta" },
});
const __VLS_4 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    name: "eye-o",
}));
const __VLS_6 = __VLS_5({
    name: "eye-o",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.onlineUsers.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-actions" },
});
const __VLS_8 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    name: "wap-nav",
    size: "22",
    color: "#fff",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    name: "wap-nav",
    size: "22",
    color: "#fff",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showVenueSwitcher = true;
    }
};
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-overlay" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-messages" },
});
for (const [msg, index] of __VLS_getVForSourceType((__VLS_ctx.chatMessages))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "chat-message" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "chat-user" },
    });
    (msg.user);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "chat-text" },
    });
    (msg.text);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-bar" },
});
if (__VLS_ctx.canPublish) {
    if (!__VLS_ctx.localStream) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (__VLS_ctx.startPublish) },
            ...{ class: "start-btn" },
        });
        const __VLS_16 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            name: "video-o",
            size: "24",
        }));
        const __VLS_18 = __VLS_17({
            name: "video-o",
            size: "24",
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (__VLS_ctx.toggleCamera) },
            ...{ class: "control-item" },
        });
        const __VLS_20 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            name: (__VLS_ctx.localStream ? 'video' : 'video-o'),
            size: "22",
        }));
        const __VLS_22 = __VLS_21({
            name: (__VLS_ctx.localStream ? 'video' : 'video-o'),
            size: "22",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (__VLS_ctx.toggleMute) },
            ...{ class: "control-item" },
        });
        const __VLS_24 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            name: (__VLS_ctx.isMuted ? 'volume-mute-o' : 'volume-o'),
            size: "22",
        }));
        const __VLS_26 = __VLS_25({
            name: (__VLS_ctx.isMuted ? 'volume-mute-o' : 'volume-o'),
            size: "22",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.isMuted ? '静音' : '麦克风');
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showChatInput = true;
        } },
    ...{ class: "control-item" },
});
const __VLS_28 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    name: "chat-o",
    size: "22",
}));
const __VLS_30 = __VLS_29({
    name: "chat-o",
    size: "22",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showMembersDrawer = true;
        } },
    ...{ class: "control-item" },
});
const __VLS_32 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    name: "friends-o",
    size: "22",
}));
const __VLS_34 = __VLS_33({
    name: "friends-o",
    size: "22",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.toggleRaiseHand) },
    ...{ class: "control-item" },
});
const __VLS_36 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    name: (__VLS_ctx.isHandRaisedLocal ? 'guide' : 'guide-o'),
    size: "22",
    color: (__VLS_ctx.isHandRaisedLocal ? '#ff9800' : ''),
}));
const __VLS_38 = __VLS_37({
    name: (__VLS_ctx.isHandRaisedLocal ? 'guide' : 'guide-o'),
    size: "22",
    color: (__VLS_ctx.isHandRaisedLocal ? '#ff9800' : ''),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleLeave) },
    ...{ class: "control-item end-btn" },
});
const __VLS_40 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    name: "cross",
    size: "22",
    color: "#fff",
}));
const __VLS_42 = __VLS_41({
    name: "cross",
    size: "22",
    color: "#fff",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_44 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    show: (__VLS_ctx.showMembersDrawer),
    position: "bottom",
    ...{ style: ({ height: '60%' }) },
    round: true,
}));
const __VLS_46 = __VLS_45({
    show: (__VLS_ctx.showMembersDrawer),
    position: "bottom",
    ...{ style: ({ height: '60%' }) },
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
            type: "danger",
        }));
        const __VLS_54 = __VLS_53({
            type: "danger",
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
    show: (__VLS_ctx.showChatInput),
    position: "bottom",
    round: true,
}));
const __VLS_70 = __VLS_69({
    show: (__VLS_ctx.showChatInput),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-input-area" },
});
const __VLS_72 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.chatInput),
    placeholder: "说点什么...",
    border: (false),
}));
const __VLS_74 = __VLS_73({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.chatInput),
    placeholder: "说点什么...",
    border: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onKeyup: (__VLS_ctx.sendChatMessage)
};
var __VLS_75;
const __VLS_80 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_82 = __VLS_81({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    onClick: (__VLS_ctx.sendChatMessage)
};
__VLS_83.slots.default;
var __VLS_83;
var __VLS_71;
const __VLS_88 = {}.VanActionSheet;
/** @type {[typeof __VLS_components.VanActionSheet, typeof __VLS_components.vanActionSheet, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    ...{ 'onSelect': {} },
    show: (__VLS_ctx.showVenueSwitcher),
    title: "切换直播间",
    actions: (__VLS_ctx.venueActions),
}));
const __VLS_90 = __VLS_89({
    ...{ 'onSelect': {} },
    show: (__VLS_ctx.showVenueSwitcher),
    title: "切换直播间",
    actions: (__VLS_ctx.venueActions),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
let __VLS_92;
let __VLS_93;
let __VLS_94;
const __VLS_95 = {
    onSelect: (__VLS_ctx.onVenueSelect)
};
var __VLS_91;
/** @type {__VLS_StyleScopedClasses['mobile-live-room']} */ ;
/** @type {__VLS_StyleScopedClasses['fullscreen-video']} */ ;
/** @type {__VLS_StyleScopedClasses['live-video']} */ ;
/** @type {__VLS_StyleScopedClasses['video-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['top-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['live-info']} */ ;
/** @type {__VLS_StyleScopedClasses['live-title']} */ ;
/** @type {__VLS_StyleScopedClasses['live-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['top-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-user']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-text']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['start-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['control-item']} */ ;
/** @type {__VLS_StyleScopedClasses['control-item']} */ ;
/** @type {__VLS_StyleScopedClasses['control-item']} */ ;
/** @type {__VLS_StyleScopedClasses['control-item']} */ ;
/** @type {__VLS_StyleScopedClasses['control-item']} */ ;
/** @type {__VLS_StyleScopedClasses['control-item']} */ ;
/** @type {__VLS_StyleScopedClasses['end-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['member-list']} */ ;
/** @type {__VLS_StyleScopedClasses['member-item']} */ ;
/** @type {__VLS_StyleScopedClasses['member-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['member-info']} */ ;
/** @type {__VLS_StyleScopedClasses['member-name']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            localStream: localStream,
            localVideoRef: localVideoRef,
            onlineUsers: onlineUsers,
            currentVenueId: currentVenueId,
            currentVenue: currentVenue,
            showMembersDrawer: showMembersDrawer,
            showChatInput: showChatInput,
            showVenueSwitcher: showVenueSwitcher,
            chatInput: chatInput,
            chatMessages: chatMessages,
            isMuted: isMuted,
            isHandRaisedLocal: isHandRaisedLocal,
            canPublish: canPublish,
            venueActions: venueActions,
            startPublish: startPublish,
            toggleCamera: toggleCamera,
            toggleMute: toggleMute,
            toggleRaiseHand: toggleRaiseHand,
            sendChatMessage: sendChatMessage,
            handleLeave: handleLeave,
            onVenueSelect: onVenueSelect,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
