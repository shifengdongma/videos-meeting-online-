import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { ChatDotRound, Document, Notebook, Pointer, SwitchButton, UserFilled } from '@element-plus/icons-vue';
const props = defineProps();
const emit = defineEmits();
const router = useRouter();
const showInviteDialog = ref(false);
const showExitDialog = ref(false);
const handRaised = ref(false);
const activePanel = ref(null);
const roomLink = computed(() => {
    const baseUrl = window.location.origin;
    return props.roomType === 'meeting'
        ? `${baseUrl}/meetings/${props.roomId}`
        : `${baseUrl}/live/${props.roomId}`;
});
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        ElMessage.success('已复制到剪贴板');
    }
    catch {
        ElMessage.error('复制失败，请手动复制');
    }
};
const toggleRaiseHand = () => {
    if (handRaised.value) {
        props.wsClient.send({ type: 'lower-hand', from: props.selfId });
        handRaised.value = false;
    }
    else {
        props.wsClient.send({ type: 'raise-hand', from: props.selfId });
        handRaised.value = true;
    }
    emit('raise-hand-change', handRaised.value);
};
const togglePanel = (panel) => {
    if (activePanel.value === panel) {
        activePanel.value = null;
        emit('panel-change', null);
    }
    else {
        activePanel.value = panel;
        emit('panel-change', panel);
    }
};
const confirmExit = async () => {
    showExitDialog.value = false;
    // 1. Close WebSocket
    props.wsClient.send({ type: 'leave', from: props.selfId });
    props.wsClient.close();
    // 2. Close all WebRTC PeerConnections
    props.peerConnections.forEach((pc) => pc.close());
    props.peerConnections.clear();
    // 3. Stop local media stream
    if (props.localStream) {
        props.localStream.getTracks().forEach((track) => track.stop());
    }
    // 4. Execute additional cleanup
    if (props.onCleanup) {
        props.onCleanup();
    }
    // 5. Navigate to list page
    ElMessage.success('已安全退出房间');
    router.push(props.roomType === 'meeting' ? '/meetings' : '/live');
};
// Expose method for external hand state update
const __VLS_exposed = {
    setHandRaised: (raised) => {
        handRaised.value = raised;
    }
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-control-bar" },
});
const __VLS_0 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.showInviteDialog),
    title: "邀请成员",
    width: "400px",
    appendToBody: true,
    zIndex: (2000),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.showInviteDialog),
    title: "邀请成员",
    width: "400px",
    appendToBody: true,
    zIndex: (2000),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "invite-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "invite-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "invite-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "invite-value" },
});
const __VLS_4 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    value: (__VLS_ctx.roomLink),
    readonly: true,
}));
const __VLS_6 = __VLS_5({
    value: (__VLS_ctx.roomLink),
    readonly: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
{
    const { append: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            __VLS_ctx.copyToClipboard(__VLS_ctx.roomLink);
        }
    };
    __VLS_11.slots.default;
    var __VLS_11;
}
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "invite-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "invite-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "invite-value" },
});
const __VLS_16 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    value: (__VLS_ctx.roomCode),
    readonly: true,
}));
const __VLS_18 = __VLS_17({
    value: (__VLS_ctx.roomCode),
    readonly: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { append: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_20 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ 'onClick': {} },
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        onClick: (...[$event]) => {
            __VLS_ctx.copyToClipboard(__VLS_ctx.roomCode);
        }
    };
    __VLS_23.slots.default;
    var __VLS_23;
}
var __VLS_19;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_28 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showInviteDialog = false;
        }
    };
    __VLS_31.slots.default;
    var __VLS_31;
}
var __VLS_3;
const __VLS_36 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.showExitDialog),
    title: "确认退出",
    width: "360px",
    appendToBody: true,
    zIndex: (2000),
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.showExitDialog),
    title: "确认退出",
    width: "360px",
    appendToBody: true,
    zIndex: (2000),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "exit-warning" },
});
{
    const { footer: __VLS_thisSlot } = __VLS_39.slots;
    const __VLS_40 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onClick': {} },
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showExitDialog = false;
        }
    };
    __VLS_43.slots.default;
    var __VLS_43;
    const __VLS_48 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ 'onClick': {} },
        type: "danger",
    }));
    const __VLS_50 = __VLS_49({
        ...{ 'onClick': {} },
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_52;
    let __VLS_53;
    let __VLS_54;
    const __VLS_55 = {
        onClick: (__VLS_ctx.confirmExit)
    };
    __VLS_51.slots.default;
    var __VLS_51;
}
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "control-bar-inner" },
});
const __VLS_56 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    content: "邀请成员",
    placement: "top",
}));
const __VLS_58 = __VLS_57({
    content: "邀请成员",
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
    circle: true,
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    circle: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showInviteDialog = true;
    }
};
__VLS_63.slots.default;
const __VLS_68 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.UserFilled;
/** @type {[typeof __VLS_components.UserFilled, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
var __VLS_71;
var __VLS_63;
var __VLS_59;
const __VLS_76 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    content: (__VLS_ctx.handRaised ? '放下举手' : '举手'),
    placement: "top",
}));
const __VLS_78 = __VLS_77({
    content: (__VLS_ctx.handRaised ? '放下举手' : '举手'),
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.handRaised ? 'warning' : 'default'),
    circle: true,
}));
const __VLS_82 = __VLS_81({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.handRaised ? 'warning' : 'default'),
    circle: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    onClick: (__VLS_ctx.toggleRaiseHand)
};
__VLS_83.slots.default;
const __VLS_88 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.Pointer;
/** @type {[typeof __VLS_components.Pointer, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
var __VLS_91;
var __VLS_83;
var __VLS_79;
if (__VLS_ctx.roomType === 'meeting') {
    const __VLS_96 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        content: "聊天",
        placement: "top",
    }));
    const __VLS_98 = __VLS_97({
        content: "聊天",
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    const __VLS_100 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.activePanel === 'chat' ? 'primary' : 'default'),
        circle: true,
    }));
    const __VLS_102 = __VLS_101({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.activePanel === 'chat' ? 'primary' : 'default'),
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    let __VLS_104;
    let __VLS_105;
    let __VLS_106;
    const __VLS_107 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.roomType === 'meeting'))
                return;
            __VLS_ctx.togglePanel('chat');
        }
    };
    __VLS_103.slots.default;
    const __VLS_108 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
    const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    const __VLS_112 = {}.ChatDotRound;
    /** @type {[typeof __VLS_components.ChatDotRound, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
    const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
    var __VLS_111;
    var __VLS_103;
    var __VLS_99;
    const __VLS_116 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        content: "文档",
        placement: "top",
    }));
    const __VLS_118 = __VLS_117({
        content: "文档",
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    const __VLS_120 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.activePanel === 'doc' ? 'primary' : 'default'),
        circle: true,
    }));
    const __VLS_122 = __VLS_121({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.activePanel === 'doc' ? 'primary' : 'default'),
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_124;
    let __VLS_125;
    let __VLS_126;
    const __VLS_127 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.roomType === 'meeting'))
                return;
            __VLS_ctx.togglePanel('doc');
        }
    };
    __VLS_123.slots.default;
    const __VLS_128 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
    const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    const __VLS_132 = {}.Document;
    /** @type {[typeof __VLS_components.Document, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
    const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
    var __VLS_131;
    var __VLS_123;
    var __VLS_119;
    const __VLS_136 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        content: "会议纪要",
        placement: "top",
    }));
    const __VLS_138 = __VLS_137({
        content: "会议纪要",
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    const __VLS_140 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.activePanel === 'minutes' ? 'primary' : 'default'),
        circle: true,
    }));
    const __VLS_142 = __VLS_141({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.activePanel === 'minutes' ? 'primary' : 'default'),
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    let __VLS_144;
    let __VLS_145;
    let __VLS_146;
    const __VLS_147 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.roomType === 'meeting'))
                return;
            __VLS_ctx.togglePanel('minutes');
        }
    };
    __VLS_143.slots.default;
    const __VLS_148 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({}));
    const __VLS_150 = __VLS_149({}, ...__VLS_functionalComponentArgsRest(__VLS_149));
    __VLS_151.slots.default;
    const __VLS_152 = {}.Notebook;
    /** @type {[typeof __VLS_components.Notebook, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({}));
    const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
    var __VLS_151;
    var __VLS_143;
    var __VLS_139;
}
const __VLS_156 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    content: "安全退出",
    placement: "top",
}));
const __VLS_158 = __VLS_157({
    content: "安全退出",
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
const __VLS_160 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    ...{ 'onClick': {} },
    type: "danger",
    circle: true,
    ...{ class: "exit-btn" },
}));
const __VLS_162 = __VLS_161({
    ...{ 'onClick': {} },
    type: "danger",
    circle: true,
    ...{ class: "exit-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
let __VLS_164;
let __VLS_165;
let __VLS_166;
const __VLS_167 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showExitDialog = true;
    }
};
__VLS_163.slots.default;
const __VLS_168 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({}));
const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.SwitchButton;
/** @type {[typeof __VLS_components.SwitchButton, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({}));
const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
var __VLS_171;
var __VLS_163;
var __VLS_159;
/** @type {__VLS_StyleScopedClasses['room-control-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['invite-content']} */ ;
/** @type {__VLS_StyleScopedClasses['invite-section']} */ ;
/** @type {__VLS_StyleScopedClasses['invite-label']} */ ;
/** @type {__VLS_StyleScopedClasses['invite-value']} */ ;
/** @type {__VLS_StyleScopedClasses['invite-section']} */ ;
/** @type {__VLS_StyleScopedClasses['invite-label']} */ ;
/** @type {__VLS_StyleScopedClasses['invite-value']} */ ;
/** @type {__VLS_StyleScopedClasses['exit-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['control-bar-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['exit-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ChatDotRound: ChatDotRound,
            Document: Document,
            Notebook: Notebook,
            Pointer: Pointer,
            SwitchButton: SwitchButton,
            UserFilled: UserFilled,
            showInviteDialog: showInviteDialog,
            showExitDialog: showExitDialog,
            handRaised: handRaised,
            activePanel: activePanel,
            roomLink: roomLink,
            copyToClipboard: copyToClipboard,
            toggleRaiseHand: toggleRaiseHand,
            togglePanel: togglePanel,
            confirmExit: confirmExit,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
