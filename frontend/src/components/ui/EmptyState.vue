<template>
  <div class="empty-state">
    <div class="empty-surface">
      <el-empty :description="description" />
      <div v-if="$slots.actions" class="actions">
        <slot name="actions" />
      </div>
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
.empty-surface {
  padding: 18px;
  border-radius: 30px;
  border: 1px dashed rgba(46, 58, 89, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.74) 0%, rgba(247, 249, 252, 0.92) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88), 0 18px 38px rgba(26, 31, 59, 0.05);
}
:deep(.el-empty) {
  --el-empty-fill-color-0: rgba(46, 58, 89, 0.08);
  --el-empty-fill-color-1: rgba(46, 58, 89, 0.04);
}
:deep(.el-empty__image) {
  opacity: 0.9;
}
:deep(.el-empty__description p) {
  color: var(--color-text-muted);
  font-size: 14px;
}
.actions {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
</style>
