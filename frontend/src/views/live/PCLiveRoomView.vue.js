import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { fetchLiveStream, fetchSubVenues } from '../../api/live';
import MediaTile from '../../components/media/MediaTile.vue';
import RoomControlBar from '../../components/room/RoomControlBar.vue';
import LiveSidePanel from '../../components/live/LiveSidePanel.vue';
import VenueSwitcher from '../../components/live/VenueSwitcher.vue';
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
const roomControlBarRef = ref(null);
const liveSidePanelRef = ref(null);
// Venue state
const currentVenueId = ref(initialLiveId);
const currentVenue = ref(null);
const mainVenue = ref(null);
const subVenues = ref([]);
const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`;
const selfName = authStore.user?.username || '匿名用户';
const canPublish = computed(() => ['admin', 'host'].includes(authStore.role));
const getUserDisplayName = (connId) => {
    const user = onlineUsers.value.find(u => u.id === connId);
    return user?.display_name || `远端流 ${connId.slice(-4)}`;
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
        ElMessage.success('主播流已准备');
    }
    catch (error) {
        console.error('Failed to start publish:', error);
        ElMessage.error('无法访问摄像头或麦克风，请检查权限设置');
    }
};
const handleSignalMessage = async (raw) => {
    const payload = JSON.parse(raw.data);
    if (payload.from === selfId)
        return;
    // Pass to LiveSidePanel for chat/member handling
    liveSidePanelRef.value?.handleWsMessage(payload);
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
    // Send join with user metadata
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
            // This is a sub-venue, load main venue data
            mainVenue.value = await fetchLiveStream(currentVenue.value.parent_id);
            const allSubs = await fetchSubVenues(mainVenue.value.id);
            subVenues.value = allSubs;
        }
        else {
            // This is main venue, load sub-venues
            mainVenue.value = currentVenue.value;
            subVenues.value = await fetchSubVenues(currentVenueId.value);
        }
    }
    catch (error) {
        console.error('Failed to load venue data:', error);
        ElMessage.error('加载直播间数据失败');
    }
};
const handleVenueSwitch = async (venueId) => {
    if (venueId === currentVenueId.value)
        return;
    // Disconnect from current room
    disconnectRoom();
    // Stop local stream if publishing
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop());
        localStream.value = null;
        if (localVideoRef.value)
            localVideoRef.value.srcObject = null;
    }
    // Update venue id and navigate
    currentVenueId.value = venueId;
    router.replace(`/live/${venueId}`);
    // Reload venue data and reconnect
    await loadVenueData();
    await connectRoom();
    ElMessage.success(`已切换到 ${currentVenue.value?.title || '直播间'}`);
};
const handleRaiseHandChange = (raised) => {
    const localUser = onlineUsers.value.find(u => u.id === selfId);
    if (localUser) {
        localUser.hand_raised = raised;
    }
};
const handleCleanup = () => {
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop());
        localStream.value = null;
    }
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
/** @type {__VLS_StyleScopedClasses['live-head']} */ ;
/** @type {__VLS_StyleScopedClasses['live-head']} */ ;
/** @type {__VLS_StyleScopedClasses['video-section']} */ ;
/** @type {__VLS_StyleScopedClasses['live-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['live-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['main-video-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['live-head']} */ ;
/** @type {__VLS_StyleScopedClasses['live-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-room-page app-page with-control-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.currentVenue?.title || `直播间 #${__VLS_ctx.currentVenueId}`);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-actions" },
});
if (__VLS_ctx.mainVenue || __VLS_ctx.subVenues.length > 0) {
    /** @type {[typeof VenueSwitcher, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(VenueSwitcher, new VenueSwitcher({
        ...{ 'onSwitch': {} },
        mainVenue: (__VLS_ctx.mainVenue),
        subVenues: (__VLS_ctx.subVenues),
        currentVenueId: (__VLS_ctx.currentVenueId),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onSwitch': {} },
        mainVenue: (__VLS_ctx.mainVenue),
        subVenues: (__VLS_ctx.subVenues),
        currentVenueId: (__VLS_ctx.currentVenueId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onSwitch: (__VLS_ctx.handleVenueSwitch)
    };
    var __VLS_2;
}
if (__VLS_ctx.canPublish) {
    const __VLS_7 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_11;
    let __VLS_12;
    let __VLS_13;
    const __VLS_14 = {
        onClick: (__VLS_ctx.startPublish)
    };
    __VLS_10.slots.default;
    var __VLS_10;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-summary" },
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
(__VLS_ctx.canPublish ? '主播端' : '观众端');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-value" },
});
(__VLS_ctx.localStream ? '已准备' : '未开始');
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
    ...{ class: "live-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "video-section" },
});
/** @type {[typeof MediaTile, typeof MediaTile, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
    ...{ class: "main-video-tile" },
    title: (__VLS_ctx.canPublish ? '主播本地画面' : '主直播画面'),
    subtitle: (__VLS_ctx.canPublish ? '用于推流预览' : '正在观看直播内容'),
    empty: (!__VLS_ctx.localStream),
    emptyText: (__VLS_ctx.canPublish ? '尚未开始本地采集' : '当前还没有收到直播画面'),
}));
const __VLS_16 = __VLS_15({
    ...{ class: "main-video-tile" },
    title: (__VLS_ctx.canPublish ? '主播本地画面' : '主直播画面'),
    subtitle: (__VLS_ctx.canPublish ? '用于推流预览' : '正在观看直播内容'),
    empty: (!__VLS_ctx.localStream),
    emptyText: (__VLS_ctx.canPublish ? '尚未开始本地采集' : '当前还没有收到直播画面'),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
    ref: "localVideoRef",
    autoplay: true,
    muted: true,
    playsinline: true,
});
/** @type {typeof __VLS_ctx.localVideoRef} */ ;
var __VLS_17;
for (const [stream] of __VLS_getVForSourceType((__VLS_ctx.remoteStreams))) {
    /** @type {[typeof MediaTile, typeof MediaTile, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
        key: (stream.id),
        title: (__VLS_ctx.getUserDisplayName(stream.id)),
        subtitle: "实时直播连接",
    }));
    const __VLS_19 = __VLS_18({
        key: (stream.id),
        title: (__VLS_ctx.getUserDisplayName(stream.id)),
        subtitle: "实时直播连接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    {
        const { 'header-extra': __VLS_thisSlot } = __VLS_20.slots;
        if (__VLS_ctx.isHandRaised(stream.id)) {
            const __VLS_21 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
                type: "warning",
                size: "small",
                ...{ class: "raised-hand-tag" },
            }));
            const __VLS_23 = __VLS_22({
                type: "warning",
                size: "small",
                ...{ class: "raised-hand-tag" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_22));
            __VLS_24.slots.default;
            var __VLS_24;
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        autoplay: true,
        playsinline: true,
        ref: ((el) => __VLS_ctx.bindRemoteVideo(el, stream.mediaStream)),
    });
    var __VLS_20;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "side-panel-section" },
});
/** @type {[typeof LiveSidePanel, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(LiveSidePanel, new LiveSidePanel({
    ref: "liveSidePanelRef",
    wsClient: (__VLS_ctx.wsClient),
    selfId: (__VLS_ctx.selfId),
    selfName: (__VLS_ctx.selfName),
}));
const __VLS_26 = __VLS_25({
    ref: "liveSidePanelRef",
    wsClient: (__VLS_ctx.wsClient),
    selfId: (__VLS_ctx.selfId),
    selfName: (__VLS_ctx.selfName),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
/** @type {typeof __VLS_ctx.liveSidePanelRef} */ ;
var __VLS_28 = {};
var __VLS_27;
/** @type {[typeof RoomControlBar, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(RoomControlBar, new RoomControlBar({
    ...{ 'onRaiseHandChange': {} },
    ref: "roomControlBarRef",
    roomType: "live",
    roomId: (__VLS_ctx.currentVenueId),
    roomCode: (__VLS_ctx.currentVenue?.room_code || 'N/A'),
    wsClient: (__VLS_ctx.wsClient),
    peerConnections: (__VLS_ctx.peerConnections),
    localStream: (__VLS_ctx.localStream),
    selfId: (__VLS_ctx.selfId),
    onCleanup: (__VLS_ctx.handleCleanup),
}));
const __VLS_31 = __VLS_30({
    ...{ 'onRaiseHandChange': {} },
    ref: "roomControlBarRef",
    roomType: "live",
    roomId: (__VLS_ctx.currentVenueId),
    roomCode: (__VLS_ctx.currentVenue?.room_code || 'N/A'),
    wsClient: (__VLS_ctx.wsClient),
    peerConnections: (__VLS_ctx.peerConnections),
    localStream: (__VLS_ctx.localStream),
    selfId: (__VLS_ctx.selfId),
    onCleanup: (__VLS_ctx.handleCleanup),
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
let __VLS_35;
const __VLS_36 = {
    onRaiseHandChange: (__VLS_ctx.handleRaiseHandChange)
};
/** @type {typeof __VLS_ctx.roomControlBarRef} */ ;
var __VLS_37 = {};
var __VLS_32;
/** @type {__VLS_StyleScopedClasses['live-room-page']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
/** @type {__VLS_StyleScopedClasses['with-control-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['live-head']} */ ;
/** @type {__VLS_StyleScopedClasses['live-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['live-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['live-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['live-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['video-section']} */ ;
/** @type {__VLS_StyleScopedClasses['main-video-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['raised-hand-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['side-panel-section']} */ ;
// @ts-ignore
var __VLS_29 = __VLS_28, __VLS_38 = __VLS_37;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MediaTile: MediaTile,
            RoomControlBar: RoomControlBar,
            LiveSidePanel: LiveSidePanel,
            VenueSwitcher: VenueSwitcher,
            wsClient: wsClient,
            peerConnections: peerConnections,
            remoteStreams: remoteStreams,
            localStream: localStream,
            localVideoRef: localVideoRef,
            onlineUsers: onlineUsers,
            roomControlBarRef: roomControlBarRef,
            liveSidePanelRef: liveSidePanelRef,
            currentVenueId: currentVenueId,
            currentVenue: currentVenue,
            mainVenue: mainVenue,
            subVenues: subVenues,
            selfId: selfId,
            selfName: selfName,
            canPublish: canPublish,
            getUserDisplayName: getUserDisplayName,
            isHandRaised: isHandRaised,
            bindRemoteVideo: bindRemoteVideo,
            startPublish: startPublish,
            handleVenueSwitch: handleVenueSwitch,
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
