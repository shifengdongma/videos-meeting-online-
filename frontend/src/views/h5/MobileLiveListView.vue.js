import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchLiveStreams, createLiveStream } from '../../api/live';
import { useAuthStore } from '../../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const streams = ref([]);
const loading = ref(false);
const activeTab = ref(2);
// Create live stream dialog
const showCreateDialog = ref(false);
const newLiveTitle = ref('');
// 计算属性
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role));
// 工具函数
const formatDateTime = (datetime) => {
    const d = new Date(datetime);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
// 加载数据
const loadStreams = async () => {
    loading.value = true;
    try {
        streams.value = await fetchLiveStreams();
    }
    finally {
        loading.value = false;
    }
};
// 操作函数
const enterLiveRoom = (id) => {
    router.push(`/live/${id}`);
};
const handleCreateLive = async (action) => {
    if (action === 'cancel') {
        newLiveTitle.value = '';
        return true;
    }
    if (!newLiveTitle.value.trim()) {
        showToast('请输入直播标题');
        return false;
    }
    try {
        await createLiveStream({
            title: newLiveTitle.value,
            record_url: null
        });
        showToast('直播已开启');
        newLiveTitle.value = '';
        await loadStreams();
        return true;
    }
    catch {
        showToast('创建失败');
        return false;
    }
};
onMounted(loadStreams);
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
    ...{ class: "mobile-live-list" },
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
(__VLS_ctx.streams.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value available" },
});
(__VLS_ctx.streams.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
    ...{ class: (__VLS_ctx.canCreate ? 'enabled' : 'disabled') },
});
(__VLS_ctx.canCreate ? '已开启' : '未开启');
if (__VLS_ctx.canCreate) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-buttons" },
    });
    const __VLS_0 = {}.VanButton;
    /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        block: true,
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        block: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canCreate))
                return;
            __VLS_ctx.showCreateDialog = true;
        }
    };
    __VLS_3.slots.default;
    var __VLS_3;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-list" },
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
else if (__VLS_ctx.streams.length === 0) {
    const __VLS_12 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        description: "当前还没有直播",
    }));
    const __VLS_14 = __VLS_13({
        description: "当前还没有直播",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    if (__VLS_ctx.canCreate) {
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
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!(__VLS_ctx.streams.length === 0))
                    return;
                if (!(__VLS_ctx.canCreate))
                    return;
                __VLS_ctx.showCreateDialog = true;
            }
        };
        __VLS_19.slots.default;
        var __VLS_19;
    }
    var __VLS_15;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-list" },
    });
    for (const [stream] of __VLS_getVForSourceType((__VLS_ctx.streams))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (stream.id),
            ...{ class: "live-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "live-title" },
        });
        (stream.title);
        const __VLS_24 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            type: "danger",
            size: "medium",
        }));
        const __VLS_26 = __VLS_25({
            type: "danger",
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_27.slots.default;
        var __VLS_27;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-row" },
        });
        const __VLS_28 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            name: "video",
        }));
        const __VLS_30 = __VLS_29({
            name: "video",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "room-code" },
        });
        (stream.room_code);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-row" },
        });
        const __VLS_32 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            name: "clock-o",
        }));
        const __VLS_34 = __VLS_33({
            name: "clock-o",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDateTime(stream.start_time));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-footer" },
        });
        const __VLS_36 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            block: true,
        }));
        const __VLS_38 = __VLS_37({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            block: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_40;
        let __VLS_41;
        let __VLS_42;
        const __VLS_43 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!!(__VLS_ctx.streams.length === 0))
                    return;
                __VLS_ctx.enterLiveRoom(stream.id);
            }
        };
        __VLS_39.slots.default;
        var __VLS_39;
    }
}
const __VLS_44 = {}.VanDialog;
/** @type {[typeof __VLS_components.VanDialog, typeof __VLS_components.vanDialog, typeof __VLS_components.VanDialog, typeof __VLS_components.vanDialog, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    show: (__VLS_ctx.showCreateDialog),
    title: "开启直播",
    showCancelButton: true,
    beforeClose: (__VLS_ctx.handleCreateLive),
}));
const __VLS_46 = __VLS_45({
    show: (__VLS_ctx.showCreateDialog),
    title: "开启直播",
    showCancelButton: true,
    beforeClose: (__VLS_ctx.handleCreateLive),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.newLiveTitle),
    label: "直播标题",
    placeholder: "请输入直播标题",
    rules: ([{ required: true, message: '请输入直播标题' }]),
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.newLiveTitle),
    label: "直播标题",
    placeholder: "请输入直播标题",
    rules: ([{ required: true, message: '请输入直播标题' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
var __VLS_47;
const __VLS_52 = {}.VanTabbar;
/** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    icon: "calendar-o",
    to: "/dashboard",
}));
const __VLS_58 = __VLS_57({
    icon: "calendar-o",
    to: "/dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
var __VLS_59;
const __VLS_60 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    icon: "video-o",
    to: "/meetings",
}));
const __VLS_62 = __VLS_61({
    icon: "video-o",
    to: "/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
var __VLS_63;
const __VLS_64 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    icon: "play-circle-o",
    to: "/live",
}));
const __VLS_66 = __VLS_65({
    icon: "play-circle-o",
    to: "/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
var __VLS_67;
const __VLS_68 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    icon: "user-o",
    to: "/profile",
}));
const __VLS_70 = __VLS_69({
    icon: "user-o",
    to: "/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
var __VLS_71;
var __VLS_55;
/** @type {__VLS_StyleScopedClasses['mobile-live-list']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['live-list']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-center']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list']} */ ;
/** @type {__VLS_StyleScopedClasses['live-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['live-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['room-code']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            streams: streams,
            loading: loading,
            activeTab: activeTab,
            showCreateDialog: showCreateDialog,
            newLiveTitle: newLiveTitle,
            canCreate: canCreate,
            formatDateTime: formatDateTime,
            enterLiveRoom: enterLiveRoom,
            handleCreateLive: handleCreateLive,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
