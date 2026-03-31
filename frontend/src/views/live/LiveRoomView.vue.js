import { useMediaQuery } from '@vueuse/core';
import PCLiveRoomView from './PCLiveRoomView.vue';
import MobileLiveRoomView from '../h5/MobileLiveRoomView.vue';
// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
if (__VLS_ctx.isMobile) {
    /** @type {[typeof MobileLiveRoomView, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(MobileLiveRoomView, new MobileLiveRoomView({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
    var __VLS_3 = {};
    var __VLS_2;
}
else {
    /** @type {[typeof PCLiveRoomView, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(PCLiveRoomView, new PCLiveRoomView({}));
    const __VLS_5 = __VLS_4({}, ...__VLS_functionalComponentArgsRest(__VLS_4));
    var __VLS_7 = {};
    var __VLS_6;
}
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            PCLiveRoomView: PCLiveRoomView,
            MobileLiveRoomView: MobileLiveRoomView,
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
