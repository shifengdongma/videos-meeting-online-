import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageHeader from '../../components/layout/PageHeader.vue';
import EmptyState from '../../components/ui/EmptyState.vue';
import StatusTag from '../../components/ui/StatusTag.vue';
import SummaryCard from '../../components/ui/SummaryCard.vue';
import { fetchUsers, updateUserRole } from '../../api/users';
const users = ref([]);
const loading = ref(false);
const adminCount = computed(() => users.value.filter((item) => item.role === 'admin').length);
const hostCount = computed(() => users.value.filter((item) => item.role === 'host').length);
const userCount = computed(() => users.value.filter((item) => item.role === 'user').length);
const roleText = (role) => {
    if (role === 'admin')
        return '管理员';
    if (role === 'host')
        return '主持人';
    return '普通用户';
};
const loadUsers = async () => {
    loading.value = true;
    try {
        users.value = await fetchUsers();
    }
    finally {
        loading.value = false;
    }
};
const changeRole = async (userId, role) => {
    await updateUserRole(userId, role);
    ElMessage.success('角色更新成功');
    await loadUsers();
};
onMounted(loadUsers);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['role-select']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-page app-page" },
});
/** @type {[typeof PageHeader, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(PageHeader, new PageHeader({
    eyebrow: "Access control",
    title: "管理后台",
    description: "集中维护账号角色与权限分配，帮助管理员快速识别当前系统中的角色结构。",
}));
const __VLS_1 = __VLS_0({
    eyebrow: "Access control",
    title: "管理后台",
    description: "集中维护账号角色与权限分配，帮助管理员快速识别当前系统中的角色结构。",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-grid app-summary-grid" },
    'data-columns': "4",
});
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "用户总数",
    value: (__VLS_ctx.users.length),
    description: "当前系统内的全部账号",
    tone: "primary",
}));
const __VLS_4 = __VLS_3({
    label: "用户总数",
    value: (__VLS_ctx.users.length),
    description: "当前系统内的全部账号",
    tone: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "管理员",
    value: (__VLS_ctx.adminCount),
    hint: "高权限",
    description: "负责系统配置与权限分配",
    tone: "warning",
}));
const __VLS_7 = __VLS_6({
    label: "管理员",
    value: (__VLS_ctx.adminCount),
    hint: "高权限",
    description: "负责系统配置与权限分配",
    tone: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "主持人",
    value: (__VLS_ctx.hostCount),
    description: "可创建会议与直播的账号",
    tone: "success",
}));
const __VLS_10 = __VLS_9({
    label: "主持人",
    value: (__VLS_ctx.hostCount),
    description: "可创建会议与直播的账号",
    tone: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "普通用户",
    value: (__VLS_ctx.userCount),
    description: "参与会议与观看直播的账号",
    tone: "neutral",
}));
const __VLS_13 = __VLS_12({
    label: "普通用户",
    value: (__VLS_ctx.userCount),
    description: "参与会议与观看直播的账号",
    tone: "neutral",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
const __VLS_15 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    ...{ class: "table-card app-table-card" },
    shadow: "never",
}));
const __VLS_17 = __VLS_16({
    ...{ class: "table-card app-table-card" },
    shadow: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_18.slots.default;
const __VLS_19 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    data: (__VLS_ctx.users),
}));
const __VLS_21 = __VLS_20({
    data: (__VLS_ctx.users),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_22.slots.default;
const __VLS_23 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_25 = __VLS_24({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
const __VLS_27 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    prop: "username",
    label: "用户名",
    minWidth: "220",
}));
const __VLS_29 = __VLS_28({
    prop: "username",
    label: "用户名",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
const __VLS_31 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    label: "当前角色",
    width: "140",
}));
const __VLS_33 = __VLS_32({
    label: "当前角色",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
__VLS_34.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_34.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    /** @type {[typeof StatusTag, ]} */ ;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(StatusTag, new StatusTag({
        text: (__VLS_ctx.roleText(scope.row.role)),
        status: (scope.row.role),
    }));
    const __VLS_36 = __VLS_35({
        text: (__VLS_ctx.roleText(scope.row.role)),
        status: (scope.row.role),
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
}
var __VLS_34;
const __VLS_38 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    label: "角色调整",
    minWidth: "220",
}));
const __VLS_40 = __VLS_39({
    label: "角色调整",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_41.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_42 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
        ...{ 'onChange': {} },
        modelValue: (scope.row.role),
        ...{ class: "role-select" },
    }));
    const __VLS_44 = __VLS_43({
        ...{ 'onChange': {} },
        modelValue: (scope.row.role),
        ...{ class: "role-select" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_46;
    let __VLS_47;
    let __VLS_48;
    const __VLS_49 = {
        onChange: ((value) => __VLS_ctx.changeRole(scope.row.id, value))
    };
    __VLS_45.slots.default;
    const __VLS_50 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        label: "管理员",
        value: "admin",
    }));
    const __VLS_52 = __VLS_51({
        label: "管理员",
        value: "admin",
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    const __VLS_54 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        label: "主持人",
        value: "host",
    }));
    const __VLS_56 = __VLS_55({
        label: "主持人",
        value: "host",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    const __VLS_58 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        label: "普通用户",
        value: "user",
    }));
    const __VLS_60 = __VLS_59({
        label: "普通用户",
        value: "user",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    var __VLS_45;
}
var __VLS_41;
var __VLS_22;
if (!__VLS_ctx.loading && !__VLS_ctx.users.length) {
    /** @type {[typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        description: "当前没有可管理的用户账号。",
    }));
    const __VLS_63 = __VLS_62({
        description: "当前没有可管理的用户账号。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
}
var __VLS_18;
/** @type {__VLS_StyleScopedClasses['user-page']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['app-summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['role-select']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            PageHeader: PageHeader,
            EmptyState: EmptyState,
            StatusTag: StatusTag,
            SummaryCard: SummaryCard,
            users: users,
            loading: loading,
            adminCount: adminCount,
            hostCount: hostCount,
            userCount: userCount,
            roleText: roleText,
            changeRole: changeRole,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
