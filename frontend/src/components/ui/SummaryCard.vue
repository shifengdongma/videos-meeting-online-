<template>
  <el-card shadow="hover" class="summary-card" :class="variantClass">
    <div class="label">{{ label }}</div>
    <div class="value-row">
      <div class="value">{{ value }}</div>
      <div v-if="hint" class="hint">{{ hint }}</div>
    </div>
    <div v-if="description" class="description">{{ description }}</div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  hint?: string
  description?: string
  tone?: 'primary' | 'warning' | 'success' | 'danger' | 'neutral'
}>(), {
  tone: 'neutral'
})

const variantClass = computed(() => `tone-${props.tone}`)
</script>

<style scoped>
.summary-card {
  border: 1px solid rgba(46, 58, 89, 0.1);
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.74) 100%);
  box-shadow: var(--shadow-soft);
  transition: transform var(--motion-fast) ease, box-shadow var(--motion-base) ease, border-color var(--motion-fast) ease;
  overflow: hidden;
}
.summary-card::before {
  content: '';
  display: block;
  height: 4px;
  border-radius: 999px;
  background: rgba(46, 58, 89, 0.16);
  margin: -24px -24px 22px;
}
.summary-card:hover {
  transform: translateY(-2px);
  border-color: rgba(46, 58, 89, 0.16);
  box-shadow: 0 24px 52px rgba(26, 31, 59, 0.1), 0 10px 24px rgba(46, 58, 89, 0.08);
}
.label {
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 18px;
}
.value-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.value {
  font-size: clamp(34px, 3vw, 42px);
  line-height: 0.95;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: var(--color-text-primary);
}
.hint {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.description {
  margin-top: 18px;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.7;
}
.tone-neutral::before {
  background: rgba(46, 58, 89, 0.18);
}
.tone-neutral .hint {
  background: rgba(46, 58, 89, 0.08);
  color: var(--color-primary);
  border: 1px solid rgba(46, 58, 89, 0.12);
}
.tone-primary::before {
  background: rgba(46, 58, 89, 0.92);
}
.tone-primary .hint {
  background: rgba(46, 58, 89, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(46, 58, 89, 0.14);
}
.tone-success::before {
  background: var(--color-success);
}
.tone-success .hint {
  background: rgba(30, 158, 111, 0.1);
  color: #157554;
  border: 1px solid rgba(30, 158, 111, 0.16);
}
.tone-warning::before {
  background: var(--color-warning);
}
.tone-warning .hint {
  background: rgba(251, 192, 45, 0.16);
  color: #9b6a00;
  border: 1px solid rgba(251, 192, 45, 0.22);
}
.tone-danger::before {
  background: var(--color-danger);
}
.tone-danger .hint {
  background: rgba(229, 115, 115, 0.14);
  color: #b24e4e;
  border: 1px solid rgba(229, 115, 115, 0.2);
}
</style>
