<template>
  <MobileDashboardView v-if="isMobile" />
  <PCDashboardView v-else />
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import PCDashboardView from './dashboard/PCDashboardView.vue'
import MobileDashboardView from './h5/MobileDashboardView.vue'

// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)')
</script>