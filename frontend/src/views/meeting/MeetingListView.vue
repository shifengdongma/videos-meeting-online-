<template>
  <div class="space-y-8">
    <section class="flex items-start justify-between gap-6 rounded-xl bg-white/70 p-6 shadow-sm ring-1 ring-gray-100 backdrop-blur-sm">
      <div class="max-w-3xl">
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-[#2E3A59]/70">Meeting center</div>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-[#2E3A59]">会议中心</h1>
        <p class="mt-3 text-sm leading-7 text-slate-500">统一查看会议安排、当前状态与会议入口，支持主持人快速创建新的会议房间。</p>
      </div>
      <el-button v-if="canCreate" type="primary" size="large" @click="dialogVisible = true">创建会议</el-button>
    </section>

    <section class="grid grid-cols-4 gap-6">
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">全部会议</div>
        <div class="mt-4 text-4xl font-bold text-[#2E3A59]">{{ meetings.length }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">当前系统内可访问的会议总数</p>
      </article>
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">进行中</div>
        <div class="mt-4 text-4xl font-bold text-[#FBC02D]">{{ ongoingCount }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">正在使用会议室的场次</p>
      </article>
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">待开始</div>
        <div class="mt-4 text-4xl font-bold text-[#1E9E6F]">{{ scheduledCount }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">已排期、等待进入的会议</p>
      </article>
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">已结束</div>
        <div class="mt-4 text-4xl font-bold text-[#E57373]">{{ endedCount }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">已完成的历史会议</p>
      </article>
    </section>

    <section class="overflow-hidden rounded-xl bg-white shadow-sm">
      <el-table :data="meetings" v-loading="loading" class="meeting-table">
        <el-table-column prop="title" label="主题" min-width="220" />
        <el-table-column prop="start_time" label="开始时间" min-width="180" />
        <el-table-column prop="end_time" label="结束时间" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <StatusTag :text="statusText(scope.row.status)" :status="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="168" fixed="right">
          <template #default="scope">
            <button class="enter-button" type="button" @click="openMeeting(scope.row.id)">进入会议室</button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && !meetings.length" description="当前还没有会议，可先创建一场新的会议。">
        <template #actions>
          <el-button v-if="canCreate" type="primary" @click="dialogVisible = true">创建会议</el-button>
        </template>
      </EmptyState>
    </section>

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

import EmptyState from '../../components/ui/EmptyState.vue'
import StatusTag from '../../components/ui/StatusTag.vue'
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

.enter-button {
  display: inline-flex;
  min-height: 40px;
  min-width: 108px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #2E3A59;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  transition: background-color 180ms ease;
}

.enter-button:hover {
  background: #1a2133;
}

.enter-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(46, 58, 89, 0.18);
}

:deep(.meeting-table .el-table__row) {
  transition: background-color 180ms ease;
}

:deep(.meeting-table .el-table__row:hover > td.el-table__cell) {
  background: #f9fafb;
}
</style>
