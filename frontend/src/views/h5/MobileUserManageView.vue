<template>
  <div class="mobile-user-manage">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1>用户管理</h1>
      <p>管理系统用户账号与权限分配</p>
    </div>

    <!-- 统计卡片 2x2 网格 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">用户总数</div>
        <div class="stat-value">{{ users.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">管理员</div>
        <div class="stat-value admin">{{ adminCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">主持人</div>
        <div class="stat-value host">{{ hostCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">普通用户</div>
        <div class="stat-value user">{{ userCount }}</div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <van-loading v-if="loading" class="loading-center" />

      <van-empty v-else-if="users.length === 0" description="暂无用户数据" />

      <div v-else class="card-list">
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="card-header">
            <div class="user-avatar">
              <van-icon name="user-circle-o" size="36" />
            </div>
            <div class="user-info">
              <div class="user-id">ID: {{ user.id }}</div>
              <div class="user-name">{{ user.username }}</div>
            </div>
            <van-tag :type="getRoleTagType(user.role)">
              {{ roleText(user.role) }}
            </van-tag>
          </div>
          <div class="card-footer">
            <span class="role-label">角色调整:</span>
            <van-dropdown-menu>
              <van-dropdown-item
                :model-value="user.role"
                :options="roleOptions"
                @change="(value: string) => changeRole(user.id, value as Role)"
              />
            </van-dropdown-menu>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item icon="calendar-o" to="/dashboard">日程</van-tabbar-item>
      <van-tabbar-item icon="video-o" to="/meetings">会议</van-tabbar-item>
      <van-tabbar-item icon="play-circle-o" to="/live">直播</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { showToast } from 'vant'

import { fetchUsers, updateUserRole } from '../../api/users'
import type { UserProfile, Role } from '../../types/auth'

const users = ref<UserProfile[]>([])
const loading = ref(false)
const activeTab = ref(0)

const roleOptions = [
  { text: '管理员', value: 'admin' },
  { text: '主持人', value: 'host' },
  { text: '普通用户', value: 'user' }
]

const adminCount = computed(() => users.value.filter((item) => item.role === 'admin').length)
const hostCount = computed(() => users.value.filter((item) => item.role === 'host').length)
const userCount = computed(() => users.value.filter((item) => item.role === 'user').length)

const roleText = (role: Role) => {
  if (role === 'admin') return '管理员'
  if (role === 'host') return '主持人'
  return '普通用户'
}

const getRoleTagType = (role: Role): 'danger' | 'warning' | 'success' => {
  if (role === 'admin') return 'danger'
  if (role === 'host') return 'warning'
  return 'success'
}

const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } finally {
    loading.value = false
  }
}

const changeRole = async (userId: number, role: Role) => {
  try {
    await updateUserRole(userId, role)
    showToast('角色更新成功')
    await loadUsers()
  } catch {
    showToast('更新失败')
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.mobile-user-manage {
  min-height: 100vh;
  padding-bottom: 50px;
  background: #f4f6f8;
}

.page-header {
  padding: 20px 16px;
  background: white;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #2E3A59;
  margin: 0;
}

.page-header p {
  font-size: 14px;
  color: #6b748b;
  margin: 8px 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-label {
  font-size: 12px;
  color: #6b748b;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2E3A59;
  margin-top: 8px;
}

.stat-value.admin { color: #E57373; }
.stat-value.host { color: #FBC02D; }
.stat-value.user { color: #1E9E6F; }

.user-list {
  padding: 16px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #2E3A59;
  margin-top: 2px;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.role-label {
  font-size: 14px;
  color: #6b748b;
  white-space: nowrap;
}

.card-footer :deep(.van-dropdown-menu) {
  flex: 1;
}

.card-footer :deep(.van-dropdown-menu__bar) {
  background: transparent;
  box-shadow: none;
}

.card-footer :deep(.van-dropdown-menu__title) {
  font-size: 14px;
}
</style>