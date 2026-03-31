<template>
  <div class="mobile-live-list">
    <!-- 顶部标题区 -->
    <div class="page-header">
      <h1>直播中心</h1>
      <p>集中管理直播房间、查看房间号，并为主播与观众提供统一的进入入口</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">全部直播</div>
        <div class="stat-value">{{ streams.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">可立即进入</div>
        <div class="stat-value available">{{ streams.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">主播权限</div>
        <div class="stat-value" :class="canCreate ? 'enabled' : 'disabled'">
          {{ canCreate ? '已开启' : '未开启' }}
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="canCreate" class="action-buttons">
      <van-button type="primary" size="small" block @click="showCreateDialog = true">开启直播</van-button>
    </div>

    <!-- 直播列表 -->
    <div class="live-list">
      <van-loading v-if="loading" class="loading-center" />

      <van-empty v-else-if="streams.length === 0" description="当前还没有直播">
        <van-button v-if="canCreate" type="primary" size="small" @click="showCreateDialog = true">开启直播</van-button>
      </van-empty>

      <div v-else class="card-list">
        <div v-for="stream in streams" :key="stream.id" class="live-card">
          <div class="card-header">
            <h3 class="live-title">{{ stream.title }}</h3>
            <van-tag type="danger" size="medium">直播中</van-tag>
          </div>
          <div class="card-body">
            <div class="info-row">
              <van-icon name="video" />
              <span class="room-code">房间号: {{ stream.room_code }}</span>
            </div>
            <div class="info-row">
              <van-icon name="clock-o" />
              <span>{{ formatDateTime(stream.start_time) }}</span>
            </div>
          </div>
          <div class="card-footer">
            <van-button type="primary" size="small" block @click="enterLiveRoom(stream.id)">
              进入直播间
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 开启直播弹窗 -->
    <van-dialog
      v-model:show="showCreateDialog"
      title="开启直播"
      show-cancel-button
      :before-close="handleCreateLive"
    >
      <van-field
        v-model="newLiveTitle"
        label="直播标题"
        placeholder="请输入直播标题"
        :rules="[{ required: true, message: '请输入直播标题' }]"
      />
    </van-dialog>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item icon="calendar-o" to="/dashboard">日程</van-tabbar-item>
      <van-tabbar-item icon="video-o" to="/meetings">会议</van-tabbar-item>
      <van-tabbar-item icon="play-circle-o" to="/live">直播</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

import { fetchLiveStreams, createLiveStream, type LiveItem } from '../../api/live'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const streams = ref<LiveItem[]>([])
const loading = ref(false)
const activeTab = ref(2)

// Create live stream dialog
const showCreateDialog = ref(false)
const newLiveTitle = ref('')

// 计算属性
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role))

// 工具函数
const formatDateTime = (datetime: string) => {
  const d = new Date(datetime)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 加载数据
const loadStreams = async () => {
  loading.value = true
  try {
    streams.value = await fetchLiveStreams()
  } finally {
    loading.value = false
  }
}

// 操作函数
const enterLiveRoom = (id: number) => {
  router.push(`/live/${id}`)
}

const handleCreateLive = async (action: string) => {
  if (action === 'cancel') {
    newLiveTitle.value = ''
    return true
  }

  if (!newLiveTitle.value.trim()) {
    showToast('请输入直播标题')
    return false
  }

  try {
    await createLiveStream({
      title: newLiveTitle.value,
      record_url: null
    })
    showToast('直播已开启')
    newLiveTitle.value = ''
    await loadStreams()
    return true
  } catch {
    showToast('创建失败')
    return false
  }
}

onMounted(loadStreams)
</script>

<style scoped>
.mobile-live-list {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
}

.stat-card {
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #6b748b;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2E3A59;
  margin-top: 8px;
}

.stat-value.available { color: #FBC02D; }
.stat-value.enabled { color: #1E9E6F; }
.stat-value.disabled { color: #E57373; }

.action-buttons {
  padding: 0 16px 16px;
}

.live-list {
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

.live-card {
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

.live-title {
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
  margin-bottom: 8px;
}

.room-code {
  color: #e57373;
  font-weight: 500;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid #eee;
}
</style>