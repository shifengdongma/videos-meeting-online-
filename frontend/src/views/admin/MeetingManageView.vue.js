import { computed, onMounted, reactive, ref, shallowRef } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar, Check, Document, Folder, Grid, Tickets, Edit, Setting, User, Location, Clock } from '@element-plus/icons-vue';
import ParticipantImportDrawer from '../../components/meeting/ParticipantImportDrawer.vue';
import VoteCreateDialog from '../../components/meeting/VoteCreateDialog.vue';
import { fetchMeetings, fetchMeetingDetail, createMeeting, updateMeeting, publishMeeting, deleteMeeting, batchUpdateModules } from '../../api/meetings';
import { fetchVotes } from '../../api/votes';
// 会议列表数据
const meetings = ref([]);
const loading = ref(false);
const searchTitle = ref('');
// 选中会议详情
const selectedMeeting = shallowRef(null);
const detailVisible = ref(false);
const modules = ref([]);
const meetingForm = reactive({
    title: '',
    address: '',
    start_time: '',
    end_time: '',
    earliest_entry_time: ''
});
// 参会人员抽屉
const participantDrawerVisible = ref(false);
// 投票相关
const voteDialogVisible = ref(false);
const votesListVisible = ref(false);
const votes = ref([]);
const votesLoading = ref(false);
// 新建会议
const createDialogVisible = ref(false);
const createForm = reactive({
    title: '',
    address: '',
    start_time: '',
    end_time: '',
    earliest_entry_time: ''
});
// 计算属性
const publishedCount = computed(() => meetings.value.filter(m => m.is_published).length);
const activeModules = computed(() => modules.value.filter(m => m.is_active).sort((a, b) => a.sort_order - b.sort_order));
// 状态文本
const statusText = (status) => {
    if (status === 'scheduled')
        return '待开始';
    if (status === 'ongoing')
        return '进行中';
    return '已结束';
};
// 格式化时间
const formatDateTime = (value) => {
    if (!value)
        return '';
    const d = new Date(value);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${date} ${time}`;
};
// 计算投票总数
const getTotalVotes = (results) => {
    return results.reduce((sum, r) => sum + r.count, 0);
};
// 获取图标组件
const getIconComponent = (iconName) => {
    const iconMap = {
        Document,
        Calendar,
        Tickets,
        Folder,
        Grid,
        Check,
        Edit,
        Setting,
        User,
        Location,
        Clock
    };
    return iconMap[iconName || 'Document'] || Document;
};
// 加载会议列表
const loadMeetings = async () => {
    loading.value = true;
    try {
        const params = searchTitle.value ? { title: searchTitle.value } : undefined;
        meetings.value = await fetchMeetings(params);
    }
    finally {
        loading.value = false;
    }
};
// 选择会议
const selectMeeting = async (row) => {
    selectedMeeting.value = row;
    detailVisible.value = true;
    // 加载详情
    const detail = await fetchMeetingDetail(row.id);
    modules.value = detail.modules.map(m => ({ ...m }));
    // 填充表单
    meetingForm.title = row.title;
    meetingForm.address = row.address || '';
    meetingForm.start_time = row.start_time;
    meetingForm.end_time = row.end_time;
    meetingForm.earliest_entry_time = row.earliest_entry_time || '';
};
// 保存会议基本信息
const saveMeetingInfo = async () => {
    if (!selectedMeeting.value)
        return;
    await updateMeeting(selectedMeeting.value.id, {
        title: meetingForm.title,
        address: meetingForm.address || null,
        start_time: meetingForm.start_time,
        end_time: meetingForm.end_time,
        earliest_entry_time: meetingForm.earliest_entry_time || null
    });
    ElMessage.success('会议信息已更新');
    await loadMeetings();
};
// 保存模块设置
const saveModules = async () => {
    if (!selectedMeeting.value)
        return;
    const payload = modules.value.map(m => ({
        id: m.id,
        module_name: m.module_name,
        icon: m.icon,
        is_active: m.is_active,
        sort_order: m.sort_order
    }));
    await batchUpdateModules(selectedMeeting.value.id, payload);
    ElMessage.success('模块设置已保存');
};
// 切换发布状态
const togglePublish = async (row) => {
    const newStatus = !row.is_published;
    await publishMeeting(row.id, newStatus);
    ElMessage.success(newStatus ? '会议已发布' : '已取消发布');
    await loadMeetings();
};
// 删除会议
const removeMeeting = async (meetingId) => {
    await ElMessageBox.confirm('删除会议将同时删除所有相关数据，是否继续？', '删除会议', { type: 'warning' });
    await deleteMeeting(meetingId);
    ElMessage.success('会议已删除');
    await loadMeetings();
};
// 打开参会人员抽屉
const openParticipantDrawer = () => {
    participantDrawerVisible.value = true;
};
// 加载参会人员（由抽屉组件调用）
const loadParticipants = async () => {
    // 刷新数据
};
// 打开投票创建弹窗
const openVoteDialog = () => {
    voteDialogVisible.value = true;
};
// 投票创建成功回调
const onVoteCreated = () => {
    ElMessage.success('投票已创建');
    voteDialogVisible.value = false;
};
// 查看投票列表
const viewVotes = async () => {
    if (!selectedMeeting.value)
        return;
    votesLoading.value = true;
    votesListVisible.value = true;
    try {
        votes.value = await fetchVotes(selectedMeeting.value.id);
    }
    finally {
        votesLoading.value = false;
    }
};
// 打开新建会议弹窗
const openCreateDialog = () => {
    createForm.title = '';
    createForm.address = '';
    createForm.start_time = '';
    createForm.end_time = '';
    createForm.earliest_entry_time = '';
    createDialogVisible.value = true;
};
// 提交新建会议
const submitCreate = async () => {
    if (!createForm.title || !createForm.start_time || !createForm.end_time) {
        ElMessage.error('请填写会议名称和时间');
        return;
    }
    await createMeeting({
        title: createForm.title,
        address: createForm.address || null,
        start_time: createForm.start_time,
        end_time: createForm.end_time,
        earliest_entry_time: createForm.earliest_entry_time || null
    });
    ElMessage.success('会议已创建');
    createDialogVisible.value = false;
    await loadMeetings();
};
onMounted(loadMeetings);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['meeting-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table__row']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['action-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table__row']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table__cell']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['phone-preview']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meeting-manage-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "top-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bar-left" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.openCreateDialog)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClear': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchTitle),
    placeholder: "搜索会议名称",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClear': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchTitle),
    placeholder: "搜索会议名称",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClear: (__VLS_ctx.loadMeetings)
};
const __VLS_16 = {
    onKeyup: (__VLS_ctx.loadMeetings)
};
__VLS_11.slots.default;
{
    const { append: __VLS_thisSlot } = __VLS_11.slots;
    const __VLS_17 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        ...{ 'onClick': {} },
    }));
    const __VLS_19 = __VLS_18({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    let __VLS_21;
    let __VLS_22;
    let __VLS_23;
    const __VLS_24 = {
        onClick: (__VLS_ctx.loadMeetings)
    };
    __VLS_20.slots.default;
    var __VLS_20;
}
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bar-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stats-item" },
});
(__VLS_ctx.meetings.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stats-item" },
});
(__VLS_ctx.publishedCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "meeting-list-section" },
});
const __VLS_25 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    ...{ 'onRowClick': {} },
    data: (__VLS_ctx.meetings),
    ...{ class: "meeting-table" },
}));
const __VLS_27 = __VLS_26({
    ...{ 'onRowClick': {} },
    data: (__VLS_ctx.meetings),
    ...{ class: "meeting-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_29;
let __VLS_30;
let __VLS_31;
const __VLS_32 = {
    onRowClick: (__VLS_ctx.selectMeeting)
};
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_28.slots.default;
const __VLS_33 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_35 = __VLS_34({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const __VLS_37 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    prop: "title",
    label: "会议名称",
    minWidth: "200",
}));
const __VLS_39 = __VLS_38({
    prop: "title",
    label: "会议名称",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const __VLS_41 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    label: "时间",
    minWidth: "200",
}));
const __VLS_43 = __VLS_42({
    label: "时间",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_44.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(scope.row.start_time));
    (__VLS_ctx.formatDateTime(scope.row.end_time));
}
var __VLS_44;
const __VLS_45 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    prop: "address",
    label: "地址",
    minWidth: "160",
}));
const __VLS_47 = __VLS_46({
    prop: "address",
    label: "地址",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_48.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (scope.row.address || '—');
}
var __VLS_48;
const __VLS_49 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    label: "状态",
    width: "100",
}));
const __VLS_51 = __VLS_50({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_52.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "status-badge" },
        ...{ class: (scope.row.status) },
    });
    (__VLS_ctx.statusText(scope.row.status));
}
var __VLS_52;
const __VLS_53 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    label: "发布",
    width: "100",
}));
const __VLS_55 = __VLS_54({
    label: "发布",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_56.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_57 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        type: (scope.row.is_published ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_59 = __VLS_58({
        type: (scope.row.is_published ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    (scope.row.is_published ? '已发布' : '未发布');
    var __VLS_60;
}
var __VLS_56;
const __VLS_61 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    label: "操作",
    width: "280",
    fixed: "right",
}));
const __VLS_63 = __VLS_62({
    label: "操作",
    width: "280",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_64.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-btns" },
    });
    const __VLS_65 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_67 = __VLS_66({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    let __VLS_69;
    let __VLS_70;
    let __VLS_71;
    const __VLS_72 = {
        onClick: (...[$event]) => {
            __VLS_ctx.selectMeeting(scope.row);
        }
    };
    __VLS_68.slots.default;
    var __VLS_68;
    const __VLS_73 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_75 = __VLS_74({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    let __VLS_77;
    let __VLS_78;
    let __VLS_79;
    const __VLS_80 = {
        onClick: (...[$event]) => {
            __VLS_ctx.togglePublish(scope.row);
        }
    };
    __VLS_76.slots.default;
    (scope.row.is_published ? '取消发布' : '发布');
    var __VLS_76;
    const __VLS_81 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_83 = __VLS_82({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    let __VLS_85;
    let __VLS_86;
    let __VLS_87;
    const __VLS_88 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeMeeting(scope.row.id);
        }
    };
    __VLS_84.slots.default;
    var __VLS_84;
}
var __VLS_64;
var __VLS_28;
const __VLS_89 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    modelValue: (__VLS_ctx.detailVisible),
    title: "会议管理",
    width: "1100px",
    top: "5vh",
    destroyOnClose: true,
}));
const __VLS_91 = __VLS_90({
    modelValue: (__VLS_ctx.detailVisible),
    title: "会议管理",
    width: "1100px",
    top: "5vh",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "phone-preview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "phone-frame" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "phone-screen" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-title" },
});
(__VLS_ctx.selectedMeeting?.title || '会议名称');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-time" },
});
(__VLS_ctx.formatDateTime(__VLS_ctx.selectedMeeting?.start_time));
(__VLS_ctx.formatDateTime(__VLS_ctx.selectedMeeting?.end_time));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-address" },
});
(__VLS_ctx.selectedMeeting?.address || '会议地点');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-modules" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-grid" },
});
for (const [module] of __VLS_getVForSourceType((__VLS_ctx.activeModules))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (module.id),
        ...{ class: "module-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "module-icon" },
    });
    const __VLS_93 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        size: (28),
    }));
    const __VLS_95 = __VLS_94({
        size: (28),
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    __VLS_96.slots.default;
    const __VLS_97 = ((__VLS_ctx.getIconComponent(module.icon)));
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({}));
    const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
    var __VLS_96;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "module-name" },
    });
    (module.module_name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "manage-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-title" },
});
const __VLS_101 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    labelWidth: "100px",
    ...{ class: "info-form" },
}));
const __VLS_103 = __VLS_102({
    labelWidth: "100px",
    ...{ class: "info-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
__VLS_104.slots.default;
const __VLS_105 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    label: "会议名称",
}));
const __VLS_107 = __VLS_106({
    label: "会议名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
__VLS_108.slots.default;
const __VLS_109 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    modelValue: (__VLS_ctx.meetingForm.title),
}));
const __VLS_111 = __VLS_110({
    modelValue: (__VLS_ctx.meetingForm.title),
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
var __VLS_108;
const __VLS_113 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    label: "会议地址",
}));
const __VLS_115 = __VLS_114({
    label: "会议地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
__VLS_116.slots.default;
const __VLS_117 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    modelValue: (__VLS_ctx.meetingForm.address),
}));
const __VLS_119 = __VLS_118({
    modelValue: (__VLS_ctx.meetingForm.address),
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
var __VLS_116;
const __VLS_121 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    label: "开始时间",
}));
const __VLS_123 = __VLS_122({
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_124.slots.default;
const __VLS_125 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    modelValue: (__VLS_ctx.meetingForm.start_time),
    type: "datetime",
    placeholder: "选择开始时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}));
const __VLS_127 = __VLS_126({
    modelValue: (__VLS_ctx.meetingForm.start_time),
    type: "datetime",
    placeholder: "选择开始时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
var __VLS_124;
const __VLS_129 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    label: "结束时间",
}));
const __VLS_131 = __VLS_130({
    label: "结束时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
const __VLS_133 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    modelValue: (__VLS_ctx.meetingForm.end_time),
    type: "datetime",
    placeholder: "选择结束时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}));
const __VLS_135 = __VLS_134({
    modelValue: (__VLS_ctx.meetingForm.end_time),
    type: "datetime",
    placeholder: "选择结束时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
var __VLS_132;
const __VLS_137 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    label: "最早入场",
}));
const __VLS_139 = __VLS_138({
    label: "最早入场",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
const __VLS_141 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    modelValue: (__VLS_ctx.meetingForm.earliest_entry_time),
    type: "datetime",
    placeholder: "选择最早入场时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}));
const __VLS_143 = __VLS_142({
    modelValue: (__VLS_ctx.meetingForm.earliest_entry_time),
    type: "datetime",
    placeholder: "选择最早入场时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
var __VLS_140;
const __VLS_145 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({}));
const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
const __VLS_149 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_151 = __VLS_150({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
let __VLS_153;
let __VLS_154;
let __VLS_155;
const __VLS_156 = {
    onClick: (__VLS_ctx.saveMeetingInfo)
};
__VLS_152.slots.default;
var __VLS_152;
var __VLS_148;
var __VLS_104;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_157 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_159 = __VLS_158({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
let __VLS_161;
let __VLS_162;
let __VLS_163;
const __VLS_164 = {
    onClick: (__VLS_ctx.saveModules)
};
__VLS_160.slots.default;
var __VLS_160;
const __VLS_165 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
    data: (__VLS_ctx.modules),
    ...{ class: "module-table" },
    size: "small",
}));
const __VLS_167 = __VLS_166({
    data: (__VLS_ctx.modules),
    ...{ class: "module-table" },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
__VLS_168.slots.default;
const __VLS_169 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
    type: "index",
    label: "序号",
    width: "60",
}));
const __VLS_171 = __VLS_170({
    type: "index",
    label: "序号",
    width: "60",
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
const __VLS_173 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    prop: "module_name",
    label: "模块名称",
    minWidth: "120",
}));
const __VLS_175 = __VLS_174({
    prop: "module_name",
    label: "模块名称",
    minWidth: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
const __VLS_177 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    label: "图标",
    width: "100",
}));
const __VLS_179 = __VLS_178({
    label: "图标",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
__VLS_180.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_180.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_181 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
        size: (20),
    }));
    const __VLS_183 = __VLS_182({
        size: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    __VLS_184.slots.default;
    const __VLS_185 = ((__VLS_ctx.getIconComponent(scope.row.icon)));
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({}));
    const __VLS_187 = __VLS_186({}, ...__VLS_functionalComponentArgsRest(__VLS_186));
    var __VLS_184;
}
var __VLS_180;
const __VLS_189 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    label: "状态",
    width: "80",
}));
const __VLS_191 = __VLS_190({
    label: "状态",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
__VLS_192.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_192.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_193 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
        modelValue: (scope.row.is_active),
        size: "small",
    }));
    const __VLS_195 = __VLS_194({
        modelValue: (scope.row.is_active),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_194));
}
var __VLS_192;
const __VLS_197 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
    label: "排序",
    width: "100",
}));
const __VLS_199 = __VLS_198({
    label: "排序",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_198));
__VLS_200.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_200.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_201 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
        modelValue: (scope.row.sort_order),
        min: (1),
        max: (99),
        size: "small",
        controlsPosition: "right",
    }));
    const __VLS_203 = __VLS_202({
        modelValue: (scope.row.sort_order),
        min: (1),
        max: (99),
        size: "small",
        controlsPosition: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_202));
}
var __VLS_200;
var __VLS_168;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-card" },
});
const __VLS_205 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_207 = __VLS_206({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
let __VLS_209;
let __VLS_210;
let __VLS_211;
const __VLS_212 = {
    onClick: (__VLS_ctx.openParticipantDrawer)
};
__VLS_208.slots.default;
var __VLS_208;
const __VLS_213 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
    ...{ 'onClick': {} },
    type: "success",
}));
const __VLS_215 = __VLS_214({
    ...{ 'onClick': {} },
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
let __VLS_217;
let __VLS_218;
let __VLS_219;
const __VLS_220 = {
    onClick: (__VLS_ctx.openVoteDialog)
};
__VLS_216.slots.default;
var __VLS_216;
const __VLS_221 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
    ...{ 'onClick': {} },
}));
const __VLS_223 = __VLS_222({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
let __VLS_225;
let __VLS_226;
let __VLS_227;
const __VLS_228 = {
    onClick: (__VLS_ctx.viewVotes)
};
__VLS_224.slots.default;
var __VLS_224;
var __VLS_92;
/** @type {[typeof ParticipantImportDrawer, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(ParticipantImportDrawer, new ParticipantImportDrawer({
    ...{ 'onRefresh': {} },
    visible: (__VLS_ctx.participantDrawerVisible),
    meetingId: (__VLS_ctx.selectedMeeting?.id || 0),
}));
const __VLS_230 = __VLS_229({
    ...{ 'onRefresh': {} },
    visible: (__VLS_ctx.participantDrawerVisible),
    meetingId: (__VLS_ctx.selectedMeeting?.id || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
let __VLS_232;
let __VLS_233;
let __VLS_234;
const __VLS_235 = {
    onRefresh: (__VLS_ctx.loadParticipants)
};
var __VLS_231;
/** @type {[typeof VoteCreateDialog, ]} */ ;
// @ts-ignore
const __VLS_236 = __VLS_asFunctionalComponent(VoteCreateDialog, new VoteCreateDialog({
    ...{ 'onCreated': {} },
    visible: (__VLS_ctx.voteDialogVisible),
    meetingId: (__VLS_ctx.selectedMeeting?.id || 0),
}));
const __VLS_237 = __VLS_236({
    ...{ 'onCreated': {} },
    visible: (__VLS_ctx.voteDialogVisible),
    meetingId: (__VLS_ctx.selectedMeeting?.id || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_236));
let __VLS_239;
let __VLS_240;
let __VLS_241;
const __VLS_242 = {
    onCreated: (__VLS_ctx.onVoteCreated)
};
var __VLS_238;
const __VLS_243 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
    modelValue: (__VLS_ctx.createDialogVisible),
    title: "新建会议",
    width: "500px",
}));
const __VLS_245 = __VLS_244({
    modelValue: (__VLS_ctx.createDialogVisible),
    title: "新建会议",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_244));
__VLS_246.slots.default;
const __VLS_247 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
    labelWidth: "100px",
}));
const __VLS_249 = __VLS_248({
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_248));
__VLS_250.slots.default;
const __VLS_251 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({
    label: "会议名称",
    required: true,
}));
const __VLS_253 = __VLS_252({
    label: "会议名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_252));
__VLS_254.slots.default;
const __VLS_255 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
    modelValue: (__VLS_ctx.createForm.title),
    placeholder: "输入会议名称",
}));
const __VLS_257 = __VLS_256({
    modelValue: (__VLS_ctx.createForm.title),
    placeholder: "输入会议名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_256));
var __VLS_254;
const __VLS_259 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
    label: "会议地址",
}));
const __VLS_261 = __VLS_260({
    label: "会议地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
__VLS_262.slots.default;
const __VLS_263 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({
    modelValue: (__VLS_ctx.createForm.address),
    placeholder: "输入会议地址",
}));
const __VLS_265 = __VLS_264({
    modelValue: (__VLS_ctx.createForm.address),
    placeholder: "输入会议地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_264));
var __VLS_262;
const __VLS_267 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
    label: "开始时间",
    required: true,
}));
const __VLS_269 = __VLS_268({
    label: "开始时间",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_268));
__VLS_270.slots.default;
const __VLS_271 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
    modelValue: (__VLS_ctx.createForm.start_time),
    type: "datetime",
    placeholder: "选择开始时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}));
const __VLS_273 = __VLS_272({
    modelValue: (__VLS_ctx.createForm.start_time),
    type: "datetime",
    placeholder: "选择开始时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}, ...__VLS_functionalComponentArgsRest(__VLS_272));
var __VLS_270;
const __VLS_275 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({
    label: "结束时间",
    required: true,
}));
const __VLS_277 = __VLS_276({
    label: "结束时间",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_276));
__VLS_278.slots.default;
const __VLS_279 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
    modelValue: (__VLS_ctx.createForm.end_time),
    type: "datetime",
    placeholder: "选择结束时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}));
const __VLS_281 = __VLS_280({
    modelValue: (__VLS_ctx.createForm.end_time),
    type: "datetime",
    placeholder: "选择结束时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}, ...__VLS_functionalComponentArgsRest(__VLS_280));
var __VLS_278;
const __VLS_283 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({
    label: "最早入场",
}));
const __VLS_285 = __VLS_284({
    label: "最早入场",
}, ...__VLS_functionalComponentArgsRest(__VLS_284));
__VLS_286.slots.default;
const __VLS_287 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({
    modelValue: (__VLS_ctx.createForm.earliest_entry_time),
    type: "datetime",
    placeholder: "选择最早入场时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}));
const __VLS_289 = __VLS_288({
    modelValue: (__VLS_ctx.createForm.earliest_entry_time),
    type: "datetime",
    placeholder: "选择最早入场时间",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}, ...__VLS_functionalComponentArgsRest(__VLS_288));
var __VLS_286;
var __VLS_250;
{
    const { footer: __VLS_thisSlot } = __VLS_246.slots;
    const __VLS_291 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
        ...{ 'onClick': {} },
    }));
    const __VLS_293 = __VLS_292({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_292));
    let __VLS_295;
    let __VLS_296;
    let __VLS_297;
    const __VLS_298 = {
        onClick: (...[$event]) => {
            __VLS_ctx.createDialogVisible = false;
        }
    };
    __VLS_294.slots.default;
    var __VLS_294;
    const __VLS_299 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_301 = __VLS_300({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_300));
    let __VLS_303;
    let __VLS_304;
    let __VLS_305;
    const __VLS_306 = {
        onClick: (__VLS_ctx.submitCreate)
    };
    __VLS_302.slots.default;
    var __VLS_302;
}
var __VLS_246;
const __VLS_307 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({
    modelValue: (__VLS_ctx.votesListVisible),
    title: "投票列表",
    width: "700px",
}));
const __VLS_309 = __VLS_308({
    modelValue: (__VLS_ctx.votesListVisible),
    title: "投票列表",
    width: "700px",
}, ...__VLS_functionalComponentArgsRest(__VLS_308));
__VLS_310.slots.default;
const __VLS_311 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({
    data: (__VLS_ctx.votes),
}));
const __VLS_313 = __VLS_312({
    data: (__VLS_ctx.votes),
}, ...__VLS_functionalComponentArgsRest(__VLS_312));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.votesLoading) }, null, null);
__VLS_314.slots.default;
const __VLS_315 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_316 = __VLS_asFunctionalComponent(__VLS_315, new __VLS_315({
    prop: "topic",
    label: "投票主题",
    minWidth: "180",
}));
const __VLS_317 = __VLS_316({
    prop: "topic",
    label: "投票主题",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_316));
const __VLS_319 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({
    label: "状态",
    width: "100",
}));
const __VLS_321 = __VLS_320({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_320));
__VLS_322.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_322.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_323 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_324 = __VLS_asFunctionalComponent(__VLS_323, new __VLS_323({
        type: (scope.row.status === 'voting' ? 'warning' : 'info'),
        size: "small",
    }));
    const __VLS_325 = __VLS_324({
        type: (scope.row.status === 'voting' ? 'warning' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_324));
    __VLS_326.slots.default;
    (scope.row.status === 'voting' ? '进行中' : '已结束');
    var __VLS_326;
}
var __VLS_322;
const __VLS_327 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_328 = __VLS_asFunctionalComponent(__VLS_327, new __VLS_327({
    label: "投票人数",
    width: "100",
}));
const __VLS_329 = __VLS_328({
    label: "投票人数",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_328));
__VLS_330.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_330.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.getTotalVotes(scope.row.results));
}
var __VLS_330;
const __VLS_331 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_332 = __VLS_asFunctionalComponent(__VLS_331, new __VLS_331({
    label: "创建时间",
    minWidth: "160",
}));
const __VLS_333 = __VLS_332({
    label: "创建时间",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_332));
__VLS_334.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_334.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(scope.row.created_at));
}
var __VLS_334;
var __VLS_314;
var __VLS_310;
/** @type {__VLS_StyleScopedClasses['meeting-manage-page']} */ ;
/** @type {__VLS_StyleScopedClasses['top-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-left']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-right']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-list-section']} */ ;
/** @type {__VLS_StyleScopedClasses['meeting-table']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btns']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['phone-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['phone-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['phone-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-time']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-address']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-modules']} */ ;
/** @type {__VLS_StyleScopedClasses['module-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['module-item']} */ ;
/** @type {__VLS_StyleScopedClasses['module-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['module-name']} */ ;
/** @type {__VLS_StyleScopedClasses['manage-area']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-form']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-table']} */ ;
/** @type {__VLS_StyleScopedClasses['action-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ParticipantImportDrawer: ParticipantImportDrawer,
            VoteCreateDialog: VoteCreateDialog,
            meetings: meetings,
            loading: loading,
            searchTitle: searchTitle,
            selectedMeeting: selectedMeeting,
            detailVisible: detailVisible,
            modules: modules,
            meetingForm: meetingForm,
            participantDrawerVisible: participantDrawerVisible,
            voteDialogVisible: voteDialogVisible,
            votesListVisible: votesListVisible,
            votes: votes,
            votesLoading: votesLoading,
            createDialogVisible: createDialogVisible,
            createForm: createForm,
            publishedCount: publishedCount,
            activeModules: activeModules,
            statusText: statusText,
            formatDateTime: formatDateTime,
            getTotalVotes: getTotalVotes,
            getIconComponent: getIconComponent,
            loadMeetings: loadMeetings,
            selectMeeting: selectMeeting,
            saveMeetingInfo: saveMeetingInfo,
            saveModules: saveModules,
            togglePublish: togglePublish,
            removeMeeting: removeMeeting,
            openParticipantDrawer: openParticipantDrawer,
            loadParticipants: loadParticipants,
            openVoteDialog: openVoteDialog,
            onVoteCreated: onVoteCreated,
            viewVotes: viewVotes,
            openCreateDialog: openCreateDialog,
            submitCreate: submitCreate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
