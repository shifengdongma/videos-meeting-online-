import { computed, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Delete, Plus } from '@element-plus/icons-vue';
import { createVote } from '../../api/votes';
const props = defineProps();
const emit = defineEmits();
const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});
const formRef = ref();
const submitting = ref(false);
const form = reactive({
    topic: '',
    description: '',
    start_time: '',
    end_time: '',
    max_votes: 1,
    options: [{ content: '' }, { content: '' }],
    remarks: ''
});
const rules = {
    topic: [{ required: true, message: '请输入投票标题', trigger: 'blur' }],
    options: [
        {
            validator: () => {
                const validOptions = form.options.filter(o => o.content.trim());
                return validOptions.length >= 2;
            },
            message: '请至少填写两个选项',
            trigger: 'blur'
        }
    ]
};
// 监听 visible 变化，重置表单
watch(() => props.visible, (val) => {
    if (val) {
        resetForm();
    }
});
// 重置表单
const resetForm = () => {
    form.topic = '';
    form.description = '';
    form.start_time = '';
    form.end_time = '';
    form.max_votes = 1;
    form.options = [{ content: '' }, { content: '' }];
    form.remarks = '';
};
// 添加选项
const addOption = () => {
    form.options.push({ content: '' });
};
// 移除选项
const removeOption = (index) => {
    if (form.options.length > 2) {
        form.options.splice(index, 1);
    }
};
// 提交投票
const submitVote = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
    }
    catch {
        return;
    }
    // 检查选项内容
    const validOptions = form.options.filter(o => o.content.trim());
    if (validOptions.length < 2) {
        ElMessage.error('请至少填写两个有效选项');
        return;
    }
    if (!props.meetingId) {
        ElMessage.error('会议ID无效');
        return;
    }
    submitting.value = true;
    try {
        await createVote({
            meeting_id: props.meetingId,
            topic: form.topic.trim(),
            description: form.description.trim() || null,
            start_time: form.start_time || null,
            end_time: form.end_time || null,
            max_votes: form.max_votes,
            remarks: form.remarks.trim() || null,
            options: validOptions.map(o => ({ content: o.content.trim() }))
        });
        emit('created');
        handleClose();
    }
    catch (error) {
        ElMessage.error(error.response?.data?.detail || '创建投票失败');
    }
    finally {
        submitting.value = false;
    }
};
// 关闭弹窗
const handleClose = () => {
    formRef.value?.resetFields();
    resetForm();
    emit('update:visible', false);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['option-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "创建投票",
    width: "600px",
    beforeClose: (__VLS_ctx.handleClose),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "创建投票",
    width: "600px",
    beforeClose: (__VLS_ctx.handleClose),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelWidth: "100px",
    ...{ class: "vote-form" },
}));
const __VLS_7 = __VLS_6({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelWidth: "100px",
    ...{ class: "vote-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_9 = {};
__VLS_8.slots.default;
const __VLS_11 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    label: "投票标题",
    prop: "topic",
}));
const __VLS_13 = __VLS_12({
    label: "投票标题",
    prop: "topic",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_14.slots.default;
const __VLS_15 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.form.topic),
    placeholder: "输入投票主题",
    maxlength: "255",
    showWordLimit: true,
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.form.topic),
    placeholder: "输入投票主题",
    maxlength: "255",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
