<template>
  <div class="mobile-meeting-list">
    <!-- 顶部标题区 -->
    <div class="page-header">
      <h1>会议中心</h1>
      <p>统一查看会议安排、当前状态与会议入口</p>
    </div>

    <!-- 统计卡片 2x2 网格 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">全部会议</div>
        <div class="stat-value">{{ meetings.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">进行中</div>
        <div class="stat-value ongoing">{{ ongoingCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待开始</div>
        <div class="stat-value scheduled">{{ scheduledCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已结束</div>
        <div class="stat-value ended">{{ endedCount }}</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="canCreate" class="action-buttons">
      <van-button plain type="primary" size="small" @click="openTemplateDialog">从模板创建</van-button>
      <van-button type="primary" size="small" @click="createDialogVisible = true">创建会议</van-button>
    </div>

    <!-- 会议列表 -->
    <div class="meeting-list">
      <van-loading v-if="loading" class="loading-center" />

      <van-empty v-else-if="meetings.length === 0" description="当前还没有会议">
        <van-button v-if="canCreate" type="primary" size="small" @click="createDialogVisible = true">创建会议</van-button>
      </van-empty>

      <div v-else class="card-list">
        <div v-for="meeting in meetings" :key="meeting.id" class="meeting-card">
          <div class="card-header">
            <h3 class="meeting-title">{{ meeting.title }}</h3>
            <van-tag :type="getStatusType(meeting.status)" size="medium">
              {{ statusLabel(meeting.status) }}
            </van-tag>
          </div>
          <div class="card-body">
            <div class="time-row">
              <van-icon name="clock-o" />
              <span>{{ formatDateTime(meeting.start_time) }} - {{ formatTime(meeting.end_time) }}</span>
            </div>
          </div>
          <div class="card-footer">
            <van-button type="primary" size="small" block @click="enterMeeting(meeting.id)">
              进入会议室
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建会议弹窗（全屏） -->
    <van-popup v-model:show="createDialogVisible" position="bottom" :style="{ height: '100%' }">
      <div class="fullscreen-popup">
        <div class="popup-header">
          <span class="popup-title">创建会议</span>
          <van-icon name="cross" size="20" @click="createDialogVisible = false" />
        </div>
        <van-form @submit="handleCreate">
          <van-field
            v-model="createForm.title"
            label="会议主题"
            placeholder="例如：月度项目评审会"
            :rules="[{ required: true, message: '请输入会议主题' }]"
          />
          <van-field
            v-model="createForm.start_time_display"
            is-link
            readonly
            label="开始时间"
            placeholder="请选择开始时间"
            @click="showStartPicker = true"
            :rules="[{ required: true, message: '请选择开始时间' }]"
          />
          <van-popup v-model:show="showStartPicker" position="bottom" round>
            <van-date-picker
              v-model="startDateValue"
              title="选择日期"
              :min-date="minDate"
              @confirm="onStartDateConfirm"
              @cancel="showStartPicker = false"
            />
          </van-popup>
          <van-popup v-model:show="showStartTimePicker" position="bottom" round>
            <van-time-picker
              v-model="startTimeValue"
              title="选择时间"
              @confirm="onStartTimeConfirm"
              @cancel="showStartTimePicker = false"
            />
          </van-popup>
          <van-field
            v-model="createForm.end_time_display"
            is-link
            readonly
            label="结束时间"
            placeholder="请选择结束时间"
            @click="showEndPicker = true"
            :rules="[{ required: true, message: '请选择结束时间' }]"
          />
          <van-popup v-model:show="showEndPicker" position="bottom" round>
            <van-date-picker
              v-model="endDateValue"
              title="选择日期"
              :min-date="minDate"
              @confirm="onEndDateConfirm"
              @cancel="showEndPicker = false"
            />
          </van-popup>
          <van-popup v-model:show="showEndTimePicker" position="bottom" round>
            <van-time-picker
              v-model="endTimeValue"
              title="选择时间"
              @confirm="onEndTimeConfirm"
              @cancel="showEndTimePicker = false"
            />
          </van-popup>
          <div class="popup-footer">
            <van-button block type="primary" native-type="submit">确定创建</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 从模板创建弹窗（全屏） -->
    <van-popup v-model:show="templateDialogVisible" position="bottom" :style="{ height: '100%' }">
      <div class="fullscreen-popup">
        <div class="popup-header">
          <span class="popup-title">从模板创建会议</span>
          <van-icon name="cross" size="20" @click="templateDialogVisible = false" />
        </div>
        <van-form @submit="handleUseTemplate">
          <van-field
            v-model="selectedTemplateName"
            is-link
            readonly
            label="选择模板"
            placeholder="请选择模板"
            @click="showTemplatePicker = true"
            :rules="[{ required: true, message: '请选择模板' }]"
          />
          <van-popup v-model:show="showTemplatePicker" position="bottom" round>
            <van-picker
              title="选择模板"
              :columns="templateColumns"
              @confirm="onTemplateConfirm"
              @cancel="showTemplatePicker = false"
            />
          </van-popup>

          <div v-if="selectedTemplate" class="template-preview">
            <div class="preview-title">{{ selectedTemplate.name }}</div>
            <p class="preview-desc">{{ selectedTemplate.description || '该模板暂无额外说明' }}</p>
            <div class="preview-tags">
              <van-tag v-for="tag in selectedTemplate.tags" :key="tag" type="primary">{{ tag }}</van-tag>
            </div>
          </div>

          <van-field
            v-model="templateForm.title"
            label="会议主题"
            placeholder="留空则使用模板默认标题"
          />
          <van-field
            v-model="templateForm.start_time_display"
            is-link
            readonly
            label="开始时间"
            placeholder="请选择开始时间"
            @click="showTemplateStartPicker = true"
            :rules="[{ required: true, message: '请选择开始时间' }]"
          />
          <van-popup v-model:show="showTemplateStartPicker" position="bottom" round>
            <van-date-picker
              v-model="templateStartDateValue"
              title="选择日期"
              :min-date="minDate"
              @confirm="onTemplateStartDateConfirm"
              @cancel="showTemplateStartPicker = false"
            />
          </van-popup>
          <van-popup v-model:show="showTemplateStartTimePicker" position="bottom" round>
            <van-time-picker
              v-model="templateStartTimeValue"
              title="选择时间"
              @confirm="onTemplateStartTimeConfirm"
              @cancel="showTemplateStartTimePicker = false"
            />
          </van-popup>
          <van-field
            v-model="templateForm.end_time_display"
            is-link
            readonly
            label="结束时间"
            placeholder="可留空，按模板默认时长计算"
            @click="showTemplateEndPicker = true"
          />
          <van-popup v-model:show="showTemplateEndPicker" position="bottom" round>
            <van-date-picker
              v-model="templateEndDateValue"
              title="选择日期"
              :min-date="minDate"
              @confirm="onTemplateEndDateConfirm"
              @cancel="showTemplateEndPicker = false"
            />
          </van-popup>
          <van-popup v-model:show="showTemplateEndTimePicker" position="bottom" round>
            <van-time-picker
              v-model="templateEndTimeValue"
              title="选择时间"
              @confirm="onTemplateEndTimeConfirm"
              @cancel="showTemplateEndTimePicker = false"
            />
          </van-popup>
          <div class="popup-footer">
            <van-button block type="primary" native-type="submit">创建并进入</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

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
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

import { createMeeting, fetchMeetings, type MeetingItem } from '../../api/meetings'
import { fetchMeetingTemplates, useMeetingTemplate } from '../../api/meetingTemplates'
import { useAuthStore } from '../../stores/auth'
import type { MeetingTemplateItem } from '../../types/meetingTemplate'

const router = useRouter()
const authStore = useAuthStore()
const meetings = ref<MeetingItem[]>([])
const templates = ref<MeetingTemplateItem[]>([])
const loading = ref(false)
const activeTab = ref(1)

// 弹窗状态
const createDialogVisible = ref(false)
const templateDialogVisible = ref(false)
const showStartPicker = ref(false)
const showStartTimePicker = ref(false)
const showEndPicker = ref(false)
const showEndTimePicker = ref(false)
const showTemplatePicker = ref(false)
const showTemplateStartPicker = ref(false)
const showTemplateStartTimePicker = ref(false)
const showTemplateEndPicker = ref(false)
const showTemplateEndTimePicker = ref(false)

// 表单数据
const createForm = reactive({
  title: '',
  start_time: '',
  start_time_display: '',
  end_time: '',
  end_time_display: ''
})
const templateForm = reactive({
  templateId: null as number | null,
  title: '',
  start_time: '',
  start_time_display: '',
  end_time: '',
  end_time_display: ''
})

// 时间选择器数据
const minDate = new Date()
const startDateValue = ref(['2024', '01', '01'])
const startTimeValue = ref(['00', '00'])
const endDateValue = ref(['2024', '01', '01'])
const endTimeValue = ref(['00', '00'])
const templateStartDateValue = ref(['2024', '01', '01'])
const templateStartTimeValue = ref(['00', '00'])
const templateEndDateValue = ref(['2024', '01', '01'])
const templateEndTimeValue = ref(['00', '00'])

// 计算属性
const canCreate = computed(() => ['admin', 'host'].includes(authStore.role))
const ongoingCount = computed(() => meetings.value.filter(m => m.status === 'ongoing').length)
const scheduledCount = computed(() => meetings.value.filter(m => m.status === 'scheduled').length)
const endedCount = computed(() => meetings.value.filter(m => m.status === 'ended').length)
const activeTemplates = computed(() => templates.value.filter(t => t.is_active))
const templateColumns = computed(() => activeTemplates.value.map(t => ({ text: t.name, value: t.id })))
const selectedTemplate = computed(() => activeTemplates.value.find(t => t.id === templateForm.templateId) || null)
const selectedTemplateName = computed(() => selectedTemplate.value?.name || '')

// 工具函数
const statusLabel = (status: string) => {
  const map: Record<string, string> = { ongoing: '进行中', scheduled: '待开始', ended: '已结束' }
  return map[status] || '未知'
}

const getStatusType = (status: string): 'primary' | 'success' | 'default' => {
  const map: Record<string, 'primary' | 'success' | 'default'> = {
    ongoing: 'success',
    scheduled: 'primary',
    ended: 'default'
  }
  return map[status] || 'default'
}

const formatDateTime = (datetime: string) => {
  const d = new Date(datetime)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const formatTime = (datetime: string) => {
  const d = new Date(datetime)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 时间选择器回调
const onStartDateConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  startDateValue.value = selectedValues
  showStartPicker.value = false
  showStartTimePicker.value = true
}

const onStartTimeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  startTimeValue.value = selectedValues
  createForm.start_time = `${startDateValue.value.join('-')}T${startTimeValue.value.join(':')}:00`
  createForm.start_time_display = `${startDateValue.value.join('-')} ${startTimeValue.value.join(':')}`
  showStartTimePicker.value = false
}

const onEndDateConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  endDateValue.value = selectedValues
  showEndPicker.value = false
  showEndTimePicker.value = true
}

const onEndTimeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  endTimeValue.value = selectedValues
  createForm.end_time = `${endDateValue.value.join('-')}T${endTimeValue.value.join(':')}:00`
  createForm.end_time_display = `${endDateValue.value.join('-')} ${endTimeValue.value.join(':')}`
  showEndTimePicker.value = false
}

const onTemplateConfirm = ({ selectedOptions }: { selectedOptions: { text: string; value: number }[] }) => {
  const option = selectedOptions[0]
  templateForm.templateId = option.value
  const template = activeTemplates.value.find(t => t.id === option.value)
  if (template) {
    templateForm.title = template.default_title || template.name
  }
  showTemplatePicker.value = false
}

const onTemplateStartDateConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  templateStartDateValue.value = selectedValues
  showTemplateStartPicker.value = false
  showTemplateStartTimePicker.value = true
}

const onTemplateStartTimeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  templateStartTimeValue.value = selectedValues
  templateForm.start_time = `${templateStartDateValue.value.join('-')}T${templateStartTimeValue.value.join(':')}:00`
  templateForm.start_time_display = `${templateStartDateValue.value.join('-')} ${templateStartTimeValue.value.join(':')}`
  showTemplateStartTimePicker.value = false
}

const onTemplateEndDateConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  templateEndDateValue.value = selectedValues
  showTemplateEndPicker.value = false
  showTemplateEndTimePicker.value = true
}

const onTemplateEndTimeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  templateEndTimeValue.value = selectedValues
  templateForm.end_time = `${templateEndDateValue.value.join('-')}T${templateEndTimeValue.value.join(':')}:00`
  templateForm.end_time_display = `${templateEndDateValue.value.join('-')} ${templateEndTimeValue.value.join(':')}`
  showTemplateEndTimePicker.value = false
}

