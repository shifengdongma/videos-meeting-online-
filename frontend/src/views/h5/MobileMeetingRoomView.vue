<template>
  <div class="mobile-meeting-room">
    <!-- 主视频区域 -->
    <div class="main-video-area">
      <!-- 主画面：本地流或发言人 -->
      <div class="main-video-container">
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
          class="main-video"
        />
        <div v-else class="video-placeholder">
          <van-icon name="video" size="48" color="#ccc" />
          <p>尚未开启摄像头</p>
        </div>
        <div class="video-label">本地画面</div>
      </div>

      <!-- 桌面共享画面（如果有） -->
      <div v-if="screenStream" class="screen-share-container" @click="showScreenInMain = !showScreenInMain">
        <video
          ref="screenVideoRef"
          autoplay
          muted
          playsinline
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
          class="screen-video"
        />
        <div class="video-label">屏幕共享</div>
      </div>
    </div>

    <!-- 小窗口：远端流（画中画） -->
    <div v-if="remoteStreams.length > 0" class="pip-container">
      <div class="pip-scroll">
        <div
          v-for="stream in remoteStreams"
          :key="stream.id"
          class="pip-item"
          :class="{ 'has-raised-hand': isHandRaised(stream.id) }"
          @click="switchMainVideo(stream)"
        >
          <video
            autoplay
            playsinline
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="false"
            :ref="(el) => bindRemoteVideo(el as HTMLVideoElement | null, stream.mediaStream)"
            class="pip-video"
          />
          <div class="pip-name">{{ getUserDisplayName(stream.id) }}</div>
          <div v-if="isHandRaised(stream.id)" class="raised-hand-indicator">
            <van-icon name="guide" />
          </div>
        </div>
      </div>
    </div>

    <!-- 顶部信息栏 -->
    <div class="top-bar">
      <div class="room-info">
        <span class="room-title">会议室 #{{ meetingId }}</span>
        <van-tag type="primary">房间号: {{ roomCode }}</van-tag>
      </div>
      <div class="online-count">
        <van-icon name="friends-o" />
        <span>{{ onlineUsers.length }}人在线</span>
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div class="bottom-control-bar">
      <div class="control-btn" :class="{ active: localStream }" @click="toggleCamera">
        <van-icon :name="localStream ? 'video' : 'video-o'" size="24" />
        <span>{{ localStream ? '关闭' : '摄像头' }}</span>
      </div>
      <div class="control-btn" :class="{ active: !isMuted }" @click="toggleMute">
        <van-icon :name="isMuted ? 'volume-mute-o' : 'volume-o'" size="24" />
        <span>{{ isMuted ? '静音' : '麦克风' }}</span>
      </div>
      <div class="control-btn" @click="toggleRaiseHand">
        <van-icon :name="isHandRaisedLocal ? 'guide' : 'guide-o'" size="24" :color="isHandRaisedLocal ? '#ff9800' : ''" />
        <span>{{ isHandRaisedLocal ? '已举手' : '举手' }}</span>
      </div>
      <div class="control-btn" @click="showMoreSheet = true">
        <van-icon name="ellipsis" size="24" />
        <span>更多</span>
      </div>
      <div class="control-btn end-call" @click="handleLeave">
        <van-icon name="phone-o" size="24" color="#fff" />
        <span>离开</span>
      </div>
    </div>

    <!-- 更多操作面板 -->
    <van-action-sheet v-model:show="showMoreSheet" title="更多操作" :actions="moreActions" @select="onMoreActionSelect" />

    <!-- 成员列表抽屉 -->
    <van-popup v-model:show="showMembersDrawer" position="bottom" :style="{ height: '70%' }" round>
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
              <van-tag v-if="user.role === 'host'" type="primary">主持人</van-tag>
              <van-tag v-if="user.role === 'admin'" type="warning">管理员</van-tag>
            </div>
            <van-tag v-if="user.hand_raised" type="warning">
              <van-icon name="guide" /> 举手
            </van-tag>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 聊天抽屉 -->
    <van-popup v-model:show="showChatDrawer" position="bottom" :style="{ height: '70%' }" round>
      <div class="drawer-content">
        <div class="drawer-header">
          <h3>聊天</h3>
        </div>
        <div class="chat-area">
          <van-empty description="聊天功能开发中..." />
        </div>
      </div>
    </van-popup>

    <!-- 表决抽屉 -->
    <van-popup v-model:show="showVoteDrawer" position="bottom" :style="{ height: '80%' }" round>
      <div class="drawer-content">
        <div class="drawer-header">
          <h3>表决</h3>
        </div>
        <div class="vote-area">
          <VotePanel
            :active-vote="activeVote"
            :results="voteResults"
            :submitted="submitted"
            :can-end-vote="canEndVote"
            @submit="handleVoteSubmit"
            @end="handleEndVote"
          />
          <div v-if="canStartVote && !activeVote" class="start-vote-btn">
            <van-button type="primary" block @click="showVoteDialog = true">发起表决</van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 桌面共享按钮 -->
    <div v-if="!screenStream" class="screen-share-fab" @click="toggleScreenShare">
      <van-icon name="tv-o" size="20" />
      <span>共享屏幕</span>
    </div>

    <!-- 发起表决弹窗 -->
    <van-popup v-model:show="showVoteDialog" position="bottom" round :style="{ padding: '20px' }">
      <div class="vote-form">
        <h3>发起表决</h3>
        <van-field v-model="voteForm.topic" label="主题" placeholder="请输入表决主题" />
        <div class="options-label">选项</div>
        <van-field
          v-for="(item, index) in voteForm.options"
          :key="index"
          v-model="item.content"
          :placeholder="`选项 ${index + 1}`"
        />
        <div class="vote-form-actions">
          <van-button block @click="showVoteDialog = false">取消</van-button>
          <van-button type="primary" block @click="startVote">发起</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'

