<template>
  <div class="meeting-manage-page">
    <!-- 顶部操作栏 -->
    <section class="top-bar">
      <div class="bar-left">
        <el-button type="primary" @click="openCreateDialog">新建会议</el-button>
        <el-input
          v-model="searchTitle"
          placeholder="搜索会议名称"
          clearable
          style="width: 220px"
          @clear="loadMeetings"
          @keyup.enter="loadMeetings"
        >
          <template #append>
            <el-button @click="loadMeetings">搜索</el-button>
          </template>
        </el-input>
      </div>
      <div class="bar-right">
        <span class="stats-item">共 {{ meetings.length }} 场会议</span>
        <span class="stats-item">已发布 {{ publishedCount }} 场</span>
      </div>
    </section>

    <!-- 会议列表 -->
    <section class="meeting-list-section">
      <el-table :data="meetings" v-loading="loading" class="meeting-table" @row-click="selectMeeting">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="会议名称" min-width="200" />
        <el-table-column label="时间" min-width="200">
          <template #default="scope">
            {{ formatDateTime(scope.row.start_time) }} ~ {{ formatDateTime(scope.row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="160">
          <template #default="scope">
            {{ scope.row.address || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <span class="status-badge" :class="scope.row.status">
              {{ statusText(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="发布" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_published ? 'success' : 'info'" size="small">
              {{ scope.row.is_published ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="action-btns">
              <el-button link type="primary" @click.stop="selectMeeting(scope.row)">管理</el-button>
              <el-button link type="primary" @click.stop="togglePublish(scope.row)">
                {{ scope.row.is_published ? '取消发布' : '发布' }}
              </el-button>
              <el-button link type="danger" @click.stop="removeMeeting(scope.row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- 会议详情管理面板 -->
    <el-dialog v-model="detailVisible" title="会议管理" width="1100px" top="5vh" destroy-on-close>
      <div class="detail-panel">
        <!-- 左侧手机预览 -->
        <div class="phone-preview">
          <div class="phone-frame">
            <div class="phone-screen">
              <div class="preview-header">
                <div class="preview-title">{{ selectedMeeting?.title || '会议名称' }}</div>
                <div class="preview-meta">
                  <div class="preview-time">
                    {{ formatDateTime(selectedMeeting?.start_time) }} ~ {{ formatDateTime(selectedMeeting?.end_time) }}
                  </div>
                  <div class="preview-address">{{ selectedMeeting?.address || '会议地点' }}</div>
                </div>
              </div>
              <div class="preview-modules">
                <div class="module-grid">
                  <div
                    v-for="module in activeModules"
                    :key="module.id"
                    class="module-item"
                  >
                    <div class="module-icon">
                      <el-icon :size="28">
                        <component :is="getIconComponent(module.icon)" />
                      </el-icon>
                    </div>
                    <div class="module-name">{{ module.module_name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧管理区域 -->
        <div class="manage-area">
          <!-- 基本信息 -->
          <div class="info-card">
            <div class="card-title">基本信息</div>
            <el-form label-width="100px" class="info-form">
              <el-form-item label="会议名称">
                <el-input v-model="meetingForm.title" />
              </el-form-item>
              <el-form-item label="会议地址">
                <el-input v-model="meetingForm.address" />
              </el-form-item>
              <el-form-item label="开始时间">
                <el-date-picker
                  v-model="meetingForm.start_time"
                  type="datetime"
                  placeholder="选择开始时间"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="meetingForm.end_time"
                  type="datetime"
                  placeholder="选择结束时间"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                />
              </el-form-item>
              <el-form-item label="最早入场">
                <el-date-picker
                  v-model="meetingForm.earliest_entry_time"
                  type="datetime"
                  placeholder="选择最早入场时间"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveMeetingInfo">保存基本信息</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 模块管理 -->
          <div class="module-card">
            <div class="card-title">
              <span>模块管理</span>
              <el-button type="primary" size="small" @click="saveModules">批量保存</el-button>
            </div>
            <el-table :data="modules" class="module-table" size="small">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="module_name" label="模块名称" min-width="120" />
              <el-table-column label="图标" width="100">
                <template #default="scope">
                  <el-icon :size="20">
                    <component :is="getIconComponent(scope.row.icon)" />
                  </el-icon>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="80">
                <template #default="scope">
                  <el-switch v-model="scope.row.is_active" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="排序" width="100">
                <template #default="scope">
                  <el-input-number v-model="scope.row.sort_order" :min="1" :max="99" size="small" controls-position="right" />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 操作按钮 -->
          <div class="action-card">
            <el-button type="primary" @click="openParticipantDrawer">管理参会人员</el-button>
            <el-button type="success" @click="openVoteDialog">创建投票</el-button>
            <el-button @click="viewVotes">查看投票列表</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 参会人员管理抽屉 -->
    <ParticipantImportDrawer
      v-model:visible="participantDrawerVisible"
      :meeting-id="selectedMeeting?.id || 0"
      @refresh="loadParticipants"
    />

    <!-- 投票创建弹窗 -->
    <VoteCreateDialog
      v-model:visible="voteDialogVisible"
      :meeting-id="selectedMeeting?.id || 0"
      @created="onVoteCreated"
    />

    <!-- 新建会议弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建会议" width="500px">
      <el-form label-width="100px">
        <el-form-item label="会议名称" required>
          <el-input v-model="createForm.title" placeholder="输入会议名称" />
        </el-form-item>
        <el-form-item label="会议地址">
          <el-input v-model="createForm.address" placeholder="输入会议地址" />
        </el-form-item>
        <el-form-item label="开始时间" required>
          <el-date-picker
            v-model="createForm.start_time"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" required>
          <el-date-picker
            v-model="createForm.end_time"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="最早入场">
          <el-date-picker
            v-model="createForm.earliest_entry_time"
            type="datetime"
            placeholder="选择最早入场时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">创建会议</el-button>
      </template>
    </el-dialog>

    <!-- 投票列表弹窗 -->
    <el-dialog v-model="votesListVisible" title="投票列表" width="700px">
      <el-table :data="votes" v-loading="votesLoading">
        <el-table-column prop="topic" label="投票主题" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'voting' ? 'warning' : 'info'" size="small">
              {{ scope.row.status === 'voting' ? '进行中' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="投票人数" width="100">
          <template #default="scope">
            {{ getTotalVotes(scope.row.results) }} 人
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  Check,
  Document,
  Folder,
  Grid,
  Tickets,
  Edit,
  Setting,
  User,
  Location,
  Clock
} from '@element-plus/icons-vue'

import ParticipantImportDrawer from '../../components/meeting/ParticipantImportDrawer.vue'
import VoteCreateDialog from '../../components/meeting/VoteCreateDialog.vue'
import {
  fetchMeetings,
  fetchMeetingDetail,
  createMeeting,
  updateMeeting,
  publishMeeting,
  deleteMeeting,
  fetchModules,
  batchUpdateModules
} from '../../api/meetings'
import { fetchVotes } from '../../api/votes'
import type { MeetingItem, MeetingModule } from '../../api/meetings'
import type { VoteItem } from '../../api/votes'

// 会议列表数据
const meetings = ref<MeetingItem[]>([])
const loading = ref(false)
const searchTitle = ref('')

// 选中会议详情
const selectedMeeting = shallowRef<MeetingItem | null>(null)
const detailVisible = ref(false)
const modules = ref<MeetingModule[]>([])
const meetingForm = reactive({
  title: '',
  address: '',
  start_time: '',
  end_time: '',
  earliest_entry_time: ''
})

// 参会人员抽屉
const participantDrawerVisible = ref(false)

// 投票相关
const voteDialogVisible = ref(false)
const votesListVisible = ref(false)
const votes = ref<VoteItem[]>([])
const votesLoading = ref(false)

// 新建会议
const createDialogVisible = ref(false)
const createForm = reactive({
  title: '',
  address: '',
  start_time: '',
  end_time: '',
  earliest_entry_time: ''
})

// 计算属性
const publishedCount = computed(() => meetings.value.filter(m => m.is_published).length)
const activeModules = computed(() => modules.value.filter(m => m.is_active).sort((a, b) => a.sort_order - b.sort_order))

// 状态文本
const statusText = (status: string) => {
  if (status === 'scheduled') return '待开始'
  if (status === 'ongoing') return '进行中'
  return '已结束'
}

// 格式化时间
const formatDateTime = (value?: string) => {
  if (!value) return ''
  const d = new Date(value)
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${date} ${time}`
}

// 计算投票总数
const getTotalVotes = (results: { count: number }[]) => {
  return results.reduce((sum, r) => sum + r.count, 0)
}

// 获取图标组件
const getIconComponent = (iconName?: string | null) => {
  const iconMap: Record<string, typeof Document> = {
    Document,
    Calendar,
    Tickets,
    Folder,
    Grid,
    Check,
    Edit,
    Setting,
    User,
    Location,
    Clock
  }
  return iconMap[iconName || 'Document'] || Document
}

// 加载会议列表
const loadMeetings = async () => {
  loading.value = true
  try {
    const params = searchTitle.value ? { title: searchTitle.value } : undefined
    meetings.value = await fetchMeetings(params)
  } finally {
    loading.value = false
  }
}

// 选择会议
const selectMeeting = async (row: MeetingItem) => {
  selectedMeeting.value = row
  detailVisible.value = true

  // 加载详情
  const detail = await fetchMeetingDetail(row.id)
  modules.value = detail.modules.map(m => ({ ...m }))

  // 填充表单
  meetingForm.title = row.title
  meetingForm.address = row.address || ''
  meetingForm.start_time = row.start_time
  meetingForm.end_time = row.end_time
  meetingForm.earliest_entry_time = row.earliest_entry_time || ''
}

// 保存会议基本信息
const saveMeetingInfo = async () => {
  if (!selectedMeeting.value) return
  await updateMeeting(selectedMeeting.value.id, {
    title: meetingForm.title,
    address: meetingForm.address || null,
    start_time: meetingForm.start_time,
    end_time: meetingForm.end_time,
    earliest_entry_time: meetingForm.earliest_entry_time || null
  })
  ElMessage.success('会议信息已更新')
  await loadMeetings()
}

// 保存模块设置
const saveModules = async () => {
  if (!selectedMeeting.value) return
  const payload = modules.value.map(m => ({
    id: m.id,
    module_name: m.module_name,
    icon: m.icon,
    is_active: m.is_active,
    sort_order: m.sort_order
  }))
  await batchUpdateModules(selectedMeeting.value.id, payload)
  ElMessage.success('模块设置已保存')
}

// 切换发布状态
const togglePublish = async (row: MeetingItem) => {
  const newStatus = !row.is_published
  await publishMeeting(row.id, newStatus)
  ElMessage.success(newStatus ? '会议已发布' : '已取消发布')
  await loadMeetings()
}

// 删除会议
const removeMeeting = async (meetingId: number) => {
  await ElMessageBox.confirm('删除会议将同时删除所有相关数据，是否继续？', '删除会议', { type: 'warning' })
  await deleteMeeting(meetingId)
  ElMessage.success('会议已删除')
  await loadMeetings()
}

// 打开参会人员抽屉
const openParticipantDrawer = () => {
  participantDrawerVisible.value = true
}

// 加载参会人员（由抽屉组件调用）
const loadParticipants = async () => {
  // 刷新数据
}

// 打开投票创建弹窗
const openVoteDialog = () => {
  voteDialogVisible.value = true
}

// 投票创建成功回调
const onVoteCreated = () => {
  ElMessage.success('投票已创建')
  voteDialogVisible.value = false
}

// 查看投票列表
const viewVotes = async () => {
  if (!selectedMeeting.value) return
  votesLoading.value = true
  votesListVisible.value = true
  try {
    votes.value = await fetchVotes(selectedMeeting.value.id)
  } finally {
    votesLoading.value = false
  }
}

// 打开新建会议弹窗
const openCreateDialog = () => {
  createForm.title = ''
  createForm.address = ''
  createForm.start_time = ''
  createForm.end_time = ''
  createForm.earliest_entry_time = ''
  createDialogVisible.value = true
}

// 提交新建会议
const submitCreate = async () => {
  if (!createForm.title || !createForm.start_time || !createForm.end_time) {
    ElMessage.error('请填写会议名称和时间')
    return
  }
  await createMeeting({
    title: createForm.title,
    address: createForm.address || null,
    start_time: createForm.start_time,
    end_time: createForm.end_time,
    earliest_entry_time: createForm.earliest_entry_time || null
  })
  ElMessage.success('会议已创建')
  createDialogVisible.value = false
  await loadMeetings()
}

onMounted(loadMeetings)
</script>

<style scoped>
.meeting-manage-page {
  padding-top: 4px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(46, 58, 89, 0.08);
}

.bar-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.bar-right {
  display: flex;
  gap: 24px;
}

.stats-item {
  font-size: 14px;
  color: #6b7280;
}

.meeting-list-section {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(46, 58, 89, 0.06);
}

:deep(.meeting-table .el-table__row) {
  cursor: pointer;
  transition: background-color 180ms ease;
}

:deep(.meeting-table .el-table__row:hover > td.el-table__cell) {
  background: #f9fafb;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.scheduled {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.status-badge.ongoing {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.status-badge.ended {
  background: rgba(107, 114, 128, 0.12);
  color: #6b7280;
}

.action-btns {
  display: flex;
  gap: 8px;
}

/* 详情面板 */
.detail-panel {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 24px;
  min-height: 600px;
}

.phone-preview {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 16px;
}

.phone-frame {
  width: 280px;
  height: 560px;
  background: #1a1a2e;
  border-radius: 36px;
  padding: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #f7f9fc 0%, #e5e9f0 100%);
  border-radius: 24px;
  overflow: hidden;
  padding: 16px;
}

.preview-header {
  padding: 12px 0;
  border-bottom: 1px solid rgba(46, 58, 89, 0.1);
  margin-bottom: 16px;
}

.preview-title {
  font-size: 18px;
  font-weight: 700;
  color: #2e3a59;
}

.preview-meta {
  margin-top: 8px;
}

.preview-time {
  font-size: 13px;
  color: #6b7280;
}

.preview-address {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(46, 58, 89, 0.08);
}

.module-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #2e3a59 0%, #4a5568 100%);
  border-radius: 12px;
  color: #fff;
}

.module-name {
  margin-top: 8px;
  font-size: 12px;
  color: #2e3a59;
  text-align: center;
}

.manage-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.module-card,
.action-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(46, 58, 89, 0.08);
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #2e3a59;
  margin-bottom: 16px;
}

.info-form {
  max-width: 400px;
}

.action-card {
  display: flex;
  gap: 12px;
}

:deep(.module-table .el-table__row:hover > td.el-table__cell) {
  background: #f9fafb;
}

@media (max-width: 900px) {
  .detail-panel {
    grid-template-columns: 1fr;
  }

  .phone-preview {
    order: -1;
    padding-bottom: 16px;
  }
}
</style>