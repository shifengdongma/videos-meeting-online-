import { onMounted, ref } from 'vue';
import { fetchMeetingPlaybacks, fetchLivePlaybacks } from '../../api/playback';
const activeTab = ref(0);
const tabbarActive = ref(0);
// Meeting playbacks
const meetingPlaybacks = ref([]);
const meetingLoading = ref(false);
const meetingRefreshing = ref(false);
const meetingFinished = ref(true);
// Live playbacks
const livePlaybacks = ref([]);
const liveLoading = ref(false);
const liveRefreshing = ref(false);
const liveFinished = ref(true);
// Video player
const showPlayer = ref(false);
const currentPlayback = ref(null);
onMounted(async () => {
    await Promise.all([
        loadMeetingPlaybacks(),
        loadLivePlaybacks()
    ]);
});
const loadMeetingPlaybacks = async () => {
    try {
        meetingLoading.value = true;
        meetingPlaybacks.value = await fetchMeetingPlaybacks();
    }
    finally {
        meetingLoading.value = false;
    }
};
const loadLivePlaybacks = async () => {
    try {
        liveLoading.value = true;
        livePlaybacks.value = await fetchLivePlaybacks();
    }
    finally {
        liveLoading.value = false;
    }
};
const onRefreshMeeting = async () => {
    await loadMeetingPlaybacks();
    meetingRefreshing.value = false;
};
const onRefreshLive = async () => {
    await loadLivePlaybacks();
    liveRefreshing.value = false;
};
const formatDateTime = (datetime) => {
    const d = new Date(datetime);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const playVideo = (playback) => {
    currentPlayback.value = playback;
    showPlayer.value = true;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h5-playback-center" },
});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "回放中心",
    fixed: true,
    placeholder: true,
}));
const __VLS_2 = __VLS_1({
    title: "回放中心",
    fixed: true,
    placeholder: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.VanTabs;
/** @type {[typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    active: (__VLS_ctx.activeTab),
    sticky: true,
}));
const __VLS_6 = __VLS_5({
    active: (__VLS_ctx.activeTab),
    sticky: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.VanTab;
/** @type {[typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    title: "会议回放",
}));
const __VLS_10 = __VLS_9({
    title: "会议回放",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.VanPullRefresh;
/** @type {[typeof __VLS_components.VanPullRefresh, typeof __VLS_components.vanPullRefresh, typeof __VLS_components.VanPullRefresh, typeof __VLS_components.vanPullRefresh, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onRefresh': {} },
    modelValue: (__VLS_ctx.meetingRefreshing),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onRefresh': {} },
    modelValue: (__VLS_ctx.meetingRefreshing),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onRefresh: (__VLS_ctx.onRefreshMeeting)
};
__VLS_15.slots.default;
const __VLS_20 = {}.VanList;
/** @type {[typeof __VLS_components.VanList, typeof __VLS_components.vanList, typeof __VLS_components.VanList, typeof __VLS_components.vanList, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    loading: (__VLS_ctx.meetingLoading),
    finished: (__VLS_ctx.meetingFinished),
    finishedText: "没有更多了",
}));
const __VLS_22 = __VLS_21({
    loading: (__VLS_ctx.meetingLoading),
    finished: (__VLS_ctx.meetingFinished),
    finishedText: "没有更多了",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
for (const [playback] of __VLS_getVForSourceType((__VLS_ctx.meetingPlaybacks))) {
    const __VLS_24 = {}.VanCard;
    /** @type {[typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        key: (playback.id),
        ...{ class: "playback-card" },
    }));
    const __VLS_26 = __VLS_25({
        key: (playback.id),
        ...{ class: "playback-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_27.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "playback-title" },
        });
        (playback.title);
    }
    {
        const { desc: __VLS_thisSlot } = __VLS_27.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "playback-time" },
        });
        (__VLS_ctx.formatDateTime(playback.start_time));
    }
    {
        const { tags: __VLS_thisSlot } = __VLS_27.slots;
        const __VLS_28 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            type: "primary",
            size: "medium",
        }));
        const __VLS_30 = __VLS_29({
            type: "primary",
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        var __VLS_31;
    }
    {
        const { footer: __VLS_thisSlot } = __VLS_27.slots;
        const __VLS_32 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_34 = __VLS_33({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        let __VLS_36;
        let __VLS_37;
        let __VLS_38;
        const __VLS_39 = {
            onClick: (...[$event]) => {
                __VLS_ctx.playVideo(playback);
            }
        };
        __VLS_35.slots.default;
        var __VLS_35;
    }
    var __VLS_27;
}
if (!__VLS_ctx.meetingLoading && __VLS_ctx.meetingPlaybacks.length === 0) {
    const __VLS_40 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        description: "暂无会议回放",
    }));
    const __VLS_42 = __VLS_41({
        description: "暂无会议回放",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
}
var __VLS_23;
var __VLS_15;
var __VLS_11;
const __VLS_44 = {}.VanTab;
/** @type {[typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    title: "直播回放",
}));
const __VLS_46 = __VLS_45({
    title: "直播回放",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.VanPullRefresh;
/** @type {[typeof __VLS_components.VanPullRefresh, typeof __VLS_components.vanPullRefresh, typeof __VLS_components.VanPullRefresh, typeof __VLS_components.vanPullRefresh, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onRefresh': {} },
    modelValue: (__VLS_ctx.liveRefreshing),
}));
const __VLS_50 = __VLS_49({
    ...{ 'onRefresh': {} },
    modelValue: (__VLS_ctx.liveRefreshing),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onRefresh: (__VLS_ctx.onRefreshLive)
};
__VLS_51.slots.default;
const __VLS_56 = {}.VanList;
/** @type {[typeof __VLS_components.VanList, typeof __VLS_components.vanList, typeof __VLS_components.VanList, typeof __VLS_components.vanList, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    loading: (__VLS_ctx.liveLoading),
    finished: (__VLS_ctx.liveFinished),
    finishedText: "没有更多了",
}));
const __VLS_58 = __VLS_57({
    loading: (__VLS_ctx.liveLoading),
    finished: (__VLS_ctx.liveFinished),
    finishedText: "没有更多了",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
for (const [playback] of __VLS_getVForSourceType((__VLS_ctx.livePlaybacks))) {
    const __VLS_60 = {}.VanCard;
    /** @type {[typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        key: (playback.id),
        ...{ class: "playback-card" },
    }));
    const __VLS_62 = __VLS_61({
        key: (playback.id),
        ...{ class: "playback-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_63.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "playback-title" },
        });
        (playback.title);
    }
    {
        const { desc: __VLS_thisSlot } = __VLS_63.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "playback-time" },
        });
        (__VLS_ctx.formatDateTime(playback.start_time));
    }
    {
        const { tags: __VLS_thisSlot } = __VLS_63.slots;
        const __VLS_64 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            type: "danger",
            size: "medium",
        }));
        const __VLS_66 = __VLS_65({
            type: "danger",
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        var __VLS_67;
    }
    {
        const { footer: __VLS_thisSlot } = __VLS_63.slots;
        const __VLS_68 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_70 = __VLS_69({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        let __VLS_72;
        let __VLS_73;
        let __VLS_74;
        const __VLS_75 = {
            onClick: (...[$event]) => {
                __VLS_ctx.playVideo(playback);
            }
        };
        __VLS_71.slots.default;
        var __VLS_71;
    }
    var __VLS_63;
}
if (!__VLS_ctx.liveLoading && __VLS_ctx.livePlaybacks.length === 0) {
    const __VLS_76 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        description: "暂无直播回放",
    }));
    const __VLS_78 = __VLS_77({
        description: "暂无直播回放",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
}
var __VLS_59;
var __VLS_51;
var __VLS_47;
var __VLS_7;
const __VLS_80 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    show: (__VLS_ctx.showPlayer),
    position: "bottom",
    round: true,
    closeable: true,
    ...{ style: ({ height: '70%' }) },
}));
const __VLS_82 = __VLS_81({
    show: (__VLS_ctx.showPlayer),
    position: "bottom",
    round: true,
    closeable: true,
    ...{ style: ({ height: '70%' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "player-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "player-title" },
});
(__VLS_ctx.currentPlayback?.title);
if (__VLS_ctx.showPlayer && __VLS_ctx.currentPlayback) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        src: (__VLS_ctx.currentPlayback.record_url),
        controls: true,
        autoplay: true,
        ...{ class: "video-player" },
    });
}
var __VLS_83;
const __VLS_84 = {}.VanTabbar;
/** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.tabbarActive),
    fixed: true,
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.tabbarActive),
    fixed: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    icon: "calendar-o",
    to: "/h5/dashboard",
}));
const __VLS_90 = __VLS_89({
    icon: "calendar-o",
    to: "/h5/dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
var __VLS_91;
const __VLS_92 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    icon: "video-o",
    to: "/h5/meetings",
}));
const __VLS_94 = __VLS_93({
    icon: "video-o",
    to: "/h5/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
var __VLS_95;
const __VLS_96 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    icon: "play-circle-o",
    to: "/h5/live",
}));
const __VLS_98 = __VLS_97({
    icon: "play-circle-o",
    to: "/h5/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
var __VLS_99;
const __VLS_100 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    icon: "user-o",
    to: "/h5/profile",
}));
const __VLS_102 = __VLS_101({
    icon: "user-o",
    to: "/h5/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
var __VLS_103;
var __VLS_87;
/** @type {__VLS_StyleScopedClasses['h5-playback-center']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-card']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-title']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-time']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-card']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-title']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-time']} */ ;
/** @type {__VLS_StyleScopedClasses['player-container']} */ ;
/** @type {__VLS_StyleScopedClasses['player-title']} */ ;
/** @type {__VLS_StyleScopedClasses['video-player']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeTab: activeTab,
            tabbarActive: tabbarActive,
            meetingPlaybacks: meetingPlaybacks,
            meetingLoading: meetingLoading,
            meetingRefreshing: meetingRefreshing,
            meetingFinished: meetingFinished,
            livePlaybacks: livePlaybacks,
            liveLoading: liveLoading,
            liveRefreshing: liveRefreshing,
            liveFinished: liveFinished,
            showPlayer: showPlayer,
            currentPlayback: currentPlayback,
            onRefreshMeeting: onRefreshMeeting,
            onRefreshLive: onRefreshLive,
            formatDateTime: formatDateTime,
            playVideo: playVideo,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
