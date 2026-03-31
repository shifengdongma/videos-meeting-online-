<template>
  <div class="h5-login">
    <div class="brand-header">
      <img src="../../assets/logo.png" class="logo" />
      <h1>视频会议管理系统</h1>
      <p class="brand-desc">面向会议、直播和在线表决的统一协作平台</p>
    </div>

    <van-form @submit="handleSubmit">
      <van-field
        v-model="form.username"
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        :rules="[{ required: true, message: '请输入用户名' }]"
      />
      <van-field
        v-model="form.password"
        type="password"
        name="password"
        label="密码"
        placeholder="请输入密码"
        :rules="[{ required: true, message: '请输入密码' }]"
      />
      <div class="submit-btn">
        <van-button round block type="primary" native-type="submit">
          登录进入系统
        </van-button>
      </div>
    </van-form>

    <div class="register-link">
      <span>还没有账号？</span>
      <router-link to="/register">立即注册</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = reactive({ username: '', password: '' })

const handleSubmit = async () => {
  try {
    await authStore.loginAction(form.username, form.password)
    showToast('登录成功')
    router.push('/dashboard')
  } catch {
    showToast('登录失败')
  }
}
</script>

<style scoped>
.h5-login {
  min-height: 100vh;
  padding: 40px 24px;
  background: linear-gradient(180deg, #f4f6f8 0%, #edf1f5 100%);
  display: flex;
  flex-direction: column;
}

.brand-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.brand-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #2E3A59;
  margin: 0;
}

.brand-desc {
  font-size: 14px;
  color: #6b748b;
  margin-top: 8px;
}

.submit-btn {
  margin-top: 24px;
  padding: 0 16px;
}

.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b748b;
}

.register-link a {
  color: #2E3A59;
  font-weight: 500;
}
</style>