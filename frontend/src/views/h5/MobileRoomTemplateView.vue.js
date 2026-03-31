import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { createMeetingTemplate, deleteMeetingTemplate, fetchMeetingTemplates, updateMeetingTemplate } from '../../api/meetingTemplates';
const router = useRouter();
const templates = ref([]);
const loading = ref(false);
const activeTab = ref(0);
const dialogVisible = ref(false);
const editingTemplateId = ref(null);
const form = reactive({
    name: '',
    description: '',
    default_title: '',
    default_duration_minutes: 0,
    capacity_label: '',
    record_url: '',
    tagsText: '',
    is_active: true
});
const activeCount = computed(() => templates.value.filter((item) => item.is_active).length);
const inactiveCount = computed(() => templates.value.filter((item) => !item.is_active).length);
const durationCount = computed(() => templates.value.filter((item) => item.default_duration_minutes).length);
const normalizeTags = (value) => value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
const resetForm = () => {
    editingTemplateId.value = null;
    form.name = '';
    form.description = '';
    form.default_title = '';
    form.default_duration_minutes = 0;
    form.capacity_label = '';
    form.record_url = '';
    form.tagsText = '';
    form.is_active = true;
};
const toPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim() || null,
    default_title: form.default_title.trim() || null,
    default_duration_minutes: form.default_duration_minutes || null,
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
    form.default_duration_minutes = template.default_duration_minutes || 0;
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
        showToast('请输入模板名称');
        return;
    }
    try {
        if (editingTemplateId.value) {
            await updateMeetingTemplate(editingTemplateId.value, toPayload());
            showToast('模板更新成功');
        }
        else {
            await createMeetingTemplate(toPayload());
            showToast('模板创建成功');
        }
        dialogVisible.value = false;
        resetForm();
        await loadTemplates();
    }
    catch {
        showToast('操作失败');
    }
};
const removeTemplate = async (templateId) => {
    try {
        await deleteMeetingTemplate(templateId);
        showToast('模板已删除');
        await loadTemplates();
    }
    catch {
        showToast('删除失败');
    }
};
const useTemplate = (templateId) => {
    router.push(`/meetings?templateId=${templateId}`);
};
onMounted(loadTemplates);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-form']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mobile-template-manage" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_0 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    ...{ class: "create-btn" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    ...{ class: "create-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.openCreateDialog)
};
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stats-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.templates.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value active" },
});
(__VLS_ctx.activeCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value inactive" },
});
(__VLS_ctx.inactiveCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value duration" },
});
(__VLS_ctx.durationCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "template-list" },
});
if (__VLS_ctx.loading) {
    const __VLS_8 = {}.VanLoading;
    /** @type {[typeof __VLS_components.VanLoading, typeof __VLS_components.vanLoading, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ class: "loading-center" },
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "loading-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
else if (__VLS_ctx.templates.length === 0) {
    const __VLS_12 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        description: "暂无模板数据",
    }));
    const __VLS_14 = __VLS_13({
        description: "暂无模板数据",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.VanButton;
    /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (__VLS_ctx.openCreateDialog)
    };
    __VLS_19.slots.default;
    var __VLS_19;
    var __VLS_15;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-list" },
    });
    for (const [template] of __VLS_getVForSourceType((__VLS_ctx.templates))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (template.id),
            ...{ class: "template-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "template-name" },
        });
        (template.name);
        const __VLS_24 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            type: (template.is_active ? 'success' : 'default'),
        }));
        const __VLS_26 = __VLS_25({
            type: (template.is_active ? 'success' : 'default'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_27.slots.default;
        (template.is_active ? '启用' : '停用');
        var __VLS_27;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-body" },
        });
        if (template.description) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "template-desc" },
            });
            (template.description);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "template-meta" },
        });
        if (template.default_title) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "meta-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "meta-label" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (template.default_title);
        }
        if (template.default_duration_minutes) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "meta-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "meta-label" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (template.default_duration_minutes);
        }
        if (template.capacity_label) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "meta-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "meta-label" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (template.capacity_label);
        }
        if (template.tags.length > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "template-tags" },
            });
            for (const [tag] of __VLS_getVForSourceType((template.tags))) {
                const __VLS_28 = {}.VanTag;
                /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
                // @ts-ignore
                const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                    key: (tag),
                    type: "primary",
                    plain: true,
                }));
                const __VLS_30 = __VLS_29({
                    key: (tag),
                    type: "primary",
                    plain: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_29));
                __VLS_31.slots.default;
                (tag);
                var __VLS_31;
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-footer" },
        });
        const __VLS_32 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            ...{ 'onClick': {} },
            size: "small",
        }));
        const __VLS_34 = __VLS_33({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        let __VLS_36;
        let __VLS_37;
        let __VLS_38;
        const __VLS_39 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!!(__VLS_ctx.templates.length === 0))
                    return;
                __VLS_ctx.openEditDialog(template);
            }
        };
        __VLS_35.slots.default;
        var __VLS_35;
        const __VLS_40 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            disabled: (!template.is_active),
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            disabled: (!template.is_active),
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_44;
        let __VLS_45;
        let __VLS_46;
        const __VLS_47 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!!(__VLS_ctx.templates.length === 0))
                    return;
                __VLS_ctx.useTemplate(template.id);
            }
        };
        __VLS_43.slots.default;
        var __VLS_43;
        const __VLS_48 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_52;
        let __VLS_53;
        let __VLS_54;
        const __VLS_55 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!!(__VLS_ctx.templates.length === 0))
                    return;
                __VLS_ctx.removeTemplate(template.id);
            }
        };
        __VLS_51.slots.default;
        var __VLS_51;
    }
}
const __VLS_56 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    show: (__VLS_ctx.dialogVisible),
    position: "bottom",
    ...{ style: ({ height: '100%' }) },
}));
const __VLS_58 = __VLS_57({
    show: (__VLS_ctx.dialogVisible),
    position: "bottom",
    ...{ style: ({ height: '100%' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fullscreen-popup" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popup-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "popup-title" },
});
(__VLS_ctx.editingTemplateId ? '编辑模板' : '新建模板');
const __VLS_60 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
    name: "cross",
    size: "20",
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    name: "cross",
    size: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (...[$event]) => {
        __VLS_ctx.dialogVisible = false;
    }
};
var __VLS_63;
const __VLS_68 = {}.VanForm;
/** @type {[typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onSubmit': {} },
    ...{ class: "popup-form" },
}));
const __VLS_70 = __VLS_69({
    ...{ 'onSubmit': {} },
    ...{ class: "popup-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onSubmit: (__VLS_ctx.submitTemplate)
};
__VLS_71.slots.default;
const __VLS_76 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    modelValue: (__VLS_ctx.form.name),
    label: "模板名称",
    placeholder: "例如：标准内部会议",
    rules: ([{ required: true, message: '请输入模板名称' }]),
}));
const __VLS_78 = __VLS_77({
    modelValue: (__VLS_ctx.form.name),
    label: "模板名称",
    placeholder: "例如：标准内部会议",
    rules: ([{ required: true, message: '请输入模板名称' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const __VLS_80 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.form.description),
    label: "模板描述",
    type: "textarea",
    rows: "2",
    placeholder: "描述该模板适用的会议场景",
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.form.description),
    label: "模板描述",
    type: "textarea",
    rows: "2",
    placeholder: "描述该模板适用的会议场景",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const __VLS_84 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.form.default_title),
    label: "默认标题",
    placeholder: "留空时默认使用模板名称",
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.form.default_title),
    label: "默认标题",
    placeholder: "留空时默认使用模板名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const __VLS_88 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "默认时长",
}));
const __VLS_90 = __VLS_89({
    label: "默认时长",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
{
    const { input: __VLS_thisSlot } = __VLS_91.slots;
    const __VLS_92 = {}.VanStepper;
    /** @type {[typeof __VLS_components.VanStepper, typeof __VLS_components.vanStepper, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        modelValue: (__VLS_ctx.form.default_duration_minutes),
        min: "0",
        step: "15",
    }));
    const __VLS_94 = __VLS_93({
        modelValue: (__VLS_ctx.form.default_duration_minutes),
        min: "0",
        step: "15",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "unit-label" },
    });
}
var __VLS_91;
const __VLS_96 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    modelValue: (__VLS_ctx.form.capacity_label),
    label: "容量说明",
    placeholder: "例如：8-12 人",
}));
const __VLS_98 = __VLS_97({
    modelValue: (__VLS_ctx.form.capacity_label),
    label: "容量说明",
    placeholder: "例如：8-12 人",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
const __VLS_100 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    modelValue: (__VLS_ctx.form.record_url),
    label: "录播地址",
    placeholder: "可选",
}));
const __VLS_102 = __VLS_101({
    modelValue: (__VLS_ctx.form.record_url),
    label: "录播地址",
    placeholder: "可选",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
const __VLS_104 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.form.tagsText),
    label: "标签",
    placeholder: "使用逗号分隔",
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.form.tagsText),
    label: "标签",
    placeholder: "使用逗号分隔",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const __VLS_108 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "模板状态",
}));
const __VLS_110 = __VLS_109({
    label: "模板状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
{
    const { input: __VLS_thisSlot } = __VLS_111.slots;
    const __VLS_112 = {}.VanSwitch;
    /** @type {[typeof __VLS_components.VanSwitch, typeof __VLS_components.vanSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        modelValue: (__VLS_ctx.form.is_active),
    }));
    const __VLS_114 = __VLS_113({
        modelValue: (__VLS_ctx.form.is_active),
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
}
var __VLS_111;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popup-footer" },
});
const __VLS_116 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    block: true,
    type: "primary",
    nativeType: "submit",
}));
const __VLS_118 = __VLS_117({
    block: true,
    type: "primary",
    nativeType: "submit",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
var __VLS_119;
var __VLS_71;
var __VLS_59;
const __VLS_120 = {}.VanTabbar;
/** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    icon: "calendar-o",
    to: "/dashboard",
}));
const __VLS_126 = __VLS_125({
    icon: "calendar-o",
    to: "/dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
var __VLS_127;
const __VLS_128 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    icon: "video-o",
    to: "/meetings",
}));
const __VLS_130 = __VLS_129({
    icon: "video-o",
    to: "/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
var __VLS_131;
const __VLS_132 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    icon: "play-circle-o",
    to: "/live",
}));
const __VLS_134 = __VLS_133({
    icon: "play-circle-o",
    to: "/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
var __VLS_135;
const __VLS_136 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    icon: "user-o",
    to: "/profile",
}));
const __VLS_138 = __VLS_137({
    icon: "user-o",
    to: "/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
var __VLS_139;
var __VLS_123;
/** @type {__VLS_StyleScopedClasses['mobile-template-manage']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['inactive']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['duration']} */ ;
/** @type {__VLS_StyleScopedClasses['template-list']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-center']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list']} */ ;
/** @type {__VLS_StyleScopedClasses['template-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['template-name']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['template-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['template-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['template-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['fullscreen-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-header']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-form']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-label']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            templates: templates,
            loading: loading,
            activeTab: activeTab,
            dialogVisible: dialogVisible,
            editingTemplateId: editingTemplateId,
            form: form,
            activeCount: activeCount,
            inactiveCount: inactiveCount,
            durationCount: durationCount,
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
