import { onMounted, ref } from 'vue';
import { fetchMeetingPlaybacks, fetchLivePlaybacks } from '../../api/playback';
const activeTab = ref(0);
const tabbarActive = ref(0);
// Meeting playbacks
const meetingPlaybacks = ref([]);
const meetingLoading = ref(false);
// Live playbacks
const livePlaybacks = ref([]);
const liveLoading = ref(false);
// Video player
const showPlayer = ref(false);
const currentPlayback = ref(null);
// 加载数据
const loadMeetingPlaybacks = async () => {
    meetingLoading.value = true;
    try {
        meetingPlaybacks.value = await fetchMeetingPlaybacks();
    }
    finally {
        meetingLoading.value = false;
    }
};
const loadLivePlaybacks = async () => {
    liveLoading.value = true;
    try {
        livePlaybacks.value = await fetchLivePlaybacks();
    }
    finally {
        liveLoading.value = false;
    }
};
// 工具函数
const formatDateTime = (datetime) => {
    if (!datetime)
        return '';
    const d = new Date(datetime);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
// 播放视频
const playVideo = (playback) => {
    currentPlayback.value = playback;
    showPlayer.value = true;
};
const closePlayer = () => {
    showPlayer.value = false;
    currentPlayback.value = null;
};
onMounted(async () => {
    await Promise.all([
        loadMeetingPlaybacks(),
        loadLivePlaybacks()
    ]);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mobile-playback-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_0 = {}.VanTabs;
/** @type {[typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    active: (__VLS_ctx.activeTab),
    sticky: true,
    shrink: true,
}));
const __VLS_2 = __VLS_1({
    active: (__VLS_ctx.activeTab),
    sticky: true,
    shrink: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.VanTab;
/** @type {[typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    title: "会议回放",
}));
const __VLS_6 = __VLS_5({
    title: "会议回放",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "playback-list" },
});
if (__VLS_ctx.meetingLoading) {
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
else if (__VLS_ctx.meetingPlaybacks.length === 0) {
    const __VLS_12 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        description: "暂无会议回放",
    }));
    const __VLS_14 = __VLS_13({
        description: "暂无会议回放",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-list" },
    });
    for (const [playback] of __VLS_getVForSourceType((__VLS_ctx.meetingPlaybacks))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (playback.id),
            ...{ class: "playback-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "playback-title" },
        });
        (playback.title);
        const __VLS_16 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            type: "primary",
            size: "medium",
        }));
        const __VLS_18 = __VLS_17({
            type: "primary",
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        var __VLS_19;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-row" },
        });
        const __VLS_20 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            name: "clock-o",
        }));
        const __VLS_22 = __VLS_21({
            name: "clock-o",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDateTime(playback.start_time));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-footer" },
        });
        const __VLS_24 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            block: true,
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            block: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_28;
        let __VLS_29;
        let __VLS_30;
        const __VLS_31 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.meetingLoading))
                    return;
                if (!!(__VLS_ctx.meetingPlaybacks.length === 0))
                    return;
                __VLS_ctx.playVideo(playback);
            }
        };
        __VLS_27.slots.default;
        var __VLS_27;
    }
}
var __VLS_7;
const __VLS_32 = {}.VanTab;
/** @type {[typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    title: "直播回放",
}));
const __VLS_34 = __VLS_33({
    title: "直播回放",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "playback-list" },
});
if (__VLS_ctx.liveLoading) {
    const __VLS_36 = {}.VanLoading;
    /** @type {[typeof __VLS_components.VanLoading, typeof __VLS_components.vanLoading, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ class: "loading-center" },
    }));
    const __VLS_38 = __VLS_37({
        ...{ class: "loading-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
}
else if (__VLS_ctx.livePlaybacks.length === 0) {
    const __VLS_40 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        description: "暂无直播回放",
    }));
    const __VLS_42 = __VLS_41({
        description: "暂无直播回放",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-list" },
    });
    for (const [playback] of __VLS_getVForSourceType((__VLS_ctx.livePlaybacks))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (playback.id),
            ...{ class: "playback-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "playback-title" },
        });
        (playback.title);
        const __VLS_44 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            type: "danger",
            size: "medium",
        }));
        const __VLS_46 = __VLS_45({
            type: "danger",
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        var __VLS_47;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-row" },
        });
        const __VLS_48 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            name: "clock-o",
        }));
        const __VLS_50 = __VLS_49({
            name: "clock-o",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDateTime(playback.start_time));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-footer" },
        });
        const __VLS_52 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            block: true,
        }));
        const __VLS_54 = __VLS_53({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            block: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        let __VLS_56;
        let __VLS_57;
        let __VLS_58;
        const __VLS_59 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.liveLoading))
                    return;
                if (!!(__VLS_ctx.livePlaybacks.length === 0))
                    return;
                __VLS_ctx.playVideo(playback);
            }
        };
        __VLS_55.slots.default;
        var __VLS_55;
    }
}
var __VLS_35;
var __VLS_3;
const __VLS_60 = {}.VanPopup;
/** @type {[typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, typeof __VLS_components.VanPopup, typeof __VLS_components.vanPopup, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    show: (__VLS_ctx.showPlayer),
    position: "bottom",
    ...{ style: ({ height: '100%' }) },
}));
const __VLS_62 = __VLS_61({
    show: (__VLS_ctx.showPlayer),
    position: "bottom",
    ...{ style: ({ height: '100%' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fullscreen-player" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "player-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "player-title" },
});
(__VLS_ctx.currentPlayback?.title);
const __VLS_64 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onClick': {} },
    name: "cross",
    size: "24",
}));
const __VLS_66 = __VLS_65({
    ...{ 'onClick': {} },
    name: "cross",
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    onClick: (__VLS_ctx.closePlayer)
};
var __VLS_67;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "player-content" },
});
if (__VLS_ctx.showPlayer && __VLS_ctx.currentPlayback) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        src: (__VLS_ctx.currentPlayback.record_url),
        controls: true,
        autoplay: true,
        playsinline: true,
        ...{ class: "video-element" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "player-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.currentPlayback?.type === 'meeting' ? '会议' : '直播');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.formatDateTime(__VLS_ctx.currentPlayback?.start_time || ''));
var __VLS_63;
const __VLS_72 = {}.VanTabbar;
/** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    modelValue: (__VLS_ctx.tabbarActive),
    fixed: true,
}));
const __VLS_74 = __VLS_73({
    modelValue: (__VLS_ctx.tabbarActive),
    fixed: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    icon: "calendar-o",
    to: "/dashboard",
}));
const __VLS_78 = __VLS_77({
    icon: "calendar-o",
    to: "/dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
const __VLS_80 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    icon: "video-o",
    to: "/meetings",
}));
const __VLS_82 = __VLS_81({
    icon: "video-o",
    to: "/meetings",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
var __VLS_83;
const __VLS_84 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    icon: "play-circle-o",
    to: "/live",
}));
const __VLS_86 = __VLS_85({
    icon: "play-circle-o",
    to: "/live",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
var __VLS_87;
const __VLS_88 = {}.VanTabbarItem;
/** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    icon: "user-o",
    to: "/profile",
}));
const __VLS_90 = __VLS_89({
    icon: "user-o",
    to: "/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
var __VLS_91;
var __VLS_75;
/** @type {__VLS_StyleScopedClasses['mobile-playback-center']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-list']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-center']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-list']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-center']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['fullscreen-player']} */ ;
/** @type {__VLS_StyleScopedClasses['player-header']} */ ;
/** @type {__VLS_StyleScopedClasses['player-title']} */ ;
/** @type {__VLS_StyleScopedClasses['player-content']} */ ;
/** @type {__VLS_StyleScopedClasses['video-element']} */ ;
/** @type {__VLS_StyleScopedClasses['player-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeTab: activeTab,
            tabbarActive: tabbarActive,
            meetingPlaybacks: meetingPlaybacks,
            meetingLoading: meetingLoading,
            livePlaybacks: livePlaybacks,
            liveLoading: liveLoading,
            showPlayer: showPlayer,
            currentPlayback: currentPlayback,
            formatDateTime: formatDateTime,
            playVideo: playVideo,
            closePlayer: closePlayer,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
