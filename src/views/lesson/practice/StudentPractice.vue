<template>
  <div class="student-practice-container">
    <!-- 头部信息 -->
    <div class="practice-header glass-card" v-if="practiceData">
      <div class="header-info">
        <h1 class="practice-title">{{ practiceData.title }} - 练习题</h1>
        <div class="practice-meta">
          <el-tag type="info" effect="plain">共 {{ practiceData.questions.length }} 题</el-tag>
          <el-tag type="success" effect="plain">已完成 {{ completedCount }} 题</el-tag>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-container">
        <div class="progress-info">
          <span>完成进度: {{ completedCount }} / {{ practiceData.questions.length }}</span>
          <span>{{ Math.round(completedPercentage) }}%</span>
        </div>
        <el-progress
          :percentage="completedPercentage"
          :stroke-width="10"
          :show-text="false"
          status="success"
        />
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="practice-content" v-if="practiceData">
      <!-- 左侧导航 -->
      <div class="question-navigator glass-card">
        <div class="navigator-header">
          <h3>题目导航</h3>
          <button
            class="submit-button"
            :disabled="completedCount < practiceData.questions.length"
            @click="submitAnswers">
            提交
          </button>
        </div>

        <div class="question-nav-items">
          <div
            v-for="(question, index) in practiceData.questions"
            :key="question.id"
            :class="[
              'nav-item',
              currentQuestionIndex === index ? 'active' : '',
              getQuestionStatus(question.id)
            ]"
            @click="navigateToQuestion(index)"
          >
            <span class="question-num">{{ index + 1 }}</span>
            <div class="nav-item-info">
              <el-tag size="small" :type="getQuestionTypeStyle(question.type)">
                {{ getQuestionTypeName(question.type) }}
              </el-tag>
              <div class="nav-item-status">
                <el-icon v-if="isMarked(question.id)"><Star /></el-icon>
                <el-icon v-if="userAnswers[index]" class="status-icon"><Check /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="nav-footer">
          <div class="status-legend">
            <div class="legend-item">
              <div class="status-dot unanswered"></div>
              <span>未作答</span>
            </div>
            <div class="legend-item">
              <div class="status-dot answered"></div>
              <span>已作答</span>
            </div>
            <div class="legend-item">
              <div class="status-dot marked"></div>
              <span>已标记</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧题目内容 -->
      <div class="question-content-wrapper">
        <!-- 分页控制器 -->
        <div class="pagination-controls glass-card">
          <el-button
            type="primary"
            plain
            :disabled="currentQuestionIndex === 0"
            @click="prevQuestion"
          >
            <el-icon><ArrowLeft /></el-icon> 上一题
          </el-button>
          <div class="page-indicator">
            {{ currentQuestionIndex + 1 }} / {{ practiceData.questions.length }}
          </div>
          <el-button
            type="primary"
            :disabled="currentQuestionIndex === practiceData.questions.length - 1"
            @click="nextQuestion"
          >
            下一题 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>

        <!-- 当前题目卡片 -->
        <div class="current-question-card glass-card" v-if="currentQuestion">
          <div class="question-header">
            <div class="question-title">
              <span class="question-number">{{ currentQuestionIndex + 1 }}</span>
              <el-tag :type="getQuestionTypeStyle(currentQuestion.type)">
                {{ getQuestionTypeName(currentQuestion.type) }}
              </el-tag>
            </div>
            <div class="question-actions">
              <el-button
                size="small"
                :type="isMarked(currentQuestion.id) ? 'warning' : 'info'"
                @click="toggleMarkQuestion(currentQuestion.id)"
              >
                <el-icon><Star /></el-icon>
                {{ isMarked(currentQuestion.id) ? '取消标记' : '标记题目' }}
              </el-button>
            </div>
          </div>

          <div class="question-content">
            <div class="content-text">{{ currentQuestion.content }}</div>

            <!-- 选择题 -->
            <div v-if="currentQuestion.type+'' === '1'" class="option-container">
              <el-radio-group v-model="userAnswers[currentQuestionIndex]" @change="checkAnswer(currentQuestionIndex)">
                <el-radio
                  v-for="(option, optIndex) in (currentQuestion.options)"
                  :key="optIndex"
                  :label="String.fromCharCode(65 + optIndex)"
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                  <span class="option-content">{{ option[1] }}</span>
                </el-radio>
              </el-radio-group>
            </div>

            <!-- 填空题 -->
            <div v-else-if="currentQuestion.type+'' === '2'" class="blank-container">
              <el-input
                v-model="userAnswers[currentQuestionIndex]"
                placeholder="请输入答案"
                class="blank-input"
                @input="checkAnswer(currentQuestionIndex)"
              ></el-input>
            </div>

            <!-- 判断题 -->
            <div v-else-if="currentQuestion.type+'' === '3'" class="judge-container">
              <el-radio-group v-model="userAnswers[currentQuestionIndex]" @change="checkAnswer(currentQuestionIndex)">
                <el-radio label="1" class="judge-option">
                  <el-icon><Select /></el-icon> 正确
                </el-radio>
                <el-radio label="0" class="judge-option">
                  <el-icon><Close /></el-icon> 错误
                </el-radio>
              </el-radio-group>
            </div>

            <!-- 简答题 -->
            <div v-else-if="currentQuestion.type+'' === '4'" class="essay-container">
              <el-input
                v-model="userAnswers[currentQuestionIndex]"
                type="textarea"
                :rows="6"
                placeholder="请输入您的答案..."
                resize="none"
                @input="checkAnswer(currentQuestionIndex)"
              ></el-input>
              <div class="essay-tips">
                <el-icon><InfoFilled /></el-icon>
                <span>简答题无字数限制，请条理清晰地表达您的观点</span>
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="question-footer">
            <div class="question-tags">
              <el-tag
                v-for="tag in currentQuestion.tags"
                :key="tag"
                class="tag"
                effect="plain"
                size="small"
                round
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Check,
  Star,
  InfoFilled,
  ArrowLeft,
  ArrowRight,
  Select,
  Close
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getQuestionsByAssessmentQuestionGroupsId } from '@/api/assessmentQuestionGroups'
import { submitPracticeAnswerService } from '@/api/studentPracticeRecord.js'

