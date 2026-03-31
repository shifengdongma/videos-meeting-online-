import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchLiveStreams, createLiveStream } from '../../api/live';
import { useAuthStore } from '../../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const liveStreams = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(true);
const activeTab = ref(2);
// Create live stream dialog
const showCreateDialog = ref(false);
const newLiveTitle = ref('');
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role));
onMounted(async () => {
    await loadLiveStreams();
});
const loadLiveStreams = async () => {
    try {
        loading.value = true;
        liveStreams.value = await fetchLiveStreams();
    }
    finally {
        loading.value = false;
    }
};
const onRefresh = async () => {
    await loadLiveStreams();
    refreshing.value = false;
};
const onLoad = () => {
    finished.value = true;
};
const formatDateTime = (datetime) => {
    const d = new Date(datetime);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
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
        showToast('创建成功');
        newLiveTitle.value = '';
        await loadLiveStreams();
        return true;
    }
    catch {
        showToast('创建失败');
        return false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h5-live-list" },
});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "直播中心",
    fixed: true,
    placeholder: true,
}));
const __VLS_2 = __VLS_1({
    title: "直播中心",
    fixed: true,
    placeholder: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.canCreate) {
    {
        const { right: __VLS_thisSlot } = __VLS_3.slots;
        const __VLS_4 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_6 = __VLS_5({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        let __VLS_8;
        let __VLS_9;
        let __VLS_10;
        const __VLS_11 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.canCreate))
                    return;
                __VLS_ctx.showCreateDialog = true;
            }
        };
        __VLS_7.slots.default;
        var __VLS_7;
    }
}
var __VLS_3;
const __VLS_12 = {}.VanPullRefresh;
/** @type {[typeof __VLS_components.VanPullRefresh, typeof __VLS_components.vanPullRefresh, typeof __VLS_components.VanPullRefresh, typeof __VLS_components.vanPullRefresh, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onRefresh': {} },
    modelValue: (__VLS_ctx.refreshing),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onRefresh': {} },
    modelValue: (__VLS_ctx.refreshing),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onRefresh: (__VLS_ctx.onRefresh)
};
__VLS_15.slots.default;
const __VLS_20 = {}.VanList;
/** @type {[typeof __VLS_components.VanList, typeof __VLS_components.vanList, typeof __VLS_components.VanList, typeof __VLS_components.vanList, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onLoad': {} },
    loading: (__VLS_ctx.loading),
    finished: (__VLS_ctx.finished),
    finishedText: "没有更多了",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onLoad': {} },
    loading: (__VLS_ctx.loading),
    finished: (__VLS_ctx.finished),
    finishedText: "没有更多了",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onLoad: (__VLS_ctx.onLoad)
};
__VLS_23.slots.default;
for (const [stream] of __VLS_getVForSourceType((__VLS_ctx.liveStreams))) {
    const __VLS_28 = {}.VanCard;
    /** @type {[typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        key: (stream.id),
        ...{ class: "live-card" },
    }));
    const __VLS_30 = __VLS_29({
        key: (stream.id),
        ...{ class: "live-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_31.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "live-title" },
        });
        (stream.title);
    }
    {
        const { desc: __VLS_thisSlot } = __VLS_31.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "live-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "room-code" },
        });
        (stream.room_code);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "live-time" },
        });
        (__VLS_ctx.formatDateTime(stream.start_time));
    }
    {
        const { tags: __VLS_thisSlot } = __VLS_31.slots;
        const __VLS_32 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            type: "danger",
            size: "medium",
        }));
        const __VLS_34 = __VLS_33({
            type: "danger",
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        var __VLS_35;
    }
    {
        const { footer: __VLS_thisSlot } = __VLS_31.slots;
        const __VLS_36 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_38 = __VLS_37({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_40;
        let __VLS_41;
        let __VLS_42;
        const __VLS_43 = {
            onClick: (...[$event]) => {
                __VLS_ctx.enterLiveRoom(stream.id);
            }
        };
        __VLS_39.slots.default;
        var __VLS_39;
    }
    var __VLS_31;
}
if (!__VLS_ctx.loading && __VLS_ctx.liveStreams.length === 0) {
    const __VLS_44 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        description: "暂无直播",
    }));
    const __VLS_46 = __VLS_45({
        description: "暂无直播",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
}
var __VLS_23;
var __VLS_15;
const __VLS_48 = {}.VanDialog;
/** @type {[typeof __VLS_components.VanDialog, typeof __VLS_components.vanDialog, typeof __VLS_components.VanDialog, typeof __VLS_components.vanDialog, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    show: (__VLS_ctx.showCreateDialog),
    title: "开启直播",
    showCancelButton: true,
    beforeClose: (__VLS_ctx.handleCreateLive),
}));
const __VLS_50 = __VLS_49({
    show: (__VLS_ctx.showCreateDialog),
    title: "开启直播",
    showCancelButton: true,
    beforeClose: (__VLS_ctx.handleCreateLive),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.newLiveTitle),
    label: "直播标题",
    placeholder: "请输入直播标题",
    required: true,
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.newLiveTitle),
    label: "直播标题",
    placeholder: "请输入直播标题",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
const __VLS_56 = {}.VanTabbar;
/** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.activeTab),
    fixed: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    icon: "calendar-o",
    to: "/h5/dashboard",
}));
const __VLS_62 = __VLS_61({
    icon: "calendar-o",
    to: "/h5/dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
var __VLS_63;
const __VLS_64 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    icon: "video-o",
    to: "/h5/meetings",
}));
const __VLS_66 = __VLS_65({
    icon: "video-o",
    to: "/h5/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
var __VLS_67;
const __VLS_68 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    icon: "play-circle-o",
    to: "/h5/live",
}));
const __VLS_70 = __VLS_69({
    icon: "play-circle-o",
    to: "/h5/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
var __VLS_71;
const __VLS_72 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    icon: "user-o",
    to: "/h5/profile",
}));
const __VLS_74 = __VLS_73({
    icon: "user-o",
    to: "/h5/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
var __VLS_75;
var __VLS_59;
/** @type {__VLS_StyleScopedClasses['h5-live-list']} */ ;
/** @type {__VLS_StyleScopedClasses['live-card']} */ ;
/** @type {__VLS_StyleScopedClasses['live-title']} */ ;
/** @type {__VLS_StyleScopedClasses['live-info']} */ ;
/** @type {__VLS_StyleScopedClasses['room-code']} */ ;
/** @type {__VLS_StyleScopedClasses['live-time']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            liveStreams: liveStreams,
            loading: loading,
            refreshing: refreshing,
            finished: finished,
            activeTab: activeTab,
            showCreateDialog: showCreateDialog,
            newLiveTitle: newLiveTitle,
            canCreate: canCreate,
            onRefresh: onRefresh,
            onLoad: onLoad,
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
