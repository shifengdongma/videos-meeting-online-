import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { createMeeting, fetchMeetings } from '../../api/meetings';
import { fetchMeetingTemplates, useMeetingTemplate } from '../../api/meetingTemplates';
import { useAuthStore } from '../../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const meetings = ref([]);
const templates = ref([]);
const loading = ref(false);
const activeTab = ref(1);
// 弹窗状态
const createDialogVisible = ref(false);
const templateDialogVisible = ref(false);
const showStartPicker = ref(false);
const showStartTimePicker = ref(false);
const showEndPicker = ref(false);
const showEndTimePicker = ref(false);
const showTemplatePicker = ref(false);
const showTemplateStartPicker = ref(false);
const showTemplateStartTimePicker = ref(false);
const showTemplateEndPicker = ref(false);
const showTemplateEndTimePicker = ref(false);
// 表单数据
const createForm = reactive({
    title: '',
    start_time: '',
    start_time_display: '',
    end_time: '',
    end_time_display: ''
});
const templateForm = reactive({
    templateId: null,
    title: '',
    start_time: '',
    start_time_display: '',
    end_time: '',
    end_time_display: ''
});
// 时间选择器数据
const minDate = new Date();
const startDateValue = ref(['2024', '01', '01']);
const startTimeValue = ref(['00', '00']);
const endDateValue = ref(['2024', '01', '01']);
const endTimeValue = ref(['00', '00']);
const templateStartDateValue = ref(['2024', '01', '01']);
const templateStartTimeValue = ref(['00', '00']);
const templateEndDateValue = ref(['2024', '01', '01']);
const templateEndTimeValue = ref(['00', '00']);
// 计算属性
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role));
const ongoingCount = computed(() => meetings.value.filter(m => m.status === 'ongoing').length);
const scheduledCount = computed(() => meetings.value.filter(m => m.status === 'scheduled').length);
const endedCount = computed(() => meetings.value.filter(m => m.status === 'ended').length);
const activeTemplates = computed(() => templates.value.filter(t => t.is_active));
const templateColumns = computed(() => activeTemplates.value.map(t => ({ text: t.name, value: t.id })));
const selectedTemplate = computed(() => activeTemplates.value.find(t => t.id === templateForm.templateId) || null);
const selectedTemplateName = computed(() => selectedTemplate.value?.name || '');
// 工具函数
const statusLabel = (status) => {
    const map = { ongoing: '进行中', scheduled: '待开始', ended: '已结束' };
    return map[status] || '未知';
};
const getStatusType = (status) => {
    const map = {
        ongoing: 'success',
        scheduled: 'primary',
        ended: 'default'
    };
    return map[status] || 'default';
};
const formatDateTime = (datetime) => {
    const d = new Date(datetime);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const formatTime = (datetime) => {
    const d = new Date(datetime);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
// 时间选择器回调
const onStartDateConfirm = ({ selectedValues }) => {
    startDateValue.value = selectedValues;
    showStartPicker.value = false;
    showStartTimePicker.value = true;
};
const onStartTimeConfirm = ({ selectedValues }) => {
    startTimeValue.value = selectedValues;
    createForm.start_time = `${startDateValue.value.join('-')}T${startTimeValue.value.join(':')}:00`;
    createForm.start_time_display = `${startDateValue.value.join('-')} ${startTimeValue.value.join(':')}`;
    showStartTimePicker.value = false;
};
const onEndDateConfirm = ({ selectedValues }) => {
    endDateValue.value = selectedValues;
    showEndPicker.value = false;
    showEndTimePicker.value = true;
};
const onEndTimeConfirm = ({ selectedValues }) => {
    endTimeValue.value = selectedValues;
    createForm.end_time = `${endDateValue.value.join('-')}T${endTimeValue.value.join(':')}:00`;
    createForm.end_time_display = `${endDateValue.value.join('-')} ${endTimeValue.value.join(':')}`;
    showEndTimePicker.value = false;
};
const onTemplateConfirm = ({ selectedOptions }) => {
    const option = selectedOptions[0];
    templateForm.templateId = option.value;
    const template = activeTemplates.value.find(t => t.id === option.value);
    if (template) {
        templateForm.title = template.default_title || template.name;
    }
    showTemplatePicker.value = false;
};
const onTemplateStartDateConfirm = ({ selectedValues }) => {
    templateStartDateValue.value = selectedValues;
    showTemplateStartPicker.value = false;
    showTemplateStartTimePicker.value = true;
};
const onTemplateStartTimeConfirm = ({ selectedValues }) => {
    templateStartTimeValue.value = selectedValues;
    templateForm.start_time = `${templateStartDateValue.value.join('-')}T${templateStartTimeValue.value.join(':')}:00`;
    templateForm.start_time_display = `${templateStartDateValue.value.join('-')} ${templateStartTimeValue.value.join(':')}`;
    showTemplateStartTimePicker.value = false;
};
const onTemplateEndDateConfirm = ({ selectedValues }) => {
    templateEndDateValue.value = selectedValues;
    showTemplateEndPicker.value = false;
    showTemplateEndTimePicker.value = true;
};
const onTemplateEndTimeConfirm = ({ selectedValues }) => {
    templateEndTimeValue.value = selectedValues;
    templateForm.end_time = `${templateEndDateValue.value.join('-')}T${templateEndTimeValue.value.join(':')}:00`;
    templateForm.end_time_display = `${templateEndDateValue.value.join('-')} ${templateEndTimeValue.value.join(':')}`;
    showTemplateEndTimePicker.value = false;
};
// 加载数据
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
    templates.value = await fetchMeetingTemplates();
};
// 操作函数
const enterMeeting = (id) => {
    router.push(`/meetings/${id}`);
};
const openTemplateDialog = async () => {
    if (!templates.value.length) {
        await loadTemplates();
    }
    templateForm.templateId = null;
    templateForm.title = '';
    templateForm.start_time = '';
    templateForm.start_time_display = '';
    templateForm.end_time = '';
    templateForm.end_time_display = '';
    templateDialogVisible.value = true;
};
const handleCreate = async () => {
    try {
        await createMeeting({
            title: createForm.title,
            start_time: createForm.start_time,
            end_time: createForm.end_time,
            record_url: null
        });
        showToast('会议创建成功');
        createDialogVisible.value = false;
        createForm.title = '';
        createForm.start_time = '';
        createForm.start_time_display = '';
        createForm.end_time = '';
        createForm.end_time_display = '';
        await loadMeetings();
    }
    catch {
        showToast('创建失败');
    }
};
const handleUseTemplate = async () => {
    if (!templateForm.templateId) {
        showToast('请选择模板');
        return;
    }
    if (!templateForm.start_time) {
        showToast('请选择开始时间');
        return;
    }
    const template = selectedTemplate.value;
    if (!template) {
        showToast('所选模板不可用');
        return;
    }
    if (!template.default_duration_minutes && !templateForm.end_time) {
        showToast('当前模板未设置默认时长，请填写结束时间');
        return;
    }
    try {
        const meeting = await useMeetingTemplate(templateForm.templateId, {
            title: templateForm.title.trim() || undefined,
            start_time: templateForm.start_time,
            end_time: templateForm.end_time || undefined
        });
        showToast('会议创建成功');
        templateDialogVisible.value = false;
        await loadMeetings();
        router.push(`/meetings/${meeting.id}`);
    }
    catch {
        showToast('创建失败');
    }
};
onMounted(loadMeetings);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mobile-meeting-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
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
(__VLS_ctx.meetings.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value ongoing" },
});
(__VLS_ctx.ongoingCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value scheduled" },
});
(__VLS_ctx.scheduledCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value ended" },
});
(__VLS_ctx.endedCount);
if (__VLS_ctx.canCreate) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-buttons" },
    });
    const __VLS_0 = {}.VanButton;
    /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        plain: true,
        type: "primary",
        size: "small",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        plain: true,
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.openTemplateDialog)
    };
    __VLS_3.slots.default;
    var __VLS_3;
    const __VLS_8 = {}.VanButton;
    /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canCreate))
                return;
            __VLS_ctx.createDialogVisible = true;
        }
    };
    __VLS_11.slots.default;
    var __VLS_11;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meeting-list" },
});
if (__VLS_ctx.loading) {
    const __VLS_16 = {}.VanLoading;
    /** @type {[typeof __VLS_components.VanLoading, typeof __VLS_components.vanLoading, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ class: "loading-center" },
    }));
    const __VLS_18 = __VLS_17({
        ...{ class: "loading-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
else if (__VLS_ctx.meetings.length === 0) {
    const __VLS_20 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        description: "当前还没有会议",
    }));
    const __VLS_22 = __VLS_21({
        description: "当前还没有会议",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    if (__VLS_ctx.canCreate) {
        const __VLS_24 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_28;
        let __VLS_29;
        let __VLS_30;
        const __VLS_31 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!(__VLS_ctx.meetings.length === 0))
                    return;
                if (!(__VLS_ctx.canCreate))
                    return;
                __VLS_ctx.createDialogVisible = true;
            }
        };
        __VLS_27.slots.default;
        var __VLS_27;
    }
    var __VLS_23;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-list" },
    });
    for (const [meeting] of __VLS_getVForSourceType((__VLS_ctx.meetings))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (meeting.id),
            ...{ class: "meeting-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "meeting-title" },
        });
        (meeting.title);
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "time-row" },
        });
        const __VLS_36 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            name: "clock-o",
        }));
        const __VLS_38 = __VLS_37({
            name: "clock-o",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDateTime(meeting.start_time));
        (__VLS_ctx.formatTime(meeting.end_time));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-footer" },
        });
        const __VLS_40 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            block: true,
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            block: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_44;
        let __VLS_45;
        let __VLS_46;
        const __VLS_47 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!!(__VLS_ctx.meetings.length === 0))
                    return;
                __VLS_ctx.enterMeeting(meeting.id);
            }
        };
        __VLS_43.slots.default;
        var __VLS_43;
    }
}
const __VLS_48 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    show: (__VLS_ctx.createDialogVisible),
    position: "bottom",
    ...{ style: ({ height: '100%' }) },
}));
const __VLS_50 = __VLS_49({
    show: (__VLS_ctx.createDialogVisible),
    position: "bottom",
    ...{ style: ({ height: '100%' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fullscreen-popup" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popup-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "popup-title" },
});
const __VLS_52 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    name: "cross",
    size: "20",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    name: "cross",
    size: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (...[$event]) => {
        __VLS_ctx.createDialogVisible = false;
    }
};
var __VLS_55;
const __VLS_60 = {}.VanForm;
/** @type {[typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onSubmit': {} },
}));
const __VLS_62 = __VLS_61({
    ...{ 'onSubmit': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onSubmit: (__VLS_ctx.handleCreate)
};
__VLS_63.slots.default;
const __VLS_68 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.createForm.title),
    label: "会议主题",
    placeholder: "例如：月度项目评审会",
    rules: ([{ required: true, message: '请输入会议主题' }]),
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.createForm.title),
    label: "会议主题",
    placeholder: "例如：月度项目评审会",
    rules: ([{ required: true, message: '请输入会议主题' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const __VLS_72 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.createForm.start_time_display),
    isLink: true,
    readonly: true,
    label: "开始时间",
    placeholder: "请选择开始时间",
    rules: ([{ required: true, message: '请选择开始时间' }]),
}));
const __VLS_74 = __VLS_73({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.createForm.start_time_display),
    isLink: true,
    readonly: true,
    label: "开始时间",
    placeholder: "请选择开始时间",
    rules: ([{ required: true, message: '请选择开始时间' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showStartPicker = true;
    }
};
var __VLS_75;
const __VLS_80 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    show: (__VLS_ctx.showStartPicker),
    position: "bottom",
    round: true,
}));
const __VLS_82 = __VLS_81({
    show: (__VLS_ctx.showStartPicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.VanDatePicker;
/** @type {[typeof __VLS_components.VanDatePicker, typeof __VLS_components.vanDatePicker, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.startDateValue),
    title: "选择日期",
    minDate: (__VLS_ctx.minDate),
}));
const __VLS_86 = __VLS_85({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.startDateValue),
    title: "选择日期",
    minDate: (__VLS_ctx.minDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_88;
let __VLS_89;
let __VLS_90;
const __VLS_91 = {
    onConfirm: (__VLS_ctx.onStartDateConfirm)
};
const __VLS_92 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showStartPicker = false;
    }
};
var __VLS_87;
var __VLS_83;
const __VLS_93 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    show: (__VLS_ctx.showStartTimePicker),
    position: "bottom",
    round: true,
}));
const __VLS_95 = __VLS_94({
    show: (__VLS_ctx.showStartTimePicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
const __VLS_97 = {}.VanTimePicker;
/** @type {[typeof __VLS_components.VanTimePicker, typeof __VLS_components.vanTimePicker, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.startTimeValue),
    title: "选择时间",
}));
const __VLS_99 = __VLS_98({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.startTimeValue),
    title: "选择时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
let __VLS_101;
let __VLS_102;
let __VLS_103;
const __VLS_104 = {
    onConfirm: (__VLS_ctx.onStartTimeConfirm)
};
const __VLS_105 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showStartTimePicker = false;
    }
};
var __VLS_100;
var __VLS_96;
const __VLS_106 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.createForm.end_time_display),
    isLink: true,
    readonly: true,
    label: "结束时间",
    placeholder: "请选择结束时间",
    rules: ([{ required: true, message: '请选择结束时间' }]),
}));
const __VLS_108 = __VLS_107({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.createForm.end_time_display),
    isLink: true,
    readonly: true,
    label: "结束时间",
    placeholder: "请选择结束时间",
    rules: ([{ required: true, message: '请选择结束时间' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
let __VLS_110;
let __VLS_111;
let __VLS_112;
const __VLS_113 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showEndPicker = true;
    }
};
var __VLS_109;
const __VLS_114 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    show: (__VLS_ctx.showEndPicker),
    position: "bottom",
    round: true,
}));
const __VLS_116 = __VLS_115({
    show: (__VLS_ctx.showEndPicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
__VLS_117.slots.default;
const __VLS_118 = {}.VanDatePicker;
/** @type {[typeof __VLS_components.VanDatePicker, typeof __VLS_components.vanDatePicker, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.endDateValue),
    title: "选择日期",
    minDate: (__VLS_ctx.minDate),
}));
const __VLS_120 = __VLS_119({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.endDateValue),
    title: "选择日期",
    minDate: (__VLS_ctx.minDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
let __VLS_122;
let __VLS_123;
let __VLS_124;
const __VLS_125 = {
    onConfirm: (__VLS_ctx.onEndDateConfirm)
};
const __VLS_126 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showEndPicker = false;
    }
};
var __VLS_121;
var __VLS_117;
const __VLS_127 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
    show: (__VLS_ctx.showEndTimePicker),
    position: "bottom",
    round: true,
}));
const __VLS_129 = __VLS_128({
    show: (__VLS_ctx.showEndTimePicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
__VLS_130.slots.default;
const __VLS_131 = {}.VanTimePicker;
/** @type {[typeof __VLS_components.VanTimePicker, typeof __VLS_components.vanTimePicker, ]} */ ;
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.endTimeValue),
    title: "选择时间",
}));
const __VLS_133 = __VLS_132({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.endTimeValue),
    title: "选择时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_132));
let __VLS_135;
let __VLS_136;
let __VLS_137;
const __VLS_138 = {
    onConfirm: (__VLS_ctx.onEndTimeConfirm)
};
const __VLS_139 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showEndTimePicker = false;
    }
};
var __VLS_134;
var __VLS_130;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popup-footer" },
});
const __VLS_140 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    block: true,
    type: "primary",
    nativeType: "submit",
}));
const __VLS_142 = __VLS_141({
    block: true,
    type: "primary",
    nativeType: "submit",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
var __VLS_143;
var __VLS_63;
var __VLS_51;
const __VLS_144 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    show: (__VLS_ctx.templateDialogVisible),
    position: "bottom",
    ...{ style: ({ height: '100%' }) },
}));
const __VLS_146 = __VLS_145({
    show: (__VLS_ctx.templateDialogVisible),
    position: "bottom",
    ...{ style: ({ height: '100%' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fullscreen-popup" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popup-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "popup-title" },
});
const __VLS_148 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    ...{ 'onClick': {} },
    name: "cross",
    size: "20",
}));
const __VLS_150 = __VLS_149({
    ...{ 'onClick': {} },
    name: "cross",
    size: "20",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
let __VLS_152;
let __VLS_153;
let __VLS_154;
const __VLS_155 = {
    onClick: (...[$event]) => {
        __VLS_ctx.templateDialogVisible = false;
    }
};
var __VLS_151;
const __VLS_156 = {}.VanForm;
/** @type {[typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    ...{ 'onSubmit': {} },
}));
const __VLS_158 = __VLS_157({
    ...{ 'onSubmit': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
let __VLS_160;
let __VLS_161;
let __VLS_162;
const __VLS_163 = {
    onSubmit: (__VLS_ctx.handleUseTemplate)
};
__VLS_159.slots.default;
const __VLS_164 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.selectedTemplateName),
    isLink: true,
    readonly: true,
    label: "选择模板",
    placeholder: "请选择模板",
    rules: ([{ required: true, message: '请选择模板' }]),
}));
const __VLS_166 = __VLS_165({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.selectedTemplateName),
    isLink: true,
    readonly: true,
    label: "选择模板",
    placeholder: "请选择模板",
    rules: ([{ required: true, message: '请选择模板' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
let __VLS_168;
let __VLS_169;
let __VLS_170;
const __VLS_171 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showTemplatePicker = true;
    }
};
var __VLS_167;
const __VLS_172 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    show: (__VLS_ctx.showTemplatePicker),
    position: "bottom",
    round: true,
}));
const __VLS_174 = __VLS_173({
    show: (__VLS_ctx.showTemplatePicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.VanPicker;
/** @type {[typeof __VLS_components.VanPicker, typeof __VLS_components.vanPicker, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    title: "选择模板",
    columns: (__VLS_ctx.templateColumns),
}));
const __VLS_178 = __VLS_177({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    title: "选择模板",
    columns: (__VLS_ctx.templateColumns),
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
let __VLS_180;
let __VLS_181;
let __VLS_182;
const __VLS_183 = {
    onConfirm: (__VLS_ctx.onTemplateConfirm)
};
const __VLS_184 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showTemplatePicker = false;
    }
};
var __VLS_179;
var __VLS_175;
if (__VLS_ctx.selectedTemplate) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-preview" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-title" },
    });
    (__VLS_ctx.selectedTemplate.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "preview-desc" },
    });
    (__VLS_ctx.selectedTemplate.description || '该模板暂无额外说明');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-tags" },
    });
    for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.selectedTemplate.tags))) {
        const __VLS_185 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
            key: (tag),
            type: "primary",
        }));
        const __VLS_187 = __VLS_186({
            key: (tag),
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_186));
        __VLS_188.slots.default;
        (tag);
        var __VLS_188;
    }
}
const __VLS_189 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    modelValue: (__VLS_ctx.templateForm.title),
    label: "会议主题",
    placeholder: "留空则使用模板默认标题",
}));
const __VLS_191 = __VLS_190({
    modelValue: (__VLS_ctx.templateForm.title),
    label: "会议主题",
    placeholder: "留空则使用模板默认标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
const __VLS_193 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.templateForm.start_time_display),
    isLink: true,
    readonly: true,
    label: "开始时间",
    placeholder: "请选择开始时间",
    rules: ([{ required: true, message: '请选择开始时间' }]),
}));
const __VLS_195 = __VLS_194({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.templateForm.start_time_display),
    isLink: true,
    readonly: true,
    label: "开始时间",
    placeholder: "请选择开始时间",
    rules: ([{ required: true, message: '请选择开始时间' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
let __VLS_197;
let __VLS_198;
let __VLS_199;
const __VLS_200 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showTemplateStartPicker = true;
    }
};
var __VLS_196;
const __VLS_201 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
    show: (__VLS_ctx.showTemplateStartPicker),
    position: "bottom",
    round: true,
}));
const __VLS_203 = __VLS_202({
    show: (__VLS_ctx.showTemplateStartPicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_202));
__VLS_204.slots.default;
const __VLS_205 = {}.VanDatePicker;
/** @type {[typeof __VLS_components.VanDatePicker, typeof __VLS_components.vanDatePicker, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.templateStartDateValue),
    title: "选择日期",
    minDate: (__VLS_ctx.minDate),
}));
const __VLS_207 = __VLS_206({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.templateStartDateValue),
    title: "选择日期",
    minDate: (__VLS_ctx.minDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
let __VLS_209;
let __VLS_210;
let __VLS_211;
const __VLS_212 = {
    onConfirm: (__VLS_ctx.onTemplateStartDateConfirm)
};
const __VLS_213 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showTemplateStartPicker = false;
    }
};
var __VLS_208;
var __VLS_204;
const __VLS_214 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
    show: (__VLS_ctx.showTemplateStartTimePicker),
    position: "bottom",
    round: true,
}));
const __VLS_216 = __VLS_215({
    show: (__VLS_ctx.showTemplateStartTimePicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_215));
__VLS_217.slots.default;
const __VLS_218 = {}.VanTimePicker;
/** @type {[typeof __VLS_components.VanTimePicker, typeof __VLS_components.vanTimePicker, ]} */ ;
// @ts-ignore
const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.templateStartTimeValue),
    title: "选择时间",
}));
const __VLS_220 = __VLS_219({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.templateStartTimeValue),
    title: "选择时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_219));
let __VLS_222;
let __VLS_223;
let __VLS_224;
const __VLS_225 = {
    onConfirm: (__VLS_ctx.onTemplateStartTimeConfirm)
};
const __VLS_226 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showTemplateStartTimePicker = false;
    }
};
var __VLS_221;
var __VLS_217;
const __VLS_227 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.templateForm.end_time_display),
    isLink: true,
    readonly: true,
    label: "结束时间",
    placeholder: "可留空，按模板默认时长计算",
}));
const __VLS_229 = __VLS_228({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.templateForm.end_time_display),
    isLink: true,
    readonly: true,
    label: "结束时间",
    placeholder: "可留空，按模板默认时长计算",
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
let __VLS_231;
let __VLS_232;
let __VLS_233;
const __VLS_234 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showTemplateEndPicker = true;
    }
};
var __VLS_230;
const __VLS_235 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
    show: (__VLS_ctx.showTemplateEndPicker),
    position: "bottom",
    round: true,
}));
const __VLS_237 = __VLS_236({
    show: (__VLS_ctx.showTemplateEndPicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_236));
__VLS_238.slots.default;
const __VLS_239 = {}.VanDatePicker;
/** @type {[typeof __VLS_components.VanDatePicker, typeof __VLS_components.vanDatePicker, ]} */ ;
// @ts-ignore
const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.templateEndDateValue),
    title: "选择日期",
    minDate: (__VLS_ctx.minDate),
}));
const __VLS_241 = __VLS_240({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.templateEndDateValue),
    title: "选择日期",
    minDate: (__VLS_ctx.minDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_240));