const router = useRouter()
const route = useRoute()
const practiceId = route.params.practiceGroupId

const currentQuestionIndex = ref(0)
const userAnswers = ref([])
const markedQuestions = ref([])

// 获取当前题目
const currentQuestion = computed(() => {
  return practiceData.value.questions[currentQuestionIndex.value]
})

// 模拟练习数据
const practiceData = ref({
  id: practiceId,
  title: '第一章 函数与导数',
  questions: []
})

// 获取问题类型名称
const getQuestionTypeName = (type) => {
  const typeMap = {
    '1': '选择题',
    '2': '填空题',
    '3': '判断题',
    '4': '简答题'
  }
  return typeMap[type] || type
}

// 获取问题类型样式
const getQuestionTypeStyle = (type) => {
  const styleMap = {
    '1': '',
    '2': 'warning',
    '3': 'info',
    '4': 'success'
  }
  return styleMap[type] || ''
}

// 检查是否可以访问指定题目
const canAccessQuestion = (index) => {
  // 只能访问已答过的题目或下一个待答题目
  return index <= getMaxAccessibleIndex()
}

// 获取最大可访问的题目索引
const getMaxAccessibleIndex = () => {
  // 已完成的最后一道题的索引，或者当前题目索引
  for (let i = practiceData.value.questions.length - 1; i >= 0; i--) {
    if (userAnswers.value[i] !== undefined && userAnswers.value[i] !== '') {
      return Math.min(i + 1, practiceData.value.questions.length - 1)
    }
  }
  return 0 // 如果没有完成任何题目，只能访问第一题
}

