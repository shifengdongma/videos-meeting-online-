import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchMeetings, createMeeting } from '../../api/meetings';
import { useAuthStore } from '../../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const meetings = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(true);
const activeTab = ref(1);
// Create meeting dialog
const showCreateDialog = ref(false);
const newMeetingTitle = ref('');
const newMeetingDate = ref('');
const showDatePicker = ref(false);
const selectedDate = ref(['2024', '01', '01']);
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role));
onMounted(async () => {
    await loadMeetings();
});
const loadMeetings = async () => {
    try {
        loading.value = true;
        meetings.value = await fetchMeetings();
    }
    finally {
        loading.value = false;
    }
};
const onRefresh = async () => {
    await loadMeetings();
    refreshing.value = false;
};
const onLoad = () => {
    // All data loaded at once, no pagination
    finished.value = true;
};
const formatDateTime = (datetime) => {
    const d = new Date(datetime);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
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
const onDateConfirm = () => {
    newMeetingDate.value = selectedDate.value.join('-');
    showDatePicker.value = false;
};
const handleCreateMeeting = async (action) => {
    if (action === 'cancel') {
        resetCreateForm();
        return true;
    }
    if (!newMeetingTitle.value.trim()) {
        showToast('请输入会议标题');
        return false;
    }
    try {
        const startTime = newMeetingDate.value || new Date().toISOString();
        const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();
        await createMeeting({
            title: newMeetingTitle.value,
            start_time: startTime,
            end_time: endTime,
            record_url: null
        });
        showToast('创建成功');
        resetCreateForm();
        await loadMeetings();
        return true;
    }
    catch {
        showToast('创建失败');
        return false;
    }
};
const resetCreateForm = () => {
    newMeetingTitle.value = '';
    newMeetingDate.value = '';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h5-meeting-list" },
});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "会议中心",
    fixed: true,
    placeholder: true,
}));
const __VLS_2 = __VLS_1({
    title: "会议中心",
    fixed: true,
    placeholder: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.canCreate) {
    {
        const { right: __VLS_thisSlot } = __VLS_3.slots;
        const __VLS_4 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_6 = __VLS_5({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        let __VLS_8;
        let __VLS_9;
        let __VLS_10;
        const __VLS_11 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.canCreate))
                    return;
                __VLS_ctx.showCreateDialog = true;
            }
        };
        __VLS_7.slots.default;
        var __VLS_7;
    }
}
var __VLS_3;
const __VLS_12 = {}.VanPullRefresh;
/** @type {[typeof __VLS_components.VanPullRefresh, typeof __VLS_components.vanPullRefresh, typeof __VLS_components.VanPullRefresh, typeof __VLS_components.vanPullRefresh, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onRefresh': {} },
    modelValue: (__VLS_ctx.refreshing),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onRefresh': {} },
    modelValue: (__VLS_ctx.refreshing),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onRefresh: (__VLS_ctx.onRefresh)
};
__VLS_15.slots.default;
const __VLS_20 = {}.VanList;
/** @type {[typeof __VLS_components.VanList, typeof __VLS_components.vanList, typeof __VLS_components.VanList, typeof __VLS_components.vanList, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onLoad': {} },
    loading: (__VLS_ctx.loading),
    finished: (__VLS_ctx.finished),
    finishedText: "没有更多了",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onLoad': {} },
    loading: (__VLS_ctx.loading),
    finished: (__VLS_ctx.finished),
    finishedText: "没有更多了",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onLoad: (__VLS_ctx.onLoad)
};
__VLS_23.slots.default;
for (const [meeting] of __VLS_getVForSourceType((__VLS_ctx.meetings))) {
    const __VLS_28 = {}.VanCard;
    /** @type {[typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        key: (meeting.id),
        ...{ class: "meeting-card" },
    }));
    const __VLS_30 = __VLS_29({
        key: (meeting.id),
        ...{ class: "meeting-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_31.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meeting-title" },
        });
        (meeting.title);
    }
    {
        const { desc: __VLS_thisSlot } = __VLS_31.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meeting-time" },
        });
        (__VLS_ctx.formatDateTime(meeting.start_time));
        (__VLS_ctx.formatTime(meeting.end_time));
    }
    {
        const { tags: __VLS_thisSlot } = __VLS_31.slots;
        const __VLS_32 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            type: (__VLS_ctx.getStatusType(meeting.status)),
            size: "medium",
        }));
        const __VLS_34 = __VLS_33({
            type: (__VLS_ctx.getStatusType(meeting.status)),
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        (__VLS_ctx.statusLabel(meeting.status));
        var __VLS_35;
    }
    {
        const { footer: __VLS_thisSlot } = __VLS_31.slots;
        const __VLS_36 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_38 = __VLS_37({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_40;
        let __VLS_41;
        let __VLS_42;
        const __VLS_43 = {
            onClick: (...[$event]) => {
                __VLS_ctx.enterMeeting(meeting.id);
            }
        };
        __VLS_39.slots.default;
        var __VLS_39;
    }
    var __VLS_31;
}
if (!__VLS_ctx.loading && __VLS_ctx.meetings.length === 0) {
    const __VLS_44 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        description: "暂无会议安排",
    }));
    const __VLS_46 = __VLS_45({
        description: "暂无会议安排",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
}
var __VLS_23;
var __VLS_15;
const __VLS_48 = {}.VanDialog;
/** @type {[typeof __VLS_components.VanDialog, typeof __VLS_components.vanDialog, typeof __VLS_components.VanDialog, typeof __VLS_components.vanDialog, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    show: (__VLS_ctx.showCreateDialog),
    title: "创建会议",
    showCancelButton: true,
    beforeClose: (__VLS_ctx.handleCreateMeeting),
}));
const __VLS_50 = __VLS_49({
    show: (__VLS_ctx.showCreateDialog),
    title: "创建会议",
    showCancelButton: true,
    beforeClose: (__VLS_ctx.handleCreateMeeting),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.newMeetingTitle),
    label: "会议标题",
    placeholder: "请输入会议标题",
    required: true,
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.newMeetingTitle),
    label: "会议标题",
    placeholder: "请输入会议标题",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const __VLS_56 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.newMeetingDate),
    isLink: true,
    readonly: true,
    label: "开始时间",
    placeholder: "选择日期时间",
}));
const __VLS_58 = __VLS_57({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.newMeetingDate),
    isLink: true,
    readonly: true,
    label: "开始时间",
    placeholder: "选择日期时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showDatePicker = true;
    }
};
var __VLS_59;
const __VLS_64 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    show: (__VLS_ctx.showDatePicker),
    position: "bottom",
    round: true,
}));
const __VLS_66 = __VLS_65({
    show: (__VLS_ctx.showDatePicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.VanDatePicker;
/** @type {[typeof __VLS_components.VanDatePicker, typeof __VLS_components.vanDatePicker, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.selectedDate),
    title: "选择日期",
}));
const __VLS_70 = __VLS_69({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.selectedDate),
    title: "选择日期",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onConfirm: (__VLS_ctx.onDateConfirm)
};
const __VLS_76 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showDatePicker = false;
    }
};
var __VLS_71;
var __VLS_67;
var __VLS_51;
const __VLS_77 = {}.VanTabbar;
/** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}));
const __VLS_79 = __VLS_78({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
const __VLS_81 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    icon: "calendar-o",
    to: "/h5/dashboard",
}));
const __VLS_83 = __VLS_82({
    icon: "calendar-o",
    to: "/h5/dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
var __VLS_84;
const __VLS_85 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    icon: "video-o",
    to: "/h5/meetings",
}));
const __VLS_87 = __VLS_86({
    icon: "video-o",
    to: "/h5/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
__VLS_88.slots.default;
var __VLS_88;
const __VLS_89 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    icon: "play-circle-o",
    to: "/h5/live",
}));
const __VLS_91 = __VLS_90({
    icon: "play-circle-o",
    to: "/h5/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
var __VLS_92;
const __VLS_93 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    icon: "user-o",
    to: "/h5/profile",
}));
const __VLS_95 = __VLS_94({
    icon: "user-o",
    to: "/h5/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
var __VLS_96;
var __VLS_80;
/** @type {__VLS_StyleScopedClasses['h5-meeting-list']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-time']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            meetings: meetings,
            loading: loading,
            refreshing: refreshing,
            finished: finished,
            activeTab: activeTab,
            showCreateDialog: showCreateDialog,
            newMeetingTitle: newMeetingTitle,
            newMeetingDate: newMeetingDate,
            showDatePicker: showDatePicker,
            selectedDate: selectedDate,
            canCreate: canCreate,
            onRefresh: onRefresh,
            onLoad: onLoad,
            formatDateTime: formatDateTime,
            formatTime: formatTime,
            statusLabel: statusLabel,
            getStatusType: getStatusType,
            enterMeeting: enterMeeting,
            onDateConfirm: onDateConfirm,
            handleCreateMeeting: handleCreateMeeting,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
