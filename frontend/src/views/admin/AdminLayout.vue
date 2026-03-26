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
          <div class="topbar-label">Admin workspace</div>
          <div class="topbar-title">{{ pageTitle }}</div>
        </div>
        <div class="topbar-actions">
          <div class="user-card">
            <div class="user-avatar">{{ authStore.user?.username?.slice(0, 1).toUpperCase() || 'A' }}</div>
            <div>
              <div class="user-name">{{ authStore.user?.username }}</div>
              <div class="user-role">系统管理员</div>
            </div>
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
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), transparent 26%),
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 30px 20px 22px;
  background: linear-gradient(180deg, #020617 0%, #0f172a 100%);
  color: #fff;
  border-right: 1px solid rgba(148, 163, 184, 0.1);
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
  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 18px 36px rgba(14, 165, 233, 0.2);
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
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.24), rgba(99, 102, 241, 0.18));
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
  color: #0ea5e9;
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
  .admin-shell {
    grid-template-columns: 1fr;
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
