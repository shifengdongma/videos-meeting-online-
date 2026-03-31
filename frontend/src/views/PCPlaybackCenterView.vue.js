import { onMounted, ref } from 'vue';
import { fetchMeetingPlaybacks, fetchLivePlaybacks } from '../api/playback';
import VideoPlayer from '../components/media/VideoPlayer.vue';
const activeTab = ref('meeting');
const meetingPlaybacks = ref([]);
const livePlaybacks = ref([]);
const drawerVisible = ref(false);
const currentPlayback = ref(null);
onMounted(async () => {
    meetingPlaybacks.value = await fetchMeetingPlaybacks();
    livePlaybacks.value = await fetchLivePlaybacks();
});
const playVideo = (item) => {
    currentPlayback.value = item;
    drawerVisible.value = true;
};
const formatDateTime = (datetime) => {
    const d = new Date(datetime);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "playback-center" },
});
const __VLS_0 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "playback-tabs" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "playback-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    label: "会议回放",
    name: "meeting",
}));
const __VLS_6 = __VLS_5({
    label: "会议回放",
    name: "meeting",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    data: (__VLS_ctx.meetingPlaybacks),
    stripe: true,
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    data: (__VLS_ctx.meetingPlaybacks),
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    prop: "title",
    label: "会议标题",
    minWidth: "200",
}));
const __VLS_14 = __VLS_13({
    prop: "title",
    label: "会议标题",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    prop: "start_time",
    label: "开始时间",
    width: "180",
}));
const __VLS_18 = __VLS_17({
    prop: "start_time",
    label: "开始时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_19.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(row.start_time));
}
var __VLS_19;
const __VLS_20 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "操作",
    width: "120",
}));
const __VLS_22 = __VLS_21({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_23.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (...[$event]) => {
            __VLS_ctx.playVideo(row);
        }
    };
    __VLS_27.slots.default;
    var __VLS_27;
}
var __VLS_23;
var __VLS_11;
var __VLS_7;
const __VLS_32 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "直播回放",
    name: "live",
}));
const __VLS_34 = __VLS_33({
    label: "直播回放",
    name: "live",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    data: (__VLS_ctx.livePlaybacks),
    stripe: true,
    ...{ style: {} },
}));
const __VLS_38 = __VLS_37({
    data: (__VLS_ctx.livePlaybacks),
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    prop: "title",
    label: "直播标题",
    minWidth: "200",
}));
const __VLS_42 = __VLS_41({
    prop: "title",
    label: "直播标题",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    prop: "start_time",
    label: "开始时间",
    width: "180",
}));
const __VLS_46 = __VLS_45({
    prop: "start_time",
    label: "开始时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_47.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(row.start_time));
}
var __VLS_47;
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "操作",
    width: "120",
}));
const __VLS_50 = __VLS_49({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_51.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_52 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onClick: (...[$event]) => {
            __VLS_ctx.playVideo(row);
        }
    };
    __VLS_55.slots.default;
    var __VLS_55;
}
var __VLS_51;
var __VLS_39;
var __VLS_35;
var __VLS_3;
const __VLS_60 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.drawerVisible),
    title: (__VLS_ctx.currentPlayback?.title),
    size: "50%",
    direction: "rtl",
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.drawerVisible),
    title: (__VLS_ctx.currentPlayback?.title),
    size: "50%",
    direction: "rtl",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-content" },
});
if (__VLS_ctx.currentPlayback) {
    /** @type {[typeof VideoPlayer, ]} */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(VideoPlayer, new VideoPlayer({
        src: (__VLS_ctx.currentPlayback.record_url),
    }));
    const __VLS_65 = __VLS_64({
        src: (__VLS_ctx.currentPlayback.record_url),
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "playback-info" },
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
/** @type {__VLS_StyleScopedClasses['playback-center']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['playback-info']} */ ;
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
            VideoPlayer: VideoPlayer,
            activeTab: activeTab,
            meetingPlaybacks: meetingPlaybacks,
            livePlaybacks: livePlaybacks,
            drawerVisible: drawerVisible,
            currentPlayback: currentPlayback,
            playVideo: playVideo,
            formatDateTime: formatDateTime,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
