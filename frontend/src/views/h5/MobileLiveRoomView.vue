<template>
  <div class="mobile-live-room">
    <!-- 全屏视频 -->
    <div class="fullscreen-video">
      <video
        v-if="localStream"
        ref="localVideoRef"
        autoplay
        muted
        playsinline
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="false"
        class="live-video"
      />
      <div v-else class="video-placeholder">
        <van-icon name="video" size="64" color="#666" />
        <p>{{ canPublish ? '点击开始采集' : '等待主播推流...' }}</p>
      </div>
    </div>

    <!-- 顶部信息栏 -->
    <div class="top-bar">
      <div class="live-info">
        <div class="live-title">{{ currentVenue?.title || `直播间 #${currentVenueId}` }}</div>
        <div class="live-meta">
          <van-icon name="eye-o" />
          <span>{{ onlineUsers.length }} 观看</span>
        </div>
      </div>
      <div class="top-actions">
        <van-icon name="wap-nav" size="22" color="#fff" @click="showVenueSwitcher = true" />
      </div>
    </div>

    <!-- 聊天消息悬浮区 -->
    <div class="chat-overlay">
      <div class="chat-messages">
        <div v-for="(msg, index) in chatMessages" :key="index" class="chat-message">
          <span class="chat-user">{{ msg.user }}:</span>
          <span class="chat-text">{{ msg.text }}</span>
        </div>
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div class="bottom-bar">
      <!-- 主播端控制 -->
      <template v-if="canPublish">
        <div v-if="!localStream" class="start-btn" @click="startPublish">
          <van-icon name="video-o" size="24" />
          <span>开始采集</span>
        </div>
        <template v-else>
          <div class="control-item" @click="toggleCamera">
            <van-icon :name="localStream ? 'video' : 'video-o'" size="22" />
            <span>摄像头</span>
          </div>
          <div class="control-item" @click="toggleMute">
            <van-icon :name="isMuted ? 'volume-mute-o' : 'volume-o'" size="22" />
            <span>{{ isMuted ? '静音' : '麦克风' }}</span>
          </div>
        </template>
      </template>

      <!-- 通用控制 -->
      <div class="control-item" @click="showChatInput = true">
        <van-icon name="chat-o" size="22" />
        <span>聊天</span>
      </div>
      <div class="control-item" @click="showMembersDrawer = true">
        <van-icon name="friends-o" size="22" />
        <span>成员</span>
      </div>
      <div class="control-item" @click="toggleRaiseHand">
        <van-icon :name="isHandRaisedLocal ? 'guide' : 'guide-o'" size="22" :color="isHandRaisedLocal ? '#ff9800' : ''" />
        <span>举手</span>
      </div>
      <div class="control-item end-btn" @click="handleLeave">
        <van-icon name="cross" size="22" color="#fff" />
        <span>退出</span>
      </div>
    </div>

    <!-- 成员列表抽屉 -->
    <van-popup v-model:show="showMembersDrawer" position="bottom" :style="{ height: '60%' }" round>
      <div class="drawer-content">
        <div class="drawer-header">
          <h3>在线成员 ({{ onlineUsers.length }})</h3>
        </div>
        <div class="member-list">
          <div v-for="user in onlineUsers" :key="user.id" class="member-item">
            <div class="member-avatar">
              <van-icon name="user-circle-o" size="32" />
            </div>
            <div class="member-info">
              <span class="member-name">{{ user.display_name }}</span>
              <van-tag v-if="user.role === 'host'" type="danger">主播</van-tag>
              <van-tag v-if="user.role === 'admin'" type="warning">管理员</van-tag>
            </div>
            <van-tag v-if="user.hand_raised" type="warning">
              <van-icon name="guide" /> 举手
            </van-tag>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 聊天输入框 -->
    <van-popup v-model:show="showChatInput" position="bottom" round>
      <div class="chat-input-area">
        <van-field
          v-model="chatInput"
          placeholder="说点什么..."
          :border="false"
          @keyup.enter="sendChatMessage"
        />
        <van-button type="primary" size="small" @click="sendChatMessage">发送</van-button>
      </div>
    </van-popup>

    <!-- 分会场切换 -->
    <van-action-sheet
      v-model:show="showVenueSwitcher"
      title="切换直播间"
      :actions="venueActions"
      @select="onVenueSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'

import { fetchLiveStream, fetchSubVenues, type LiveItem } from '../../api/live'
import { useAuthStore } from '../../stores/auth'
import { WsClient } from '../../utils/ws'

interface RemoteStreamItem {
  id: string
  mediaStream: MediaStream
}

interface OnlineUser {
  id: string
  user_id: number
  display_name: string
  role: string
  hand_raised: boolean
}

