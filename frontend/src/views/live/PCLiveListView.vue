<template>
  <div class="live-page app-page">
    <PageHeader
      eyebrow="Live center"
      title="直播中心"
      description="集中管理直播房间、查看房间号，并为主播与观众提供统一的进入入口。"
    >
      <template #actions>
        <el-button v-if="canCreate" type="primary" size="large" @click="createStream">开启直播</el-button>
      </template>
    </PageHeader>

    <div class="summary-grid app-summary-grid" data-columns="3">
      <SummaryCard label="全部直播" :value="streams.length" description="当前可访问的直播场次" tone="primary" />
      <SummaryCard label="可立即进入" :value="streams.length" hint="在线可用" description="已创建完成，可直接进入直播间" tone="warning" />
      <SummaryCard label="主播权限" :value="canCreate ? '已开启' : '未开启'" description="当前账号是否可发起直播" tone="success" />
    </div>

    <el-card class="table-card app-table-card" shadow="never">
      <el-table :data="streams" v-loading="loading">
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column prop="room_code" label="房间号" min-width="150" />
        <el-table-column prop="start_time" label="开始时间" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default>
            <StatusTag text="直播中" status="live" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button class="enter-button" type="primary" @click="openStream(scope.row.id)">进入直播间</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && !streams.length" description="当前还没有直播，可先创建一个直播房间。">
        <template #actions>
          <el-button v-if="canCreate" type="primary" @click="createStream">开启直播</el-button>
        </template>
      </EmptyState>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

import PageHeader from '../../components/layout/PageHeader.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import StatusTag from '../../components/ui/StatusTag.vue'
import SummaryCard from '../../components/ui/SummaryCard.vue'
import { createLiveStream, fetchLiveStreams, type LiveItem } from '../../api/live'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)
const streams = ref<LiveItem[]>([])
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role))

const loadStreams = async () => {
  loading.value = true
  try {
    streams.value = await fetchLiveStreams()
  } finally {
    loading.value = false
  }
}

const createStream = async () => {
  const title = await ElMessageBox.prompt('请输入直播标题', '开启直播')
  await createLiveStream({ title: title.value })
  ElMessage.success('直播已开启')
  await loadStreams()
}

const openStream = (streamId: number) => {
  router.push(`/live/${streamId}`)
}

onMounted(loadStreams)
</script>

<style scoped>
.enter-button {
  min-width: 108px;
}
</style>
