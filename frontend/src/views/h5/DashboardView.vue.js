import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchMeetings } from '../../api/meetings';
const router = useRouter();
const meetings = ref([]);
const selectedDate = ref(new Date());
const activeTab = ref(0);
const minDate = new Date(2020, 0, 1);
const maxDate = new Date(2030, 11, 31);
onMounted(async () => {
    meetings.value = await fetchMeetings();
});
const onDateSelect = (date) => {
    selectedDate.value = date;
};
const todayMeetings = computed(() => {
    const selectedDateStr = selectedDate.value.toISOString().split('T')[0];
    return meetings.value.filter(m => m.start_time.startsWith(selectedDateStr));
});
const formatSelectedDate = computed(() => {
    const d = selectedDate.value;
    return `${d.getMonth() + 1}月${d.getDate()}日`;
});
const formatTime = (datetime) => {
    const d = new Date(datetime);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const statusLabel = (status) => {
    const labels = {
        scheduled: '已预约',
        ongoing: '进行中',
        ended: '已结束'
    };
    return labels[status] || status;
};
const getStatusType = (status) => {
    const types = {
        scheduled: 'primary',
        ongoing: 'success',
        ended: 'default'
    };
    return types[status] || 'default';
};
const enterMeeting = (id) => {
    router.push(`/meetings/${id}`);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h5-dashboard" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "calendar-section" },
});
const __VLS_0 = {}.VanCalendar;
/** @type {[typeof __VLS_components.VanCalendar, typeof __VLS_components.vanCalendar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onSelect': {} },
    showTitle: (true),
    poppable: (false),
    showConfirm: (false),
    minDate: (__VLS_ctx.minDate),
    maxDate: (__VLS_ctx.maxDate),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSelect': {} },
    showTitle: (true),
    poppable: (false),
    showConfirm: (false),
    minDate: (__VLS_ctx.minDate),
    maxDate: (__VLS_ctx.maxDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSelect: (__VLS_ctx.onDateSelect)
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meeting-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.formatSelectedDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "meeting-count" },
});
(__VLS_ctx.todayMeetings.length);
if (__VLS_ctx.todayMeetings.length > 0) {
    const __VLS_8 = {}.VanList;
    /** @type {[typeof __VLS_components.VanList, typeof __VLS_components.vanList, typeof __VLS_components.VanList, typeof __VLS_components.vanList, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    for (const [meeting] of __VLS_getVForSourceType((__VLS_ctx.todayMeetings))) {
        const __VLS_12 = {}.VanCard;
        /** @type {[typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            key: (meeting.id),
            ...{ class: "meeting-card" },
        }));
        const __VLS_14 = __VLS_13({
            key: (meeting.id),
            ...{ class: "meeting-card" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_15.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "meeting-title" },
            });
            (meeting.title);
        }
        {
            const { desc: __VLS_thisSlot } = __VLS_15.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "meeting-time" },
            });
            (__VLS_ctx.formatTime(meeting.start_time));
            (__VLS_ctx.formatTime(meeting.end_time));
        }
        {
            const { tags: __VLS_thisSlot } = __VLS_15.slots;
            const __VLS_16 = {}.VanTag;
            /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
                type: (__VLS_ctx.getStatusType(meeting.status)),
                size: "medium",
            }));
            const __VLS_18 = __VLS_17({
                type: (__VLS_ctx.getStatusType(meeting.status)),
                size: "medium",
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            __VLS_19.slots.default;
            (__VLS_ctx.statusLabel(meeting.status));
            var __VLS_19;
        }
        {
            const { footer: __VLS_thisSlot } = __VLS_15.slots;
            const __VLS_20 = {}.VanButton;
            /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                ...{ 'onClick': {} },
                size: "small",
                type: "primary",
            }));
            const __VLS_22 = __VLS_21({
                ...{ 'onClick': {} },
                size: "small",
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            let __VLS_24;
            let __VLS_25;
            let __VLS_26;
            const __VLS_27 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.todayMeetings.length > 0))
                        return;
                    __VLS_ctx.enterMeeting(meeting.id);
                }
            };
            __VLS_23.slots.default;
            var __VLS_23;
        }
        var __VLS_15;
    }
    var __VLS_11;
}
else {
    const __VLS_28 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        description: "当日暂无会议安排",
    }));
    const __VLS_30 = __VLS_29({
        description: "当日暂无会议安排",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
const __VLS_32 = {}.VanTabbar;
/** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    icon: "calendar-o",
    to: "/h5/dashboard",
}));
const __VLS_38 = __VLS_37({
    icon: "calendar-o",
    to: "/h5/dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
var __VLS_39;
const __VLS_40 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    icon: "video-o",
    to: "/h5/meetings",
}));
const __VLS_42 = __VLS_41({
    icon: "video-o",
    to: "/h5/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
var __VLS_43;
const __VLS_44 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    icon: "play-circle-o",
    to: "/h5/live",
}));
const __VLS_46 = __VLS_45({
    icon: "play-circle-o",
    to: "/h5/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
var __VLS_47;
const __VLS_48 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    icon: "user-o",
    to: "/h5/profile",
}));
const __VLS_50 = __VLS_49({
    icon: "user-o",
    to: "/h5/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
var __VLS_51;
var __VLS_35;
/** @type {__VLS_StyleScopedClasses['h5-dashboard']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-count']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-time']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeTab: activeTab,
            minDate: minDate,
            maxDate: maxDate,
            onDateSelect: onDateSelect,
            todayMeetings: todayMeetings,
            formatSelectedDate: formatSelectedDate,
            formatTime: formatTime,
            statusLabel: statusLabel,
            getStatusType: getStatusType,
            enterMeeting: enterMeeting,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
