<template>
  <MobileLiveRoomView v-if="isMobile" />
  <PCLiveRoomView v-else />
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import PCLiveRoomView from './PCLiveRoomView.vue'
import MobileLiveRoomView from '../h5/MobileLiveRoomView.vue'

// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)')
</script>