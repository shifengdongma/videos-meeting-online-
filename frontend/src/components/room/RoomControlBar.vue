<template>
  <div class="room-control-bar">
    <!-- Invite Dialog -->
    <el-dialog v-model="showInviteDialog" title="邀请成员" width="400px">
      <div class="invite-content">
        <div class="invite-section">
          <div class="invite-label">房间链接</div>
          <div class="invite-value">
            <el-input :value="roomLink" readonly>
              <template #append>
                <el-button @click="copyToClipboard(roomLink)">复制</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="invite-section">
          <div class="invite-label">房间号</div>
          <div class="invite-value">
            <el-input :value="roomCode" readonly>
              <template #append>
                <el-button @click="copyToClipboard(roomCode)">复制</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showInviteDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Exit Confirmation Dialog -->
    <el-dialog v-model="showExitDialog" title="确认退出" width="360px">
      <p class="exit-warning">确定要离开房间吗？这将关闭所有连接并释放媒体设备。</p>
      <template #footer>
        <el-button @click="showExitDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmExit">确认退出</el-button>
      </template>
    </el-dialog>

    <!-- Control Bar -->
    <div class="control-bar-inner">
      <!-- Invite -->
      <el-tooltip content="邀请成员" placement="top">
        <el-button circle @click="showInviteDialog = true">
          <el-icon><UserFilled /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- Raise Hand Toggle -->
      <el-tooltip :content="handRaised ? '放下举手' : '举手'" placement="top">
        <el-button :type="handRaised ? 'warning' : 'default'" circle @click="toggleRaiseHand">
          <el-icon><Pointer /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- Panel Toggles (for meeting) -->
      <template v-if="roomType === 'meeting'">
        <el-tooltip content="聊天" placement="top">
          <el-button :type="activePanel === 'chat' ? 'primary' : 'default'" circle @click="togglePanel('chat')">
            <el-icon><ChatDotRound /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="文档" placement="top">
          <el-button :type="activePanel === 'doc' ? 'primary' : 'default'" circle @click="togglePanel('doc')">
            <el-icon><Document /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="会议纪要" placement="top">
          <el-button :type="activePanel === 'minutes' ? 'primary' : 'default'" circle @click="togglePanel('minutes')">
            <el-icon><Notebook /></el-icon>
          </el-button>
        </el-tooltip>
      </template>

      <!-- Exit Button -->
      <el-tooltip content="安全退出" placement="top">
        <el-button type="danger" circle class="exit-btn" @click="showExitDialog = true">
          <el-icon><SwitchButton /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { ChatDotRound, Document, Notebook, Pointer, SwitchButton, UserFilled } from '@element-plus/icons-vue'

import { WsClient } from '../../utils/ws'

interface Props {
  roomType: 'meeting' | 'live'
  roomId: number
  roomCode: string
  wsClient: WsClient
  peerConnections: Map<string, RTCPeerConnection>
  localStream: MediaStream | null
  selfId: string
  onCleanup?: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'panel-change', panel: 'chat' | 'doc' | 'minutes' | null): void
  (e: 'raise-hand-change', raised: boolean): void
}>()

const router = useRouter()
const showInviteDialog = ref(false)
const showExitDialog = ref(false)
const handRaised = ref(false)
const activePanel = ref<'chat' | 'doc' | 'minutes' | null>(null)

const roomLink = computed(() => {
  const baseUrl = window.location.origin
  return props.roomType === 'meeting'
    ? `${baseUrl}/meetings/${props.roomId}`
    : `${baseUrl}/live/${props.roomId}`
})

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const toggleRaiseHand = () => {
  if (handRaised.value) {
    props.wsClient.send({ type: 'lower-hand', from: props.selfId })
    handRaised.value = false
  } else {
    props.wsClient.send({ type: 'raise-hand', from: props.selfId })
    handRaised.value = true
  }
  emit('raise-hand-change', handRaised.value)
}

const togglePanel = (panel: 'chat' | 'doc' | 'minutes') => {
  if (activePanel.value === panel) {
    activePanel.value = null
    emit('panel-change', null)
  } else {
    activePanel.value = panel
    emit('panel-change', panel)
  }
}

const confirmExit = async () => {
  showExitDialog.value = false

  // 1. Close WebSocket
  props.wsClient.send({ type: 'leave', from: props.selfId })
  props.wsClient.close()

  // 2. Close all WebRTC PeerConnections
  props.peerConnections.forEach((pc) => pc.close())
  props.peerConnections.clear()

  // 3. Stop local media stream
  if (props.localStream) {
    props.localStream.getTracks().forEach((track) => track.stop())
  }

  // 4. Execute additional cleanup
  if (props.onCleanup) {
    props.onCleanup()
  }

  // 5. Navigate to list page
  ElMessage.success('已安全退出房间')
  router.push(props.roomType === 'meeting' ? '/meetings' : '/live')
}

// Expose method for external hand state update
defineExpose({
  setHandRaised: (raised: boolean) => {
    handRaised.value = raised
  }
})
</script>

<style scoped>
.room-control-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(247, 249, 252, 0.98) 100%);
  border-top: 1px solid rgba(46, 58, 89, 0.12);
  box-shadow: 0 -8px 32px rgba(26, 31, 59, 0.08);
  backdrop-filter: blur(12px);
  padding: 16px 24px;
  z-index: 100;
}

.control-bar-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.exit-btn {
  margin-left: 24px;
}

.invite-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.invite-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.invite-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.invite-value {
  display: flex;
}

.exit-warning {
  color: #64748b;
  line-height: 1.6;
}
</style>