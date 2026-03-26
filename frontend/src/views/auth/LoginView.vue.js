import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import AuthShell from '../../components/auth/AuthShell.vue';
import { useAuthStore } from '../../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const form = reactive({ username: '', password: '' });
const handleSubmit = async () => {
    try {
        await authStore.loginAction(form.username, form.password);
        ElMessage.success('登录成功');
        router.push('/');
    }
    catch {
        ElMessage.error('登录失败');
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['auth-content']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AuthShell, typeof AuthShell, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AuthShell, new AuthShell({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
const __VLS_4 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ class: "auth-card" },
    shadow: "never",
}));
const __VLS_6 = __VLS_5({
    ...{ class: "auth-card" },
    shadow: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "auth-description" },
});
const __VLS_8 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onSubmit': {} },
    ...{ class: "auth-form" },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onSubmit': {} },
    ...{ class: "auth-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onSubmit: (__VLS_ctx.handleSubmit)
};
__VLS_11.slots.default;
const __VLS_16 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "用户名",
}));
const __VLS_18 = __VLS_17({
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.form.username),
    size: "large",
    placeholder: "请输入用户名",
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.form.username),
    size: "large",
    placeholder: "请输入用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_19;
const __VLS_24 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "密码",
}));
const __VLS_26 = __VLS_25({
    label: "密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    showPassword: true,
    size: "large",
    placeholder: "请输入密码",
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    showPassword: true,
    size: "large",
    placeholder: "请输入密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
const __VLS_32 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    ...{ class: "submit-btn" },
    type: "primary",
    size: "large",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    ...{ class: "submit-btn" },
    type: "primary",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_35.slots.default;
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    link: true,
    type: "primary",
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    link: true,
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/register');
    }
};
__VLS_43.slots.default;
var __VLS_43;
var __VLS_11;
var __VLS_7;
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-content']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-description']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AuthShell: AuthShell,
            router: router,
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
