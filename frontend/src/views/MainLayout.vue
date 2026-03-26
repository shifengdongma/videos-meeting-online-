<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand-block">
        <div class="brand-mark">EV</div>
        <div>
          <div class="brand-title">视频会议管理系统</div>
          <div class="brand-subtitle">Meeting · Live · Vote</div>
        </div>
      </div>

      <el-menu
        :default-active="route.path"
        router
        class="nav-menu"
      >
        <el-menu-item index="/meetings">
          <span>会议中心</span>
        </el-menu-item>
        <el-menu-item index="/live">
          <span>直播中心</span>
        </el-menu-item>
        <el-menu-item v-if="authStore.role === 'admin'" index="/admin/users">
          <span>后台管理</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <div class="footer-label">当前角色</div>
        <div class="footer-value">{{ roleLabel }}</div>
      </div>
    </aside>

    <div class="main-panel">
      <header class="topbar">
        <div>
          <div class="topbar-label">统一协作平台</div>
          <div class="topbar-title">{{ pageTitle }}</div>
        </div>
        <div class="topbar-actions">
          <div class="user-card">
            <div class="user-name">{{ authStore.user?.username }}</div>
            <div class="user-role">{{ roleLabel }}</div>
          </div>
          <el-button class="logout-btn" @click="logout">退出登录</el-button>
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

import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const pageTitle = computed(() => {
  if (route.path.startsWith('/meetings/')) return '会议控制台'
  if (route.path.startsWith('/live/')) return '直播控制台'
  if (route.path.startsWith('/live')) return '直播中心'
  if (route.path.startsWith('/admin')) return '后台管理'
  return '会议中心'
})

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

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--app-shell-sidebar-width) minmax(0, 1fr);
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.14), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 30px 20px 22px;
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  color: #fff;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
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
  background: linear-gradient(135deg, #6366f1 0%, #38bdf8 100%);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 18px 36px rgba(79, 70, 229, 0.24);
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
  height: 50px;
  margin-bottom: 8px;
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.74);
  font-weight: 600;
}
:deep(.nav-menu .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
:deep(.nav-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(56, 189, 248, 0.18));
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}
.sidebar-footer {
  margin-top: 20px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
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
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: var(--app-shell-topbar-padding-top) var(--app-shell-gutter) var(--app-shell-topbar-padding-bottom);
}
.topbar-label {
  color: #6366f1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.topbar-title {
  margin-top: 8px;
  font-size: clamp(28px, 3vw, 34px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: #0f172a;
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-card {
  padding: 10px 14px;
  border-radius: 18px;
  background: var(--app-surface-glass);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
}
.user-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
.user-role {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}
.logout-btn {
  border-radius: 12px;
}
.content-area {
  flex: 1;
  padding: 0 var(--app-shell-gutter) var(--app-shell-gutter);
}
.content-inner {
  min-height: 100%;
}
@media (max-width: 1100px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    padding-bottom: 14px;
  }
  .topbar,
  .content-area {
    padding-left: var(--app-shell-gutter-compact);
    padding-right: var(--app-shell-gutter-compact);
  }
}
@media (max-width: 720px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .topbar-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
