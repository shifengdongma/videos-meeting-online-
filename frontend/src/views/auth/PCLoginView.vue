<template>
  <div class="min-h-screen w-full flex font-inter">
    <section class="hidden w-[55%] flex-col justify-between bg-gradient-to-br from-[#2E3A59] to-[#1a2133] px-16 py-14 text-white lg:flex">
      <div class="space-y-6">
        <div class="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-white/80 backdrop-blur-md">
          <img src="../../assets/logo.png" alt="logo" class="mr-8 h-16 w-16 object-contain" />
          新国脉数字文化股份有限公司
        </div>
        <div class="max-w-2xl space-y-5">
          <h1 class="text-5xl font-semibold leading-tight tracking-[-0.04em]">
            视频会议管理系统
          </h1>
          <p class="max-w-xl text-base leading-8 text-white/72 xl:text-lg">
            面向会议、直播和在线表决的统一协作平台，让管理员、主持人和参会成员在同一套产品体验中完成日常业务。
          </p>
        </div>
      </div>

      <div class="space-y-5">
        <div class="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-transform hover:-translate-y-1">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5M5.25 4.5h13.5A1.5 1.5 0 0 1 20.25 6v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Z" />
            </svg>
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-semibold">稳定会议</h3>
            <p class="text-sm leading-7 text-white/72">
              统一管理会议预约、状态流转与会议入口，确保日常协作稳定可控。
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-transform hover:-translate-y-1">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6.75a3.75 3.75 0 1 0-7.5 0v6m10.5 0a2.25 2.25 0 0 1 2.25 2.25v3a2.25 2.25 0 0 1-2.25 2.25h-13.5A2.25 2.25 0 0 1 3 18v-3a2.25 2.25 0 0 1 2.25-2.25m13.5 0h-13.5" />
            </svg>
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-semibold">实时音视频</h3>
            <p class="text-sm leading-7 text-white/72">
              支持本地音视频与桌面共享，帮助主持人与成员快速进入高效协同状态。
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-transform hover:-translate-y-1">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 12h9.75M10.5 18h9.75M3.75 6h.008v.008H3.75V6Zm0 6h.008v.008H3.75V12Zm0 6h.008v.008H3.75V18Z" />
            </svg>
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-semibold">在线表决</h3>
            <p class="text-sm leading-7 text-white/72">
              提供会议投票与结果反馈能力，让关键议题在线完成决策闭环。
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="flex w-full items-center justify-center bg-[#F4F6F8] px-6 py-10 lg:w-[45%] lg:px-10">
      <div class="w-full max-w-[520px] rounded-2xl border border-white/50 bg-white/70 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-10">
        <div class="space-y-3">
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E3A59]">Welcome back</div>
          <h2 class="text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">登录系统</h2>
          <p class="text-sm leading-7 text-slate-600 sm:text-base">
            登录后可进入会议中心、直播控制台与后台权限管理。
          </p>
        </div>

        <el-form class="mt-8" label-position="top" @submit.prevent="handleSubmit">
          <el-form-item label="用户名" class="mb-5 text-sm font-semibold text-slate-700">
            <el-input
              v-model="form.username"
              size="large"
              placeholder="请输入用户名"
              class="w-full"
              style="--el-input-bg-color: rgb(249 250 251); --el-input-border-color: transparent; --el-input-hover-border-color: transparent; --el-input-focus-border-color: transparent; --el-input-border-radius: 0.5rem; --el-input-text-color: #0f172a; --el-input-box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.08), 0 0 0 0 rgba(46, 58, 89, 0); --el-input-focus-box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.08), 0 0 0 2px rgba(46, 58, 89, 0.5);"
              input-style="min-height: 50px; padding: 12px 16px;"
            />
          </el-form-item>
          <el-form-item label="密码" class="mb-5 text-sm font-semibold text-slate-700">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              size="large"
              placeholder="请输入密码"
              class="w-full"
              style="--el-input-bg-color: rgb(249 250 251); --el-input-border-color: transparent; --el-input-hover-border-color: transparent; --el-input-focus-border-color: transparent; --el-input-border-radius: 0.5rem; --el-input-text-color: #0f172a; --el-input-box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.08), 0 0 0 0 rgba(46, 58, 89, 0); --el-input-focus-box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.08), 0 0 0 2px rgba(46, 58, 89, 0.5);"
              input-style="min-height: 50px; padding: 12px 16px;"
            />
          </el-form-item>

          <el-button
            class="mt-3 h-[52px] w-full rounded-lg border-0 bg-[#2E3A59] py-3 text-base font-medium text-white transition-all hover:bg-[#1a2133] hover:shadow-lg active:scale-95"
            type="primary"
            size="large"
            @click="handleSubmit"
          >
            登录进入系统
          </el-button>

          <div class="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span>还没有账号？</span>
            <el-button link type="primary" class="!text-[#2E3A59]" @click="router.push('/register')">立即注册</el-button>
          </div>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

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
