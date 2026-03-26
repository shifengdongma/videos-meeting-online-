<template>
  <AuthShell>
    <el-card class="auth-card" shadow="never">
      <div class="auth-content">
        <div class="auth-eyebrow">Welcome back</div>
        <h2>登录系统</h2>
        <p class="auth-description">登录后可进入会议中心、直播控制台与后台权限管理。</p>

        <el-form class="auth-form" @submit.prevent="handleSubmit">
          <el-form-item label="用户名">
            <el-input v-model="form.username" size="large" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" show-password size="large" placeholder="请输入密码" />
          </el-form-item>

          <el-button class="submit-btn" type="primary" size="large" @click="handleSubmit">
            登录并进入系统
          </el-button>

          <div class="auth-footer">
            <span>还没有账号？</span>
            <el-button link type="primary" @click="router.push('/register')">立即注册</el-button>
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
    await authStore.loginAction(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/')
  } catch {
    ElMessage.error('登录失败')
  }
}
</script>

<style scoped>
.auth-card {
  width: min(468px, 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.14);
}
.auth-content {
  padding: 16px;
}
.auth-eyebrow {
  color: #6366f1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.auth-content h2 {
  margin: 14px 0 0;
  font-size: clamp(30px, 4vw, 34px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: #0f172a;
}
.auth-description {
  margin: 14px 0 0;
  color: #64748b;
  line-height: 1.75;
}
.auth-form {
  margin-top: 28px;
}
.submit-btn {
  width: 100%;
  margin-top: 8px;
  height: 46px;
  border-radius: 14px;
}
.auth-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 14px;
}
</style>
