import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Download, Upload } from '@element-plus/icons-vue';
import { fetchParticipants, importParticipants, deleteParticipant, fetchParticipantTemplate, batchCreateParticipants } from '../../api/meetings';
const props = defineProps();
const emit = defineEmits();
const drawerVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});
const participants = ref([]);
const loading = ref(false);
const importing = ref(false);
const previewData = ref([]);
const uploadRef = ref();
const pendingFile = ref(null);
// 加载参会人员
const loadParticipants = async () => {
    if (!props.meetingId)
        return;
    loading.value = true;
    try {
        participants.value = await fetchParticipants(props.meetingId);
    }
    finally {
        loading.value = false;
    }
};
// 监听 visible 变化
watch(() => props.visible, (val) => {
    if (val && props.meetingId) {
        loadParticipants();
        previewData.value = [];
        pendingFile.value = null;
    }
});
// 下载模板
const downloadTemplate = async () => {
    if (!props.meetingId)
        return;
    try {
        const templateInfo = await fetchParticipantTemplate(props.meetingId);
        // 创建示例数据
        const exampleData = templateInfo.example;
        // 使用浏览器 API 生成 CSV 文件
        const headers = templateInfo.columns;
        const csvContent = [
            headers.join(','),
            ...exampleData.map(row => headers.map(h => row[h] || '').join(','))
        ].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '参会人员导入模板.csv';
        link.click();
        URL.revokeObjectURL(url);
        ElMessage.success('模板已下载');
    }
    catch (error) {
        ElMessage.error('下载模板失败');
    }
};
// 文件选择处理
const handleFileChange = async (file) => {
    const rawFile = file.raw;
    if (!rawFile)
        return;
    pendingFile.value = rawFile;
    // 解析文件预览
    try {
        const parsed = await parseExcelFile(rawFile);
        previewData.value = parsed;
    }
    catch (error) {
        ElMessage.error('文件解析失败，请检查文件格式');
        previewData.value = [];
    }
};
// 解析 Excel 文件（简单实现）
const parseExcelFile = async (file) => {
    // 对于 CSV 文件，直接解析
    if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2)
            return [];
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const nameIdx = headers.findIndex(h => h.includes('姓名'));
        const phoneIdx = headers.findIndex(h => h.includes('电话'));
        const deptIdx = headers.findIndex(h => h.includes('部门'));
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
            const name = cols[nameIdx] || '';
            if (name) {
                result.push({
                    name,
                    phone: cols[phoneIdx] || null,
                    department: cols[deptIdx] || null
                });
            }
        }
        return result;
    }
    // 对于 Excel 文件，使用后端 API 解析
    return [];
};
// 取消预览
const cancelPreview = () => {
    previewData.value = [];
    pendingFile.value = null;
};
// 确认导入
const confirmImport = async () => {
    if (!props.meetingId)
        return;
    importing.value = true;
    try {
        if (pendingFile.value && (pendingFile.value.name.endsWith('.xlsx') || pendingFile.value.name.endsWith('.xls'))) {
            // Excel 文件通过后端 API 导入
            await importParticipants(props.meetingId, pendingFile.value);
        }
        else if (previewData.value.length) {
            // CSV 或预览数据通过批量创建 API 导入
            await batchCreateParticipants(props.meetingId, previewData.value);
        }
        ElMessage.success('导入成功');
        previewData.value = [];
        pendingFile.value = null;
        await loadParticipants();
        emit('refresh');
    }
    catch (error) {
        ElMessage.error(error.response?.data?.detail || '导入失败');
    }
    finally {
        importing.value = false;
    }
};
// 删除参会人员
const removeParticipant = async (participantId) => {
    await deleteParticipant(props.meetingId, participantId);
    ElMessage.success('已删除');
    await loadParticipants();
    emit('refresh');
};
// 关闭抽屉
const handleClose = () => {
    previewData.value = [];
    pendingFile.value = null;
    emit('update:visible', false);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['participant-table']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.drawerVisible),
    title: "参会人员管理",
    size: "600px",
    beforeClose: (__VLS_ctx.handleClose),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.drawerVisible),
    title: "参会人员管理",
    size: "600px",
    beforeClose: (__VLS_ctx.handleClose),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-bar" },
});
const __VLS_5 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_7 = __VLS_6({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_9;
let __VLS_10;
let __VLS_11;
const __VLS_12 = {
    onClick: (__VLS_ctx.downloadTemplate)
};
__VLS_8.slots.default;
const __VLS_13 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    ...{ class: "mr-2" },
}));
const __VLS_15 = __VLS_14({
    ...{ class: "mr-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.Download;
/** @type {[typeof __VLS_components.Download, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
var __VLS_16;
var __VLS_8;
const __VLS_21 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ref: "uploadRef",
    autoUpload: (false),
    showFileList: (false),
    accept: ".xlsx,.xls,.csv",
    onChange: (__VLS_ctx.handleFileChange),
}));
const __VLS_23 = __VLS_22({
    ref: "uploadRef",
    autoUpload: (false),
    showFileList: (false),
    accept: ".xlsx,.xls,.csv",
    onChange: (__VLS_ctx.handleFileChange),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
/** @type {typeof __VLS_ctx.uploadRef} */ ;
var __VLS_25 = {};
__VLS_24.slots.default;
const __VLS_27 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    type: "success",
}));
const __VLS_29 = __VLS_28({
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_30.slots.default;
const __VLS_31 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    ...{ class: "mr-2" },
}));
const __VLS_33 = __VLS_32({
    ...{ class: "mr-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
__VLS_34.slots.default;
const __VLS_35 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({}));
const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
var __VLS_34;
var __VLS_30;
var __VLS_24;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tips-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tips-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "tips-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "participants-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "count-badge" },
});
(__VLS_ctx.participants.length);
const __VLS_39 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    data: (__VLS_ctx.participants),
    ...{ class: "participant-table" },
    maxHeight: "400",
}));
const __VLS_41 = __VLS_40({
    data: (__VLS_ctx.participants),
    ...{ class: "participant-table" },
    maxHeight: "400",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_42.slots.default;
const __VLS_43 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    prop: "name",
    label: "姓名",
    minWidth: "120",
}));
const __VLS_45 = __VLS_44({
    prop: "name",
    label: "姓名",
    minWidth: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
const __VLS_47 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    prop: "phone",
    label: "电话",
    minWidth: "140",
}));
const __VLS_49 = __VLS_48({
    prop: "phone",
    label: "电话",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
__VLS_50.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_50.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (scope.row.phone || '—');
}
var __VLS_50;
const __VLS_51 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
    prop: "department",
    label: "部门",
    minWidth: "140",
}));
const __VLS_53 = __VLS_52({
    prop: "department",
    label: "部门",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
__VLS_54.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_54.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (scope.row.department || '—');
}
var __VLS_54;
const __VLS_55 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    label: "操作",
    width: "80",
}));
const __VLS_57 = __VLS_56({
    label: "操作",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
__VLS_58.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_58.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_59 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_61 = __VLS_60({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    let __VLS_63;
    let __VLS_64;
    let __VLS_65;
    const __VLS_66 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeParticipant(scope.row.id);
        }
    };
    __VLS_62.slots.default;
    var __VLS_62;
}
var __VLS_58;
var __VLS_42;
if (!__VLS_ctx.loading && !__VLS_ctx.participants.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-tip" },
    });
}
if (__VLS_ctx.previewData.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "count-badge" },
    });
    (__VLS_ctx.previewData.length);
    const __VLS_67 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
        data: (__VLS_ctx.previewData),
        ...{ class: "preview-table" },
        maxHeight: "200",
    }));
    const __VLS_69 = __VLS_68({
        data: (__VLS_ctx.previewData),
        ...{ class: "preview-table" },
        maxHeight: "200",
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_70.slots.default;
    const __VLS_71 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
        prop: "name",
        label: "姓名",
        minWidth: "120",
    }));
    const __VLS_73 = __VLS_72({
        prop: "name",
        label: "姓名",
        minWidth: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    const __VLS_75 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        prop: "phone",
        label: "电话",
        minWidth: "140",
    }));
    const __VLS_77 = __VLS_76({
        prop: "phone",
        label: "电话",
        minWidth: "140",
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    const __VLS_79 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
        prop: "department",
        label: "部门",
        minWidth: "140",
    }));
    const __VLS_81 = __VLS_80({
        prop: "department",
        label: "部门",
        minWidth: "140",
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    var __VLS_70;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-actions" },
    });
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
        onClick: (__VLS_ctx.cancelPreview)
    };
    __VLS_86.slots.default;
    var __VLS_86;
    const __VLS_91 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.importing),
    }));
    const __VLS_93 = __VLS_92({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.importing),
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    let __VLS_95;
    let __VLS_96;
    let __VLS_97;
    const __VLS_98 = {
        onClick: (__VLS_ctx.confirmImport)
    };
    __VLS_94.slots.default;
    var __VLS_94;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['action-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tips-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tips-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tips-list']} */ ;
/** @type {__VLS_StyleScopedClasses['participants-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['participant-table']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-table']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-actions']} */ ;
// @ts-ignore
var __VLS_26 = __VLS_25;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Download: Download,
            Upload: Upload,
            drawerVisible: drawerVisible,
            participants: participants,
            loading: loading,
            importing: importing,
            previewData: previewData,
            uploadRef: uploadRef,
            downloadTemplate: downloadTemplate,
            handleFileChange: handleFileChange,
            cancelPreview: cancelPreview,
            confirmImport: confirmImport,
            removeParticipant: removeParticipant,
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
