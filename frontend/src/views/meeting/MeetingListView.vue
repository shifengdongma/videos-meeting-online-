<template>
  <div class="meeting-page app-page">
    <PageHeader
      eyebrow="Meeting center"
      title="会议中心"
      description="统一查看会议安排、当前状态与会议入口，支持主持人快速创建新的会议房间。"
    >
      <template #actions>
        <el-button v-if="canCreate" type="primary" size="large" @click="dialogVisible = true">创建会议</el-button>
      </template>
    </PageHeader>

    <div class="summary-grid app-summary-grid" data-columns="4">
      <SummaryCard label="全部会议" :value="meetings.length" description="当前系统内可访问的会议总数" tone="primary" />
      <SummaryCard label="进行中" :value="ongoingCount" hint="实时进行" description="正在使用会议室的场次" tone="warning" />
      <SummaryCard label="待开始" :value="scheduledCount" description="已排期、等待进入的会议" tone="success" />
      <SummaryCard label="已结束" :value="endedCount" description="已完成的历史会议" tone="danger" />
    </div>

    <el-card class="table-card app-table-card" shadow="never">
      <el-table :data="meetings" v-loading="loading">
        <el-table-column prop="title" label="主题" min-width="220" />
        <el-table-column prop="start_time" label="开始时间" min-width="180" />
        <el-table-column prop="end_time" label="结束时间" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <StatusTag :text="statusText(scope.row.status)" :status="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button class="enter-button" type="primary" @click="openMeeting(scope.row.id)">进入会议室</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && !meetings.length" description="当前还没有会议，可先创建一场新的会议。">
        <template #actions>
          <el-button v-if="canCreate" type="primary" @click="dialogVisible = true">创建会议</el-button>
        </template>
      </EmptyState>
    </el-card>

    <el-dialog v-model="dialogVisible" title="创建会议" width="560px">
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="会议主题">
          <el-input v-model="form.title" placeholder="例如：月度项目评审会" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="form.start_time" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" class="time-picker" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="form.end_time" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" class="time-picker" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import PageHeader from '../../components/layout/PageHeader.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import StatusTag from '../../components/ui/StatusTag.vue'
import SummaryCard from '../../components/ui/SummaryCard.vue'
import { createMeeting, fetchMeetings, type MeetingItem } from '../../api/meetings'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const meetings = ref<MeetingItem[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = reactive({ title: '', start_time: '', end_time: '', record_url: '' as string | null })
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role))

const ongoingCount = computed(() => meetings.value.filter((item) => item.status === 'ongoing').length)
const scheduledCount = computed(() => meetings.value.filter((item) => item.status === 'scheduled').length)
const endedCount = computed(() => meetings.value.filter((item) => item.status === 'ended').length)

const statusText = (status: string) => {
  if (status === 'ongoing') return '进行中'
  if (status === 'scheduled') return '待开始'
  if (status === 'ended') return '已结束'
  return '未知状态'
}

const loadMeetings = async () => {
  loading.value = true
  try {
    meetings.value = await fetchMeetings()
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  await createMeeting(form)
  ElMessage.success('会议创建成功')
  dialogVisible.value = false
  form.title = ''
  form.start_time = ''
  form.end_time = ''
  await loadMeetings()
}

const openMeeting = (meetingId: number) => {
  router.push(`/meetings/${meetingId}`)
}

onMounted(loadMeetings)
</script>

<style scoped>
.dialog-form {
  padding-top: 8px;
}
.time-picker {
  width: 100%;
}
</style>