import { createVote, endVote, fetchVotes, submitVote, type VoteItem } from '../../api/votes'
import VotePanel from '../../components/meeting/VotePanel.vue'
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
const authStore = useAuthStore()
const meetingId = Number(route.params.id)
const roomCode = route.query.code as string || 'N/A'
const wsClient = new WsClient()
const peerConnections = new Map<string, RTCPeerConnection>()
const remoteStreams = ref<RemoteStreamItem[]>([])
const localStream = ref<MediaStream | null>(null)
const screenStream = ref<MediaStream | null>(null)
const localVideoRef = ref<HTMLVideoElement | null>(null)
const screenVideoRef = ref<HTMLVideoElement | null>(null)
const showVoteDialog = ref(false)
const submitted = ref(false)
const votes = ref<VoteItem[]>([])
const voteResults = ref<Array<{ id: number; content: string; count: number; ratio: number }>>([])
const voteForm = reactive({
  topic: '',
  options: [{ content: '赞成' }, { content: '反对' }, { content: '弃权' }]
})
const onlineUsers = ref<OnlineUser[]>([])
const activeSidePanel = ref<'chat' | 'doc' | 'minutes' | 'vote' | null>(null)

// Mobile specific state
const showMoreSheet = ref(false)
const showMembersDrawer = ref(false)
const showChatDrawer = ref(false)
const showVoteDrawer = ref(false)
const showScreenInMain = ref(false)
const isMuted = ref(false)
const isHandRaisedLocal = ref(false)

