import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import EmptyState from '../../components/ui/EmptyState.vue';
import StatusTag from '../../components/ui/StatusTag.vue';
import { fetchMeetingTemplates, useMeetingTemplate } from '../../api/meetingTemplates';
import { createMeeting, fetchMeetings } from '../../api/meetings';
import { useAuthStore } from '../../stores/auth';
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const meetings = ref([]);
const templates = ref([]);
const loading = ref(false);
const templateLoading = ref(false);
const dialogVisible = ref(false);
const templateDialogVisible = ref(false);
const form = reactive({ title: '', start_time: '', end_time: '', record_url: '' });
const templateForm = reactive({
    templateId: null,
    title: '',
    start_time: '',
    end_time: '',
    record_url: ''
});
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role));
const ongoingCount = computed(() => meetings.value.filter((item) => item.status === 'ongoing').length);
const scheduledCount = computed(() => meetings.value.filter((item) => item.status === 'scheduled').length);
const endedCount = computed(() => meetings.value.filter((item) => item.status === 'ended').length);
const activeTemplates = computed(() => templates.value.filter((item) => item.is_active));
const selectedTemplate = computed(() => activeTemplates.value.find((item) => item.id === templateForm.templateId) || null);
const statusText = (status) => {
    if (status === 'ongoing')
        return '进行中';
    if (status === 'scheduled')
        return '待开始';
    if (status === 'ended')
        return '已结束';
    return '未知状态';
};
const resetTemplateForm = () => {
    templateForm.templateId = null;
    templateForm.title = '';
    templateForm.start_time = '';
    templateForm.end_time = '';
    templateForm.record_url = '';
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
const loadTemplates = async () => {
    templateLoading.value = true;
    try {
        templates.value = await fetchMeetingTemplates();
    }
    finally {
        templateLoading.value = false;
    }
};
const handleCreate = async () => {
    await createMeeting(form);
    ElMessage.success('会议创建成功');
    dialogVisible.value = false;
    form.title = '';
    form.start_time = '';
    form.end_time = '';
    form.record_url = '';
    await loadMeetings();
};
const handleTemplateChange = (templateId) => {
    const template = activeTemplates.value.find((item) => item.id === templateId);
    if (!template) {
        return;
    }
    templateForm.title = template.default_title || template.name;
    templateForm.record_url = template.record_url || '';
    templateForm.end_time = '';
};
const openTemplateDialog = async () => {
    if (!templates.value.length) {
        await loadTemplates();
    }
    resetTemplateForm();
    templateDialogVisible.value = true;
};
const handleUseTemplate = async () => {
    if (!templateForm.templateId) {
        ElMessage.error('请选择模板');
        return;
    }
    if (!templateForm.start_time) {
        ElMessage.error('请选择开始时间');
        return;
    }
    const template = selectedTemplate.value;
    if (!template) {
        ElMessage.error('所选模板不可用');
        return;
    }
    if (!template.default_duration_minutes && !templateForm.end_time) {
        ElMessage.error('当前模板未设置默认时长，请填写结束时间');
        return;
    }
    if (templateForm.end_time && templateForm.end_time <= templateForm.start_time) {
        ElMessage.error('结束时间必须晚于开始时间');
        return;
    }
    const meeting = await useMeetingTemplate(templateForm.templateId, {
        title: templateForm.title.trim() || undefined,
        start_time: templateForm.start_time,
        end_time: templateForm.end_time || undefined,
        record_url: templateForm.record_url?.trim() || undefined
    });
    ElMessage.success('会议创建成功');
    templateDialogVisible.value = false;
    resetTemplateForm();
    await loadMeetings();
    await router.replace('/meetings');
    router.push(`/meetings/${meeting.id}`);
};
const applyTemplateFromQuery = async () => {
    const rawId = route.query.templateId;
    if (!canCreate.value || !rawId) {
        return;
    }
    if (!templates.value.length) {
        await loadTemplates();
    }
    const templateId = Number(rawId);
    const template = activeTemplates.value.find((item) => item.id === templateId);
    if (!template) {
        await router.replace('/meetings');
        return;
    }
    resetTemplateForm();
    templateDialogVisible.value = true;
    templateForm.templateId = template.id;
    handleTemplateChange(template.id);
    await router.replace('/meetings');
};
const openMeeting = (meetingId) => {
    router.push(`/meetings/${meetingId}`);
};
onMounted(async () => {
    await loadMeetings();
    await applyTemplateFromQuery();
});
watch(() => route.query.templateId, async (value) => {
    if (value) {
        await applyTemplateFromQuery();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['enter-button']} */ ;
/** @type {__VLS_StyleScopedClasses['enter-button']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table__row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "space-y-8" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "flex items-start justify-between gap-6 rounded-xl bg-white/70 p-6 shadow-sm ring-1 ring-gray-100 backdrop-blur-sm" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "max-w-3xl" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-xs font-semibold uppercase tracking-[0.24em] text-[#2E3A59]/70" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "mt-3 text-3xl font-bold tracking-tight text-[#2E3A59]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "mt-3 text-sm leading-7 text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex items-center gap-3" },
});
if (__VLS_ctx.canCreate) {
    const __VLS_0 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.openTemplateDialog)
    };
    __VLS_3.slots.default;
    var __VLS_3;
}
if (__VLS_ctx.canCreate) {
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canCreate))
                return;
            __VLS_ctx.dialogVisible = true;
        }
    };
    __VLS_11.slots.default;
    var __VLS_11;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "grid grid-cols-4 gap-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-sm font-medium text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-4 text-4xl font-bold text-[#2E3A59]" },
});
(__VLS_ctx.meetings.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "mt-3 text-sm leading-6 text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-sm font-medium text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-4 text-4xl font-bold text-[#FBC02D]" },
});
(__VLS_ctx.ongoingCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "mt-3 text-sm leading-6 text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-sm font-medium text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-4 text-4xl font-bold text-[#1E9E6F]" },
});
(__VLS_ctx.scheduledCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "mt-3 text-sm leading-6 text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-sm font-medium text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mt-4 text-4xl font-bold text-[#E57373]" },
});
(__VLS_ctx.endedCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "mt-3 text-sm leading-6 text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "overflow-hidden rounded-xl bg-white shadow-sm" },
});
const __VLS_16 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    data: (__VLS_ctx.meetings),
    ...{ class: "meeting-table" },
}));
const __VLS_18 = __VLS_17({
    data: (__VLS_ctx.meetings),
    ...{ class: "meeting-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_19.slots.default;
const __VLS_20 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    prop: "title",
    label: "主题",
    minWidth: "220",
}));
const __VLS_22 = __VLS_21({
    prop: "title",
    label: "主题",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    prop: "start_time",
    label: "开始时间",
    minWidth: "180",
}));
const __VLS_26 = __VLS_25({
    prop: "start_time",
    label: "开始时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    prop: "end_time",
    label: "结束时间",
    minWidth: "180",
}));
const __VLS_30 = __VLS_29({
    prop: "end_time",
    label: "结束时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "状态",
    width: "120",
}));
const __VLS_34 = __VLS_33({
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_35.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    /** @type {[typeof StatusTag, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(StatusTag, new StatusTag({
        text: (__VLS_ctx.statusText(scope.row.status)),
        status: (scope.row.status),
    }));
    const __VLS_37 = __VLS_36({
        text: (__VLS_ctx.statusText(scope.row.status)),
        status: (scope.row.status),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
}
var __VLS_35;
const __VLS_39 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    label: "操作",
    width: "168",
    fixed: "right",
}));
const __VLS_41 = __VLS_40({
    label: "操作",
    width: "168",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_42.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_42.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openMeeting(scope.row.id);
            } },
        ...{ class: "enter-button" },
        type: "button",
    });
}
var __VLS_42;
var __VLS_19;
if (!__VLS_ctx.loading && !__VLS_ctx.meetings.length) {
    /** @type {[typeof EmptyState, typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        description: "当前还没有会议，可先创建一场新的会议。",
    }));
    const __VLS_44 = __VLS_43({
        description: "当前还没有会议，可先创建一场新的会议。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    __VLS_45.slots.default;
    {
        const { actions: __VLS_thisSlot } = __VLS_45.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flex items-center gap-3" },
        });
        if (__VLS_ctx.canCreate) {
            const __VLS_46 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
                ...{ 'onClick': {} },
            }));
            const __VLS_48 = __VLS_47({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            let __VLS_50;
            let __VLS_51;
            let __VLS_52;
            const __VLS_53 = {
                onClick: (__VLS_ctx.openTemplateDialog)
            };
            __VLS_49.slots.default;
            var __VLS_49;
        }
        if (__VLS_ctx.canCreate) {
            const __VLS_54 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_56 = __VLS_55({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_55));
            let __VLS_58;
            let __VLS_59;
            let __VLS_60;
            const __VLS_61 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.loading && !__VLS_ctx.meetings.length))
                        return;
                    if (!(__VLS_ctx.canCreate))
                        return;
                    __VLS_ctx.dialogVisible = true;
                }
            };
            __VLS_57.slots.default;
            var __VLS_57;
        }
    }
    var __VLS_45;
}
const __VLS_62 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "创建会议",
    width: "560px",
}));
const __VLS_64 = __VLS_63({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "创建会议",
    width: "560px",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
__VLS_65.slots.default;
const __VLS_66 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    labelWidth: "90px",
    ...{ class: "dialog-form" },
}));
const __VLS_68 = __VLS_67({
    labelWidth: "90px",
    ...{ class: "dialog-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_69.slots.default;
const __VLS_70 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    label: "会议主题",
}));
const __VLS_72 = __VLS_71({
    label: "会议主题",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
__VLS_73.slots.default;
const __VLS_74 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "例如：月度项目评审会",
}));
const __VLS_76 = __VLS_75({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "例如：月度项目评审会",
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
var __VLS_73;
const __VLS_78 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
    label: "开始时间",
}));
const __VLS_80 = __VLS_79({
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
__VLS_81.slots.default;
const __VLS_82 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    modelValue: (__VLS_ctx.form.start_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}));
const __VLS_84 = __VLS_83({
    modelValue: (__VLS_ctx.form.start_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
var __VLS_81;
const __VLS_86 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    label: "结束时间",
}));
const __VLS_88 = __VLS_87({
    label: "结束时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
__VLS_89.slots.default;
const __VLS_90 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    modelValue: (__VLS_ctx.form.end_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}));
const __VLS_92 = __VLS_91({
    modelValue: (__VLS_ctx.form.end_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
var __VLS_89;
var __VLS_69;
{
    const { footer: __VLS_thisSlot } = __VLS_65.slots;
    const __VLS_94 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        ...{ 'onClick': {} },
    }));
    const __VLS_96 = __VLS_95({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    let __VLS_98;
    let __VLS_99;
    let __VLS_100;
    const __VLS_101 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_97.slots.default;
    var __VLS_97;
    const __VLS_102 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_104 = __VLS_103({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    let __VLS_106;
    let __VLS_107;
    let __VLS_108;
    const __VLS_109 = {
        onClick: (__VLS_ctx.handleCreate)
    };
    __VLS_105.slots.default;
    var __VLS_105;
}
var __VLS_65;
const __VLS_110 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    modelValue: (__VLS_ctx.templateDialogVisible),
    title: "从模板创建会议",
    width: "620px",
}));
const __VLS_112 = __VLS_111({
    modelValue: (__VLS_ctx.templateDialogVisible),
    title: "从模板创建会议",
    width: "620px",
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
__VLS_113.slots.default;
const __VLS_114 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    labelWidth: "100px",
    ...{ class: "dialog-form" },
}));
const __VLS_116 = __VLS_115({
    labelWidth: "100px",
    ...{ class: "dialog-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
__VLS_117.slots.default;
const __VLS_118 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    label: "选择模板",
}));
const __VLS_120 = __VLS_119({
    label: "选择模板",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
__VLS_121.slots.default;
const __VLS_122 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.templateForm.templateId),
    placeholder: "请选择模板",
    ...{ class: "full-width" },
}));
const __VLS_124 = __VLS_123({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.templateForm.templateId),
    placeholder: "请选择模板",
    ...{ class: "full-width" },
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
let __VLS_126;
let __VLS_127;
let __VLS_128;
const __VLS_129 = {
    onChange: (__VLS_ctx.handleTemplateChange)
};
__VLS_125.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.activeTemplates))) {
    const __VLS_130 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_132 = __VLS_131({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
}
var __VLS_125;
var __VLS_121;
if (__VLS_ctx.selectedTemplate) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-preview" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-title" },
    });
    (__VLS_ctx.selectedTemplate.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "preview-description" },
    });
    (__VLS_ctx.selectedTemplate.description || '该模板暂无额外说明。');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.selectedTemplate.default_title || __VLS_ctx.selectedTemplate.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.selectedTemplate.default_duration_minutes ? `${__VLS_ctx.selectedTemplate.default_duration_minutes} 分钟` : '需手动填写结束时间');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.selectedTemplate.capacity_label || '未设置');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-3 flex flex-wrap gap-2" },
    });
    for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.selectedTemplate.tags))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (tag),
            ...{ class: "rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600" },
        });
        (tag);
    }
}
const __VLS_134 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
    label: "会议主题",
}));
const __VLS_136 = __VLS_135({
    label: "会议主题",
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
__VLS_137.slots.default;
const __VLS_138 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
    modelValue: (__VLS_ctx.templateForm.title),
    placeholder: "留空则使用模板默认标题",
}));
const __VLS_140 = __VLS_139({
    modelValue: (__VLS_ctx.templateForm.title),
    placeholder: "留空则使用模板默认标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
var __VLS_137;
const __VLS_142 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    label: "开始时间",
}));
const __VLS_144 = __VLS_143({
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
__VLS_145.slots.default;
const __VLS_146 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    modelValue: (__VLS_ctx.templateForm.start_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}));
const __VLS_148 = __VLS_147({
    modelValue: (__VLS_ctx.templateForm.start_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
var __VLS_145;
const __VLS_150 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    label: "结束时间",
}));
const __VLS_152 = __VLS_151({
    label: "结束时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
__VLS_153.slots.default;
const __VLS_154 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    modelValue: (__VLS_ctx.templateForm.end_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}));
const __VLS_156 = __VLS_155({
    modelValue: (__VLS_ctx.templateForm.end_time),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ class: "time-picker" },
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "form-hint" },
});
(__VLS_ctx.selectedTemplate?.default_duration_minutes ? '可留空，系统将按模板默认时长自动计算。' : '当前模板未设置默认时长，请手动填写结束时间。');
var __VLS_153;
const __VLS_158 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    label: "录播地址",
}));
const __VLS_160 = __VLS_159({
    label: "录播地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
const __VLS_162 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    modelValue: (__VLS_ctx.templateForm.record_url),
    placeholder: "可选，默认带入模板录播地址",
}));
const __VLS_164 = __VLS_163({
    modelValue: (__VLS_ctx.templateForm.record_url),
    placeholder: "可选，默认带入模板录播地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
var __VLS_161;
var __VLS_117;
{
    const { footer: __VLS_thisSlot } = __VLS_113.slots;
    const __VLS_166 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
        ...{ 'onClick': {} },
    }));
    const __VLS_168 = __VLS_167({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    let __VLS_170;
    let __VLS_171;
    let __VLS_172;
    const __VLS_173 = {
        onClick: (...[$event]) => {
            __VLS_ctx.templateDialogVisible = false;
        }
    };
    __VLS_169.slots.default;
    var __VLS_169;
    const __VLS_174 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_176 = __VLS_175({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_175));
    let __VLS_178;
    let __VLS_179;
    let __VLS_180;
    const __VLS_181 = {
        onClick: (__VLS_ctx.handleUseTemplate)
    };
    __VLS_177.slots.default;
    var __VLS_177;
}
var __VLS_113;
/** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/70']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-[0.24em]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#2E3A59]/70']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#2E3A59]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-7']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/80']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#2E3A59]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/80']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#FBC02D]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/80']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#1E9E6F]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/80']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#E57373]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-table']} */ ;
/** @type {__VLS_StyleScopedClasses['enter-button']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-form']} */ ;
/** @type {__VLS_StyleScopedClasses['time-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['time-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-form']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['template-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-description']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['time-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['time-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            EmptyState: EmptyState,
            StatusTag: StatusTag,
            meetings: meetings,
            loading: loading,
            dialogVisible: dialogVisible,
            templateDialogVisible: templateDialogVisible,
            form: form,
            templateForm: templateForm,
            canCreate: canCreate,
            ongoingCount: ongoingCount,
            scheduledCount: scheduledCount,
            endedCount: endedCount,
            activeTemplates: activeTemplates,
            selectedTemplate: selectedTemplate,
            statusText: statusText,
            handleCreate: handleCreate,
            handleTemplateChange: handleTemplateChange,
            openTemplateDialog: openTemplateDialog,
            handleUseTemplate: handleUseTemplate,
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
