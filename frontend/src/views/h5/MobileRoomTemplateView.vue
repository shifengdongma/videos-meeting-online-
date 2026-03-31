<template>
  <div class="mobile-template-manage">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1>会议室模板</h1>
      <p>集中管理不同会议场景的标准配置</p>
      <van-button type="primary" size="small" class="create-btn" @click="openCreateDialog">新建模板</van-button>
    </div>

    <!-- 统计卡片 2x2 网格 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">模板总数</div>
        <div class="stat-value">{{ templates.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">启用中</div>
        <div class="stat-value active">{{ activeCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已停用</div>
        <div class="stat-value inactive">{{ inactiveCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">有默认时长</div>
        <div class="stat-value duration">{{ durationCount }}</div>
      </div>
    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <van-loading v-if="loading" class="loading-center" />

      <van-empty v-else-if="templates.length === 0" description="暂无模板数据">
        <van-button type="primary" size="small" @click="openCreateDialog">新建模板</van-button>
      </van-empty>

      <div v-else class="card-list">
        <div v-for="template in templates" :key="template.id" class="template-card">
          <div class="card-header">
            <h3 class="template-name">{{ template.name }}</h3>
            <van-tag :type="template.is_active ? 'success' : 'default'">
              {{ template.is_active ? '启用' : '停用' }}
            </van-tag>
          </div>

          <div class="card-body">
            <div v-if="template.description" class="template-desc">{{ template.description }}</div>
            <div class="template-meta">
              <div v-if="template.default_title" class="meta-item">
                <span class="meta-label">默认标题:</span>
                <span>{{ template.default_title }}</span>
              </div>
              <div v-if="template.default_duration_minutes" class="meta-item">
                <span class="meta-label">默认时长:</span>
                <span>{{ template.default_duration_minutes }} 分钟</span>
              </div>
              <div v-if="template.capacity_label" class="meta-item">
                <span class="meta-label">容量:</span>
                <span>{{ template.capacity_label }}</span>
              </div>
            </div>
            <div v-if="template.tags.length > 0" class="template-tags">
              <van-tag v-for="tag in template.tags" :key="tag" type="primary" plain>{{ tag }}</van-tag>
            </div>
          </div>

          <div class="card-footer">
            <van-button size="small" @click="openEditDialog(template)">编辑</van-button>
            <van-button
              size="small"
              type="primary"
              :disabled="!template.is_active"
              @click="useTemplate(template.id)"
            >
              使用
            </van-button>
            <van-button size="small" type="danger" @click="removeTemplate(template.id)">删除</van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑模板弹窗（全屏） -->
    <van-popup v-model:show="dialogVisible" position="bottom" :style="{ height: '100%' }">
      <div class="fullscreen-popup">
        <div class="popup-header">
          <span class="popup-title">{{ editingTemplateId ? '编辑模板' : '新建模板' }}</span>
          <van-icon name="cross" size="20" @click="dialogVisible = false" />
        </div>
        <van-form @submit="submitTemplate" class="popup-form">
          <van-field
            v-model="form.name"
            label="模板名称"
            placeholder="例如：标准内部会议"
            :rules="[{ required: true, message: '请输入模板名称' }]"
          />
          <van-field
            v-model="form.description"
            label="模板描述"
            type="textarea"
            rows="2"
            placeholder="描述该模板适用的会议场景"
          />
          <van-field
            v-model="form.default_title"
            label="默认标题"
            placeholder="留空时默认使用模板名称"
          />
          <van-field label="默认时长">
            <template #input>
              <van-stepper v-model="form.default_duration_minutes" min="0" step="15" />
              <span class="unit-label">分钟</span>
            </template>
          </van-field>
          <van-field
            v-model="form.capacity_label"
            label="容量说明"
            placeholder="例如：8-12 人"
          />
          <van-field
            v-model="form.record_url"
            label="录播地址"
            placeholder="可选"
          />
          <van-field
            v-model="form.tagsText"
            label="标签"
            placeholder="使用逗号分隔"
          />
          <van-field label="模板状态">
            <template #input>
              <van-switch v-model="form.is_active" />
            </template>
          </van-field>
          <div class="popup-footer">
            <van-button block type="primary" native-type="submit">保存模板</van-button>
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

import {
  createMeetingTemplate,
  deleteMeetingTemplate,
  fetchMeetingTemplates,
  updateMeetingTemplate
} from '../../api/meetingTemplates'
import type { MeetingTemplateItem, MeetingTemplatePayload } from '../../types/meetingTemplate'

const router = useRouter()
const templates = ref<MeetingTemplateItem[]>([])
const loading = ref(false)
const activeTab = ref(0)
const dialogVisible = ref(false)
const editingTemplateId = ref<number | null>(null)
const form = reactive({
  name: '',
  description: '',
  default_title: '',
  default_duration_minutes: 0,
  capacity_label: '',
  record_url: '',
  tagsText: '',
  is_active: true
})

const activeCount = computed(() => templates.value.filter((item) => item.is_active).length)
const inactiveCount = computed(() => templates.value.filter((item) => !item.is_active).length)
const durationCount = computed(() => templates.value.filter((item) => item.default_duration_minutes).length)

const normalizeTags = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const resetForm = () => {
  editingTemplateId.value = null
  form.name = ''
  form.description = ''
  form.default_title = ''
  form.default_duration_minutes = 0
  form.capacity_label = ''
  form.record_url = ''
  form.tagsText = ''
  form.is_active = true
}

const toPayload = (): MeetingTemplatePayload => ({
  name: form.name.trim(),
  description: form.description.trim() || null,
  default_title: form.default_title.trim() || null,
  default_duration_minutes: form.default_duration_minutes || null,
  capacity_label: form.capacity_label.trim() || null,
  record_url: form.record_url.trim() || null,
  tags: normalizeTags(form.tagsText),
  is_active: form.is_active
})

const fillForm = (template: MeetingTemplateItem) => {
  editingTemplateId.value = template.id
  form.name = template.name
  form.description = template.description || ''
  form.default_title = template.default_title || ''
  form.default_duration_minutes = template.default_duration_minutes || 0
  form.capacity_label = template.capacity_label || ''
  form.record_url = template.record_url || ''
  form.tagsText = template.tags.join(', ')
  form.is_active = template.is_active
}

const loadTemplates = async () => {
  loading.value = true
  try {
    templates.value = await fetchMeetingTemplates()
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (template: MeetingTemplateItem) => {
  fillForm(template)
  dialogVisible.value = true
}

const submitTemplate = async () => {
  if (!form.name.trim()) {
    showToast('请输入模板名称')
    return
  }

  try {
    if (editingTemplateId.value) {
      await updateMeetingTemplate(editingTemplateId.value, toPayload())
      showToast('模板更新成功')
    } else {
      await createMeetingTemplate(toPayload())
      showToast('模板创建成功')
    }

    dialogVisible.value = false
    resetForm()
    await loadTemplates()
  } catch {
    showToast('操作失败')
  }
}

const removeTemplate = async (templateId: number) => {
  try {
    await deleteMeetingTemplate(templateId)
    showToast('模板已删除')
    await loadTemplates()
  } catch {
    showToast('删除失败')
  }
}

const useTemplate = (templateId: number) => {
  router.push(`/meetings?templateId=${templateId}`)
}

onMounted(loadTemplates)
</script>

<style scoped>
.mobile-template-manage {
  min-height: 100vh;
  padding-bottom: 50px;
  background: #f4f6f8;
}

.page-header {
  padding: 20px 16px;
  background: white;
  position: relative;
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

.create-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
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

.stat-value.active { color: #1E9E6F; }
.stat-value.inactive { color: #E57373; }
.stat-value.duration { color: #FBC02D; }

.template-list {
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

.template-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.template-name {
  font-size: 16px;
  font-weight: 600;
  color: #2E3A59;
  margin: 0;
}

.card-body {
  margin-bottom: 12px;
}

.template-desc {
  font-size: 14px;
  color: #6b748b;
  margin-bottom: 8px;
  line-height: 1.5;
}

.template-meta {
  margin-bottom: 8px;
}

.meta-item {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.meta-label {
  color: #999;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.card-footer .van-button {
  flex: 1;
}

/* 全屏弹窗 */
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

.popup-form {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.popup-form :deep(.van-cell) {
  margin-bottom: 12px;
  border-radius: 8px;
}

.unit-label {
  margin-left: 8px;
  color: #999;
  font-size: 14px;
}

.popup-footer {
  padding: 16px;
  background: white;
}
</style>