<template>
  <MobileLoginView v-if="isMobile" />
  <PCLoginView v-else />
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import PCLoginView from './PCLoginView.vue'
import MobileLoginView from '../h5/MobileLoginView.vue'

// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)')
</script>