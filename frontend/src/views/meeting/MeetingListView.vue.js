import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/layout/PageHeader.vue';
import EmptyState from '../../components/ui/EmptyState.vue';
import StatusTag from '../../components/ui/StatusTag.vue';
import SummaryCard from '../../components/ui/SummaryCard.vue';
import { createMeeting, fetchMeetings } from '../../api/meetings';
import { useAuthStore } from '../../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const meetings = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const form = reactive({ title: '', start_time: '', end_time: '', record_url: '' });
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role));
const ongoingCount = computed(() => meetings.value.filter((item) => item.status === 'ongoing').length);
const scheduledCount = computed(() => meetings.value.filter((item) => item.status === 'scheduled').length);
const endedCount = computed(() => meetings.value.filter((item) => item.status === 'ended').length);
const statusText = (status) => {
    if (status === 'ongoing')
        return '进行中';
    if (status === 'scheduled')
        return '待开始';
    if (status === 'ended')
        return '已结束';
    return '未知状态';
};
const loadMeetings = async () => {
    loading.value = true;
    try {
        meetings.value = await fetchMeetings();
    }
    finally {
        loading.value = false;
    }
};
const handleCreate = async () => {
    await createMeeting(form);
    ElMessage.success('会议创建成功');
    dialogVisible.value = false;
    form.title = '';
    form.start_time = '';
    form.end_time = '';
    await loadMeetings();
};
const openMeeting = (meetingId) => {
    router.push(`/meetings/${meetingId}`);
};
onMounted(loadMeetings);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meeting-page app-page" },
});
/** @type {[typeof PageHeader, typeof PageHeader, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(PageHeader, new PageHeader({
    eyebrow: "Meeting center",
    title: "会议中心",
    description: "统一查看会议安排、当前状态与会议入口，支持主持人快速创建新的会议房间。",
}));
const __VLS_1 = __VLS_0({
    eyebrow: "Meeting center",
    title: "会议中心",
    description: "统一查看会议安排、当前状态与会议入口，支持主持人快速创建新的会议房间。",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
{
    const { actions: __VLS_thisSlot } = __VLS_2.slots;
    if (__VLS_ctx.canCreate) {
        const __VLS_3 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
        }));
        const __VLS_5 = __VLS_4({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
        }, ...__VLS_functionalComponentArgsRest(__VLS_4));
        let __VLS_7;
        let __VLS_8;
        let __VLS_9;
        const __VLS_10 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.canCreate))
                    return;
                __VLS_ctx.dialogVisible = true;
            }
        };
        __VLS_6.slots.default;
        var __VLS_6;
    }
}
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-grid app-summary-grid" },
    'data-columns': "4",
});
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "全部会议",
    value: (__VLS_ctx.meetings.length),
    description: "当前系统内可访问的会议总数",
    tone: "primary",
}));
const __VLS_12 = __VLS_11({
    label: "全部会议",
    value: (__VLS_ctx.meetings.length),
    description: "当前系统内可访问的会议总数",
    tone: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "进行中",
    value: (__VLS_ctx.ongoingCount),
    hint: "实时进行",
    description: "正在使用会议室的场次",
    tone: "warning",
}));
const __VLS_15 = __VLS_14({
    label: "进行中",
    value: (__VLS_ctx.ongoingCount),
    hint: "实时进行",
    description: "正在使用会议室的场次",
    tone: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "待开始",
    value: (__VLS_ctx.scheduledCount),
    description: "已排期、等待进入的会议",
    tone: "success",
}));
const __VLS_18 = __VLS_17({
    label: "待开始",
    value: (__VLS_ctx.scheduledCount),
    description: "已排期、等待进入的会议",
    tone: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "已结束",
    value: (__VLS_ctx.endedCount),
    description: "已完成的历史会议",
    tone: "danger",
}));
const __VLS_21 = __VLS_20({
    label: "已结束",
    value: (__VLS_ctx.endedCount),
    description: "已完成的历史会议",
    tone: "danger",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const __VLS_23 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    ...{ class: "table-card app-table-card" },
    shadow: "never",
}));
const __VLS_25 = __VLS_24({
    ...{ class: "table-card app-table-card" },
    shadow: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
__VLS_26.slots.default;
const __VLS_27 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    data: (__VLS_ctx.meetings),
}));
const __VLS_29 = __VLS_28({
    data: (__VLS_ctx.meetings),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_30.slots.default;
const __VLS_31 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    prop: "title",
    label: "主题",
    minWidth: "220",
}));
const __VLS_33 = __VLS_32({
    prop: "title",
    label: "主题",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
const __VLS_35 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    prop: "start_time",
    label: "开始时间",
    minWidth: "180",
}));
const __VLS_37 = __VLS_36({
    prop: "start_time",
    label: "开始时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
const __VLS_39 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    prop: "end_time",
    label: "结束时间",
    minWidth: "180",
}));
const __VLS_41 = __VLS_40({
    prop: "end_time",
    label: "结束时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const __VLS_43 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    label: "状态",
    width: "120",
}));
const __VLS_45 = __VLS_44({
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_46.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_46.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    /** @type {[typeof StatusTag, ]} */ ;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(StatusTag, new StatusTag({
        text: (__VLS_ctx.statusText(scope.row.status)),
        status: (scope.row.status),
    }));
    const __VLS_48 = __VLS_47({
        text: (__VLS_ctx.statusText(scope.row.status)),
        status: (scope.row.status),
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
}
var __VLS_46;
const __VLS_50 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    label: "操作",
    width: "160",
    fixed: "right",
}));
const __VLS_52 = __VLS_51({
    label: "操作",
    width: "160",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_53.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_54 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        ...{ 'onClick': {} },
        ...{ class: "enter-button" },
        type: "primary",
    }));
    const __VLS_56 = __VLS_55({
        ...{ 'onClick': {} },
        ...{ class: "enter-button" },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    let __VLS_58;
    let __VLS_59;
    let __VLS_60;
    const __VLS_61 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openMeeting(scope.row.id);
        }
    };
    __VLS_57.slots.default;
    var __VLS_57;
}
var __VLS_53;
var __VLS_30;
if (!__VLS_ctx.loading && !__VLS_ctx.meetings.length) {
    /** @type {[typeof EmptyState, typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        description: "当前还没有会议，可先创建一场新的会议。",
    }));
    const __VLS_63 = __VLS_62({
        description: "当前还没有会议，可先创建一场新的会议。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_64.slots.default;
    {
        const { actions: __VLS_thisSlot } = __VLS_64.slots;
        if (__VLS_ctx.canCreate) {
            const __VLS_65 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_67 = __VLS_66({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_66));
            let __VLS_69;
            let __VLS_70;
            let __VLS_71;
            const __VLS_72 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.loading && !__VLS_ctx.meetings.length))
                        return;
                    if (!(__VLS_ctx.canCreate))
                        return;
                    __VLS_ctx.dialogVisible = true;
                }
            };
            __VLS_68.slots.default;
            var __VLS_68;
        }
    }
    var __VLS_64;
}
var __VLS_26;
const __VLS_73 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "创建会议",
    width: "560px",
}));
const __VLS_75 = __VLS_74({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "创建会议",
    width: "560px",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
const __VLS_77 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    labelWidth: "90px",
    ...{ class: "dialog-form" },
}));
const __VLS_79 = __VLS_78({
    labelWidth: "90px",
    ...{ class: "dialog-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
const __VLS_81 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    label: "会议主题",
}));
const __VLS_83 = __VLS_82({
    label: "会议主题",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
const __VLS_85 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "例如：月度项目评审会",
}));
const __VLS_87 = __VLS_86({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "例如：月度项目评审会",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
var __VLS_84;
const __VLS_89 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    label: "开始时间",
}));
const __VLS_91 = __VLS_90({
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
const __VLS_93 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    modelValue: (__VLS_ctx.form.start_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}));
const __VLS_95 = __VLS_94({
    modelValue: (__VLS_ctx.form.start_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
var __VLS_92;
const __VLS_97 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    label: "结束时间",
}));
const __VLS_99 = __VLS_98({
    label: "结束时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
const __VLS_101 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    modelValue: (__VLS_ctx.form.end_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}));
const __VLS_103 = __VLS_102({
    modelValue: (__VLS_ctx.form.end_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
var __VLS_100;
var __VLS_80;
{
    const { footer: __VLS_thisSlot } = __VLS_76.slots;
    const __VLS_105 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        ...{ 'onClick': {} },
    }));
    const __VLS_107 = __VLS_106({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    let __VLS_109;
    let __VLS_110;
    let __VLS_111;
    const __VLS_112 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_108.slots.default;
    var __VLS_108;
    const __VLS_113 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_115 = __VLS_114({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    let __VLS_117;
    let __VLS_118;
    let __VLS_119;
    const __VLS_120 = {
        onClick: (__VLS_ctx.handleCreate)
    };
    __VLS_116.slots.default;
    var __VLS_116;
}
var __VLS_76;
/** @type {__VLS_StyleScopedClasses['meeting-page']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['app-summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['enter-button']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-form']} */ ;
/** @type {__VLS_StyleScopedClasses['time-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['time-picker']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            PageHeader: PageHeader,
            EmptyState: EmptyState,
            StatusTag: StatusTag,
            SummaryCard: SummaryCard,
            meetings: meetings,
            loading: loading,
            dialogVisible: dialogVisible,
            form: form,
            canCreate: canCreate,
            ongoingCount: ongoingCount,
            scheduledCount: scheduledCount,
            endedCount: endedCount,
            statusText: statusText,
            handleCreate: handleCreate,
            openMeeting: openMeeting,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