var __VLS_14;
const __VLS_19 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    label: "投票描述",
}));
const __VLS_21 = __VLS_20({
    label: "投票描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
const __VLS_23 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "可选，描述投票的具体内容或说明",
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "可选，描述投票的具体内容或说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
var __VLS_22;
const __VLS_27 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    label: "开始时间",
}));
const __VLS_29 = __VLS_28({
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_30.slots.default;
const __VLS_31 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    modelValue: (__VLS_ctx.form.start_time),
    type: "datetime",
    placeholder: "可选，选择投票开始时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}));
const __VLS_33 = __VLS_32({
    modelValue: (__VLS_ctx.form.start_time),
    type: "datetime",
    placeholder: "可选，选择投票开始时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
var __VLS_30;
const __VLS_35 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    label: "结束时间",
}));
const __VLS_37 = __VLS_36({
    label: "结束时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_38.slots.default;
const __VLS_39 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    modelValue: (__VLS_ctx.form.end_time),
    type: "datetime",
    placeholder: "可选，选择投票结束时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}));
const __VLS_41 = __VLS_40({
    modelValue: (__VLS_ctx.form.end_time),
    type: "datetime",
    placeholder: "可选，选择投票结束时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
var __VLS_38;
const __VLS_43 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    label: "投票次数",
}));
const __VLS_45 = __VLS_44({
    label: "投票次数",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_46.slots.default;
const __VLS_47 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    modelValue: (__VLS_ctx.form.max_votes),
    min: (1),
    max: (10),
    controlsPosition: "right",
}));
const __VLS_49 = __VLS_48({
    modelValue: (__VLS_ctx.form.max_votes),
    min: (1),
    max: (10),
    controlsPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "form-hint" },
});
var __VLS_46;
const __VLS_51 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
    label: "投票选项",
    prop: "options",
}));
const __VLS_53 = __VLS_52({
    label: "投票选项",
    prop: "options",
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
__VLS_54.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "options-container" },
});
for (const [option, index] of __VLS_getVForSourceType((__VLS_ctx.form.options))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "option-row" },
    });
    const __VLS_55 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
        modelValue: (option.content),
        placeholder: "输入选项内容",
        maxlength: "120",
        showWordLimit: true,
    }));
    const __VLS_57 = __VLS_56({
        modelValue: (option.content),
        placeholder: "输入选项内容",
        maxlength: "120",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const __VLS_59 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        ...{ 'onClick': {} },
        type: "danger",
        icon: (__VLS_ctx.Delete),
        circle: true,
        disabled: (__VLS_ctx.form.options.length <= 2),
    }));
    const __VLS_61 = __VLS_60({
        ...{ 'onClick': {} },
        type: "danger",
        icon: (__VLS_ctx.Delete),
        circle: true,
        disabled: (__VLS_ctx.form.options.length <= 2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    let __VLS_63;
    let __VLS_64;
    let __VLS_65;
    const __VLS_66 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeOption(index);
        }
    };
    var __VLS_62;
}
const __VLS_67 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
    icon: (__VLS_ctx.Plus),
}));
const __VLS_69 = __VLS_68({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
    icon: (__VLS_ctx.Plus),
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
let __VLS_71;
let __VLS_72;
let __VLS_73;
const __VLS_74 = {
    onClick: (__VLS_ctx.addOption)
};
__VLS_70.slots.default;
var __VLS_70;
var __VLS_54;
const __VLS_75 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
    label: "备注",
}));
const __VLS_77 = __VLS_76({
    label: "备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
__VLS_78.slots.default;
const __VLS_79 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    modelValue: (__VLS_ctx.form.remarks),
    type: "textarea",
    rows: (2),
    placeholder: "可选，备注信息",
    maxlength: "500",
    showWordLimit: true,
}));
const __VLS_81 = __VLS_80({
    modelValue: (__VLS_ctx.form.remarks),
    type: "textarea",
    rows: (2),
    placeholder: "可选，备注信息",
    maxlength: "500",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
var __VLS_78;
var __VLS_8;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_83 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        ...{ 'onClick': {} },
    }));
    const __VLS_85 = __VLS_84({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    let __VLS_87;
    let __VLS_88;
    let __VLS_89;
    const __VLS_90 = {
        onClick: (__VLS_ctx.handleClose)
    };
    __VLS_86.slots.default;
    var __VLS_86;
    const __VLS_91 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_93 = __VLS_92({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    let __VLS_95;
    let __VLS_96;
    let __VLS_97;
    const __VLS_98 = {
        onClick: (__VLS_ctx.submitVote)
    };
    __VLS_94.slots.default;
    var __VLS_94;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['vote-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['options-container']} */ ;
/** @type {__VLS_StyleScopedClasses['option-row']} */ ;
// @ts-ignore
var __VLS_10 = __VLS_9;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Delete: Delete,
            Plus: Plus,
            dialogVisible: dialogVisible,
            formRef: formRef,
            submitting: submitting,
            form: form,
            rules: rules,
            addOption: addOption,
            removeOption: removeOption,
            submitVote: submitVote,
            handleClose: handleClose,
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