// 获取答题状态
const getQuestionStatus = (questionId) => {
  const index = practiceData.value.questions.findIndex(q => q.id === questionId)

  if (markedQuestions.value.includes(questionId)) {
    return 'marked'
  }
  if (userAnswers.value[index] !== undefined && userAnswers.value[index] !== '') {
    return 'answered'
  }
  return 'unanswered'
}

// 是否已标记题目
const isMarked = (questionId) => {
  return markedQuestions.value.includes(questionId)
}

// 切换标记题目
const toggleMarkQuestion = (questionId) => {
  const index = markedQuestions.value.indexOf(questionId)
  if (index > -1) {
    markedQuestions.value.splice(index, 1)
  } else {
    markedQuestions.value.push(questionId)
  }
}

// 检查答案是否填写
const checkAnswer = (index) => {
  // 如果当前题目已回答，可以自动进入下一题
  if (index === currentQuestionIndex.value &&
    userAnswers.value[index] !== undefined &&
    userAnswers.value[index] !== '') {
    nextQuestionIfPossible()
  }
}

// 导航到指定题目
const navigateToQuestion = (index) => {
  if (index < 0 || index >= practiceData.value.questions.length) return

  // 只能导航到已完成题目和下一个待完成题目
  if (canAccessQuestion(index)) {
    currentQuestionIndex.value = index
  } else {
    ElMessage.warning('请按顺序完成题目')
  }
}

// 上一题
const prevQuestion = () => {
  navigateToQuestion(currentQuestionIndex.value - 1)
}

// 下一题，仅当当前题目已回答时才能进入下一题
const nextQuestion = () => {
  if (userAnswers.value[currentQuestionIndex.value]) {
    navigateToQuestion(currentQuestionIndex.value + 1)
  } else {
    ElMessage.warning('请先回答当前题目再继续')
  }
}

// 如果可能，自动进入下一题
const nextQuestionIfPossible = () => {
  if (currentQuestionIndex.value < practiceData.value.questions.length - 1) {
    nextTick(() => {
      nextQuestion()
    })
  }
}

// 计算已完成题目数量
const completedCount = computed(() => {
  return userAnswers.value.filter(answer => answer !== undefined && answer !== '').length
})

// 计算完成百分比
const completedPercentage = computed(() => {
  return (completedCount.value / practiceData.value.questions.length) * 100
})

