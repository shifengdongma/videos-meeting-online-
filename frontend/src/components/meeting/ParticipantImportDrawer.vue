<template>
  <el-drawer
    v-model="drawerVisible"
    title="参会人员管理"
    size="600px"
    :before-close="handleClose"
  >
    <div class="drawer-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="downloadTemplate">
          <el-icon class="mr-2"><Download /></el-icon>
          下载 Excel 模板
        </el-button>
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          accept=".xlsx,.xls,.csv"
          :on-change="handleFileChange"
        >
          <el-button type="success">
            <el-icon class="mr-2"><Upload /></el-icon>
            导入 Excel 文件
          </el-button>
        </el-upload>
      </div>

      <!-- 导入提示 -->
      <div class="tips-card">
        <div class="tips-title">导入说明</div>
        <ul class="tips-list">
          <li>文件格式支持 .xlsx、.xls、.csv</li>
          <li>Excel 表头需包含：姓名、电话、部门（姓名必填）</li>
          <li>CSV 文件请使用 UTF-8 编码</li>
        </ul>
      </div>

      <!-- 参会人员列表 -->
      <div class="participants-section">
        <div class="section-title">
          <span>参会人员列表</span>
          <span class="count-badge">共 {{ participants.length }} 人</span>
        </div>

        <el-table
          :data="participants"
          v-loading="loading"
          class="participant-table"
          max-height="400"
        >
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column prop="phone" label="电话" min-width="140">
            <template #default="scope">
              {{ scope.row.phone || '—' }}
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" min-width="140">
            <template #default="scope">
              {{ scope.row.department || '—' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button link type="danger" @click="removeParticipant(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="!loading && !participants.length" class="empty-tip">
          当前没有参会人员，请通过 Excel 导入
        </div>
      </div>

      <!-- 导入预览 -->
      <div v-if="previewData.length" class="preview-section">
        <div class="section-title">
          <span>导入预览</span>
          <span class="count-badge">{{ previewData.length }} 条数据待导入</span>
        </div>

        <el-table :data="previewData" class="preview-table" max-height="200">
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column prop="phone" label="电话" min-width="140" />
          <el-table-column prop="department" label="部门" min-width="140" />
        </el-table>

        <div class="preview-actions">
          <el-button @click="cancelPreview">取消</el-button>
          <el-button type="primary" @click="confirmImport" :loading="importing">确认导入</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'
import {
  fetchParticipants,
  importParticipants,
  deleteParticipant,
  fetchParticipantTemplate,
  batchCreateParticipants
} from '../../api/meetings'
import type { MeetingParticipant, MeetingParticipantCreatePayload } from '../../api/meetings'

const props = defineProps<{
  visible: boolean
  meetingId: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  refresh: []
}>()

const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const participants = ref<MeetingParticipant[]>([])
const loading = ref(false)
const importing = ref(false)
const previewData = ref<MeetingParticipantCreatePayload[]>([])
const uploadRef = ref()
const pendingFile = ref<File | null>(null)

// 加载参会人员
const loadParticipants = async () => {
  if (!props.meetingId) return
  loading.value = true
  try {
    participants.value = await fetchParticipants(props.meetingId)
  } finally {
    loading.value = false
  }
}

// 监听 visible 变化
watch(() => props.visible, (val) => {
  if (val && props.meetingId) {
    loadParticipants()
    previewData.value = []
    pendingFile.value = null
  }
})

// 下载模板
const downloadTemplate = async () => {
  if (!props.meetingId) return
  try {
    const templateInfo = await fetchParticipantTemplate(props.meetingId)
    // 创建示例数据
    const exampleData = templateInfo.example

    // 使用浏览器 API 生成 CSV 文件
    const headers = templateInfo.columns
    const csvContent = [
      headers.join(','),
      ...exampleData.map(row => headers.map(h => row[h] || '').join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '参会人员导入模板.csv'
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success('模板已下载')
  } catch (error) {
    ElMessage.error('下载模板失败')
  }
}

// 文件选择处理
const handleFileChange = async (file: { raw: File }) => {
  const rawFile = file.raw
  if (!rawFile) return

  pendingFile.value = rawFile

  // 解析文件预览
  try {
    const parsed = await parseExcelFile(rawFile)
    previewData.value = parsed
  } catch (error) {
    ElMessage.error('文件解析失败，请检查文件格式')
    previewData.value = []
  }
}

// 解析 Excel 文件（简单实现）
const parseExcelFile = async (file: File): Promise<MeetingParticipantCreatePayload[]> => {
  // 对于 CSV 文件，直接解析
  if (file.name.endsWith('.csv')) {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const nameIdx = headers.findIndex(h => h.includes('姓名'))
    const phoneIdx = headers.findIndex(h => h.includes('电话'))
    const deptIdx = headers.findIndex(h => h.includes('部门'))

    const result: MeetingParticipantCreatePayload[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''))
      const name = cols[nameIdx] || ''
      if (name) {
        result.push({
          name,
          phone: cols[phoneIdx] || null,
          department: cols[deptIdx] || null
        })
      }
    }
    return result
  }

  // 对于 Excel 文件，使用后端 API 解析
  return []
}

// 取消预览
const cancelPreview = () => {
  previewData.value = []
  pendingFile.value = null
}

// 确认导入
const confirmImport = async () => {
  if (!props.meetingId) return

  importing.value = true
  try {
    if (pendingFile.value && (pendingFile.value.name.endsWith('.xlsx') || pendingFile.value.name.endsWith('.xls'))) {
      // Excel 文件通过后端 API 导入
      await importParticipants(props.meetingId, pendingFile.value)
    } else if (previewData.value.length) {
      // CSV 或预览数据通过批量创建 API 导入
      await batchCreateParticipants(props.meetingId, previewData.value)
    }

    ElMessage.success('导入成功')
    previewData.value = []
    pendingFile.value = null
    await loadParticipants()
    emit('refresh')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '导入失败')
  } finally {
    importing.value = false
  }
}

// 删除参会人员
const removeParticipant = async (participantId: number) => {
  await deleteParticipant(props.meetingId, participantId)
  ElMessage.success('已删除')
  await loadParticipants()
  emit('refresh')
}

// 关闭抽屉
const handleClose = () => {
  previewData.value = []
  pendingFile.value = null
  emit('update:visible', false)
}
</script>

<style scoped>
.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-bar {
  display: flex;
  gap: 12px;
}

.tips-card {
  background: rgba(59, 130, 246, 0.06);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(59, 130, 246, 0.12);
}

.tips-title {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 8px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.8;
}

.participants-section,
.preview-section {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(46, 58, 89, 0.08);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #2e3a59;
  border-bottom: 1px solid rgba(46, 58, 89, 0.08);
}

.count-badge {
  font-size: 12px;
  color: #6b7280;
  background: rgba(46, 58, 89, 0.06);
  padding: 4px 10px;
  border-radius: 999px;
}

.participant-table,
.preview-table {
  border-radius: 0 0 12px 12px;
}

.empty-tip {
  padding: 24px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid rgba(46, 58, 89, 0.08);
}

.mr-2 {
  margin-right: 8px;
}

:deep(.participant-table .el-table__row:hover > td.el-table__cell) {
  background: #f9fafb;
}
</style>