<template>
  <el-tag :type="tagType" effect="light" round class="status-tag">
    {{ text }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
  status?: string
}>()

const tagType = computed(() => {
  if (['admin', 'ongoing', 'live'].includes(props.status || '')) return 'danger'
  if (['host', 'scheduled'].includes(props.status || '')) return 'warning'
  if (['ended', 'offline'].includes(props.status || '')) return 'info'
  return 'success'
})
</script>

<style scoped>
.status-tag {
  padding-inline: 12px;
  min-height: 30px;
  font-weight: 700;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
}
:deep(.status-tag.el-tag--danger) {
  color: #be123c;
  background: rgba(244, 63, 94, 0.12);
  border-color: rgba(244, 63, 94, 0.18);
}
:deep(.status-tag.el-tag--warning) {
  color: #b45309;
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.2);
}
:deep(.status-tag.el-tag--info) {
  color: #475569;
  background: rgba(148, 163, 184, 0.14);
  border-color: rgba(148, 163, 184, 0.2);
}
:deep(.status-tag.el-tag--success) {
  color: #047857;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.18);
}
</style>
