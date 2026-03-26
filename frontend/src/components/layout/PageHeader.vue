<template>
  <div class="page-header">
    <div>
      <div class="eyebrow" v-if="eyebrow">{{ eyebrow }}</div>
      <h1 class="title">{{ title }}</h1>
      <p v-if="description" class="description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  eyebrow?: string
}>()
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 28px;
  padding: 4px 2px 0;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.eyebrow::before {
  content: '';
  width: 26px;
  height: 1px;
  background: linear-gradient(90deg, rgba(79, 70, 229, 0.9), rgba(56, 189, 248, 0.35));
}
.title {
  margin: 0;
  font-size: clamp(30px, 3vw, 38px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: #0f172a;
}
.description {
  margin: 14px 0 0;
  color: #64748b;
  line-height: 1.8;
  max-width: 760px;
  font-size: 15px;
}
.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
