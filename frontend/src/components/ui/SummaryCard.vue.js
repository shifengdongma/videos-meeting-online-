import { computed } from 'vue';
const props = withDefaults(defineProps(), {
    tone: 'neutral'
});
const variantClass = computed(() => `tone-${props.tone}`);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    tone: 'neutral'
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-neutral']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-success']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    shadow: "hover",
    ...{ class: "summary-card" },
    ...{ class: (__VLS_ctx.variantClass) },
}));
const __VLS_2 = __VLS_1({
    shadow: "hover",
    ...{ class: "summary-card" },
    ...{ class: (__VLS_ctx.variantClass) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.label);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.value);
if (__VLS_ctx.hint) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hint" },
    });
    (__VLS_ctx.hint);
}
if (__VLS_ctx.description) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description" },
    });
    (__VLS_ctx.description);
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value-row']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            variantClass: variantClass,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
