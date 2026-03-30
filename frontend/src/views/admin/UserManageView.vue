<template>
  <div class="space-y-8 pt-4">
    
    <section class="grid grid-cols-4 gap-6">
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">用户总数</div>
        <div class="mt-4 text-4xl font-bold text-[#2E3A59]">{{ users.length }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">当前系统内的全部账号</p>
      </article>
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">管理员</div>
        <div class="mt-4 text-4xl font-bold text-[#E57373]">{{ adminCount }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">负责系统配置与权限分配</p>
      </article>
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">主持人</div>
        <div class="mt-4 text-4xl font-bold text-[#FBC02D]">{{ hostCount }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">可创建会议与直播的账号</p>
      </article>
      <article class="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md">
        <div class="text-sm font-medium text-slate-500">普通用户</div>
        <div class="mt-4 text-4xl font-bold text-[#1E9E6F]">{{ userCount }}</div>
        <p class="mt-3 text-sm leading-6 text-slate-500">参与会议与观看直播的账号</p>
      </article>
    </section>

    <section class="overflow-hidden rounded-xl bg-white shadow-sm">
      <el-table :data="users" v-loading="loading" class="user-table">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="220" />
        <el-table-column label="当前角色" width="140">
          <template #default="scope">
            <span class="inline-flex px-3 py-1 rounded-full text-xs font-medium" :class="roleBadgeClass(scope.row.role)">
              {{ roleText(scope.row.role) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="角色调整" min-width="220">
          <template #default="scope">
            <div class="role-select-wrapper">
              <select
                :value="scope.row.role"
                class="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-10 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                @change="changeRole(scope.row.id, ($event.target as HTMLSelectElement).value as Role)"
              >
                <option value="admin">管理员</option>
                <option value="host">主持人</option>
                <option value="user">普通用户</option>
              </select>
              <span class="role-select-arrow" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && !users.length" description="当前没有可管理的用户账号。" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

import EmptyState from '../../components/ui/EmptyState.vue'
import { fetchUsers, updateUserRole } from '../../api/users'
import type { UserProfile, Role } from '../../types/auth'

const users = ref<UserProfile[]>([])
const loading = ref(false)

const adminCount = computed(() => users.value.filter((item) => item.role === 'admin').length)
const hostCount = computed(() => users.value.filter((item) => item.role === 'host').length)
const userCount = computed(() => users.value.filter((item) => item.role === 'user').length)

const roleText = (role: Role) => {
  if (role === 'admin') return '管理员'
  if (role === 'host') return '主持人'
  return '普通用户'
}

const roleBadgeClass = (role: Role) => {
  if (role === 'admin') return 'bg-orange-100 text-orange-700'
  if (role === 'host') return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
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
  await updateUserRole(userId, role)
  ElMessage.success('角色更新成功')
  await loadUsers()
}

onMounted(loadUsers)
</script>

<style scoped>
.role-select-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.role-select-wrapper select {
  min-height: 40px;
  min-width: 180px;
  cursor: pointer;
}

.role-select-arrow {
  pointer-events: none;
  position: absolute;
  right: 12px;
  display: inline-flex;
  height: 16px;
  width: 16px;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.role-select-arrow svg {
  height: 16px;
  width: 16px;
}

:deep(.user-table .el-table__row) {
  transition: background-color 180ms ease;
}

:deep(.user-table .el-table__row:hover > td.el-table__cell) {
  background: #f9fafb;
}
</style>
