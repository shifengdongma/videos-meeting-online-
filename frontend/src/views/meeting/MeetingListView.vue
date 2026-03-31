<template>
  <MobileMeetingListView v-if="isMobile" />
  <PCMeetingListView v-else />
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import PCMeetingListView from './PCMeetingListView.vue'
import MobileMeetingListView from '../h5/MobileMeetingListView.vue'

// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)')
</script>