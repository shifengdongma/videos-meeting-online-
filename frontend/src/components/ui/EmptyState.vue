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
  padding: 12px;
  border-radius: 28px;
  border: 1px dashed rgba(148, 163, 184, 0.24);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.74) 0%, rgba(255, 255, 255, 0.88) 100%);
}
:deep(.el-empty) {
  --el-empty-fill-color-0: rgba(59, 130, 246, 0.08);
  --el-empty-fill-color-1: rgba(59, 130, 246, 0.04);
}
:deep(.el-empty__image) {
  opacity: 0.86;
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
