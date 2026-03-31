import { computed } from 'vue';
const props = defineProps();
const emit = defineEmits();
const statusLabel = computed(() => {
    if (!props.activeVote)
        return '待开始';
    if (props.activeVote.status === 'ended')
        return '已结束';
    return '进行中';
});
const formatDateTime = (datetime) => {
    if (!datetime)
        return '';
    const d = new Date(datetime);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const getProgressColor = (ratio) => {
    if (ratio >= 0.5)
        return '#22c55e';
    if (ratio >= 0.3)
        return '#3b82f6';
    return '#6b7280';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['panel-head']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-status']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['ended']} */ ;
/** @type {__VLS_StyleScopedClasses['result-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "vote-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-status" },
    ...{ class: ({ active: !!__VLS_ctx.activeVote, ended: __VLS_ctx.activeVote?.status === 'ended' }) },
});
(__VLS_ctx.statusLabel);
if (__VLS_ctx.activeVote) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "vote-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "topic-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "topic-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "topic" },
    });
    (__VLS_ctx.activeVote.topic);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "vote-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-value" },
    });
    (__VLS_ctx.formatDateTime(__VLS_ctx.activeVote.created_at));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-value status-tag" },
        ...{ class: (__VLS_ctx.activeVote.status) },
    });
    (__VLS_ctx.activeVote.status === 'voting' ? '投票中' : '已结束');
    if (__VLS_ctx.submitted && __VLS_ctx.results.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "submitted-tip" },
        });
    }
    else if (__VLS_ctx.activeVote.status === 'ended') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "ended-tip" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "option-list" },
        });
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.activeVote.options))) {
            const __VLS_0 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
                ...{ 'onClick': {} },
                key: (option.id),
                ...{ class: "vote-option" },
                disabled: (__VLS_ctx.submitted),
            }));
            const __VLS_2 = __VLS_1({
                ...{ 'onClick': {} },
                key: (option.id),
                ...{ class: "vote-option" },
                disabled: (__VLS_ctx.submitted),
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            let __VLS_4;
            let __VLS_5;
            let __VLS_6;
            const __VLS_7 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeVote))
                        return;
                    if (!!(__VLS_ctx.submitted && __VLS_ctx.results.length))
                        return;
                    if (!!(__VLS_ctx.activeVote.status === 'ended'))
                        return;
                    __VLS_ctx.emit('submit', option.id);
                }
            };
            __VLS_3.slots.default;
            (option.content);
            var __VLS_3;
        }
    }
    if (__VLS_ctx.canEndVote) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "action-bar" },
        });
        const __VLS_8 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            ...{ 'onClick': {} },
            type: "warning",
        }));
        const __VLS_10 = __VLS_9({
            ...{ 'onClick': {} },
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_12;
        let __VLS_13;
        let __VLS_14;
        const __VLS_15 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeVote))
                    return;
                if (!(__VLS_ctx.canEndVote))
                    return;
                __VLS_ctx.emit('end');
            }
        };
        __VLS_11.slots.default;
        var __VLS_11;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-wrap" },
    });
    const __VLS_16 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        description: "当前没有进行中的表决",
    }));
    const __VLS_18 = __VLS_17({
        description: "当前没有进行中的表决",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
if (__VLS_ctx.results.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "results-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "results-title" },
    });
    (__VLS_ctx.activeVote?.status === 'ended' ? '最终结果' : '实时结果');
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.results))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "result-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-line" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.content);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.count);
        (Math.round(item.ratio * 100));
        const __VLS_20 = {}.ElProgress;
        /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            percentage: (Math.round(item.ratio * 100)),
            strokeWidth: (12),
            color: (__VLS_ctx.getProgressColor(item.ratio)),
        }));
        const __VLS_22 = __VLS_21({
            percentage: (Math.round(item.ratio * 100)),
            strokeWidth: (12),
            color: (__VLS_ctx.getProgressColor(item.ratio)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    }
}
/** @type {__VLS_StyleScopedClasses['vote-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-head']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-status']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['ended']} */ ;
/** @type {__VLS_StyleScopedClasses['vote-body']} */ ;
/** @type {__VLS_StyleScopedClasses['topic-card']} */ ;
/** @type {__VLS_StyleScopedClasses['topic-label']} */ ;
/** @type {__VLS_StyleScopedClasses['topic']} */ ;
/** @type {__VLS_StyleScopedClasses['vote-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-value']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-value']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['submitted-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['ended-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['option-list']} */ ;
/** @type {__VLS_StyleScopedClasses['vote-option']} */ ;
/** @type {__VLS_StyleScopedClasses['action-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['results-card']} */ ;
/** @type {__VLS_StyleScopedClasses['results-title']} */ ;
/** @type {__VLS_StyleScopedClasses['result-item']} */ ;
/** @type {__VLS_StyleScopedClasses['result-line']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
            statusLabel: statusLabel,
            formatDateTime: formatDateTime,
            getProgressColor: getProgressColor,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
