import { computed, onMounted, ref } from 'vue';
import { showToast } from 'vant';
import { fetchUsers, updateUserRole } from '../../api/users';
const users = ref([]);
const loading = ref(false);
const activeTab = ref(0);
const roleOptions = [
    { text: '管理员', value: 'admin' },
    { text: '主持人', value: 'host' },
    { text: '普通用户', value: 'user' }
];
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
const getRoleTagType = (role) => {
    if (role === 'admin')
        return 'danger';
    if (role === 'host')
        return 'warning';
    return 'success';
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
    try {
        await updateUserRole(userId, role);
        showToast('角色更新成功');
        await loadUsers();
    }
    catch {
        showToast('更新失败');
    }
};
onMounted(loadUsers);
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
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mobile-user-manage" },
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
(__VLS_ctx.users.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value admin" },
});
(__VLS_ctx.adminCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value host" },
});
(__VLS_ctx.hostCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value user" },
});
(__VLS_ctx.userCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-list" },
});
if (__VLS_ctx.loading) {
    const __VLS_0 = {}.VanLoading;
    /** @type {[typeof __VLS_components.VanLoading, typeof __VLS_components.vanLoading, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ class: "loading-center" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "loading-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else if (__VLS_ctx.users.length === 0) {
    const __VLS_4 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        description: "暂无用户数据",
    }));
    const __VLS_6 = __VLS_5({
        description: "暂无用户数据",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-list" },
    });
    for (const [user] of __VLS_getVForSourceType((__VLS_ctx.users))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (user.id),
            ...{ class: "user-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-avatar" },
        });
        const __VLS_8 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            name: "user-circle-o",
            size: "36",
        }));
        const __VLS_10 = __VLS_9({
            name: "user-circle-o",
            size: "36",
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-id" },
        });
        (user.id);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-name" },
        });
        (user.username);
        const __VLS_12 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            type: (__VLS_ctx.getRoleTagType(user.role)),
        }));
        const __VLS_14 = __VLS_13({
            type: (__VLS_ctx.getRoleTagType(user.role)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        (__VLS_ctx.roleText(user.role));
        var __VLS_15;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-footer" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "role-label" },
        });
        const __VLS_16 = {}.VanDropdownMenu;
        /** @type {[typeof __VLS_components.VanDropdownMenu, typeof __VLS_components.vanDropdownMenu, typeof __VLS_components.VanDropdownMenu, typeof __VLS_components.vanDropdownMenu, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
        const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        const __VLS_20 = {}.VanDropdownItem;
        /** @type {[typeof __VLS_components.VanDropdownItem, typeof __VLS_components.vanDropdownItem, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            ...{ 'onChange': {} },
            modelValue: (user.role),
            options: (__VLS_ctx.roleOptions),
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onChange': {} },
            modelValue: (user.role),
            options: (__VLS_ctx.roleOptions),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_24;
        let __VLS_25;
        let __VLS_26;
        const __VLS_27 = {
            onChange: ((value) => __VLS_ctx.changeRole(user.id, value))
        };
        var __VLS_23;
        var __VLS_19;
    }
}
const __VLS_28 = {}.VanTabbar;
/** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    icon: "calendar-o",
    to: "/dashboard",
}));
const __VLS_34 = __VLS_33({
    icon: "calendar-o",
    to: "/dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
var __VLS_35;
const __VLS_36 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    icon: "video-o",
    to: "/meetings",
}));
const __VLS_38 = __VLS_37({
    icon: "video-o",
    to: "/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
var __VLS_39;
const __VLS_40 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    icon: "play-circle-o",
    to: "/live",
}));
const __VLS_42 = __VLS_41({
    icon: "play-circle-o",
    to: "/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
var __VLS_43;
const __VLS_44 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    icon: "user-o",
    to: "/profile",
}));
const __VLS_46 = __VLS_45({
    icon: "user-o",
    to: "/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
var __VLS_47;
var __VLS_31;
/** @type {__VLS_StyleScopedClasses['mobile-user-manage']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['admin']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['host']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-center']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list']} */ ;
/** @type {__VLS_StyleScopedClasses['user-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-id']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['role-label']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            users: users,
            loading: loading,
            activeTab: activeTab,
            roleOptions: roleOptions,
            adminCount: adminCount,
            hostCount: hostCount,
            userCount: userCount,
            roleText: roleText,
            getRoleTagType: getRoleTagType,
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