interface ChatMessage {
  user: string
  text: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const initialLiveId = Number(route.params.id)
const wsClient = new WsClient()
const peerConnections = new Map<string, RTCPeerConnection>()
const remoteStreams = ref<RemoteStreamItem[]>([])
const localStream = ref<MediaStream | null>(null)
const localVideoRef = ref<HTMLVideoElement | null>(null)
const onlineUsers = ref<OnlineUser[]>([])

// Venue state
const currentVenueId = ref(initialLiveId)
const currentVenue = ref<LiveItem | null>(null)
const mainVenue = ref<LiveItem | null>(null)
const subVenues = ref<LiveItem[]>([])

// Mobile specific state
const showMembersDrawer = ref(false)
const showChatInput = ref(false)
const showVenueSwitcher = ref(false)
const chatInput = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isMuted = ref(false)
const isHandRaisedLocal = ref(false)

const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`
const selfName = authStore.user?.username || '匿名用户'
const canPublish = computed(() => ['admin', 'host'].includes(authStore.role))

const venueActions = computed(() => {
  const actions: Array<{ name: string; subname?: string; value: number }> = []
  if (mainVenue.value) {
    actions.push({
      name: mainVenue.value.title || `主会场 ${mainVenue.value.id}`,
      subname: mainVenue.value.room_code,
      value: mainVenue.value.id
    })
  }
  subVenues.value.forEach(venue => {
    actions.push({
      name: venue.title || `分会场 ${venue.id}`,
      subname: venue.room_code,
      value: venue.id
    })
  })
  return actions
})

const getUserDisplayName = (connId: string) => {
  const user = onlineUsers.value.find(u => u.id === connId)
  return user?.display_name || `用户 ${connId.slice(-4)}`
}

const isHandRaised = (connId: string) => {
  const user = onlineUsers.value.find(u => u.id === connId)
  return user?.hand_raised || false
}

const bindRemoteVideo = (el: HTMLVideoElement | null, stream: MediaStream) => {
  if (el) el.srcObject = stream
}

const createPeerConnection = (peerId: string) => {
  if (peerConnections.has(peerId)) return peerConnections.get(peerId)!

  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
  localStream.value?.getTracks().forEach((track) => pc.addTrack(track, localStream.value!))

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      wsClient.send({ type: 'ice-candidate', from: selfId, to: peerId, candidate: event.candidate })
    }
  }

  pc.ontrack = (event) => {
    const [stream] = event.streams
    if (!remoteStreams.value.find((item) => item.id === peerId)) {
      remoteStreams.value.push({ id: peerId, mediaStream: stream })
    }
  }

  peerConnections.set(peerId, pc)
  return pc
}

const startPublish = async () => {
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    if (localVideoRef.value) localVideoRef.value.srcObject = localStream.value
    showToast('主播流已准备')
  } catch (error) {
    console.error('Failed to start publish:', error)
    showToast('无法访问摄像头或麦克风')
  }
}

const toggleCamera = async () => {
  if (localStream.value) {
    const videoTrack = localStream.value.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
    }
  }
}

const toggleMute = () => {
  if (localStream.value) {
    const audioTrack = localStream.value.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      isMuted.value = !audioTrack.enabled
      showToast(isMuted.value ? '已静音' : '已取消静音')
    }
  }
}

const toggleRaiseHand = () => {
  isHandRaisedLocal.value = !isHandRaisedLocal.value
  wsClient.send({
    type: isHandRaisedLocal.value ? 'raise-hand' : 'lower-hand',
    from: selfId
  })
  showToast(isHandRaisedLocal.value ? '已举手' : '已放下')
}

const sendChatMessage = () => {
  if (!chatInput.value.trim()) return
  wsClient.send({
    type: 'chat',
    from: selfId,
    user: selfName,
    text: chatInput.value
  })
  chatMessages.value.push({
    user: selfName,
    text: chatInput.value
  })
  chatInput.value = ''
  showChatInput.value = false
}

const handleLeave = () => {
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
  }
  wsClient.send({ type: 'leave', from: selfId })
  wsClient.close()
  peerConnections.forEach((pc) => pc.close())
  window.history.back()
}

const handleSignalMessage = async (raw: MessageEvent<string>) => {
  const payload = JSON.parse(raw.data)
  if (payload.from === selfId) return

  // Handle chat messages
  if (payload.type === 'chat') {
    chatMessages.value.push({
      user: payload.user || '匿名用户',
      text: payload.text
    })
    // Keep only last 50 messages
    if (chatMessages.value.length > 50) {
      chatMessages.value = chatMessages.value.slice(-50)
    }
    return
  }

  // Handle user management messages
  if (payload.type === 'user-list') {
    onlineUsers.value = payload.users || []
    return
  }

  if (payload.type === 'user-joined') {
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
    return
  }

  if (payload.type === 'user-left') {
    onlineUsers.value = onlineUsers.value.filter(u => u.id !== payload.from)
    remoteStreams.value = remoteStreams.value.filter(s => s.id !== payload.from)
    const pc = peerConnections.get(payload.from)
    if (pc) {
      pc.close()
      peerConnections.delete(payload.from)
    }
    return
  }

  if (payload.type === 'raise-hand') {
    const user = onlineUsers.value.find(u => u.id === payload.from)
    if (user) {
      user.hand_raised = true
    }
    return
  }

  if (payload.type === 'lower-hand') {
    const user = onlineUsers.value.find(u => u.id === payload.from)
    if (user) {
      user.hand_raised = false
    }
    return
  }

  // WebRTC signaling
  if (payload.type === 'join' && canPublish.value) {
    const pc = createPeerConnection(payload.from)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    wsClient.send({ type: 'offer', from: selfId, to: payload.from, sdp: offer })
    return
  }

  if (payload.to !== selfId) return

  if (payload.type === 'offer') {
    const pc = createPeerConnection(payload.from)
    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    wsClient.send({ type: 'answer', from: selfId, to: payload.from, sdp: answer })
  }

  if (payload.type === 'answer') {
    const pc = createPeerConnection(payload.from)
    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
  }

  if (payload.type === 'ice-candidate') {
    const pc = createPeerConnection(payload.from)
    await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
  }
}

const connectRoom = async () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  await wsClient.connect(`${wsProtocol}//${window.location.host}/ws/live/${currentVenueId.value}`, handleSignalMessage)
  wsClient.send({
    type: 'join',
    from: selfId,
    user_id: authStore.user?.id || 0,
    display_name: selfName,
    role: canPublish.value ? 'host' : 'user'
  })
}

