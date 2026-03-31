<template>
  <div class="video-player">
    <video ref="videoRef" :src="src" class="video-element" @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata" />
    <div class="controls">
      <button class="control-btn" @click="togglePlay">
        <span v-if="isPlaying">暂停</span>
        <span v-else>播放</span>
      </button>
      <div class="progress-bar" @click="seek">
        <div class="progress-fill" :style="{ width: `${progress}%` }" />
      </div>
      <div class="time-display">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
      <div class="volume-control">
        <button class="control-btn" @click="toggleMute">
          {{ isMuted ? '静音' : '音量' }}
        </button>
        <input type="range" min="0" max="100" :value="volume" @input="setVolume" class="volume-slider" />
      </div>
      <button class="control-btn" @click="toggleFullscreen">全屏</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  src: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(80)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)

watch(() => props.src, () => {
  isPlaying.value = false
  currentTime.value = 0
  progress.value = 0
})

const togglePlay = () => {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const toggleMute = () => {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
}

const setVolume = (e: Event) => {
  const target = e.target as HTMLInputElement
  volume.value = Number(target.value)
  if (videoRef.value) {
    videoRef.value.volume = volume.value / 100
  }
}

const onTimeUpdate = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  progress.value = (currentTime.value / duration.value) * 100 || 0
}

const onLoadedMetadata = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

const seek = (e: MouseEvent) => {
  if (!videoRef.value) return
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

const toggleFullscreen = () => {
  if (!videoRef.value) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    videoRef.value.requestFullscreen()
  }
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
</script>

<style scoped>
.video-player {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  display: block;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(46, 58, 89, 0.95);
}

.control-btn {
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #22c55e 100%);
  border-radius: 3px;
  transition: width 0.1s ease;
}

.time-display {
  font-size: 12px;
  color: white;
  font-weight: 500;
  white-space: nowrap;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.volume-slider {
  width: 60px;
  height: 4px;
  appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}
</style>