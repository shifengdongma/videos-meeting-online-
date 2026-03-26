import { computed } from 'vue';
const props = defineProps();
const tagType = computed(() => {
    if (['scheduled', 'host'].includes(props.status || ''))
        return 'success';
    if (['ongoing', 'live', 'admin'].includes(props.status || ''))
        return 'warning';
    if (['ended', 'offline'].includes(props.status || ''))
        return 'danger';
    return 'info';
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    type: (__VLS_ctx.tagType),
    effect: "light",
    round: true,
    ...{ class: "status-tag" },
}));
const __VLS_2 = __VLS_1({
    type: (__VLS_ctx.tagType),
    effect: "light",
    round: true,
    ...{ class: "status-tag" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
(__VLS_ctx.text);
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            tagType: tagType,
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
