<template>
  <div class="room-page app-page">
    <div class="room-head">
      <div>
        <div class="room-eyebrow">Meeting console</div>
        <h1>会议室 #{{ meetingId }}</h1>
        <p>统一管理本地音视频、桌面共享、远端参会流与在线表决。</p>
      </div>
    </div>

    <div class="room-summary">
      <div class="summary-item">
        <div class="summary-label">本地设备</div>
        <div class="summary-value">{{ localStream ? '已接入' : '未开启' }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">桌面共享</div>
        <div class="summary-value">{{ screenStream ? '共享中' : '未共享' }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">远端成员</div>
        <div class="summary-value">{{ remoteStreams.length }}</div>
      </div>
    </div>

    <div class="room-layout">
      <div class="media-section">
        <div class="video-grid">
          <MediaTile class="media-tile-main" title="本地画面" subtitle="摄像头与麦克风" :empty="!localStream" empty-text="尚未开启本地设备">
            <video ref="localVideoRef" autoplay muted playsinline />
          </MediaTile>

          <MediaTile class="media-tile-main" title="桌面共享" subtitle="屏幕内容同步" :empty="!screenStream" empty-text="尚未开启桌面共享" icon="◌">
            <video ref="screenVideoRef" autoplay muted playsinline />
          </MediaTile>

          <MediaTile
            v-for="stream in remoteStreams"
            :key="stream.id"
            :title="`远端成员 ${stream.id.slice(-4)}`"
            subtitle="实时参会流"
          >
            <video
              autoplay
              playsinline
              :ref="(el) => bindRemoteVideo(el as HTMLVideoElement | null, stream.mediaStream)"
            />
          </MediaTile>
        </div>

        <div class="floating-toolbar">
          <el-button type="primary" @click="toggleCamera">
            {{ localStream ? '关闭摄像头/麦克风' : '打开摄像头/麦克风' }}
          </el-button>
          <el-button @click="toggleScreenShare">
            {{ screenStream ? '停止桌面共享' : '桌面共享' }}
          </el-button>
          <el-button v-if="canStartVote" @click="showVoteDialog = true">发起表决</el-button>
        </div>
      </div>

      <div class="side-section">
        <VotePanel :active-vote="activeVote" :results="voteResults" :submitted="submitted" @submit="handleVoteSubmit" />
      </div>
    </div>

    <el-dialog v-model="showVoteDialog" title="发起表决" width="560px">
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="主题">
          <el-input v-model="voteForm.topic" placeholder="请输入表决主题" />
        </el-form-item>
        <el-form-item label="选项">
          <el-space direction="vertical" style="width: 100%">
            <el-input v-for="(item, index) in voteForm.options" :key="index" v-model="item.content" />
          </el-space>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showVoteDialog = false">取消</el-button>
        <el-button type="primary" @click="startVote">发起</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

import { createVote, fetchVotes, submitVote, type VoteItem } from '../../api/votes'
import MediaTile from '../../components/media/MediaTile.vue'
import VotePanel from '../../components/meeting/VotePanel.vue'
import { useAuthStore } from '../../stores/auth'
import { WsClient } from '../../utils/ws'

interface RemoteStreamItem {
  id: string
  mediaStream: MediaStream
}

const route = useRoute()
const authStore = useAuthStore()
const meetingId = Number(route.params.id)
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

const canStartVote = computed(() => ['admin', 'host'].includes(authStore.role))
const activeVote = computed(() => votes.value[0] || null)
const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`

const setVideoStream = (el: HTMLVideoElement | null, stream: MediaStream | null) => {
  if (el) el.srcObject = stream
}

const checkMediaDevices = (): boolean => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    ElMessage.error('摄像头/麦克风不可用：请使用 HTTPS 或 localhost 访问')
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
    ElMessage.success('已打开摄像头和麦克风')
  } catch (error) {
    console.error('Failed to access camera/microphone:', error)
    ElMessage.error('无法访问摄像头或麦克风，请检查权限设置')
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
    ElMessage.success('已开启桌面共享')
  } catch (error) {
    console.error('Failed to share screen:', error)
    ElMessage.error('无法开启屏幕共享，请检查权限设置')
  }
}

const toggleCamera = async () => {
  if (localStream.value) {
    stopCamera()
    ElMessage.success('已关闭摄像头和麦克风')
    return
  }
  await openCamera()
}

const toggleScreenShare = async () => {
  if (screenStream.value) {
    stopScreenShare()
    ElMessage.success('已停止桌面共享')
    return
  }
  await shareScreen()
}

const handleSignalMessage = async (raw: MessageEvent<string>) => {
  const payload = JSON.parse(raw.data)
  if (payload.from === selfId) return

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
  wsClient.send({ type: 'join', from: selfId })
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
  ElMessage.success('表决已发起')
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
  ElMessage.success('投票成功')
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
.room-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}
.room-eyebrow {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.room-head h1 {
  margin: 10px 0 0;
  font-size: clamp(30px, 4vw, 36px);
  line-height: 1.03;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
}
.room-head p {
  margin: 12px 0 0;
  color: var(--color-text-muted);
  line-height: 1.7;
  max-width: 720px;
}
.room-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.summary-item {
  padding: 20px 22px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.68) 100%);
  border: 1px solid rgba(46, 58, 89, 0.1);
  box-shadow: 0 16px 36px rgba(26, 31, 59, 0.06);
  backdrop-filter: blur(16px);
}
.summary-label {
  color: var(--color-text-muted);
  font-size: 13px;
}
.summary-value {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.room-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  align-items: start;
}
.media-section,
.side-section {
  min-width: 0;
}
.video-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.media-tile-main {
  min-height: 420px;
}
.floating-toolbar {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.74) 0%, rgba(247, 249, 252, 0.9) 100%);
  border: 1px solid rgba(46, 58, 89, 0.1);
  box-shadow: 0 20px 40px rgba(26, 31, 59, 0.08);
  backdrop-filter: blur(18px);
}
.dialog-form {
  padding-top: 8px;
}
@media (max-width: 1200px) {
  .room-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 900px) {
  .room-summary,
  .video-grid {
    grid-template-columns: 1fr;
  }

  .media-tile-main {
    min-height: 340px;
  }
}
@media (max-width: 720px) {
  .room-head {
    flex-direction: column;
  }
}
</style>