const disconnectRoom = () => {
  wsClient.send({ type: 'leave', from: selfId })
  wsClient.close()
  peerConnections.forEach((pc) => pc.close())
  peerConnections.clear()
  remoteStreams.value = []
  onlineUsers.value = []
}

const loadVenueData = async () => {
  try {
    currentVenue.value = await fetchLiveStream(currentVenueId.value)

    if (currentVenue.value?.parent_id) {
      mainVenue.value = await fetchLiveStream(currentVenue.value.parent_id)
      const allSubs = await fetchSubVenues(mainVenue.value.id)
      subVenues.value = allSubs
    } else {
      mainVenue.value = currentVenue.value
      subVenues.value = await fetchSubVenues(currentVenueId.value)
    }
  } catch (error) {
    console.error('Failed to load venue data:', error)
    showToast('加载直播间数据失败')
  }
}

const onVenueSelect = async (action: { value: number }) => {
  if (action.value === currentVenueId.value) {
    showVenueSwitcher.value = false
    return
  }

  disconnectRoom()

  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
    localStream.value = null
    if (localVideoRef.value) localVideoRef.value.srcObject = null
  }

  currentVenueId.value = action.value
  router.replace(`/live/${action.value}`)

  await loadVenueData()
  await connectRoom()

  showVenueSwitcher.value = false
  showToast(`已切换到 ${currentVenue.value?.title || '直播间'}`)
}

onMounted(async () => {
  await loadVenueData()
  await connectRoom()
})

onBeforeUnmount(() => {
  disconnectRoom()
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
  }
})

// Watch for route changes
watch(() => route.params.id, async (newId) => {
  const newLiveId = Number(newId)
  if (newLiveId !== currentVenueId.value && newId) {
    disconnectRoom()
    currentVenueId.value = newLiveId
    await loadVenueData()
    await connectRoom()
  }
})
</script>

<style scoped>
.mobile-live-room {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  overflow: hidden;
}

/* 全屏视频 */
.fullscreen-video {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.live-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #666;
}

.video-placeholder p {
  margin-top: 16px;
  font-size: 14px;
}

/* 顶部信息栏 */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  padding-top: calc(10px + env(safe-area-inset-top));
  background: linear-gradient(rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.live-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.live-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.live-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.top-actions {
  display: flex;
  gap: 12px;
}

/* 聊天消息悬浮区 */
.chat-overlay {
  position: absolute;
  bottom: 80px;
  left: 10px;
  right: 60px;
  max-height: 200px;
  overflow: hidden;
  pointer-events: none;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-message {
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  max-width: 80%;
}

.chat-user {
  color: #22c55e;
  font-weight: 500;
  margin-right: 4px;
}

.chat-text {
  color: white;
}

/* 底部控制栏 */
.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 10px;
  padding-bottom: calc(15px + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 10px;
  padding: 8px;
  min-width: 44px;
}

.start-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ef4444;
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
}

.end-btn {
  background: rgba(239, 68, 68, 0.9);
  border-radius: 50%;
  width: 44px;
  height: 44px;
}

/* 抽屉内容 */
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.drawer-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2E3A59;
}

.member-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 8px;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #2E3A59;
}

/* 聊天输入区 */
.chat-input-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.chat-input-area .van-field {
  flex: 1;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 16px;
}
</style>