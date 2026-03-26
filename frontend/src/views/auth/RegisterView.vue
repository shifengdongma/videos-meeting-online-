<template>
  <AuthShell>
    <el-card class="auth-card" shadow="never">
      <div class="auth-content">
        <div class="auth-eyebrow">Create account</div>
        <h2>注册账号</h2>
        <p class="auth-description">完成注册后即可参与会议、进入直播间，并按权限使用后台功能。</p>

        <el-form class="auth-form" @submit.prevent="handleSubmit">
          <el-form-item label="用户名">
            <el-input v-model="form.username" size="large" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" show-password size="large" placeholder="请输入密码" />
          </el-form-item>

          <el-button class="submit-btn" type="primary" size="large" @click="handleSubmit">
            注册并进入系统
          </el-button>

          <div class="auth-footer">
            <span>已有账号？</span>
            <el-button link type="primary" @click="router.push('/login')">返回登录</el-button>
          </div>
        </el-form>
      </div>
    </el-card>
  </AuthShell>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import AuthShell from '../../components/auth/AuthShell.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = reactive({ username: '', password: '' })

const handleSubmit = async () => {
  try {
    await authStore.registerAction(form.username, form.password)
    ElMessage.success('注册成功')
    router.push('/')
  } catch {
    ElMessage.error('注册失败')
  }
}
</script>

<style scoped>
.auth-card {
  width: min(488px, 100%);
  border: 1px solid rgba(46, 58, 89, 0.12);
  border-radius: 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(255, 255, 255, 0.72) 100%);
  backdrop-filter: blur(22px);
  box-shadow:
    0 24px 56px rgba(26, 31, 59, 0.14),
    0 34px 78px rgba(46, 58, 89, 0.12);
}
.auth-content {
  padding: 20px;
}
.auth-eyebrow {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.auth-content h2 {
  margin: 14px 0 0;
  font-size: clamp(30px, 4vw, 36px);
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: var(--color-text-primary);
}
.auth-description {
  margin: 14px 0 0;
  color: var(--color-text-muted);
  line-height: 1.8;
}
.auth-form {
  margin-top: 28px;
}
:deep(.auth-form .el-form-item) {
  margin-bottom: 20px;
}
:deep(.auth-form .el-form-item__label) {
  padding-bottom: 8px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
}
.submit-btn {
  width: 100%;
  margin-top: 10px;
  height: 52px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  box-shadow:
    0 18px 34px rgba(46, 58, 89, 0.22),
    0 8px 20px rgba(46, 58, 89, 0.14);
}
.submit-btn:hover {
  box-shadow:
    0 22px 38px rgba(46, 58, 89, 0.28),
    0 10px 22px rgba(46, 58, 89, 0.16);
}
.auth-footer {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
