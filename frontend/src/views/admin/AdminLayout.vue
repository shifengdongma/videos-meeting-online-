<template>
  <div class="admin-shell">
    <div class="shell-glow shell-glow-a"></div>
    <div class="shell-glow shell-glow-b"></div>

    <aside class="sidebar">
      <div class="sidebar-inner">
        <div class="brand-block">
          <div class="brand-mark">ADM</div>
          <div>
            <div class="brand-title">管理后台</div>
            <div class="brand-subtitle">Users · Roles · Templates</div>
          </div>
        </div>

        <el-menu :default-active="route.path" router class="nav-menu">
          <el-menu-item index="/admin/users">
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/rooms">
            <span>会议室模板</span>
          </el-menu-item>
          <el-menu-item index="/meetings">
            <span>返回前台</span>
          </el-menu-item>
        </el-menu>

        <div class="sidebar-footer">
          <div class="footer-label">当前账号</div>
          <div class="footer-value">{{ authStore.user?.username }}</div>
        </div>
      </div>
    </aside>

    <div class="main-panel">
      <header class="topbar">
        <div>
          <div class="topbar-label">统一协作平台</div>
          <div class="topbar-title">{{ pageTitle }}</div>
        </div>

        <div class="flex min-h-[64px] min-w-[220px] items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-[#2E3A59]/10 text-sm font-bold uppercase text-[#2E3A59]">
            {{ authStore.user?.username?.slice(0, 1).toUpperCase() || 'A' }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold text-slate-900">{{ authStore.user?.username }}</div>
            <div class="mt-1 text-xs text-slate-500">系统管理员</div>
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

      <main class="content-area">
        <div class="content-inner">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  if (route.path.startsWith('/admin/rooms')) return '会议室模板'
  return '用户与权限管理'
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--app-shell-sidebar-width) minmax(0, 1fr);
  background: var(--color-sidebar);
}
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 30px 20px 22px;
  background: var(--color-sidebar);
  color: #fff;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.04);
}
.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 10px 26px;
}
.brand-mark {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.08) 100%);
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 18px 36px rgba(10, 14, 30, 0.24);
  backdrop-filter: blur(12px);
}
.brand-title {
  font-size: 16px;
  font-weight: 700;
}
.brand-subtitle {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
}
.nav-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}
:deep(.nav-menu .el-menu-item) {
  height: 52px;
  margin-bottom: 8px;
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.74);
  font-weight: 600;
  transition: background-color var(--motion-fast) ease, transform var(--motion-fast) ease, color var(--motion-fast) ease;
}
:deep(.nav-menu .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transform: translateX(2px);
}
:deep(.nav-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.08));
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}
.sidebar-footer {
  margin-top: 20px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(14px);
}
.footer-label {
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
}
.footer-value {
  margin-top: 6px;
  font-size: 15px;
  font-weight: 700;
}
.main-panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #e5e9f0;
}
.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 32px 0;
}
.topbar-label {
  color: rgba(46, 58, 89, 0.7);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}
.topbar-title {
  margin-top: 12px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #2e3a59;
}
.content-area {
  flex: 1;
  padding: 0 32px 32px;
}
.content-inner {
  min-height: 100%;
}
@media (max-width: 1100px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
  .topbar,
  .content-area {
    padding-left: 20px;
    padding-right: 20px;
  }
}
@media (max-width: 720px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
