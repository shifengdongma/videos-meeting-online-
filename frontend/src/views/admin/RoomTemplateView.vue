<template>
  <div class="template-page app-page">
    <PageHeader
      eyebrow="Room templates"
      title="会议室模板"
      description="预留不同会议模板与场景配置入口，便于后续扩展专项会议室能力。"
    />

    <div class="summary-grid app-summary-grid" data-columns="2">
      <SummaryCard label="模板能力" value="规划中" description="当前阶段以管理入口与展示框架为主" />
      <SummaryCard label="扩展方向" value="多场景" description="可覆盖培训、直播、表决等业务类型" />
    </div>

    <el-card class="content-card" shadow="never">
      <EmptyState description="后续可扩展为特殊会议室模板分配能力。" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../../components/layout/PageHeader.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import SummaryCard from '../../components/ui/SummaryCard.vue'
</script>

<style scoped>
.template-page {
  display: grid;
  gap: 24px;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.content-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
}
@media (max-width: 720px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
