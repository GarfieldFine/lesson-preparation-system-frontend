<template>
  <div class="practice-container">
    <!-- 左侧内容区 -->
    <div class="left-content">
      <!-- 推荐课程部分 -->
      <div class="section recommend-section">
        <div class="section-header">
          <h2>精选推荐</h2>
          <div class="nav-controls">
            <el-button-group>
              <el-button type="primary" text @click="prevRecommend">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button type="primary" text @click="nextRecommend">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div class="recommend-cards">
          <div v-for="(item, index) in recommendCourses" :key="index" class="recommend-card">
            <div class="card-image">
              <img :src="item.image" :alt="item.title">
              <div class="card-overlay">
                <span class="time" v-if="item.time">
                  <el-icon><Clock /></el-icon>
                  {{ item.time }}
                </span>
              </div>
            </div>
            <div class="card-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习计划部分 -->
      <div class="section study-plan">
        <div class="section-header">
          <h2>学习计划</h2>
          <el-button type="primary" text>
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="plan-cards">
          <div v-for="(plan, index) in studyPlans" :key="index"
               class="plan-card" :class="`gradient-${index + 1}`">
            <div class="plan-icon">
              <img :src="plan.icon" :alt="plan.title">
            </div>
            <div class="plan-content">
              <h3>{{ plan.title }}</h3>
              <p>{{ plan.description }}</p>
              <el-button class="start-btn" round>开始学习</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 题目分类部分 -->
      <div class="section categories-section">
        <h2>题目分类</h2>
        <div class="category-grid">
          <div v-for="(category, index) in categories"
               :key="index"
               class="category-card"
               :class="{ active: currentCategory === index }"
               @click="selectCategory(index)">
            <h4>{{ category.name }}</h4>
            <div class="category-info">
              <span class="count">{{ category.count }}</span>
              <span class="label">题目</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="right-content">
      <!-- 日历部分 -->
      <div class="section calendar-section">
        <div class="calendar-header">
          <div class="calendar-title">
            <el-icon><Calendar /></el-icon>
            <span>每日刷题</span>
          </div>
          <div class="calendar-nav">
            <el-button-group>
              <el-button text @click="previousMonth">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button text>{{ currentMonthText }}</el-button>
              <el-button text @click="nextMonth">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div class="custom-calendar">
          <div class="calendar-weekdays">
            <span v-for="day in weekDays" :key="day">{{ day }}</span>
          </div>
          <div class="calendar-days">
            <div v-for="(day, index) in calendarDays"
                 :key="index"
                 :class="getDayClass(day)"
                 @click="selectDay(day)">
              <span class="day-number">{{ day.date }}</span>
              <div class="day-indicator" v-if="day.hasCompleted"></div>
              <div class="day-streak" v-if="day.streak">{{ day.streak }}天</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plus会员挑战 -->
      <div class="section plus-challenge">
        <div class="challenge-header">
          <h3>
            <el-icon><Trophy /></el-icon>
            Plus会员挑战
          </h3>
          <el-tag type="warning" effect="plain">剩余 6 天</el-tag>
        </div>
        <div class="challenge-weeks">
          <div v-for="i in 6" :key="i"
               class="week-block"
               :class="{ completed: i === 2 }">
            <span class="week-label">Week {{ i }}</span>
            <el-icon v-if="i === 2"><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ArrowLeft, ArrowRight, ArrowDown,
  Calendar, Clock, Trophy, Check
} from '@element-plus/icons-vue'

// 定义组件名称（注意：在 <script setup> 中，name 需要通过 defineComponent 显式声明）
import { defineComponent } from 'vue'
const name = 'PracticeQuestion'

// 引入的图标组件注册为局部组件（在 <script setup> 中自动注册）

// 响应式数据
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentDate = ref(new Date())
const currentCategory = ref(0)

const recommendCourses = ref([
  {
    title: '2026届实习生招聘',
    description: '第440场力扣周赛',
    image: 'https://sky-take-out-csuft.oss-cn-beijing.aliyuncs.com/10ef5f66-027a-4799-b007-ff60bc67ea91.jpg',
    time: '03.09 10:30'
  },
  {
    title: '13天突破C语言',
    description: '最全面的C语言入门课程',
    image: 'https://sky-take-out-csuft.oss-cn-beijing.aliyuncs.com/10ef5f66-027a-4799-b007-ff60bc67ea91.jpg'
  },
  {
    title: 'Java基础修炼',
    description: '从BUG入手',
    image: 'https://sky-take-out-csuft.oss-cn-beijing.aliyuncs.com/10ef5f66-027a-4799-b007-ff60bc67ea91.jpg'
  }
])

const studyPlans = ref([
  {
    title: '面试经典 150 题',
    description: '最经典150题，掌握面试所有知识点',
    icon: 'https://sky-take-out-csuft.oss-cn-beijing.aliyuncs.com/10ef5f66-027a-4799-b007-ff60bc67ea91.jpg'
  },
  {
    title: '动态规划（基础版）',
    description: '更细的知识点拆分，让入门更简单',
    icon: 'https://sky-take-out-csuft.oss-cn-beijing.aliyuncs.com/10ef5f66-027a-4799-b007-ff60bc67ea91.jpg'
  },
  {
    title: 'LeetCode 热题 100',
    description: '力扣最受欢迎的高频面试题',
    icon: 'https://sky-take-out-csuft.oss-cn-beijing.aliyuncs.com/10ef5f66-027a-4799-b007-ff60bc67ea91.jpg'
  }
])