const canStartVote = computed(() => ['admin', 'host'].includes(authStore.role))
const canEndVote = computed(() => canStartVote.value && activeVote.value?.status === 'voting')
const activeVote = computed(() => votes.value[0] || null)
const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`
const selfName = authStore.user?.username || '匿名用户'

const moreActions = computed(() => [
  { name: '成员列表', icon: 'friends-o' },
  { name: '聊天', icon: 'chat-o' },
  { name: '表决', icon: 'todo-list-o' },
  { name: '桌面共享', icon: 'tv-o' }
])

const getUserDisplayName = (connId: string) => {
  const user = onlineUsers.value.find(u => u.id === connId)
  return user?.display_name || `远端成员 ${connId.slice(-4)}`
}

const isHandRaised = (connId: string) => {
  const user = onlineUsers.value.find(u => u.id === connId)
  return user?.hand_raised || false
}

const setVideoStream = (el: HTMLVideoElement | null, stream: MediaStream | null) => {
  if (el) el.srcObject = stream
}

const checkMediaDevices = (): boolean => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('摄像头/麦克风不可用：请使用 HTTPS 或 localhost 访问')
    return false
  }
  return true
}

const addStreamToPeers = (stream: MediaStream) => {
  peerConnections.forEach((pc) => {
    const senderTrackIds = new Set(pc.getSenders().map((sender) => sender.track?.id).filter(Boolean))
    stream.getTracks().forEach((track) => {
      if (!senderTrackIds.has(track.id)) {
        pc.addTrack(track, stream)
      }
    })
  })
}

const removeStreamFromPeers = (stream: MediaStream | null) => {
  if (!stream) return
  const trackIds = new Set(stream.getTracks().map((track) => track.id))
  peerConnections.forEach((pc) => {
    pc.getSenders()
      .filter((sender) => sender.track && trackIds.has(sender.track.id))
      .forEach((sender) => pc.removeTrack(sender))
  })
}

const cleanupStream = (
  streamRef: typeof localStream | typeof screenStream,
  videoRef: typeof localVideoRef | typeof screenVideoRef
) => {
  removeStreamFromPeers(streamRef.value)
  streamRef.value?.getTracks().forEach((track) => {
    track.onended = null
    track.stop()
  })
  streamRef.value = null
  setVideoStream(videoRef.value, null)
}

const resetVoteState = () => {
  submitted.value = false
  voteResults.value = []
}

const syncVoteState = (vote: VoteItem | null) => {
  submitted.value = !!vote?.submitted
  voteResults.value = vote?.results ?? []
}

const upsertVote = (vote: VoteItem) => {
  votes.value = [vote, ...votes.value.filter((item) => item.id !== vote.id)]
}

const createPeerConnection = (peerId: string) => {
  if (peerConnections.has(peerId)) return peerConnections.get(peerId)!

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  })

  localStream.value?.getTracks().forEach((track) => pc.addTrack(track, localStream.value!))
  screenStream.value?.getTracks().forEach((track) => pc.addTrack(track, screenStream.value!))

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      wsClient.send({ type: 'ice-candidate', from: selfId, to: peerId, candidate: event.candidate })
    }
  }

  pc.ontrack = (event) => {
    const [stream] = event.streams
    const exists = remoteStreams.value.find((item) => item.id === peerId)
    if (!exists) {
      remoteStreams.value.push({ id: peerId, mediaStream: stream })
    }
  }

  peerConnections.set(peerId, pc)
  return pc
}

const bindRemoteVideo = (el: HTMLVideoElement | null, stream: MediaStream) => {
  setVideoStream(el, stream)
}

const stopCamera = () => {
  cleanupStream(localStream, localVideoRef)
}

const stopScreenShare = () => {
  cleanupStream(screenStream, screenVideoRef)
}

const openCamera = async () => {
  if (localStream.value) return
  if (!checkMediaDevices()) return

  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    setVideoStream(localVideoRef.value, localStream.value)
    addStreamToPeers(localStream.value)
    showToast('已打开摄像头和麦克风')
  } catch (error) {
    console.error('Failed to access camera/microphone:', error)
    showToast('无法访问摄像头或麦克风')
  }
}

const shareScreen = async () => {
  if (screenStream.value) return
  if (!checkMediaDevices()) return

  try {
    screenStream.value = await navigator.mediaDevices.getDisplayMedia({ video: true })
    const [screenTrack] = screenStream.value.getVideoTracks()
    if (screenTrack) {
      screenTrack.onended = () => {
        stopScreenShare()
      }
    }
    setVideoStream(screenVideoRef.value, screenStream.value)
    addStreamToPeers(screenStream.value)
    showToast('已开启桌面共享')
  } catch (error) {
    console.error('Failed to share screen:', error)
    showToast('无法开启屏幕共享')
  }
}

const toggleCamera = async () => {
  if (localStream.value) {
    stopCamera()
    showToast('已关闭摄像头和麦克风')
    return
  }
  await openCamera()
}

const toggleScreenShare = async () => {
  if (screenStream.value) {
    stopScreenShare()
    showToast('已停止桌面共享')
    return
  }
  await shareScreen()
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

const switchMainVideo = (stream: RemoteStreamItem) => {
  // Could implement switching main video to selected remote stream
  console.log('Switch to:', stream.id)
}

const handleLeave = () => {
  stopCamera()
  stopScreenShare()
  wsClient.send({ type: 'leave', from: selfId })
  wsClient.close()
  peerConnections.forEach((pc) => pc.close())
  window.history.back()
}

const onMoreActionSelect = (action: { name: string }) => {
  showMoreSheet.value = false
  if (action.name === '成员列表') {
    showMembersDrawer.value = true
  } else if (action.name === '聊天') {
    showChatDrawer.value = true
  } else if (action.name === '表决') {
    showVoteDrawer.value = true
  } else if (action.name === '桌面共享') {
    toggleScreenShare()
  }
}

const handleSignalMessage = async (raw: MessageEvent<string>) => {
  const payload = JSON.parse(raw.data)
  if (payload.from === selfId) return

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
  if (payload.type === 'join') {
    const pc = createPeerConnection(payload.from)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    wsClient.send({ type: 'offer', from: selfId, to: payload.from, sdp: offer })
  }

  if (payload.to !== selfId) {
    if (payload.type === 'vote-started') {
      upsertVote(payload.vote)
    }
    if (payload.type === 'vote-result' && activeVote.value?.id === payload.voteId) {
      voteResults.value = payload.options
    }
    if (payload.type === 'vote-ended' && activeVote.value?.id === payload.voteId) {
      const currentVote = activeVote.value
      if (currentVote) {
        currentVote.status = 'ended'
        currentVote.results = payload.results
      }
      voteResults.value = payload.results
    }
    return
  }

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
  await wsClient.connect(`${wsProtocol}//${window.location.host}/ws/meetings/${meetingId}`, handleSignalMessage)
  wsClient.send({
    type: 'join',
    from: selfId,
    user_id: authStore.user?.id || 0,
    display_name: selfName,
    role: authStore.role || 'user'
  })
}

