<template>
  <div class="live-room-page app-page">
    <div class="live-head">
      <div>
        <div class="live-eyebrow">Live console</div>
        <h1>直播间 #{{ liveId }}</h1>
        <p>主播可在此快速开启采集，观众可直接查看主画面与远端流状态。</p>
      </div>
      <div class="live-actions">
        <el-button v-if="canPublish" type="primary" @click="startPublish">开始采集</el-button>
      </div>
    </div>

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
        <div class="summary-label">远端流数量</div>
        <div class="summary-value">{{ remoteStreams.length }}</div>
      </div>
    </div>

    <div class="video-grid">
      <MediaTile
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
        :title="`远端流 ${stream.id.slice(-4)}`"
        subtitle="实时直播连接"
      >
        <video
          autoplay
          playsinline
          :ref="(el) => bindRemoteVideo(el as HTMLVideoElement | null, stream.mediaStream)"
        />
      </MediaTile>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

import MediaTile from '../../components/media/MediaTile.vue'
import { useAuthStore } from '../../stores/auth'
import { WsClient } from '../../utils/ws'

interface RemoteStreamItem {
  id: string
  mediaStream: MediaStream
}

const route = useRoute()
const authStore = useAuthStore()
const liveId = Number(route.params.id)
const wsClient = new WsClient()
const peerConnections = new Map<string, RTCPeerConnection>()
const remoteStreams = ref<RemoteStreamItem[]>([])
const localVideoRef = ref<HTMLVideoElement | null>(null)
const localStream = ref<MediaStream | null>(null)
const selfId = `${authStore.user?.id || 'guest'}-${Math.random().toString(36).slice(2, 8)}`
const canPublish = computed(() => ['admin', 'host'].includes(authStore.role))

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
  localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  if (localVideoRef.value) localVideoRef.value.srcObject = localStream.value
  ElMessage.success('主播流已准备')
}

const handleSignalMessage = async (raw: MessageEvent<string>) => {
  const payload = JSON.parse(raw.data)
  if (payload.from === selfId) return

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

onMounted(() => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  wsClient.connect(`${wsProtocol}//${window.location.host}/ws/live/${liveId}`, handleSignalMessage)
  setTimeout(() => wsClient.send({ type: 'join', from: selfId }), 300)
})

onBeforeUnmount(() => {
  wsClient.close()
  peerConnections.forEach((pc) => pc.close())
})
</script>

<style scoped>
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
.video-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
@media (max-width: 900px) {
  .live-summary,
  .video-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .live-head {
    flex-direction: column;
  }
}
</style>
