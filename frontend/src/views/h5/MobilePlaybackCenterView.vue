<template>
  <div class="mobile-playback-center">
    <!-- 顶部标题区 -->
    <div class="page-header">
      <h1>回放中心</h1>
      <p>查看会议与直播的历史录制内容</p>
    </div>

    <!-- Tab 切换 -->
    <van-tabs v-model:active="activeTab" sticky shrink>
      <van-tab title="会议回放">
        <div class="playback-list">
          <van-loading v-if="meetingLoading" class="loading-center" />

          <van-empty v-else-if="meetingPlaybacks.length === 0" description="暂无会议回放" />

          <div v-else class="card-list">
            <div v-for="playback in meetingPlaybacks" :key="playback.id" class="playback-card">
              <div class="card-header">
                <h3 class="playback-title">{{ playback.title }}</h3>
                <van-tag type="primary" size="medium">会议</van-tag>
              </div>
              <div class="card-body">
                <div class="info-row">
                  <van-icon name="clock-o" />
                  <span>{{ formatDateTime(playback.start_time) }}</span>
                </div>
              </div>
              <div class="card-footer">
                <van-button type="primary" size="small" block @click="playVideo(playback)">
                  播放视频
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="直播回放">
        <div class="playback-list">
          <van-loading v-if="liveLoading" class="loading-center" />

          <van-empty v-else-if="livePlaybacks.length === 0" description="暂无直播回放" />

          <div v-else class="card-list">
            <div v-for="playback in livePlaybacks" :key="playback.id" class="playback-card">
              <div class="card-header">
                <h3 class="playback-title">{{ playback.title }}</h3>
                <van-tag type="danger" size="medium">直播</van-tag>
              </div>
              <div class="card-body">
                <div class="info-row">
                  <van-icon name="clock-o" />
                  <span>{{ formatDateTime(playback.start_time) }}</span>
                </div>
              </div>
              <div class="card-footer">
                <van-button type="primary" size="small" block @click="playVideo(playback)">
                  播放视频
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 视频播放弹窗（全屏） -->
    <van-popup
      v-model:show="showPlayer"
      position="bottom"
      :style="{ height: '100%' }"
    >
      <div class="fullscreen-player">
        <div class="player-header">
          <span class="player-title">{{ currentPlayback?.title }}</span>
          <van-icon name="cross" size="24" @click="closePlayer" />
        </div>
        <div class="player-content">
          <video
            v-if="showPlayer && currentPlayback"
            :src="currentPlayback.record_url"
            controls
            autoplay
            playsinline
            class="video-element"
          />
        </div>
        <div class="player-info">
          <div class="info-item">
            <span class="label">类型：</span>
            <span class="value">{{ currentPlayback?.type === 'meeting' ? '会议' : '直播' }}</span>
          </div>
          <div class="info-item">
            <span class="label">时间：</span>
            <span class="value">{{ formatDateTime(currentPlayback?.start_time || '') }}</span>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 底部导航 -->
    <van-tabbar v-model="tabbarActive" fixed>
      <van-tabbar-item icon="calendar-o" to="/dashboard">日程</van-tabbar-item>
      <van-tabbar-item icon="video-o" to="/meetings">会议</van-tabbar-item>
      <van-tabbar-item icon="play-circle-o" to="/live">直播</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { fetchMeetingPlaybacks, fetchLivePlaybacks, type PlaybackItem } from '../../api/playback'

const activeTab = ref(0)
const tabbarActive = ref(0)

// Meeting playbacks
const meetingPlaybacks = ref<PlaybackItem[]>([])
const meetingLoading = ref(false)

// Live playbacks
const livePlaybacks = ref<PlaybackItem[]>([])
const liveLoading = ref(false)

// Video player
const showPlayer = ref(false)
const currentPlayback = ref<PlaybackItem | null>(null)

// 加载数据
const loadMeetingPlaybacks = async () => {
  meetingLoading.value = true
  try {
    meetingPlaybacks.value = await fetchMeetingPlaybacks()
  } finally {
    meetingLoading.value = false
  }
}

const loadLivePlaybacks = async () => {
  liveLoading.value = true
  try {
    livePlaybacks.value = await fetchLivePlaybacks()
  } finally {
    liveLoading.value = false
  }
}

// 工具函数
const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  const d = new Date(datetime)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 播放视频
const playVideo = (playback: PlaybackItem) => {
  currentPlayback.value = playback
  showPlayer.value = true
}

const closePlayer = () => {
  showPlayer.value = false
  currentPlayback.value = null
}

onMounted(async () => {
  await Promise.all([
    loadMeetingPlaybacks(),
    loadLivePlaybacks()
  ])
})
</script>

<style scoped>
.mobile-playback-center {
  min-height: 100vh;
  padding-bottom: 50px;
  background: #f4f6f8;
}

.page-header {
  padding: 20px 16px;
  background: white;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #2E3A59;
  margin: 0;
}

.page-header p {
  font-size: 14px;
  color: #6b748b;
  margin: 8px 0 0;
}

.playback-list {
  padding: 16px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.playback-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.playback-title {
  font-size: 16px;
  font-weight: 600;
  color: #2E3A59;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-body {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b748b;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid #eee;
}

/* 全屏播放器样式 */
.fullscreen-player {
  height: 100%;
  background: #000;
  display: flex;
  flex-direction: column;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #1a1a1a;
  color: white;
}

.player-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.player-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.player-info {
  padding: 16px;
  background: #1a1a1a;
}

.info-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  color: white;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #999;
  font-size: 14px;
}

.value {
  color: white;
  font-size: 14px;
  font-weight: 500;
}
</style>