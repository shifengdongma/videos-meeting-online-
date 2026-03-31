<template>
  <div class="live-side-panel">
    <el-tabs v-model="activeTab" class="panel-tabs">
      <!-- Members Tab -->
      <el-tab-pane label="成员" name="members">
        <div class="members-list">
          <div class="members-header">
            <span class="members-count">在线成员: {{ onlineUsers.length }}</span>
          </div>
          <div class="members-content">
            <div
              v-for="user in onlineUsers"
              :key="user.id"
              class="member-item"
            >
              <div class="member-avatar">
                <el-avatar :size="32" :icon="UserFilled" />
              </div>
              <div class="member-info">
                <div class="member-name">{{ user.display_name }}</div>
                <div class="member-role">
                  <el-tag :type="user.role === 'host' ? 'danger' : 'info'" size="small">
                    {{ user.role === 'host' ? '主播' : '观众' }}
                  </el-tag>
                  <el-tag v-if="user.hand_raised" type="warning" size="small" class="hand-tag">
                    举手
                  </el-tag>
                </div>
              </div>
              <div v-if="user.id === selfId" class="member-self-tag">
                <el-tag type="success" size="small">我</el-tag>
              </div>
            </div>
            <el-empty v-if="onlineUsers.length === 0" description="暂无在线成员" />
          </div>
        </div>
      </el-tab-pane>

      <!-- Chat Tab -->
      <el-tab-pane label="聊天" name="chat">
        <div class="chat-panel">
          <div class="chat-messages" ref="chatMessagesRef">
            <div
              v-for="(msg, index) in chatMessages"
              :key="index"
              class="chat-message"
              :class="{ 'self-message': msg.from === selfId }"
            >
              <div class="message-sender">{{ msg.sender_name }}</div>
              <div class="message-content">
                <!-- Text message -->
                <div v-if="msg.msg_type === 'text'" class="message-text">
                  {{ msg.content }}
                </div>
                <!-- Image message -->
                <div v-else-if="msg.msg_type === 'image'" class="message-image">
                  <el-image :src="msg.url" fit="cover" :preview-src-list="[msg.url]" />
                </div>
                <!-- File message -->
                <div v-else-if="msg.msg_type === 'file'" class="message-file">
                  <el-link :href="msg.url" target="_blank" type="primary">
                    <el-icon><Document /></el-icon>
                    {{ msg.filename || '文件' }}
                  </el-link>
                </div>
              </div>
            </div>
            <el-empty v-if="chatMessages.length === 0" description="暂无聊天消息" />
          </div>
          <div class="chat-input-area">
            <el-input
              v-model="chatInput"
              placeholder="输入消息..."
              @keyup.enter="sendTextMessage"
            >
              <template #append>
                <el-button @click="sendTextMessage">发送</el-button>
              </template>
            </el-input>
            <el-upload
              :show-file-list="false"
              :before-upload="handleFileUpload"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            >
              <el-button circle class="upload-btn">
                <el-icon><Upload /></el-icon>
              </el-button>
            </el-upload>
          </div>
        </div>
      </el-tab-pane>

      <!-- Documents Tab -->
      <el-tab-pane label="文档" name="docs">
        <el-empty description="文档功能开发中..." />
      </el-tab-pane>

      <!-- Minutes Tab -->
      <el-tab-pane label="纪要" name="minutes">
        <el-empty description="会议纪要功能开发中..." />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Upload, UserFilled } from '@element-plus/icons-vue'

import { uploadFile } from '../../api/upload'
import { WsClient } from '../../utils/ws'

interface OnlineUser {
  id: string
  user_id: number
  display_name: string
  role: string
  hand_raised: boolean
}

interface ChatMessage {
  from: string
  sender_name: string
  msg_type: 'text' | 'image' | 'file'
  content?: string
  url?: string
  filename?: string
}

interface Props {
  wsClient: WsClient
  selfId: string
  selfName: string
}

const props = defineProps<Props>()

const activeTab = ref('chat')
const onlineUsers = ref<OnlineUser[]>([])
const chatMessages = ref<ChatMessage[]>([])
const chatInput = ref('')
const chatMessagesRef = ref<HTMLElement | null>(null)

// Handle WebSocket messages
const handleWsMessage = (payload: any) => {
  const { type } = payload

  if (type === 'user-list') {
    onlineUsers.value = payload.users || []
  }

  if (type === 'user-joined') {
    // Add new user if not already in list
    const exists = onlineUsers.value.find(u => u.id === payload.from)
    if (!exists) {
      onlineUsers.value.push({
        id: payload.from,
        user_id: payload.user_id,
        display_name: payload.display_name,
        role: payload.role,
        hand_raised: false
      })
    }
  }

  if (type === 'user-left') {
    onlineUsers.value = onlineUsers.value.filter(u => u.id !== payload.from)
  }

  if (type === 'raise-hand') {
    const user = onlineUsers.value.find(u => u.id === payload.from)
    if (user) {
      user.hand_raised = true
    }
  }

  if (type === 'lower-hand') {
    const user = onlineUsers.value.find(u => u.id === payload.from)
    if (user) {
      user.hand_raised = false
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
    })
    // Scroll to bottom
    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    })
  }
}

const sendTextMessage = () => {
  if (!chatInput.value.trim()) return

  props.wsClient.send({
    type: 'chat-message',
    from: props.selfId,
    sender_name: props.selfName,
    msg_type: 'text',
    content: chatInput.value.trim()
  })
  chatInput.value = ''
}

const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadFile(file)
    props.wsClient.send({
      type: 'chat-message',
      from: props.selfId,
      sender_name: props.selfName,
      msg_type: result.type,
      url: result.url,
      filename: result.filename
    })
    ElMessage.success('文件已发送')
  } catch (error) {
    ElMessage.error('文件上传失败')
  }
  return false // Prevent el-upload default behavior
}

// Expose method for parent component
defineExpose({
  handleWsMessage
})
</script>

<style scoped>
.live-side-panel {
  height: 100%;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  border: 1px solid rgba(46, 58, 89, 0.1);
  box-shadow: 0 8px 32px rgba(26, 31, 59, 0.06);
  overflow: hidden;
}

.panel-tabs {
  height: 100%;
}

.panel-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 12px 16px 0;
}

.panel-tabs :deep(.el-tabs__content) {
  height: calc(100% - 50px);
  overflow: auto;
}

.panel-tabs :deep(.el-tab-pane) {
  height: 100%;
}

/* Members styles */
.members-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.members-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(46, 58, 89, 0.08);
}

.members-count {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.members-content {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(247, 249, 252, 0.8);
  margin-bottom: 8px;
}

.member-avatar {
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.member-role {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.hand-tag {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.member-self-tag {
  flex-shrink: 0;
}

/* Chat styles */
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.chat-message {
  margin-bottom: 16px;
}

.chat-message.self-message {
  text-align: right;
}

.message-sender {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.message-content {
  display: inline-block;
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(241, 245, 249, 0.9);
}

.chat-message.self-message .message-content {
  background: rgba(59, 130, 246, 0.12);
}

.message-text {
  font-size: 14px;
  color: #1e293b;
  line-height: 1.5;
}

.message-image {
  max-width: 200px;
}

.message-image :deep(.el-image) {
  border-radius: 8px;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-input-area {
  padding: 12px;
  border-top: 1px solid rgba(46, 58, 89, 0.08);
  display: flex;
  gap: 8px;
}

.chat-input-area :deep(.el-input) {
  flex: 1;
}

.upload-btn {
  flex-shrink: 0;
}
</style>