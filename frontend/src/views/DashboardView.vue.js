import { computed, onMounted, ref } from 'vue';
import { fetchMeetings } from '../api/meetings';
const meetings = ref([]);
const selectedDate = ref(new Date());
onMounted(async () => {
    meetings.value = await fetchMeetings();
});
const meetingDates = computed(() => {
    const dates = new Set();
    meetings.value.forEach(m => {
        const date = m.start_time.split('T')[0];
        dates.add(date);
    });
    return dates;
});
const hasMeetingOnDate = (dateStr) => {
    return meetingDates.value.has(dateStr);
};
const todayMeetings = computed(() => {
    const selectedDateStr = selectedDate.value.toISOString().split('T')[0];
    return meetings.value.filter(m => m.start_time.startsWith(selectedDateStr));
});
const formatSelectedDate = computed(() => {
    const d = selectedDate.value;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['calendar-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-status']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-status']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-status']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-link']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dashboard-view" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "calendar-section" },
});
const __VLS_0 = {}.ElCalendar;
/** @type {[typeof __VLS_components.ElCalendar, typeof __VLS_components.elCalendar, typeof __VLS_components.ElCalendar, typeof __VLS_components.elCalendar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.selectedDate),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.selectedDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { dateCell: __VLS_thisSlot } = __VLS_3.slots;
    const [{ data }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "calendar-cell" },
        ...{ class: ({ 'has-meeting': __VLS_ctx.hasMeetingOnDate(data.day) }) },
    });
    (data.day.split('-')[2]);
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meeting-list-section" },
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
if (__VLS_ctx.todayMeetings.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    const __VLS_4 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        description: "当日暂无会议安排",
    }));
    const __VLS_6 = __VLS_5({
        description: "当日暂无会议安排",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meeting-list" },
    });
    for (const [meeting] of __VLS_getVForSourceType((__VLS_ctx.todayMeetings))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (meeting.id),
            ...{ class: "meeting-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meeting-time" },
        });
        (__VLS_ctx.formatTime(meeting.start_time));
        (__VLS_ctx.formatTime(meeting.end_time));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meeting-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
            ...{ class: "meeting-title" },
        });
        (meeting.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meeting-status" },
            ...{ class: (meeting.status) },
        });
        (__VLS_ctx.statusLabel(meeting.status));
        const __VLS_8 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            to: (`/meetings/${meeting.id}`),
            ...{ class: "meeting-link" },
        }));
        const __VLS_10 = __VLS_9({
            to: (`/meetings/${meeting.id}`),
            ...{ class: "meeting-link" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        __VLS_11.slots.default;
        var __VLS_11;
    }
}
/** @type {__VLS_StyleScopedClasses['dashboard-view']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['has-meeting']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-list-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-count']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-list']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-time']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-status']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-link']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            selectedDate: selectedDate,
            hasMeetingOnDate: hasMeetingOnDate,
            todayMeetings: todayMeetings,
            formatSelectedDate: formatSelectedDate,
            formatTime: formatTime,
            statusLabel: statusLabel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