// 加载数据
const loadMeetings = async () => {
  loading.value = true
  try {
    meetings.value = await fetchMeetings()
  } finally {
    loading.value = false
  }
}

const loadTemplates = async () => {
  templates.value = await fetchMeetingTemplates()
}

// 操作函数
const enterMeeting = (id: number) => {
  router.push(`/meetings/${id}`)
}

const openTemplateDialog = async () => {
  if (!templates.value.length) {
    await loadTemplates()
  }
  templateForm.templateId = null
  templateForm.title = ''
  templateForm.start_time = ''
  templateForm.start_time_display = ''
  templateForm.end_time = ''
  templateForm.end_time_display = ''
  templateDialogVisible.value = true
}

const handleCreate = async () => {
  try {
    await createMeeting({
      title: createForm.title,
      start_time: createForm.start_time,
      end_time: createForm.end_time,
      record_url: null
    })
    showToast('会议创建成功')
    createDialogVisible.value = false
    createForm.title = ''
    createForm.start_time = ''
    createForm.start_time_display = ''
    createForm.end_time = ''
    createForm.end_time_display = ''
    await loadMeetings()
  } catch {
    showToast('创建失败')
  }
}

const handleUseTemplate = async () => {
  if (!templateForm.templateId) {
    showToast('请选择模板')
    return
  }
  if (!templateForm.start_time) {
    showToast('请选择开始时间')
    return
  }

  const template = selectedTemplate.value
  if (!template) {
    showToast('所选模板不可用')
    return
  }

  if (!template.default_duration_minutes && !templateForm.end_time) {
    showToast('当前模板未设置默认时长，请填写结束时间')
    return
  }

  try {
    const meeting = await useMeetingTemplate(templateForm.templateId, {
      title: templateForm.title.trim() || undefined,
      start_time: templateForm.start_time,
      end_time: templateForm.end_time || undefined
    })
    showToast('会议创建成功')
    templateDialogVisible.value = false
    await loadMeetings()
    router.push(`/meetings/${meeting.id}`)
  } catch {
    showToast('创建失败')
  }
}

onMounted(loadMeetings)
</script>

<style scoped>
.mobile-meeting-list {
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
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-label {
  font-size: 12px;
  color: #6b748b;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2E3A59;
  margin-top: 8px;
}

.stat-value.ongoing { color: #FBC02D; }
.stat-value.scheduled { color: #1E9E6F; }
.stat-value.ended { color: #E57373; }

.action-buttons {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}

.meeting-list {
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

.meeting-card {
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

.meeting-title {
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

.time-row {
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

.fullscreen-popup {
  height: 100%;
  background: #f4f6f8;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #eee;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: #2E3A59;
}

.popup-footer {
  padding: 16px;
  background: white;
  margin-top: auto;
}

.template-preview {
  margin: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #2E3A59;
}

.preview-desc {
  font-size: 14px;
  color: #6b748b;
  margin: 8px 0;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
</style>