const loadVotes = async () => {
  votes.value = await fetchVotes(meetingId)
}

watch(activeVote, (vote) => {
  syncVoteState(vote)
}, { immediate: true })

const startVote = async () => {
  await createVote({
    meeting_id: meetingId,
    topic: voteForm.topic,
    options: voteForm.options
  })
  showVoteDialog.value = false
  voteForm.topic = ''
  resetVoteState()
  showToast('表决已发起')
}

const handleVoteSubmit = async (optionId: number) => {
  if (!activeVote.value) return
  const voteId = activeVote.value.id
  const result = await submitVote(voteId, optionId)
  if (activeVote.value?.id === voteId) {
    voteResults.value = result.options
    submitted.value = true
    const currentVote = activeVote.value
    if (currentVote) {
      currentVote.submitted = true
      currentVote.results = result.options
    }
  }
  showToast('投票成功')
}

const handleEndVote = async () => {
  if (!activeVote.value) return
  const voteId = activeVote.value.id
  const result = await endVote(voteId)
  if (activeVote.value?.id === voteId) {
    const currentVote = activeVote.value
    if (currentVote) {
      currentVote.status = 'ended'
      currentVote.results = result.results
    }
    voteResults.value = result.results
  }
  showToast('表决已结束')
}

onMounted(async () => {
  await loadVotes()
  connectRoom()
})

onBeforeUnmount(() => {
  stopCamera()
  stopScreenShare()
  wsClient.close()
  peerConnections.forEach((pc) => pc.close())
})
</script>

<style scoped>
.mobile-meeting-room {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 主视频区域 */
.main-video-area {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.main-video {
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

.video-label {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  border-radius: 4px;
}

.screen-share-container {
  position: absolute;
  top: 60px;
  right: 10px;
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #fff;
}

.screen-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 画中画容器 */
.pip-container {
  position: absolute;
  bottom: 100px;
  left: 0;
  right: 0;
  padding: 0 10px;
}

.pip-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.pip-item {
  flex-shrink: 0;
  width: 80px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 2px solid transparent;
}

.pip-item.has-raised-hand {
  border-color: #ff9800;
}

.pip-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pip-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  font-size: 10px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.raised-hand-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff9800;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* 顶部信息栏 */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background: linear-gradient(rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.room-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.online-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 12px;
}

/* 底部控制栏 */
.bottom-control-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  padding-bottom: calc(15px + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 10px;
  padding: 8px;
  border-radius: 8px;
  min-width: 50px;
}

.control-btn.active {
  color: #22c55e;
}

.control-btn.end-call {
  background: #ef4444;
  border-radius: 50%;
  width: 50px;
  height: 50px;
}

/* 桌面共享浮动按钮 */
.screen-share-fab {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(46, 58, 89, 0.9);
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
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

.chat-area, .vote-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.start-vote-btn {
  padding: 16px;
}

/* 表决表单 */
.vote-form h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #2E3A59;
}

.options-label {
  margin: 12px 0 8px;
  font-size: 14px;
  color: #6b748b;
}

.vote-form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
</style>