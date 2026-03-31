<template>
  <div class="h5-dashboard">
    <div class="calendar-section">
      <van-calendar
        :show-title="true"
        :poppable="false"
        :show-confirm="false"
        :min-date="minDate"
        :max-date="maxDate"
        @select="onDateSelect"
      />
    </div>

    <div class="meeting-section">
      <div class="section-header">
        <h3>{{ formatSelectedDate }} 会议议程</h3>
        <span class="meeting-count">{{ todayMeetings.length }} 场会议</span>
      </div>

      <van-list v-if="todayMeetings.length > 0">
        <van-card
          v-for="meeting in todayMeetings"
          :key="meeting.id"
          class="meeting-card"
        >
          <template #title>
            <div class="meeting-title">{{ meeting.title }}</div>
          </template>
          <template #desc>
            <div class="meeting-time">
              {{ formatTime(meeting.start_time) }} - {{ formatTime(meeting.end_time) }}
            </div>
          </template>
          <template #tags>
            <van-tag :type="getStatusType(meeting.status)" size="medium">
              {{ statusLabel(meeting.status) }}
            </van-tag>
          </template>
          <template #footer>
            <van-button size="small" type="primary" @click="enterMeeting(meeting.id)">
              进入会议
            </van-button>
          </template>
        </van-card>
      </van-list>

      <van-empty v-else description="当日暂无会议安排" />
    </div>

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
import { fetchMeetings, type MeetingItem } from '../../api/meetings'

const router = useRouter()
const meetings = ref<MeetingItem[]>([])
const selectedDate = ref(new Date())
const activeTab = ref(0)

const minDate = new Date(2020, 0, 1)
const maxDate = new Date(2030, 11, 31)

onMounted(async () => {
  meetings.value = await fetchMeetings()
})

const onDateSelect = (date: Date) => {
  selectedDate.value = date
}

const todayMeetings = computed(() => {
  const selectedDateStr = selectedDate.value.toISOString().split('T')[0]
  return meetings.value.filter(m => m.start_time.startsWith(selectedDateStr))
})

const formatSelectedDate = computed(() => {
  const d = selectedDate.value
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const formatTime = (datetime: string) => {
  const d = new Date(datetime)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    scheduled: '已预约',
    ongoing: '进行中',
    ended: '已结束'
  }
  return labels[status] || status
}

const getStatusType = (status: string): 'primary' | 'success' | 'default' => {
  const types: Record<string, 'primary' | 'success' | 'default'> = {
    scheduled: 'primary',
    ongoing: 'success',
    ended: 'default'
  }
  return types[status] || 'default'
}

const enterMeeting = (id: number) => {
  router.push(`/meetings/${id}`)
}
</script>

<style scoped>
.h5-dashboard {
  min-height: 100vh;
  padding-bottom: 50px;
  background: #f4f6f8;
}

.calendar-section {
  background: white;
  margin-bottom: 12px;
}

.meeting-section {
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2E3A59;
  margin: 0;
}

.meeting-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.meeting-card {
  margin-bottom: 12px;
  background: white;
  border-radius: 12px;
}

.meeting-title {
  font-size: 16px;
  font-weight: 600;
  color: #2E3A59;
}

.meeting-time {
  font-size: 14px;
  color: #6b748b;
  margin-top: 4px;
}
</style>