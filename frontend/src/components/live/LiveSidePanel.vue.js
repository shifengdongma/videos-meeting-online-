import { nextTick, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Upload, UserFilled } from '@element-plus/icons-vue';
import { uploadFile } from '../../api/upload';
const props = defineProps();
const activeTab = ref('chat');
const onlineUsers = ref([]);
const chatMessages = ref([]);
const chatInput = ref('');
const chatMessagesRef = ref(null);
// Handle WebSocket messages
const handleWsMessage = (payload) => {
    const { type } = payload;
    if (type === 'user-list') {
        onlineUsers.value = payload.users || [];
    }
    if (type === 'user-joined') {
        // Add new user if not already in list
        const exists = onlineUsers.value.find(u => u.id === payload.from);
        if (!exists) {
            onlineUsers.value.push({
                id: payload.from,
                user_id: payload.user_id,
                display_name: payload.display_name,
                role: payload.role,
                hand_raised: false
            });
        }
    }
    if (type === 'user-left') {
        onlineUsers.value = onlineUsers.value.filter(u => u.id !== payload.from);
    }
    if (type === 'raise-hand') {
        const user = onlineUsers.value.find(u => u.id === payload.from);
        if (user) {
            user.hand_raised = true;
        }
    }
    if (type === 'lower-hand') {
        const user = onlineUsers.value.find(u => u.id === payload.from);
        if (user) {
            user.hand_raised = false;
        }
    }
    if (type === 'chat-message') {
        chatMessages.value.push({
            from: payload.from,
            sender_name: payload.sender_name,
            msg_type: payload.msg_type,
            content: payload.content,
            url: payload.url,
            filename: payload.filename
        });
        // Scroll to bottom
        nextTick(() => {
            if (chatMessagesRef.value) {
                chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
            }
        });
    }
};
const sendTextMessage = () => {
    if (!chatInput.value.trim())
        return;
    props.wsClient.send({
        type: 'chat-message',
        from: props.selfId,
        sender_name: props.selfName,
        msg_type: 'text',
        content: chatInput.value.trim()
    });
    chatInput.value = '';
};
const handleFileUpload = async (file) => {
    try {
        const result = await uploadFile(file);
        props.wsClient.send({
            type: 'chat-message',
            from: props.selfId,
            sender_name: props.selfName,
            msg_type: result.type,
            url: result.url,
            filename: result.filename
        });
        ElMessage.success('文件已发送');
    }
    catch (error) {
        ElMessage.error('文件上传失败');
    }
    return false; // Prevent el-upload default behavior
};
// Expose method for parent component
const __VLS_exposed = {
    handleWsMessage
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['panel-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message']} */ ;
/** @type {__VLS_StyleScopedClasses['self-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-image']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input-area']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "live-side-panel" },
});
const __VLS_0 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "panel-tabs" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "panel-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    label: "成员",
    name: "members",
}));
const __VLS_6 = __VLS_5({
    label: "成员",
    name: "members",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "members-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "members-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "members-count" },
});
(__VLS_ctx.onlineUsers.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "members-content" },
});
for (const [user] of __VLS_getVForSourceType((__VLS_ctx.onlineUsers))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (user.id),
        ...{ class: "member-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "member-avatar" },
    });
    const __VLS_8 = {}.ElAvatar;
    /** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        size: (32),
        icon: (__VLS_ctx.UserFilled),
    }));
    const __VLS_10 = __VLS_9({
        size: (32),
        icon: (__VLS_ctx.UserFilled),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "member-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "member-name" },
    });
    (user.display_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "member-role" },
    });
    const __VLS_12 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        type: (user.role === 'host' ? 'danger' : 'info'),
        size: "small",
    }));
    const __VLS_14 = __VLS_13({
        type: (user.role === 'host' ? 'danger' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (user.role === 'host' ? '主播' : '观众');
    var __VLS_15;
    if (user.hand_raised) {
        const __VLS_16 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            type: "warning",
            size: "small",
            ...{ class: "hand-tag" },
        }));
        const __VLS_18 = __VLS_17({
            type: "warning",
            size: "small",
            ...{ class: "hand-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        var __VLS_19;
    }
    if (user.id === __VLS_ctx.selfId) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "member-self-tag" },
        });
        const __VLS_20 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            type: "success",
            size: "small",
        }));
        const __VLS_22 = __VLS_21({
            type: "success",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_23.slots.default;
        var __VLS_23;
    }
}
if (__VLS_ctx.onlineUsers.length === 0) {
    const __VLS_24 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        description: "暂无在线成员",
    }));
    const __VLS_26 = __VLS_25({
        description: "暂无在线成员",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
var __VLS_7;
const __VLS_28 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "聊天",
    name: "chat",
}));
const __VLS_30 = __VLS_29({
    label: "聊天",
    name: "chat",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-messages" },
    ref: "chatMessagesRef",
});
/** @type {typeof __VLS_ctx.chatMessagesRef} */ ;
for (const [msg, index] of __VLS_getVForSourceType((__VLS_ctx.chatMessages))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "chat-message" },
        ...{ class: ({ 'self-message': msg.from === __VLS_ctx.selfId }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-sender" },
    });
    (msg.sender_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-content" },
    });
    if (msg.msg_type === 'text') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-text" },
        });
        (msg.content);
    }
    else if (msg.msg_type === 'image') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-image" },
        });
        const __VLS_32 = {}.ElImage;
        /** @type {[typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            src: (msg.url),
            fit: "cover",
            previewSrcList: ([msg.url]),
        }));
        const __VLS_34 = __VLS_33({
            src: (msg.url),
            fit: "cover",
            previewSrcList: ([msg.url]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    }
    else if (msg.msg_type === 'file') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-file" },
        });
        const __VLS_36 = {}.ElLink;
        /** @type {[typeof __VLS_components.ElLink, typeof __VLS_components.elLink, typeof __VLS_components.ElLink, typeof __VLS_components.elLink, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            href: (msg.url),
            target: "_blank",
            type: "primary",
        }));
        const __VLS_38 = __VLS_37({
            href: (msg.url),
            target: "_blank",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_39.slots.default;
        const __VLS_40 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        const __VLS_44 = {}.Document;
        /** @type {[typeof __VLS_components.Document, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        var __VLS_43;
        (msg.filename || '文件');
        var __VLS_39;
    }
}
if (__VLS_ctx.chatMessages.length === 0) {
    const __VLS_48 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        description: "暂无聊天消息",
    }));
    const __VLS_50 = __VLS_49({
        description: "暂无聊天消息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-input-area" },
});
const __VLS_52 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.chatInput),
    placeholder: "输入消息...",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.chatInput),
    placeholder: "输入消息...",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onKeyup: (__VLS_ctx.sendTextMessage)
};
__VLS_55.slots.default;
{
    const { append: __VLS_thisSlot } = __VLS_55.slots;
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (__VLS_ctx.sendTextMessage)
    };
    __VLS_63.slots.default;
    var __VLS_63;
}
var __VLS_55;
const __VLS_68 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleFileUpload),
    accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt",
}));
const __VLS_70 = __VLS_69({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleFileUpload),
    accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    circle: true,
    ...{ class: "upload-btn" },
}));
const __VLS_74 = __VLS_73({
    circle: true,
    ...{ class: "upload-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
var __VLS_79;
var __VLS_75;
var __VLS_71;
var __VLS_31;
const __VLS_84 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "文档",
    name: "docs",
}));
const __VLS_86 = __VLS_85({
    label: "文档",
    name: "docs",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ElEmpty;
/** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    description: "文档功能开发中...",
}));
const __VLS_90 = __VLS_89({
    description: "文档功能开发中...",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
var __VLS_87;
const __VLS_92 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    label: "纪要",
    name: "minutes",
}));
const __VLS_94 = __VLS_93({
    label: "纪要",
    name: "minutes",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.ElEmpty;
/** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    description: "会议纪要功能开发中...",
}));
const __VLS_98 = __VLS_97({
    description: "会议纪要功能开发中...",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
var __VLS_95;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['live-side-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['members-list']} */ ;
/** @type {__VLS_StyleScopedClasses['members-header']} */ ;
/** @type {__VLS_StyleScopedClasses['members-count']} */ ;
/** @type {__VLS_StyleScopedClasses['members-content']} */ ;
/** @type {__VLS_StyleScopedClasses['member-item']} */ ;
/** @type {__VLS_StyleScopedClasses['member-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['member-info']} */ ;
/** @type {__VLS_StyleScopedClasses['member-name']} */ ;
/** @type {__VLS_StyleScopedClasses['member-role']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['member-self-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message']} */ ;
/** @type {__VLS_StyleScopedClasses['self-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-sender']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-image']} */ ;
/** @type {__VLS_StyleScopedClasses['message-file']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Document: Document,
            Upload: Upload,
            UserFilled: UserFilled,
            activeTab: activeTab,
            onlineUsers: onlineUsers,
            chatMessages: chatMessages,
            chatInput: chatInput,
            chatMessagesRef: chatMessagesRef,
            sendTextMessage: sendTextMessage,
            handleFileUpload: handleFileUpload,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
