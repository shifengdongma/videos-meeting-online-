<template>
  <div class="playback-center">
    <el-tabs v-model="activeTab" class="playback-tabs">
      <el-tab-pane label="会议回放" name="meeting">
        <el-table :data="meetingPlaybacks" stripe style="width: 100%">
          <el-table-column prop="title" label="会议标题" min-width="200" />
          <el-table-column prop="start_time" label="开始时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.start_time) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="playVideo(row)">播放</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="直播回放" name="live">
        <el-table :data="livePlaybacks" stripe style="width: 100%">
          <el-table-column prop="title" label="直播标题" min-width="200" />
          <el-table-column prop="start_time" label="开始时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.start_time) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="playVideo(row)">播放</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-drawer v-model="drawerVisible" :title="currentPlayback?.title" size="50%" direction="rtl">
      <div class="drawer-content">
        <VideoPlayer v-if="currentPlayback" :src="currentPlayback.record_url" />
        <div class="playback-info">
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
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchMeetingPlaybacks, fetchLivePlaybacks, type PlaybackItem } from '../api/playback'
import VideoPlayer from '../components/media/VideoPlayer.vue'

const activeTab = ref('meeting')
const meetingPlaybacks = ref<PlaybackItem[]>([])
const livePlaybacks = ref<PlaybackItem[]>([])
const drawerVisible = ref(false)
const currentPlayback = ref<PlaybackItem | null>(null)

onMounted(async () => {
  meetingPlaybacks.value = await fetchMeetingPlaybacks()
  livePlaybacks.value = await fetchLivePlaybacks()
})

const playVideo = (item: PlaybackItem) => {
  currentPlayback.value = item
  drawerVisible.value = true
}

const formatDateTime = (datetime: string) => {
  const d = new Date(datetime)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.playback-center {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(46, 58, 89, 0.12);
  box-shadow: 0 4px 12px rgba(26, 31, 59, 0.08);
}

.playback-tabs {
  margin-bottom: 0;
}

.drawer-content {
  padding: 20px;
}

.playback-info {
  margin-top: 20px;
  padding: 16px;
  background: rgba(247, 249, 252, 0.8);
  border-radius: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.value {
  color: #2E3A59;
  font-size: 14px;
  font-weight: 600;
}

:deep(.el-table) {
  border-radius: 12px;
}

:deep(.el-table th) {
  background: rgba(46, 58, 89, 0.08);
  color: #2E3A59;
  font-weight: 600;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  background: #2E3A59;
  color: white;
}

:deep(.el-drawer__title) {
  color: white;
  font-weight: 600;
}
</style>