import { useMediaQuery } from '@vueuse/core';
import PCPlaybackCenterView from './PCPlaybackCenterView.vue';
import MobilePlaybackCenterView from './h5/MobilePlaybackCenterView.vue';
// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
if (__VLS_ctx.isMobile) {
    /** @type {[typeof MobilePlaybackCenterView, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(MobilePlaybackCenterView, new MobilePlaybackCenterView({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
    var __VLS_3 = {};
    var __VLS_2;
}
else {
    /** @type {[typeof PCPlaybackCenterView, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(PCPlaybackCenterView, new PCPlaybackCenterView({}));
    const __VLS_5 = __VLS_4({}, ...__VLS_functionalComponentArgsRest(__VLS_4));
    var __VLS_7 = {};
    var __VLS_6;
}
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            PCPlaybackCenterView: PCPlaybackCenterView,
            MobilePlaybackCenterView: MobilePlaybackCenterView,
            isMobile: isMobile,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
