import { computed } from 'vue';
import { ArrowDown, VideoCamera } from '@element-plus/icons-vue';
const props = defineProps();
const emit = defineEmits();
const currentVenueName = computed(() => {
    if (props.currentVenueId === props.mainVenue?.id) {
        return props.mainVenue?.title || '主会场';
    }
    const sub = props.subVenues.find(s => s.id === props.currentVenueId);
    return sub?.title || '分会场';
});
const handleSwitch = (venueId) => {
    if (venueId !== props.currentVenueId) {
        emit('switch', venueId);
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "venue-switcher" },
});
const __VLS_0 = {}.ElDropdown;
/** @type {[typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onCommand': {} },
    trigger: "click",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onCommand': {} },
    trigger: "click",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onCommand: (__VLS_ctx.handleSwitch)
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    type: "primary",
    ...{ class: "switcher-btn" },
}));
const __VLS_10 = __VLS_9({
    type: "primary",
    ...{ class: "switcher-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.VideoCamera;
/** @type {[typeof __VLS_components.VideoCamera, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "current-venue-name" },
});
(__VLS_ctx.currentVenueName);
const __VLS_20 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ class: "dropdown-icon" },
}));
const __VLS_22 = __VLS_21({
    ...{ class: "dropdown-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ArrowDown;
/** @type {[typeof __VLS_components.ArrowDown, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_23;
var __VLS_11;
{
    const { dropdown: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_28 = {}.ElDropdownMenu;
    /** @type {[typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.elDropdownMenu, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    const __VLS_32 = {}.ElDropdownItem;
    /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        command: (__VLS_ctx.mainVenue?.id),
        ...{ class: ({ 'is-active': __VLS_ctx.currentVenueId === __VLS_ctx.mainVenue?.id }) },
    }));
    const __VLS_34 = __VLS_33({
        command: (__VLS_ctx.mainVenue?.id),
        ...{ class: ({ 'is-active': __VLS_ctx.currentVenueId === __VLS_ctx.mainVenue?.id }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "venue-item" },
    });
    const __VLS_36 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        type: "danger",
        size: "small",
    }));
    const __VLS_38 = __VLS_37({
        type: "danger",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    var __VLS_39;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "venue-title" },
    });
    (__VLS_ctx.mainVenue?.title || '主会场');
    var __VLS_35;
    for (const [sub] of __VLS_getVForSourceType((__VLS_ctx.subVenues))) {
        const __VLS_40 = {}.ElDropdownItem;
        /** @type {[typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            key: (sub.id),
            command: (sub.id),
            ...{ class: ({ 'is-active': __VLS_ctx.currentVenueId === sub.id }) },
        }));
        const __VLS_42 = __VLS_41({
            key: (sub.id),
            command: (sub.id),
            ...{ class: ({ 'is-active': __VLS_ctx.currentVenueId === sub.id }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "venue-item" },
        });
        const __VLS_44 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            type: "info",
            size: "small",
        }));
        const __VLS_46 = __VLS_45({
            type: "info",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        var __VLS_47;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "venue-title" },
        });
        (sub.title);
        var __VLS_43;
    }
    var __VLS_31;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['venue-switcher']} */ ;
/** @type {__VLS_StyleScopedClasses['switcher-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['current-venue-name']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['venue-item']} */ ;
/** @type {__VLS_StyleScopedClasses['venue-title']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['venue-item']} */ ;
/** @type {__VLS_StyleScopedClasses['venue-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArrowDown: ArrowDown,
            VideoCamera: VideoCamera,
            currentVenueName: currentVenueName,
            handleSwitch: handleSwitch,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
