<template>
  <MobileMeetingRoomView v-if="isMobile" />
  <PCMeetingRoomView v-else />
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import PCMeetingRoomView from './PCMeetingRoomView.vue'
import MobileMeetingRoomView from '../h5/MobileMeetingRoomView.vue'

// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)')
</script>