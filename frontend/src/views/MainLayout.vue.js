import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const pageTitle = computed(() => {
    if (route.path.startsWith('/meetings/'))
        return '会议控制台';
    if (route.path.startsWith('/live/'))
        return '直播控制台';
    if (route.path.startsWith('/live'))
        return '直播中心';
    if (route.path.startsWith('/admin'))
        return '后台管理';
    return '会议中心';
});
const roleLabel = computed(() => {
    if (authStore.role === 'admin')
        return '系统管理员';
    if (authStore.role === 'host')
        return '会议主持人';
    return '普通成员';
});
const logout = () => {
    authStore.logout();
    router.push('/login');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['el-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['el-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shell-glow shell-glow-a" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shell-glow shell-glow-b" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "sidebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-inner" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-mark" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-subtitle" },
});
const __VLS_0 = {}.ElMenu;
/** @type {[typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    defaultActive: (__VLS_ctx.route.path),
    router: true,
    ...{ class: "nav-menu" },
}));
const __VLS_2 = __VLS_1({
    defaultActive: (__VLS_ctx.route.path),
    router: true,
    ...{ class: "nav-menu" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElMenuItem;
/** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    index: "/meetings",
}));
const __VLS_6 = __VLS_5({
    index: "/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
var __VLS_7;
const __VLS_8 = {}.ElMenuItem;
/** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    index: "/live",
}));
const __VLS_10 = __VLS_9({
    index: "/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
var __VLS_11;
if (__VLS_ctx.authStore.role === 'admin') {
    const __VLS_12 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        index: "/admin/users",
    }));
    const __VLS_14 = __VLS_13({
        index: "/admin/users",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_15;
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-value" },
});
(__VLS_ctx.roleLabel);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "topbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "topbar-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "topbar-title" },
});
(__VLS_ctx.pageTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "topbar-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-avatar" },
});
(__VLS_ctx.authStore.user?.username?.slice(0, 1).toUpperCase() || 'U');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-name" },
});
(__VLS_ctx.authStore.user?.username);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-role" },
});
(__VLS_ctx.roleLabel);
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    ...{ class: "logout-btn" },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    ...{ class: "logout-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.logout)
};
__VLS_19.slots.default;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "content-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-inner" },
});
const __VLS_24 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['shell-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['shell-glow-a']} */ ;
/** @type {__VLS_StyleScopedClasses['shell-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['shell-glow-b']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-block']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-value']} */ ;
/** @type {__VLS_StyleScopedClasses['main-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-label']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['user-card']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['user-role']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['content-inner']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            authStore: authStore,
            route: route,
            pageTitle: pageTitle,
            roleLabel: roleLabel,
            logout: logout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