// 监听页面离开
const handleBeforeUnload = (e) => {
  if (completedCount.value > 0) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// 路由守卫
const beforeRouteLeave = async (to, from, next) => {
  if (completedCount.value > 0) {
    try {
      await ElMessageBox.confirm(
        '您的答案尚未保存，离开页面将丢失所有已答内容。确定要离开吗？',
        '确认离开',
        {
          confirmButtonText: '确认离开',
          cancelButtonText: '留在此页',
          type: 'warning'
        }
      )
      next()
    } catch (e) {
      next(false)
    }
  } else {
    next()
  }
}

onMounted(async () => {
  // 实际项目中，这里会从API获取练习数据
  const res = await getQuestionsByAssessmentQuestionGroupsId(practiceId)
  console.log(res)
  practiceData.value = res.data

  // 初始化答案数组
  userAnswers.value = new Array(practiceData.value.questions.length).fill('')

  // 添加离开页面的事件监听
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// 暴露给路由守卫
defineExpose({
  beforeRouteLeave
})

const submitAnswers = async () => {
  // 直接提交答案数组，不需要转换格式
  await submitPracticeAnswerService(practiceId, JSON.stringify(userAnswers.value))
  window.location.href = 'http://localhost:8084/student/space/inbox';
  ElMessage.success('提交成功')
}
</script>

<style scoped>
.student-practice-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #f6f8fc 0%, #e9f0f9 100%);
  padding: 24px;
  gap: 24px;
  position: relative;
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

/* 头部样式 */
.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.practice-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.practice-meta {
  display: flex;
  gap: 12px;
}

.progress-container {
  width: 280px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.timer-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.timer {
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

/* 主体内容 */
.practice-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

/* 左侧导航 */
.question-navigator {
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 24px;
  overflow-y: auto;
}

.navigator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.navigator-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.question-nav-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  gap: 8px;
  padding: 4px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
}

.question-num {
  width: 24px;
  height: 24px;
  font-size: 12px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 4px;
}

.nav-item-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.nav-item-info :deep(.el-tag) {
  transform: scale(0.8);
  margin: 0;
  white-space: nowrap;
}

.nav-item-status {
  position: absolute;
  top: -4px;
  right: -4px;
  display: flex;
  gap: 2px;
}

.nav-item-status .el-icon {
  font-size: 12px;
  background: white;
  border-radius: 50%;
  padding: 2px;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  transform: scale(1.05);
}

.nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.nav-item.unanswered {
  border-color: #ef4444;
}

.nav-item.answered {
  border-color: #22c55e;
}

.nav-item.marked {
  border-color: #f59e0b;
}

.nav-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.status-legend {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  justify-content: center;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.unanswered {
  background-color: #ef4444;
}

.status-dot.answered {
  background-color: #22c55e;
}

.status-dot.marked {
  background-color: #f59e0b;
}

/* 右侧内容 */
.question-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  position: sticky;
  top: 24px;
  z-index: 10;
}

.page-indicator {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.question-cards-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.question-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 16px;
}

.question-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-score {
  font-size: 14px;
  color: #666;
}

.question-content {
  line-height: 1.6;
  color: #333;
}

.content-text {
  margin-bottom: 24px;
  font-size: 16px;
}

/* 选项样式 */
.option-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  margin-left: 0;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  width: 100%;
  height: auto;
}

.option-item:hover {
  background: rgba(255, 255, 255, 0.8);
}

.option-label {
  font-weight: 600;
  margin-right: 8px;
  color: #666;
}

.option-content {
  flex: 1;
}

/* 填空题样式 */
.blank-container {
  max-width: 400px;
  margin: 16px 0;
}

.blank-input :deep(.el-input__inner) {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
}

/* 判断题样式 */
.judge-container {
  display: flex;
  gap: 32px;
  margin: 16px 0;
}

.judge-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.judge-option:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* 简答题样式 */
.essay-container {
  margin: 16px 0;
}

.essay-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #6b7280;
  font-size: 14px;
}

/* 底部操作 */
.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.question-tags {
  display: flex;
  gap: 8px;
}

.question-nav-buttons {
  display: flex;
  gap: 12px;
}

/* 悬浮提交按钮 */
.floating-submit {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 100;
}

.floating-submit .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
}

/* 当前题目卡片样式 */
.current-question-card {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.question-content {
  flex: 1;
  padding: 24px 0;
}

.submit-button {
  padding: 8px 16px;        /* 减少内边距 */
  border-radius: 20px;
  border: none;
  background: #e0e0e0;
  color: white;
  font-size: 14px;
  cursor: not-allowed;
  transition: all 0.3s ease;

}

.submit-button:not(:disabled) {
  background: #4CAF50; /* 健康绿色 */
  cursor: pointer;
  animation: pulse 1.5s infinite;
  box-shadow: 0 4px 15px rgba(76,175,80,0.3);
}

.submit-button:hover:not(:disabled) {
  background: #45a049; /* 深绿色 */
  transform: scale(1.03);    /* 同步缩小悬停放大值 */
}

.submit-button:active:not(:disabled) {
  animation: none;
  transform: scale(0.95);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.submit-button {
  padding: 8px 16px;        /* 减少内边距 */
  border-radius: 20px;       /* 缩小圆角 */
  font-size: 14px;          /* 调小字号 */
  /* 其他原有属性保持不变 */
}

</style>
