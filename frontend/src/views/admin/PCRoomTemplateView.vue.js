import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import EmptyState from '../../components/ui/EmptyState.vue';
import { createMeetingTemplate, deleteMeetingTemplate, fetchMeetingTemplates, updateMeetingTemplate } from '../../api/meetingTemplates';
const router = useRouter();
const templates = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const editingTemplateId = ref(null);
const form = reactive({
    name: '',
    description: '',
    default_title: '',
    default_duration_minutes: null,
    capacity_label: '',
    record_url: '',
    tagsText: '',
    is_active: true
});
const activeCount = computed(() => templates.value.filter((item) => item.is_active).length);
const inactiveCount = computed(() => templates.value.filter((item) => !item.is_active).length);
const durationCount = computed(() => templates.value.filter((item) => item.default_duration_minutes).length);
const formatDateTime = (value) => value.replace('T', ' ');
const normalizeTags = (value) => value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
const resetForm = () => {
    editingTemplateId.value = null;
    form.name = '';
    form.description = '';
    form.default_title = '';
    form.default_duration_minutes = null;
    form.capacity_label = '';
    form.record_url = '';
    form.tagsText = '';
    form.is_active = true;
};
const toPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim() || null,
    default_title: form.default_title.trim() || null,
    default_duration_minutes: form.default_duration_minutes,
    capacity_label: form.capacity_label.trim() || null,
    record_url: form.record_url.trim() || null,
    tags: normalizeTags(form.tagsText),
    is_active: form.is_active
});
const fillForm = (template) => {
    editingTemplateId.value = template.id;
    form.name = template.name;
    form.description = template.description || '';
    form.default_title = template.default_title || '';
    form.default_duration_minutes = template.default_duration_minutes;
    form.capacity_label = template.capacity_label || '';
    form.record_url = template.record_url || '';
    form.tagsText = template.tags.join(', ');
    form.is_active = template.is_active;
};
const loadTemplates = async () => {
    loading.value = true;
    try {
        templates.value = await fetchMeetingTemplates();
    }
    finally {
        loading.value = false;
    }
};
const openCreateDialog = () => {
    resetForm();
    dialogVisible.value = true;
};
const openEditDialog = (template) => {
    fillForm(template);
    dialogVisible.value = true;
};
const submitTemplate = async () => {
    if (!form.name.trim()) {
        ElMessage.error('请输入模板名称');
        return;
    }
    if (editingTemplateId.value) {
        await updateMeetingTemplate(editingTemplateId.value, toPayload());
        ElMessage.success('模板更新成功');
    }
    else {
        await createMeetingTemplate(toPayload());
        ElMessage.success('模板创建成功');
    }
    dialogVisible.value = false;
    resetForm();
    await loadTemplates();
};
const removeTemplate = async (templateId) => {
    await ElMessageBox.confirm('删除后将无法继续编辑该模板，是否继续？', '删除模板', {
        type: 'warning'
    });
    await deleteMeetingTemplate(templateId);
    ElMessage.success('模板已删除');
    await loadTemplates();
};
const useTemplate = (templateId) => {
    router.push(`/meetings?templateId=${templateId}`);
};
onMounted(loadTemplates);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['template-table']} */ ;
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
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.openCreateDialog)
};
__VLS_3.slots.default;
var __VLS_3;
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
(__VLS_ctx.templates.length);
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
(__VLS_ctx.activeCount);
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
(__VLS_ctx.inactiveCount);
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
(__VLS_ctx.durationCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "mt-3 text-sm leading-6 text-slate-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "overflow-hidden rounded-xl bg-white shadow-sm" },
});
const __VLS_8 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    data: (__VLS_ctx.templates),
    ...{ class: "template-table" },
}));
const __VLS_10 = __VLS_9({
    data: (__VLS_ctx.templates),
    ...{ class: "template-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_11.slots.default;
const __VLS_12 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    prop: "name",
    label: "模板名称",
    minWidth: "180",
}));
const __VLS_14 = __VLS_13({
    prop: "name",
    label: "模板名称",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    prop: "default_title",
    label: "默认标题",
    minWidth: "180",
}));
const __VLS_18 = __VLS_17({
    prop: "default_title",
    label: "默认标题",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_19.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (scope.row.default_title || '—');
}
var __VLS_19;
const __VLS_20 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "默认时长",
    width: "120",
}));
const __VLS_22 = __VLS_21({
    label: "默认时长",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_23.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (scope.row.default_duration_minutes ? `${scope.row.default_duration_minutes} 分钟` : '—');
}
var __VLS_23;
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "容量",
    width: "120",
}));
const __VLS_26 = __VLS_25({
    label: "容量",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_27.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (scope.row.capacity_label || '—');
}
var __VLS_27;
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "标签",
    minWidth: "220",
}));
const __VLS_30 = __VLS_29({
    label: "标签",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_31.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex flex-wrap gap-2" },
    });
    for (const [tag] of __VLS_getVForSourceType((scope.row.tags))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (tag),
            ...{ class: "rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600" },
        });
        (tag);
    }
    if (!scope.row.tags.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "text-slate-400" },
        });
    }
}
var __VLS_31;
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "inline-flex rounded-full px-3 py-1 text-xs font-medium" },
        ...{ class: (scope.row.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500') },
    });
    (scope.row.is_active ? '启用中' : '已停用');
}
var __VLS_35;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "更新时间",
    minWidth: "180",
}));
const __VLS_38 = __VLS_37({
    label: "更新时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_39.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(scope.row.updated_at));
}
var __VLS_39;
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "操作",
    width: "240",
    fixed: "right",
}));
const __VLS_42 = __VLS_41({
    label: "操作",
    width: "240",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_43.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex items-center gap-3" },
    });
    const __VLS_44 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEditDialog(scope.row);
        }
    };
    __VLS_47.slots.default;
    var __VLS_47;
    const __VLS_52 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        disabled: (!scope.row.is_active),
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        disabled: (!scope.row.is_active),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onClick: (...[$event]) => {
            __VLS_ctx.useTemplate(scope.row.id);
        }
    };
    __VLS_55.slots.default;
    var __VLS_55;
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeTemplate(scope.row.id);
        }
    };
    __VLS_63.slots.default;
    var __VLS_63;
}
var __VLS_43;
var __VLS_11;
if (!__VLS_ctx.loading && !__VLS_ctx.templates.length) {
    /** @type {[typeof EmptyState, typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        description: "当前还没有会议室模板，可先创建一个标准模板。",
    }));
    const __VLS_69 = __VLS_68({
        description: "当前还没有会议室模板，可先创建一个标准模板。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_70.slots.default;
    {
        const { actions: __VLS_thisSlot } = __VLS_70.slots;
        const __VLS_71 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_73 = __VLS_72({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        let __VLS_75;
        let __VLS_76;
        let __VLS_77;
        const __VLS_78 = {
            onClick: (__VLS_ctx.openCreateDialog)
        };
        __VLS_74.slots.default;
        var __VLS_74;
    }
    var __VLS_70;
}
const __VLS_79 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingTemplateId ? '编辑模板' : '新建模板'),
    width: "620px",
}));
const __VLS_81 = __VLS_80({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingTemplateId ? '编辑模板' : '新建模板'),
    width: "620px",
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
__VLS_82.slots.default;
const __VLS_83 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
    labelWidth: "110px",
    ...{ class: "dialog-form" },
}));
const __VLS_85 = __VLS_84({
    labelWidth: "110px",
    ...{ class: "dialog-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
__VLS_86.slots.default;
const __VLS_87 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    label: "模板名称",
}));
const __VLS_89 = __VLS_88({
    label: "模板名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
__VLS_90.slots.default;
const __VLS_91 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "例如：标准内部会议",
}));
const __VLS_93 = __VLS_92({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "例如：标准内部会议",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
var __VLS_90;
const __VLS_95 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
    label: "模板描述",
}));
const __VLS_97 = __VLS_96({
    label: "模板描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
__VLS_98.slots.default;
const __VLS_99 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "描述该模板适用的会议场景",
}));
const __VLS_101 = __VLS_100({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "描述该模板适用的会议场景",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
var __VLS_98;
const __VLS_103 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
    label: "默认标题",
}));
const __VLS_105 = __VLS_104({
    label: "默认标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
__VLS_106.slots.default;
const __VLS_107 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
    modelValue: (__VLS_ctx.form.default_title),
    placeholder: "留空时默认使用模板名称",
}));
const __VLS_109 = __VLS_108({
    modelValue: (__VLS_ctx.form.default_title),
    placeholder: "留空时默认使用模板名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_108));
var __VLS_106;
const __VLS_111 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
    label: "默认时长",
}));
const __VLS_113 = __VLS_112({
    label: "默认时长",
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
__VLS_114.slots.default;
const __VLS_115 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
    modelValue: (__VLS_ctx.form.default_duration_minutes),
    min: (1),
    step: (15),
    controlsPosition: "right",
}));
const __VLS_117 = __VLS_116({
    modelValue: (__VLS_ctx.form.default_duration_minutes),
    min: (1),
    step: (15),
    controlsPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "ml-3 text-sm text-slate-400" },
});
var __VLS_114;
const __VLS_119 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
    label: "容量说明",
}));
const __VLS_121 = __VLS_120({
    label: "容量说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
__VLS_122.slots.default;
const __VLS_123 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
    modelValue: (__VLS_ctx.form.capacity_label),
    placeholder: "例如：8-12 人",
}));
const __VLS_125 = __VLS_124({
    modelValue: (__VLS_ctx.form.capacity_label),
    placeholder: "例如：8-12 人",
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
var __VLS_122;
const __VLS_127 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
    label: "录播地址",
}));
const __VLS_129 = __VLS_128({
    label: "录播地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
__VLS_130.slots.default;
const __VLS_131 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
    modelValue: (__VLS_ctx.form.record_url),
    placeholder: "可选，使用模板时会作为默认录播地址",
}));
const __VLS_133 = __VLS_132({
    modelValue: (__VLS_ctx.form.record_url),
    placeholder: "可选，使用模板时会作为默认录播地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_132));
var __VLS_130;
const __VLS_135 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({
    label: "标签",
}));
const __VLS_137 = __VLS_136({
    label: "标签",
}, ...__VLS_functionalComponentArgsRest(__VLS_136));
__VLS_138.slots.default;
const __VLS_139 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
    modelValue: (__VLS_ctx.form.tagsText),
    placeholder: "使用逗号分隔，例如：屏幕共享, 纪要模板",
}));
const __VLS_141 = __VLS_140({
    modelValue: (__VLS_ctx.form.tagsText),
    placeholder: "使用逗号分隔，例如：屏幕共享, 纪要模板",
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
var __VLS_138;
const __VLS_143 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({
    label: "模板状态",
}));
const __VLS_145 = __VLS_144({
    label: "模板状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
__VLS_146.slots.default;
const __VLS_147 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
    modelValue: (__VLS_ctx.form.is_active),
    inlinePrompt: true,
    activeText: "启用",
    inactiveText: "停用",
}));
const __VLS_149 = __VLS_148({
    modelValue: (__VLS_ctx.form.is_active),
    inlinePrompt: true,
    activeText: "启用",
    inactiveText: "停用",
}, ...__VLS_functionalComponentArgsRest(__VLS_148));
var __VLS_146;
var __VLS_86;
{
    const { footer: __VLS_thisSlot } = __VLS_82.slots;
    const __VLS_151 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({
        ...{ 'onClick': {} },
    }));
    const __VLS_153 = __VLS_152({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    let __VLS_155;
    let __VLS_156;
    let __VLS_157;
    const __VLS_158 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_154.slots.default;
    var __VLS_154;
    const __VLS_159 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_161 = __VLS_160({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    let __VLS_163;
    let __VLS_164;
    let __VLS_165;
    const __VLS_166 = {
        onClick: (__VLS_ctx.submitTemplate)
    };
    __VLS_162.slots.default;
    var __VLS_162;
}
var __VLS_82;
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
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['template-table']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-form']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            EmptyState: EmptyState,
            templates: templates,
            loading: loading,
            dialogVisible: dialogVisible,
            editingTemplateId: editingTemplateId,
            form: form,
            activeCount: activeCount,
            inactiveCount: inactiveCount,
            durationCount: durationCount,
            formatDateTime: formatDateTime,
            openCreateDialog: openCreateDialog,
            openEditDialog: openEditDialog,
            submitTemplate: submitTemplate,
            removeTemplate: removeTemplate,
            useTemplate: useTemplate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
