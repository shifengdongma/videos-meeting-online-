<template>
  <div class="empty-state">
    <el-empty :description="description" />
    <div v-if="$slots.actions" class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  description: string
}>()
</script>

<style scoped>
.empty-state {
  padding: 34px 0 20px;
}
:deep(.el-empty) {
  --el-empty-fill-color-0: rgba(99, 102, 241, 0.08);
  --el-empty-fill-color-1: rgba(99, 102, 241, 0.04);
}
:deep(.el-empty__description p) {
  color: #64748b;
  font-size: 14px;
}
.actions {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
</style>
