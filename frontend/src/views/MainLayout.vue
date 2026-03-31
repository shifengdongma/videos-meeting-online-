<template>
  <div class="min-h-screen bg-[#F4F6F8] text-slate-900">
    <aside class="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-[#2E3A59] text-white shadow-2xl">
      <div class="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold tracking-[0.2em] text-white">
          EV
        </div>
        <div>
          <div class="text-sm font-semibold">视频会议管理系统</div>
          <div class="mt-1 text-xs text-white/60">Meeting · Live · Vote</div>
        </div>
      </div>

      <nav class="flex-1 px-0 py-6">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="group flex items-center gap-3 border-l-4 px-6 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          :class="isActive(item.path) ? 'border-blue-400 bg-white/10 text-white' : 'border-transparent text-white/75 hover:bg-white/5 hover:text-white'"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="border-t border-white/10 px-6 py-5">
        <div class="text-xs text-white/60">当前角色</div>
        <div class="mt-2 text-sm font-semibold text-white">{{ roleLabel }}</div>
      </div>
    </aside>

    <div class="ml-64 min-h-screen bg-[#F4F6F8] p-8">
      <header class="mb-8 flex items-start justify-between gap-6">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.24em] text-[#2E3A59]/70">统一协作平台</div>
          <div class="mt-3 text-3xl font-bold tracking-tight text-[#2E3A59]">{{ pageTitle }}</div>
        </div>

        <div class="flex min-h-[64px] min-w-[220px] items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-[#2E3A59]/10 text-sm font-bold uppercase text-[#2E3A59]">
            {{ authStore.user?.username?.slice(0, 1).toUpperCase() || 'U' }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold text-slate-900">{{ authStore.user?.username }}</div>
            <div class="mt-1 text-xs text-slate-500">{{ roleLabel }}</div>
          </div>
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-gray-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E3A59]/30"
            @click="logout"
          >
            退出登录
          </button>
        </div>
      </header>

      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDaysIcon, SignalIcon, UserGroupIcon, PlayCircleIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const navItems = computed(() => {
  const items = [
    { path: '/dashboard', label: '仪表盘', icon: CalendarIcon },
    { path: '/meetings', label: '会议中心', icon: CalendarDaysIcon },
    { path: '/live', label: '直播中心', icon: SignalIcon },
    { path: '/playback', label: '回放中心', icon: PlayCircleIcon }
  ]

  if (authStore.role === 'admin') {
    items.push({ path: '/admin/users', label: '后台管理', icon: UserGroupIcon })
  }

  return items
})

const pageTitle = computed(() => {
  if (route.path.startsWith('/dashboard')) return '仪表盘'
  if (route.path.startsWith('/meetings/')) return '会议控制台'
  if (route.path.startsWith('/live/')) return '直播控制台'
  if (route.path.startsWith('/live')) return '直播中心'
  if (route.path.startsWith('/playback')) return '回放中心'
  if (route.path.startsWith('/admin')) return '后台管理'
  return '会议中心'
})

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)

const roleLabel = computed(() => {
  if (authStore.role === 'admin') return '系统管理员'
  if (authStore.role === 'host') return '会议主持人'
  return '普通成员'
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
