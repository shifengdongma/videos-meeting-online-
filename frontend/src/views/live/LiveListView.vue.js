import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/layout/PageHeader.vue';
import EmptyState from '../../components/ui/EmptyState.vue';
import StatusTag from '../../components/ui/StatusTag.vue';
import SummaryCard from '../../components/ui/SummaryCard.vue';
import { createLiveStream, fetchLiveStreams } from '../../api/live';
import { useAuthStore } from '../../stores/auth';
const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const streams = ref([]);
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role));
const loadStreams = async () => {
    loading.value = true;
    try {
        streams.value = await fetchLiveStreams();
    }
    finally {
        loading.value = false;
    }
};
const createStream = async () => {
    const title = await ElMessageBox.prompt('请输入直播标题', '开启直播');
    await createLiveStream({ title: title.value });
    ElMessage.success('直播已开启');
    await loadStreams();
};
const openStream = (streamId) => {
    router.push(`/live/${streamId}`);
};
onMounted(loadStreams);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-page app-page" },
});
/** @type {[typeof PageHeader, typeof PageHeader, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(PageHeader, new PageHeader({
    eyebrow: "Live center",
    title: "直播中心",
    description: "集中管理直播房间、查看房间号，并为主播与观众提供统一的进入入口。",
}));
const __VLS_1 = __VLS_0({
    eyebrow: "Live center",
    title: "直播中心",
    description: "集中管理直播房间、查看房间号，并为主播与观众提供统一的进入入口。",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
{
    const { actions: __VLS_thisSlot } = __VLS_2.slots;
    if (__VLS_ctx.canCreate) {
        const __VLS_3 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
        }));
        const __VLS_5 = __VLS_4({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
        }, ...__VLS_functionalComponentArgsRest(__VLS_4));
        let __VLS_7;
        let __VLS_8;
        let __VLS_9;
        const __VLS_10 = {
            onClick: (__VLS_ctx.createStream)
        };
        __VLS_6.slots.default;
        var __VLS_6;
    }
}
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-grid app-summary-grid" },
    'data-columns': "3",
});
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "全部直播",
    value: (__VLS_ctx.streams.length),
    description: "当前可访问的直播场次",
    tone: "primary",
}));
const __VLS_12 = __VLS_11({
    label: "全部直播",
    value: (__VLS_ctx.streams.length),
    description: "当前可访问的直播场次",
    tone: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "可立即进入",
    value: (__VLS_ctx.streams.length),
    hint: "在线可用",
    description: "已创建完成，可直接进入直播间",
    tone: "warning",
}));
const __VLS_15 = __VLS_14({
    label: "可立即进入",
    value: (__VLS_ctx.streams.length),
    hint: "在线可用",
    description: "已创建完成，可直接进入直播间",
    tone: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
/** @type {[typeof SummaryCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(SummaryCard, new SummaryCard({
    label: "主播权限",
    value: (__VLS_ctx.canCreate ? '已开启' : '未开启'),
    description: "当前账号是否可发起直播",
    tone: "success",
}));
const __VLS_18 = __VLS_17({
    label: "主播权限",
    value: (__VLS_ctx.canCreate ? '已开启' : '未开启'),
    description: "当前账号是否可发起直播",
    tone: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ class: "table-card app-table-card" },
    shadow: "never",
}));
const __VLS_22 = __VLS_21({
    ...{ class: "table-card app-table-card" },
    shadow: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    data: (__VLS_ctx.streams),
}));
const __VLS_26 = __VLS_25({
    data: (__VLS_ctx.streams),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_27.slots.default;
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    prop: "title",
    label: "标题",
    minWidth: "220",
}));
const __VLS_30 = __VLS_29({
    prop: "title",
    label: "标题",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    prop: "room_code",
    label: "房间号",
    minWidth: "150",
}));
const __VLS_34 = __VLS_33({
    prop: "room_code",
    label: "房间号",
    minWidth: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "start_time",
    label: "开始时间",
    minWidth: "180",
}));
const __VLS_38 = __VLS_37({
    prop: "start_time",
    label: "开始时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "状态",
    width: "120",
}));
const __VLS_42 = __VLS_41({
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_43.slots;
    /** @type {[typeof StatusTag, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(StatusTag, new StatusTag({
        text: "直播中",
        status: "live",
    }));
    const __VLS_45 = __VLS_44({
        text: "直播中",
        status: "live",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
}
var __VLS_43;
const __VLS_47 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    label: "操作",
    width: "160",
    fixed: "right",
}));
const __VLS_49 = __VLS_48({
    label: "操作",
    width: "160",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
__VLS_50.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_50.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_51 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        ...{ 'onClick': {} },
        ...{ class: "enter-button" },
        type: "primary",
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onClick': {} },
        ...{ class: "enter-button" },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_55;
    let __VLS_56;
    let __VLS_57;
    const __VLS_58 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openStream(scope.row.id);
        }
    };
    __VLS_54.slots.default;
    var __VLS_54;
}
var __VLS_50;
var __VLS_27;
if (!__VLS_ctx.loading && !__VLS_ctx.streams.length) {
    /** @type {[typeof EmptyState, typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        description: "当前还没有直播，可先创建一个直播房间。",
    }));
    const __VLS_60 = __VLS_59({
        description: "当前还没有直播，可先创建一个直播房间。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_61.slots.default;
    {
        const { actions: __VLS_thisSlot } = __VLS_61.slots;
        if (__VLS_ctx.canCreate) {
            const __VLS_62 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_64 = __VLS_63({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            let __VLS_66;
            let __VLS_67;
            let __VLS_68;
            const __VLS_69 = {
                onClick: (__VLS_ctx.createStream)
            };
            __VLS_65.slots.default;
            var __VLS_65;
        }
    }
    var __VLS_61;
}
var __VLS_23;
/** @type {__VLS_StyleScopedClasses['live-page']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['app-summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['enter-button']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            PageHeader: PageHeader,
            EmptyState: EmptyState,
            StatusTag: StatusTag,
            SummaryCard: SummaryCard,
            loading: loading,
            streams: streams,
            canCreate: canCreate,
            createStream: createStream,
            openStream: openStream,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
