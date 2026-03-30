import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import MediaTile from '../../components/media/MediaTile.vue';
import { useAuthStore } from '../../stores/auth';
import { WsClient } from '../../utils/ws';
const route = useRoute();
const authStore = useAuthStore();
const liveId = Number(route.params.id);
const wsClient = new WsClient();
const peerConnections = new Map();
const remoteStreams = ref([]);
const localVideoRef = ref(null);
const localStream = ref(null);
const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`;
const canPublish = computed(() => ['admin', 'host'].includes(authStore.role));
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
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.value)
        localVideoRef.value.srcObject = localStream.value;
    ElMessage.success('主播流已准备');
};
const handleSignalMessage = async (raw) => {
    const payload = JSON.parse(raw.data);
    if (payload.from === selfId)
        return;
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
onMounted(() => {
    wsClient.connect(`ws://218.78.28.69:8001/ws/live/${liveId}`, handleSignalMessage);
    setTimeout(() => wsClient.send({ type: 'join', from: selfId }), 300);
});
onBeforeUnmount(() => {
    wsClient.close();
    peerConnections.forEach((pc) => pc.close());
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['live-head']} */ ;
/** @type {__VLS_StyleScopedClasses['live-head']} */ ;
/** @type {__VLS_StyleScopedClasses['live-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['video-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['live-head']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-room-page app-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.liveId);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-actions" },
});
if (__VLS_ctx.canPublish) {
    const __VLS_0 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.startPublish)
    };
    __VLS_3.slots.default;
    var __VLS_3;
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
(__VLS_ctx.remoteStreams.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "video-grid" },
});
/** @type {[typeof MediaTile, typeof MediaTile, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
    title: (__VLS_ctx.canPublish ? '主播本地画面' : '主直播画面'),
    subtitle: (__VLS_ctx.canPublish ? '用于推流预览' : '正在观看直播内容'),
    empty: (!__VLS_ctx.localStream),
    emptyText: (__VLS_ctx.canPublish ? '尚未开始本地采集' : '当前还没有收到直播画面'),
}));
const __VLS_9 = __VLS_8({
    title: (__VLS_ctx.canPublish ? '主播本地画面' : '主直播画面'),
    subtitle: (__VLS_ctx.canPublish ? '用于推流预览' : '正在观看直播内容'),
    empty: (!__VLS_ctx.localStream),
    emptyText: (__VLS_ctx.canPublish ? '尚未开始本地采集' : '当前还没有收到直播画面'),
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_10.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
    ref: "localVideoRef",
    autoplay: true,
    muted: true,
    playsinline: true,
});
/** @type {typeof __VLS_ctx.localVideoRef} */ ;
var __VLS_10;
for (const [stream] of __VLS_getVForSourceType((__VLS_ctx.remoteStreams))) {
    /** @type {[typeof MediaTile, typeof MediaTile, ]} */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(MediaTile, new MediaTile({
        key: (stream.id),
        title: (`远端流 ${stream.id.slice(-4)}`),
        subtitle: "实时直播连接",
    }));
    const __VLS_12 = __VLS_11({
        key: (stream.id),
        title: (`远端流 ${stream.id.slice(-4)}`),
        subtitle: "实时直播连接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_13.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        autoplay: true,
        playsinline: true,
        ref: ((el) => __VLS_ctx.bindRemoteVideo(el, stream.mediaStream)),
    });
    var __VLS_13;
}
/** @type {__VLS_StyleScopedClasses['live-room-page']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
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
/** @type {__VLS_StyleScopedClasses['video-grid']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MediaTile: MediaTile,
            liveId: liveId,
            remoteStreams: remoteStreams,
            localVideoRef: localVideoRef,
            localStream: localStream,
            canPublish: canPublish,
            bindRemoteVideo: bindRemoteVideo,
            startPublish: startPublish,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
