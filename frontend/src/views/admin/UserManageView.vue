<template>
  <MobileUserManageView v-if="isMobile" />
  <PCUserManageView v-else />
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import PCUserManageView from './PCUserManageView.vue'
import MobileUserManageView from '../h5/MobileUserManageView.vue'

// 768px 是常见的移动端/平板分界点
const isMobile = useMediaQuery('(max-width: 768px)')
</script>