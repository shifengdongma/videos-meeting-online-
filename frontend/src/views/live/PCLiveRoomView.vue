<template>
  <div class="live-room-page app-page with-control-bar">
    <!-- Header -->
    <div class="live-head">
      <div>
        <div class="live-eyebrow">Live console</div>
        <h1>{{ currentVenue?.title || `直播间 #${currentVenueId}` }}</h1>
        <p>主播可在此快速开启采集，观众可直接查看主画面与远端流状态。</p>
      </div>
      <div class="live-actions">
        <!-- Venue Switcher -->
        <VenueSwitcher
          v-if="mainVenue || subVenues.length > 0"
          :main-venue="mainVenue"
          :sub-venues="subVenues"
          :current-venue-id="currentVenueId"
          @switch="handleVenueSwitch"
        />
        <el-button v-if="canPublish" type="primary" @click="startPublish">开始采集</el-button>
      </div>
    </div>

    <!-- Summary -->
    <div class="live-summary">
      <div class="summary-item">
        <div class="summary-label">当前身份</div>
        <div class="summary-value">{{ canPublish ? '主播端' : '观众端' }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">本地推流</div>
        <div class="summary-value">{{ localStream ? '已准备' : '未开始' }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">在线成员</div>
        <div class="summary-value">{{ onlineUsers.length }}</div>
      </div>
    </div>

    <!-- Main Layout: Video + Side Panel -->
    <div class="live-layout">
      <div class="video-section">
        <MediaTile
          class="main-video-tile"
          :title="canPublish ? '主播本地画面' : '主直播画面'"
          :subtitle="canPublish ? '用于推流预览' : '正在观看直播内容'"
          :empty="!localStream"
          :empty-text="canPublish ? '尚未开始本地采集' : '当前还没有收到直播画面'"
        >
          <video ref="localVideoRef" autoplay muted playsinline />
        </MediaTile>

        <MediaTile
          v-for="stream in remoteStreams"
          :key="stream.id"
          :title="getUserDisplayName(stream.id)"
          subtitle="实时直播连接"
        >
          <template #header-extra>
            <el-tag v-if="isHandRaised(stream.id)" type="warning" size="small" class="raised-hand-tag">
              举手
            </el-tag>
          </template>
          <video
            autoplay
            playsinline
            :ref="(el) => bindRemoteVideo(el as HTMLVideoElement | null, stream.mediaStream)"
          />
        </MediaTile>
      </div>

      <div class="side-panel-section">
        <LiveSidePanel
          ref="liveSidePanelRef"
          :ws-client="wsClient"
          :self-id="selfId"
          :self-name="selfName"
        />
      </div>
    </div>

    <!-- Room Control Bar (fixed at bottom) -->
    <RoomControlBar
      ref="roomControlBarRef"
      room-type="live"
      :room-id="currentVenueId"
      :room-code="currentVenue?.room_code || 'N/A'"
      :ws-client="wsClient"
      :peer-connections="peerConnections"
      :local-stream="localStream"
      :self-id="selfId"
      :on-cleanup="handleCleanup"
      @raise-hand-change="handleRaiseHandChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

import { fetchLiveStream, fetchSubVenues, type LiveItem } from '../../api/live'
import MediaTile from '../../components/media/MediaTile.vue'
import RoomControlBar from '../../components/room/RoomControlBar.vue'
import LiveSidePanel from '../../components/live/LiveSidePanel.vue'
import VenueSwitcher from '../../components/live/VenueSwitcher.vue'
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
const roomControlBarRef = ref<InstanceType<typeof RoomControlBar> | null>(null)
const liveSidePanelRef = ref<InstanceType<typeof LiveSidePanel> | null>(null)

// Venue state
const currentVenueId = ref(initialLiveId)
const currentVenue = ref<LiveItem | null>(null)
const mainVenue = ref<LiveItem | null>(null)
const subVenues = ref<LiveItem[]>([])

const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`
const selfName = authStore.user?.username || '匿名用户'
const canPublish = computed(() => ['admin', 'host'].includes(authStore.role))

const getUserDisplayName = (connId: string) => {
  const user = onlineUsers.value.find(u => u.id === connId)
  return user?.display_name || `远端流 ${connId.slice(-4)}`
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
    ElMessage.success('主播流已准备')
  } catch (error) {
    console.error('Failed to start publish:', error)
    ElMessage.error('无法访问摄像头或麦克风，请检查权限设置')
  }
}

const handleSignalMessage = async (raw: MessageEvent<string>) => {
  const payload = JSON.parse(raw.data)
  if (payload.from === selfId) return

  // Pass to LiveSidePanel for chat/member handling
  liveSidePanelRef.value?.handleWsMessage(payload)

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
  // Send join with user metadata
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
      // This is a sub-venue, load main venue data
      mainVenue.value = await fetchLiveStream(currentVenue.value.parent_id)
      const allSubs = await fetchSubVenues(mainVenue.value.id)
      subVenues.value = allSubs
    } else {
      // This is main venue, load sub-venues
      mainVenue.value = currentVenue.value
      subVenues.value = await fetchSubVenues(currentVenueId.value)
    }
  } catch (error) {
    console.error('Failed to load venue data:', error)
    ElMessage.error('加载直播间数据失败')
  }
}

const handleVenueSwitch = async (venueId: number) => {
  if (venueId === currentVenueId.value) return

  // Disconnect from current room
  disconnectRoom()

  // Stop local stream if publishing
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
    localStream.value = null
    if (localVideoRef.value) localVideoRef.value.srcObject = null
  }

  // Update venue id and navigate
  currentVenueId.value = venueId
  router.replace(`/live/${venueId}`)

  // Reload venue data and reconnect
  await loadVenueData()
  await connectRoom()

  ElMessage.success(`已切换到 ${currentVenue.value?.title || '直播间'}`)
}

const handleRaiseHandChange = (raised: boolean) => {
  const localUser = onlineUsers.value.find(u => u.id === selfId)
  if (localUser) {
    localUser.hand_raised = raised
  }
}

const handleCleanup = () => {
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
    localStream.value = null
  }
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
.live-room-page.with-control-bar {
  padding-bottom: 80px;
}

.live-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.live-eyebrow {
  color: #0ea5e9;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.live-head h1 {
  margin: 10px 0 0;
  font-size: clamp(30px, 4vw, 36px);
  line-height: 1.03;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.live-head p {
  margin: 12px 0 0;
  color: #64748b;
  line-height: 1.7;
  max-width: 720px;
}

.live-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.live-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.summary-item {
  padding: 20px 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
}

.summary-label {
  color: #64748b;
  font-size: 13px;
}

.summary-value {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.live-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 24px;
  align-items: start;
}

.video-section,
.side-panel-section {
  min-width: 0;
}

.video-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
}

.main-video-tile {
  min-height: 480px;
}

.raised-hand-tag {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@media (max-width: 1200px) {
  .live-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .live-summary {
    grid-template-columns: 1fr;
  }

  .main-video-tile {
    min-height: 360px;
  }
}

@media (max-width: 720px) {
  .live-head {
    flex-direction: column;
  }

  .live-actions {
    flex-wrap: wrap;
  }
}
</style>