<template>
  <div class="user-page app-page">
    <PageHeader
      eyebrow="Access control"
      title="管理后台"
      description="集中维护账号角色与权限分配，帮助管理员快速识别当前系统中的角色结构。"
    />

    <div class="summary-grid app-summary-grid" data-columns="4">
      <SummaryCard label="用户总数" :value="users.length" description="当前系统内的全部账号" tone="primary" />
      <SummaryCard label="管理员" :value="adminCount" hint="高权限" description="负责系统配置与权限分配" tone="warning" />
      <SummaryCard label="主持人" :value="hostCount" description="可创建会议与直播的账号" tone="success" />
      <SummaryCard label="普通用户" :value="userCount" description="参与会议与观看直播的账号" tone="neutral" />
    </div>

    <el-card class="table-card app-table-card" shadow="never">
      <el-table :data="users" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="220" />
        <el-table-column label="当前角色" width="140">
          <template #default="scope">
            <StatusTag :text="roleText(scope.row.role)" :status="scope.row.role" />
          </template>
        </el-table-column>
        <el-table-column label="角色调整" min-width="220">
          <template #default="scope">
            <el-select :model-value="scope.row.role" class="role-select" @change="(value: Role) => changeRole(scope.row.id, value)">
              <el-option label="管理员" value="admin" />
              <el-option label="主持人" value="host" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && !users.length" description="当前没有可管理的用户账号。" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

import PageHeader from '../../components/layout/PageHeader.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import StatusTag from '../../components/ui/StatusTag.vue'
import SummaryCard from '../../components/ui/SummaryCard.vue'
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
.role-select {
  width: 180px;
}
</style>
