<template>
  <el-card shadow="hover" class="summary-card">
    <div class="label">{{ label }}</div>
    <div class="value-row">
      <div class="value">{{ value }}</div>
      <div v-if="hint" class="hint">{{ hint }}</div>
    </div>
    <div v-if="description" class="description">{{ description }}</div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
  description?: string
}>()
</script>

<style scoped>
.summary-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.summary-card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.18);
  box-shadow: 0 24px 52px rgba(15, 23, 42, 0.1);
}
.label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.value-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.value {
  font-size: clamp(30px, 3vw, 38px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #0f172a;
}
.hint {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.description {
  margin-top: 16px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.7;
}
</style>
