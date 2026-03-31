import { useMediaQuery } from '@vueuse/core';
import PCMeetingRoomView from './PCMeetingRoomView.vue';
import MobileMeetingRoomView from '../h5/MobileMeetingRoomView.vue';
// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
if (__VLS_ctx.isMobile) {
    /** @type {[typeof MobileMeetingRoomView, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(MobileMeetingRoomView, new MobileMeetingRoomView({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
    var __VLS_3 = {};
    var __VLS_2;
}
else {
    /** @type {[typeof PCMeetingRoomView, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(PCMeetingRoomView, new PCMeetingRoomView({}));
    const __VLS_5 = __VLS_4({}, ...__VLS_functionalComponentArgsRest(__VLS_4));
    var __VLS_7 = {};
    var __VLS_6;
}
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            PCMeetingRoomView: PCMeetingRoomView,
            MobileMeetingRoomView: MobileMeetingRoomView,
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
