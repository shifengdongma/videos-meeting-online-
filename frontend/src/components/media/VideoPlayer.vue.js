import { ref, watch } from 'vue';
const props = defineProps();
const videoRef = ref(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const volume = ref(80);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
watch(() => props.src, () => {
    isPlaying.value = false;
    currentTime.value = 0;
    progress.value = 0;
});
const togglePlay = () => {
    if (!videoRef.value)
        return;
    if (isPlaying.value) {
        videoRef.value.pause();
    }
    else {
        videoRef.value.play();
    }
    isPlaying.value = !isPlaying.value;
};
const toggleMute = () => {
    if (!videoRef.value)
        return;
    videoRef.value.muted = !videoRef.value.muted;
    isMuted.value = videoRef.value.muted;
};
const setVolume = (e) => {
    const target = e.target;
    volume.value = Number(target.value);
    if (videoRef.value) {
        videoRef.value.volume = volume.value / 100;
    }
};
const onTimeUpdate = () => {
    if (!videoRef.value)
        return;
    currentTime.value = videoRef.value.currentTime;
    progress.value = (currentTime.value / duration.value) * 100 || 0;
};
const onLoadedMetadata = () => {
    if (!videoRef.value)
        return;
    duration.value = videoRef.value.duration;
};
const seek = (e) => {
    if (!videoRef.value)
        return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.value.currentTime = percent * duration.value;
};
const toggleFullscreen = () => {
    if (!videoRef.value)
        return;
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    else {
        videoRef.value.requestFullscreen();
    }
};
const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['volume-slider']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "video-player" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
    ...{ onTimeupdate: (__VLS_ctx.onTimeUpdate) },
    ...{ onLoadedmetadata: (__VLS_ctx.onLoadedMetadata) },
    ref: "videoRef",
    src: (__VLS_ctx.src),
    ...{ class: "video-element" },
});
/** @type {typeof __VLS_ctx.videoRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.togglePlay) },
    ...{ class: "control-btn" },
});
if (__VLS_ctx.isPlaying) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.seek) },
    ...{ class: "progress-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "progress-fill" },
    ...{ style: ({ width: `${__VLS_ctx.progress}%` }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-display" },
});
(__VLS_ctx.formatTime(__VLS_ctx.currentTime));
(__VLS_ctx.formatTime(__VLS_ctx.duration));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "volume-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleMute) },
    ...{ class: "control-btn" },
});
(__VLS_ctx.isMuted ? '静音' : '音量');
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.setVolume) },
    type: "range",
    min: "0",
    max: "100",
    value: (__VLS_ctx.volume),
    ...{ class: "volume-slider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleFullscreen) },
    ...{ class: "control-btn" },
});
/** @type {__VLS_StyleScopedClasses['video-player']} */ ;
/** @type {__VLS_StyleScopedClasses['video-element']} */ ;
/** @type {__VLS_StyleScopedClasses['controls']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['time-display']} */ ;
/** @type {__VLS_StyleScopedClasses['volume-control']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['volume-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            videoRef: videoRef,
            isPlaying: isPlaying,
            isMuted: isMuted,
            volume: volume,
            currentTime: currentTime,
            duration: duration,
            progress: progress,
            togglePlay: togglePlay,
            toggleMute: toggleMute,
            setVolume: setVolume,
            onTimeUpdate: onTimeUpdate,
            onLoadedMetadata: onLoadedMetadata,
            seek: seek,
            toggleFullscreen: toggleFullscreen,
            formatTime: formatTime,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