const categories = ref([
  { name: '数组', count: 2036 },
  { name: '字符串', count: 845 },
  { name: '哈希表', count: 739 },
  { name: '动态规划', count: 643 },
  { name: '数学', count: 626 },
  { name: '排序', count: 482 }
])

// 计算属性
const currentMonthText = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(currentDate.value)
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({
      date: date.getDate(),
      isCurrentMonth: false,
      hasCompleted: false
    })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      date: i,
      isCurrentMonth: true,
      hasCompleted: Math.random() > 0.5,
      streak: i % 7 === 0 ? 7 : null
    })
  }

  return days
})

// 方法
function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

function getDayClass(day) {
  const isToday = (date) => new Date(date).toDateString() === new Date().toDateString()
  return {
    'other-month': !day.isCurrentMonth,
    'today': isToday(day.date),
    'completed': day.hasCompleted,
    'selected': false // 注意：isSelected 函数需要定义或移除
  }
}

// 由于 methods 在 <script setup> 中不直接支持，但可以通过定义函数来实现相同功能
function prevRecommend() {
  // 处理前一个推荐
}

function nextRecommend() {
  // 处理下一个推荐
}

function selectCategory(index) {
  currentCategory.value = index
}

function isCompleted(date) {
  // 判断该日期是否完成题目
  return false
}

</script>

<style scoped>
.practice-container {
  display: flex;
  gap: 32px;
  padding: 24px;
  background: #f6f8fa;
  min-height: 100vh;
}

.left-content {
  flex: 1;
}

.right-content {
  width: 320px;
}

.section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 推荐课程卡片样式 */
.recommend-cards {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 4px;
  scroll-behavior: smooth;
}

.recommend-card {
  flex: 0 0 320px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: transform 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.recommend-card:hover {
  transform: translateY(-4px);
}

.card-image {
  position: relative;
  height: 180px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: #fff;
}

.card-content {
  padding: 16px;
}

.card-content h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.card-content p {
  color: #666;
  font-size: 14px;
}

/* 学习计划卡片样式 */
.plan-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.plan-card {
  padding: 24px;
  border-radius: 12px;
  color: #fff;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  transition: transform 0.3s;
}

.plan-card:hover {
  transform: scale(1.02);
}

.gradient-1 { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.gradient-2 { background: linear-gradient(135deg, #10b981, #059669); }
.gradient-3 { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }

.plan-icon img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
}

.plan-content h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.plan-content p {
  opacity: 0.8;
  margin-bottom: 16px;
}

.start-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
}

/* 分类网格样式 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.category-card {
  padding: 20px;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e2e8f0;
}

.category-card:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.category-card.active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.category-info {
  margin-top: 12px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.count {
  font-size: 24px;
  font-weight: 600;
  color: #3b82f6;
}

.label {
  color: #64748b;
  font-size: 14px;
}

/* 日历样式优化 */
.calendar-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.calendar-nav {
  display: flex;
  gap: 12px;
}

.custom-calendar {
  width: 100%;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 12px;
}

.calendar-weekdays span {
  font-size: 13px;
  color: #64748b;
  padding: 8px 0;
  font-weight: 500;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-days > div {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.calendar-days > div:hover {
  background: #f1f5f9;
}

.calendar-days > div.today {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 600;
}

.calendar-days > div.completed {
  background: #ecfdf5;
}

.calendar-days > div.selected {
  background: #3b82f6;
  color: white;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
}

.day-indicator {
  position: absolute;
  bottom: 6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #3b82f6;
}

.day-streak {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  padding: 2px 4px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
}

/* 学习计划卡片样式优化 */
.plan-card {
  background: white;
  border: 1px solid #e2e8f0;
  color: #1e293b;
}

.gradient-1 {
  background: linear-gradient(135deg, #ffffff, #f0f9ff);
  border-left: 4px solid #3b82f6;
}

.gradient-2 {
  background: linear-gradient(135deg, #ffffff, #f0fdf4);
  border-left: 4px solid #10b981;
}

.gradient-3 {
  background: linear-gradient(135deg, #ffffff, #f5f3ff);
  border-left: 4px solid #8b5cf6;
}

.plan-content h3 {
  color: #1e293b;
}

.plan-content p {
  color: #64748b;
}

.start-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  transition: all 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* 分类卡片样式优化 */
.category-card {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.category-card.active {
  background: #f8fafc;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* 轮播图样式 */
.recommend-section :deep(.el-carousel__item) {
  border-radius: 16px;
  overflow: hidden;
}

.carousel-card {
  position: relative;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.carousel-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
}

.carousel-content h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.carousel-content p {
  font-size: 14px;
  opacity: 0.9;
}

/* Plus会员挑战样式 */
.challenge-weeks {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.week-block {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.week-block.completed {
  background: #ecfdf5;
  border-color: #10b981;
  color: #10b981;
}

.week-label {
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}
</style>
