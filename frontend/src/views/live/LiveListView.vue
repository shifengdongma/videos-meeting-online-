<template>
  <MobileLiveListView v-if="isMobile" />
  <PCLiveListView v-else />
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import PCLiveListView from './PCLiveListView.vue'
import MobileLiveListView from '../h5/MobileLiveListView.vue'

// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)')
</script>