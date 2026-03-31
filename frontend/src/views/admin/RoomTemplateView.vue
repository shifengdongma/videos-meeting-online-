<template>
  <MobileRoomTemplateView v-if="isMobile" />
  <PCRoomTemplateView v-else />
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import PCRoomTemplateView from './PCRoomTemplateView.vue'
import MobileRoomTemplateView from '../h5/MobileRoomTemplateView.vue'

// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)')
</script>