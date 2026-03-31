<template>
  <MobilePlaybackCenterView v-if="isMobile" />
  <PCPlaybackCenterView v-else />
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import PCPlaybackCenterView from './PCPlaybackCenterView.vue'
import MobilePlaybackCenterView from './h5/MobilePlaybackCenterView.vue'

// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)')
</script>