let __VLS_243;
let __VLS_244;
let __VLS_245;
const __VLS_246 = {
    onConfirm: (__VLS_ctx.onTemplateEndDateConfirm)
};
const __VLS_247 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showTemplateEndPicker = false;
    }
};
var __VLS_242;
var __VLS_238;
const __VLS_248 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    show: (__VLS_ctx.showTemplateEndTimePicker),
    position: "bottom",
    round: true,
}));
const __VLS_250 = __VLS_249({
    show: (__VLS_ctx.showTemplateEndTimePicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
const __VLS_252 = {}.VanTimePicker;
/** @type {[typeof __VLS_components.VanTimePicker, typeof __VLS_components.vanTimePicker, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.templateEndTimeValue),
    title: "选择时间",
}));
const __VLS_254 = __VLS_253({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.templateEndTimeValue),
    title: "选择时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
let __VLS_256;
let __VLS_257;
let __VLS_258;
const __VLS_259 = {
    onConfirm: (__VLS_ctx.onTemplateEndTimeConfirm)
};
const __VLS_260 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showTemplateEndTimePicker = false;
    }
};
var __VLS_255;
var __VLS_251;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "popup-footer" },
});
const __VLS_261 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
    block: true,
    type: "primary",
    nativeType: "submit",
}));
const __VLS_263 = __VLS_262({
    block: true,
    type: "primary",
    nativeType: "submit",
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
__VLS_264.slots.default;
var __VLS_264;
var __VLS_159;
var __VLS_147;
const __VLS_265 = {}.VanTabbar;
/** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
// @ts-ignore
const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}));
const __VLS_267 = __VLS_266({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_266));
__VLS_268.slots.default;
const __VLS_269 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({
    icon: "calendar-o",
    to: "/dashboard",
}));
const __VLS_271 = __VLS_270({
    icon: "calendar-o",
    to: "/dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_270));
__VLS_272.slots.default;
var __VLS_272;
const __VLS_273 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
    icon: "video-o",
    to: "/meetings",
}));
const __VLS_275 = __VLS_274({
    icon: "video-o",
    to: "/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
__VLS_276.slots.default;
var __VLS_276;
const __VLS_277 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_278 = __VLS_asFunctionalComponent(__VLS_277, new __VLS_277({
    icon: "play-circle-o",
    to: "/live",
}));
const __VLS_279 = __VLS_278({
    icon: "play-circle-o",
    to: "/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_278));
__VLS_280.slots.default;
var __VLS_280;
const __VLS_281 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({
    icon: "user-o",
    to: "/profile",
}));
const __VLS_283 = __VLS_282({
    icon: "user-o",
    to: "/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_282));
__VLS_284.slots.default;
var __VLS_284;
var __VLS_268;
/** @type {__VLS_StyleScopedClasses['mobile-meeting-list']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['ongoing']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['scheduled']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['ended']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-list']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-center']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['time-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['fullscreen-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-header']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['fullscreen-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-header']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['template-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            meetings: meetings,
            loading: loading,
            activeTab: activeTab,
            createDialogVisible: createDialogVisible,
            templateDialogVisible: templateDialogVisible,
            showStartPicker: showStartPicker,
            showStartTimePicker: showStartTimePicker,
            showEndPicker: showEndPicker,
            showEndTimePicker: showEndTimePicker,
            showTemplatePicker: showTemplatePicker,
            showTemplateStartPicker: showTemplateStartPicker,
            showTemplateStartTimePicker: showTemplateStartTimePicker,
            showTemplateEndPicker: showTemplateEndPicker,
            showTemplateEndTimePicker: showTemplateEndTimePicker,
            createForm: createForm,
            templateForm: templateForm,
            minDate: minDate,
            startDateValue: startDateValue,
            startTimeValue: startTimeValue,
            endDateValue: endDateValue,
            endTimeValue: endTimeValue,
            templateStartDateValue: templateStartDateValue,
            templateStartTimeValue: templateStartTimeValue,
            templateEndDateValue: templateEndDateValue,
            templateEndTimeValue: templateEndTimeValue,
            canCreate: canCreate,
            ongoingCount: ongoingCount,
            scheduledCount: scheduledCount,
            endedCount: endedCount,
            templateColumns: templateColumns,
            selectedTemplate: selectedTemplate,
            selectedTemplateName: selectedTemplateName,
            statusLabel: statusLabel,
            getStatusType: getStatusType,
            formatDateTime: formatDateTime,
            formatTime: formatTime,
            onStartDateConfirm: onStartDateConfirm,
            onStartTimeConfirm: onStartTimeConfirm,
            onEndDateConfirm: onEndDateConfirm,
            onEndTimeConfirm: onEndTimeConfirm,
            onTemplateConfirm: onTemplateConfirm,
            onTemplateStartDateConfirm: onTemplateStartDateConfirm,
            onTemplateStartTimeConfirm: onTemplateStartTimeConfirm,
            onTemplateEndDateConfirm: onTemplateEndDateConfirm,
            onTemplateEndTimeConfirm: onTemplateEndTimeConfirm,
            enterMeeting: enterMeeting,
            openTemplateDialog: openTemplateDialog,
            handleCreate: handleCreate,
            handleUseTemplate: handleUseTemplate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
