<template>
  <div class="venue-switcher">
    <el-dropdown @command="handleSwitch" trigger="click">
      <el-button type="primary" class="switcher-btn">
        <el-icon><VideoCamera /></el-icon>
        <span class="current-venue-name">{{ currentVenueName }}</span>
        <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            :command="mainVenue?.id"
            :class="{ 'is-active': currentVenueId === mainVenue?.id }"
          >
            <div class="venue-item">
              <el-tag type="danger" size="small">主会场</el-tag>
              <span class="venue-title">{{ mainVenue?.title || '主会场' }}</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item
            v-for="sub in subVenues"
            :key="sub.id"
            :command="sub.id"
            :class="{ 'is-active': currentVenueId === sub.id }"
          >
            <div class="venue-item">
              <el-tag type="info" size="small">分会场</el-tag>
              <span class="venue-title">{{ sub.title }}</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, VideoCamera } from '@element-plus/icons-vue'

import type { LiveItem } from '../../api/live'

interface Props {
  mainVenue: LiveItem | null
  subVenues: LiveItem[]
  currentVenueId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'switch', venueId: number): void
}>()

const currentVenueName = computed(() => {
  if (props.currentVenueId === props.mainVenue?.id) {
    return props.mainVenue?.title || '主会场'
  }
  const sub = props.subVenues.find(s => s.id === props.currentVenueId)
  return sub?.title || '分会场'
})

const handleSwitch = (venueId: number) => {
  if (venueId !== props.currentVenueId) {
    emit('switch', venueId)
  }
}
</script>

<style scoped>
.venue-switcher {
  display: inline-flex;
}

.switcher-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
}

.current-venue-name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
}

.venue-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.venue-title {
  font-size: 14px;
}

.el-dropdown-menu :deep(.el-dropdown-item.is-active) {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
</style>