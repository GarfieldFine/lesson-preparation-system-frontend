<template>
  <div class="question-creator-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部搜索和通知栏 -->
      <div class="top-bar">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="搜索题目或标签...">
        </div>
        <div class="action-buttons">
          <button class="btn btn-outline" @click="router.push(`/lesson/practice/generate/${teacherScheduleId}`)">
            <i class="fas fa-magic"></i> 智能出题
          </button>
          <button class="btn btn-outline" @click="router.push(`/lesson/practice/stats/${teacherScheduleId}`)">
            <i class="fas fa-chart-pie"></i> 统计分析
          </button>
          <button class="btn btn-outline" @click="router.push(`/lesson/practice/question-bank/${teacherScheduleId}`)">
            <i class="fas fa-book"></i> 题库管理
          </button>
          <button class="btn btn-primary" @click="router.push('/lesson/practice/ai-assistant')">
            <i class="fas fa-robot"></i> AI助手
          </button>
        </div>
      </div>
      <!-- 路由出口 -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const teacherScheduleId = useRoute().params.teacherScheduleId
</script>

<style scoped>
/* 全局样式 */
.question-creator-container {
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #f8f9fa;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f1f3f5;
  border-radius: 20px;
  padding: 8px 15px;
  width: 300px;
}

.search-bar.wide {
  width: 400px;
}

.search-bar i {
  color: #6c757d;
  margin-right: 8px;
}

.search-bar input {
  border: none;
  background: transparent;
  flex: 1;
  outline: none;
  color: #495057;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn i {
  margin-right: 6px;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #dee2e6;
  color: #495057;
  position: relative;
}

.btn-outline:hover {
  background-color: #f8f9fa;
}

.btn-text {
  background-color: transparent;
  color: #4361ee;
  padding: 4px 8px;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #f03e3e;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 路由出口样式 */
.router-view {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}
</style>
