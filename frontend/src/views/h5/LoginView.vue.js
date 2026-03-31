import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useAuthStore } from '../../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const form = reactive({ username: '', password: '' });
const handleSubmit = async () => {
    try {
        await authStore.loginAction(form.username, form.password);
        showToast('登录成功');
        router.push('/h5/dashboard');
    }
    catch {
        showToast('登录失败');
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brand-header']} */ ;
/** @type {__VLS_StyleScopedClasses['register-link']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h5-login" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: "../../assets/logo.png",
    ...{ class: "logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "brand-desc" },
});
const __VLS_0 = {}.VanForm;
/** @type {[typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onSubmit': {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSubmit: (__VLS_ctx.handleSubmit)
};
__VLS_3.slots.default;
const __VLS_8 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.form.username),
    name: "username",
    label: "用户名",
    placeholder: "请输入用户名",
    rules: ([{ required: true, message: '请输入用户名' }]),
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.form.username),
    name: "username",
    label: "用户名",
    placeholder: "请输入用户名",
    rules: ([{ required: true, message: '请输入用户名' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    name: "password",
    label: "密码",
    placeholder: "请输入密码",
    rules: ([{ required: true, message: '请输入密码' }]),
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    name: "password",
    label: "密码",
    placeholder: "请输入密码",
    rules: ([{ required: true, message: '请输入密码' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "submit-btn" },
});
const __VLS_16 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    round: true,
    block: true,
    type: "primary",
    nativeType: "submit",
}));
const __VLS_18 = __VLS_17({
    round: true,
    block: true,
    type: "primary",
    nativeType: "submit",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
var __VLS_19;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "register-link" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_20 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    to: "/h5/register",
}));
const __VLS_22 = __VLS_21({
    to: "/h5/register",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
var __VLS_23;
/** @type {__VLS_StyleScopedClasses['h5-login']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-header']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['register-link']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            form: form,
            handleSubmit: handleSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
