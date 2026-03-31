<template>
  <div class="dashboard-view">
    <div class="calendar-section">
      <el-calendar v-model="selectedDate">
        <template #dateCell="{ data }">
          <div class="calendar-cell" :class="{ 'has-meeting': hasMeetingOnDate(data.day) }">
            {{ data.day.split('-')[2] }}
          </div>
        </template>
      </el-calendar>
    </div>

    <div class="meeting-list-section">
      <div class="section-header">
        <h3>{{ formatSelectedDate }} 会议议程</h3>
        <span class="meeting-count">{{ todayMeetings.length }} 场会议</span>
      </div>

      <div v-if="todayMeetings.length === 0" class="empty-state">
        <el-empty description="当日暂无会议安排" />
      </div>

      <div v-else class="meeting-list">
        <div v-for="meeting in todayMeetings" :key="meeting.id" class="meeting-card">
          <div class="meeting-time">
            {{ formatTime(meeting.start_time) }} - {{ formatTime(meeting.end_time) }}
          </div>
          <div class="meeting-info">
            <h4 class="meeting-title">{{ meeting.title }}</h4>
            <div class="meeting-status" :class="meeting.status">
              {{ statusLabel(meeting.status) }}
            </div>
          </div>
          <router-link :to="`/meetings/${meeting.id}`" class="meeting-link">
            进入会议
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchMeetings, type MeetingItem } from '../../api/meetings'

const meetings = ref<MeetingItem[]>([])
const selectedDate = ref(new Date())

onMounted(async () => {
  meetings.value = await fetchMeetings()
})

const meetingDates = computed(() => {
  const dates = new Set<string>()
  meetings.value.forEach(m => {
    const date = m.start_time.split('T')[0]
    dates.add(date)
  })
  return dates
})

const hasMeetingOnDate = (dateStr: string) => {
  return meetingDates.value.has(dateStr)
}

const todayMeetings = computed(() => {
  const selectedDateStr = selectedDate.value.toISOString().split('T')[0]
  return meetings.value.filter(m => m.start_time.startsWith(selectedDateStr))
})

const formatSelectedDate = computed(() => {
  const d = selectedDate.value
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
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
</script>

<style scoped>
.dashboard-view {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  min-height: calc(100vh - 180px);
}

.calendar-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(46, 58, 89, 0.12);
  box-shadow: 0 4px 12px rgba(26, 31, 59, 0.08);
}

.calendar-cell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.calendar-cell.has-meeting {
  background: linear-gradient(135deg, #2E3A59 0%, #4a5a8a 100%);
  color: white;
  font-weight: 600;
}

.meeting-list-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(46, 58, 89, 0.12);
  box-shadow: 0 4px 12px rgba(26, 31, 59, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #2E3A59;
}

.meeting-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.empty-state {
  padding: 40px 0;
}

.meeting-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meeting-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  border-radius: 16px;
  background: rgba(247, 249, 252, 0.8);
  border: 1px solid rgba(46, 58, 89, 0.08);
  transition: all 0.2s ease;
}

.meeting-card:hover {
  background: rgba(247, 249, 252, 1);
  box-shadow: 0 4px 12px rgba(26, 31, 59, 0.1);
}

.meeting-time {
  font-size: 14px;
  font-weight: 600;
  color: #2E3A59;
  white-space: nowrap;
}

.meeting-info {
  flex: 1;
  min-width: 0;
}

.meeting-title {
  font-size: 16px;
  font-weight: 600;
  color: #2E3A59;
  margin: 0;
}

.meeting-status {
  display: inline-block;
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.meeting-status.scheduled {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.meeting-status.ongoing {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.meeting-status.ended {
  background: rgba(107, 114, 128, 0.15);
  color: #6b7280;
}

.meeting-link {
  padding: 8px 16px;
  border-radius: 12px;
  background: #2E3A59;
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.meeting-link:hover {
  background: #3d4d72;
}
</style>