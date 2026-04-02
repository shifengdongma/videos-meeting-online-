<template>
  <el-dialog
    v-model="dialogVisible"
    title="创建投票"
    width="600px"
    :before-close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="vote-form">
      <el-form-item label="投票标题" prop="topic">
        <el-input v-model="form.topic" placeholder="输入投票主题" maxlength="255" show-word-limit />
      </el-form-item>

      <el-form-item label="投票描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="可选，描述投票的具体内容或说明"
        />
      </el-form-item>

      <el-form-item label="开始时间">
        <el-date-picker
          v-model="form.start_time"
          type="datetime"
          placeholder="可选，选择投票开始时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DDTHH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="结束时间">
        <el-date-picker
          v-model="form.end_time"
          type="datetime"
          placeholder="可选，选择投票结束时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DDTHH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="投票次数">
        <el-input-number v-model="form.max_votes" :min="1" :max="10" controls-position="right" />
        <span class="form-hint">每人可投票数</span>
      </el-form-item>

      <el-form-item label="投票选项" prop="options">
        <div class="options-container">
          <div v-for="(option, index) in form.options" :key="index" class="option-row">
            <el-input
              v-model="option.content"
              placeholder="输入选项内容"
              maxlength="120"
              show-word-limit
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              :disabled="form.options.length <= 2"
              @click="removeOption(index)"
            />
          </div>

          <el-button type="primary" plain :icon="Plus" @click="addOption">
            添加选项
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="2"
          placeholder="可选，备注信息"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submitVote">创建投票</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { createVote } from '../../api/votes'

const props = defineProps<{
  visible: boolean
  meetingId: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  created: []
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  topic: '',
  description: '',
  start_time: '',
  end_time: '',
  max_votes: 1,
  options: [{ content: '' }, { content: '' }],
  remarks: ''
})

const rules: FormRules = {
  topic: [{ required: true, message: '请输入投票标题', trigger: 'blur' }],
  options: [
    {
      validator: () => {
        const validOptions = form.options.filter(o => o.content.trim())
        return validOptions.length >= 2
      },
      message: '请至少填写两个选项',
      trigger: 'blur'
    }
  ]
}

// 监听 visible 变化，重置表单
watch(() => props.visible, (val) => {
  if (val) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  form.topic = ''
  form.description = ''
  form.start_time = ''
  form.end_time = ''
  form.max_votes = 1
  form.options = [{ content: '' }, { content: '' }]
  form.remarks = ''
}

// 添加选项
const addOption = () => {
  form.options.push({ content: '' })
}

// 移除选项
const removeOption = (index: number) => {
  if (form.options.length > 2) {
    form.options.splice(index, 1)
  }
}

// 提交投票
const submitVote = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  // 检查选项内容
  const validOptions = form.options.filter(o => o.content.trim())
  if (validOptions.length < 2) {
    ElMessage.error('请至少填写两个有效选项')
    return
  }

  if (!props.meetingId) {
    ElMessage.error('会议ID无效')
    return
  }

  submitting.value = true
  try {
    await createVote({
      meeting_id: props.meetingId,
      topic: form.topic.trim(),
      description: form.description.trim() || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      max_votes: form.max_votes,
      remarks: form.remarks.trim() || null,
      options: validOptions.map(o => ({ content: o.content.trim() }))
    })

    emit('created')
    handleClose()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '创建投票失败')
  } finally {
    submitting.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
  emit('update:visible', false)
}
</script>

<style scoped>
.vote-form {
  padding-top: 8px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.option-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.option-row .el-input {
  flex: 1;
}

.form-hint {
  margin-left: 12px;
  font-size: 13px;
  color: #9ca3af;
}
</style>