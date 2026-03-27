<template>
  <div class="space-y-8">
    <section class="flex items-start justify-between gap-6 rounded-xl bg-white/70 p-6 shadow-sm ring-1 ring-gray-100 backdrop-blur-sm">
      <div class="max-w-3xl">
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-[#2E3A59]/70">Room templates</div>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-[#2E3A59]">会议室模板</h1>
        <p class="mt-3 text-sm leading-7 text-slate-500">集中管理不同会议场景的标准配置，帮助运营、培训和管理层快速复用成熟的会议空间方案。</p>
      </div>
      <el-button type="primary" size="large" @click="openCreateDialog">新建模板</el-button>
    </section>

    <section class="grid grid-cols-4 gap-6">
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">模板总数</div>
        <div class="mt-4 text-4xl font-bold text-[#2E3A59]">{{ templates.length }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">当前可维护的全部会议室模板</p>
      </article>
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">启用中</div>
        <div class="mt-4 text-4xl font-bold text-[#1E9E6F]">{{ activeCount }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">可直接复用创建会议的模板</p>
      </article>
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">已停用</div>
        <div class="mt-4 text-4xl font-bold text-[#E57373]">{{ inactiveCount }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">保留历史配置，但不可直接使用</p>
      </article>
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">默认时长模板</div>
        <div class="mt-4 text-4xl font-bold text-[#FBC02D]">{{ durationCount }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">可自动推导会议结束时间的模板</p>
      </article>
    </section>

    <section class="overflow-hidden rounded-xl bg-white shadow-sm">
      <el-table :data="templates" v-loading="loading" class="template-table">
        <el-table-column prop="name" label="模板名称" min-width="180" />
        <el-table-column prop="default_title" label="默认标题" min-width="180">
          <template #default="scope">
            {{ scope.row.default_title || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="默认时长" width="120">
          <template #default="scope">
            {{ scope.row.default_duration_minutes ? `${scope.row.default_duration_minutes} 分钟` : '—' }}
          </template>
        </el-table-column>
        <el-table-column label="容量" width="120">
          <template #default="scope">
            {{ scope.row.capacity_label || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="220">
          <template #default="scope">
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in scope.row.tags" :key="tag" class="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                {{ tag }}
              </span>
              <span v-if="!scope.row.tags.length" class="text-slate-400">—</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <span class="inline-flex rounded-full px-3 py-1 text-xs font-medium" :class="scope.row.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
              {{ scope.row.is_active ? '启用中' : '已停用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <el-button link type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
              <el-button link type="primary" :disabled="!scope.row.is_active" @click="useTemplate(scope.row.id)">使用模板</el-button>
              <el-button link type="danger" @click="removeTemplate(scope.row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && !templates.length" description="当前还没有会议室模板，可先创建一个标准模板。">
        <template #actions>
          <el-button type="primary" @click="openCreateDialog">新建模板</el-button>
        </template>
      </EmptyState>
    </section>

    <el-dialog v-model="dialogVisible" :title="editingTemplateId ? '编辑模板' : '新建模板'" width="620px">
      <el-form label-width="110px" class="dialog-form">
        <el-form-item label="模板名称">
          <el-input v-model="form.name" placeholder="例如：标准内部会议" />
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="描述该模板适用的会议场景" />
        </el-form-item>
        <el-form-item label="默认标题">
          <el-input v-model="form.default_title" placeholder="留空时默认使用模板名称" />
        </el-form-item>
        <el-form-item label="默认时长">
          <el-input-number v-model="form.default_duration_minutes" :min="1" :step="15" controls-position="right" />
          <span class="ml-3 text-sm text-slate-400">分钟，可留空</span>
        </el-form-item>
        <el-form-item label="容量说明">
          <el-input v-model="form.capacity_label" placeholder="例如：8-12 人" />
        </el-form-item>
        <el-form-item label="录播地址">
          <el-input v-model="form.record_url" placeholder="可选，使用模板时会作为默认录播地址" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tagsText" placeholder="使用逗号分隔，例如：屏幕共享, 纪要模板" />
        </el-form-item>
        <el-form-item label="模板状态">
          <el-switch v-model="form.is_active" inline-prompt active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTemplate">保存模板</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

import EmptyState from '../../components/ui/EmptyState.vue'
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
const dialogVisible = ref(false)
const editingTemplateId = ref<number | null>(null)
const form = reactive({
  name: '',
  description: '',
  default_title: '',
  default_duration_minutes: null as number | null,
  capacity_label: '',
  record_url: '',
  tagsText: '',
  is_active: true
})

const activeCount = computed(() => templates.value.filter((item) => item.is_active).length)
const inactiveCount = computed(() => templates.value.filter((item) => !item.is_active).length)
const durationCount = computed(() => templates.value.filter((item) => item.default_duration_minutes).length)

const formatDateTime = (value: string) => value.replace('T', ' ')

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
  form.default_duration_minutes = null
  form.capacity_label = ''
  form.record_url = ''
  form.tagsText = ''
  form.is_active = true
}

const toPayload = (): MeetingTemplatePayload => ({
  name: form.name.trim(),
  description: form.description.trim() || null,
  default_title: form.default_title.trim() || null,
  default_duration_minutes: form.default_duration_minutes,
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
  form.default_duration_minutes = template.default_duration_minutes
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
    ElMessage.error('请输入模板名称')
    return
  }

  if (editingTemplateId.value) {
    await updateMeetingTemplate(editingTemplateId.value, toPayload())
    ElMessage.success('模板更新成功')
  } else {
    await createMeetingTemplate(toPayload())
    ElMessage.success('模板创建成功')
  }

  dialogVisible.value = false
  resetForm()
  await loadTemplates()
}

const removeTemplate = async (templateId: number) => {
  await ElMessageBox.confirm('删除后将无法继续编辑该模板，是否继续？', '删除模板', {
    type: 'warning'
  })
  await deleteMeetingTemplate(templateId)
  ElMessage.success('模板已删除')
  await loadTemplates()
}

const useTemplate = (templateId: number) => {
  router.push(`/meetings?templateId=${templateId}`)
}

onMounted(loadTemplates)
</script>

<style scoped>
.dialog-form {
  padding-top: 8px;
}

:deep(.template-table .el-table__row) {
  transition: background-color 180ms ease;
}

:deep(.template-table .el-table__row:hover > td.el-table__cell) {
  background: #f9fafb;
}
</style>
