<template>
  <div class="practice-container">
    <!-- 左侧内容区 -->
    <div class="left-panel">
      <!-- 主要题目卡片 -->
      <div class="glass-card main-question-card">
        <div class="question-header">
          <div class="question-meta">
            <el-tag :type="getQuestionTypeStyle(question.type)">
              {{ getQuestionTypeName(question.type) }}
            </el-tag>
            <div class="difficulty">
              <span class="label">难度：</span>
              <el-rate
                v-model="question.difficulty"
                disabled
                text-color="#ff9900"
              />
            </div>
          </div>
          <div class="tags-container">
            <el-tag
              v-for="tag in question.tags"
              :key="tag"
              class="tag"
              effect="plain"
              round
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <div class="question-content">
          <h2>题目描述</h2>
          <div class="content-text">{{ question.questionContent?.content }}</div>

          <!-- 选择题选项展示和作答 -->
          <div v-if="question.type === '1' || question.type === 1" class="question-options">
            <el-radio-group v-model="userAnswer" :disabled="hasSubmitted" @change="val => console.log('选择了选项:', val)">
              <div
                v-for="(option, index) in question.questionContent?.options"
                :key="index"
                class="option-wrapper"
              >
                <el-radio :label="String.fromCharCode(65 + index)">
                  <div class="option" :class="{
                    'correct-option': hasSubmitted && String.fromCharCode(65 + index) === question.questionContent?.answer,
                    'wrong-option': hasSubmitted && userAnswer === String.fromCharCode(65 + index) && userAnswer !== question.questionContent?.answer
                  }">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    {{ option.split('.')[1] }}
                  </div>
                </el-radio>
              </div>
            </el-radio-group>
          </div>

          <!-- 填空题作答 -->
          <div v-else-if="question.type === '2' || question.type === 2" class="question-blank">
            <el-input
              v-model="userAnswer"
              :placeholder="hasSubmitted ? '正确答案: ' + question.questionContent?.answer : '请输入你的答案'"
              :disabled="hasSubmitted"
              class="blank-input"
              :class="{
                'correct-answer': hasSubmitted && userAnswer.trim() === question.questionContent?.answer,
                'wrong-answer': hasSubmitted && userAnswer.trim() !== question.questionContent?.answer
              }"
            />
          </div>

          <!-- 判断题作答 -->
          <div v-else-if="question.type === '3' || question.type === 3" class="question-judge">
            <el-radio-group v-model="userAnswer" :disabled="hasSubmitted" @change="val => console.log('判断选择:', val)">
              <el-radio label="1" class="judge-option" :class="{
                'correct-answer': hasSubmitted && ('1' === String(question.questionContent?.answer) || 1 === question.questionContent?.answer),
                'wrong-answer': hasSubmitted && userAnswer === '1' && !('1' === String(question.questionContent?.answer) || 1 === question.questionContent?.answer)
              }">
                <el-icon><Select /></el-icon>
                正确
              </el-radio>
              <el-radio label="0" class="judge-option" :class="{
                'correct-option': hasSubmitted && ('0' === String(question.questionContent?.answer) || 0 === question.questionContent?.answer),
                'wrong-option': hasSubmitted && userAnswer === '0' && !('0' === String(question.questionContent?.answer) || 0 === question.questionContent?.answer)
              }">
                <el-icon><Close /></el-icon>
                错误
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 简答题作答 -->
          <div v-else-if="question.type === '4' || question.type === 4" class="question-essay">
            <el-input
              v-model="userAnswer"
              type="textarea"
              :rows="6"
              :placeholder="hasSubmitted ? '参考答案在下方显示' : '请在此处输入你的答案'"
              :disabled="hasSubmitted"
              class="essay-input"
            />
          </div>

          <!-- 提交按钮 -->
          <div class="submit-area">
            <el-button
              v-if="!hasSubmitted"
              type="primary"
              :disabled="!userAnswer"
              @click="submitAnswer"
              class="submit-btn"
            >
              提交答案
              <el-icon class="el-icon--right"><Check /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 答案区域（提交后显示） -->
        <div v-if="hasSubmitted" class="answer-section">
          <h2>参考答案</h2>
          <div class="answer-content">
            <template v-if="question.type === 3 || question.type === '3'">
              {{ Number(question.questionContent?.answer) === 1 ? '✔ 正确' : '✘ 错误' }}
            </template>
            <template v-else-if="question.type === 4 || question.type === '4'">
              <p>{{ question.questionContent?.answer }}</p>
            </template>
            <template v-else>
              {{ question.questionContent?.answer }}
            </template>
          </div>
        </div>

        <!-- 答题结果动画 -->
        <div v-if="showResultAnimation" class="result-animation" :class="isCorrect ? 'correct' : 'wrong'">
          <div class="result-icon">
            <el-icon v-if="isCorrect"><SuccessFilled /></el-icon>
            <el-icon v-else><CircleCloseFilled /></el-icon>
          </div>
          <div class="result-text">{{ isCorrect ? '恭喜你，答对了！' : '很遗憾，答错了' }}</div>
        </div>
      </div>

      <!-- 题目提示卡片（答题后显示） -->
      <div class="glass-card hint-card">
        <h3>
          <el-icon>
            <Help />
          </el-icon>
          解题提示
        </h3>
        <div class="hint-content">{{ question.suggestion }}</div>
      </div>

      <!-- 相关题目推荐 -->
      <div v-if="hasSubmitted" class="glass-card related-questions">
        <h3>
          <el-icon>
            <Connection />
          </el-icon>
          相关题目
        </h3>
        <div class="related-list">
          <div
            v-for="item in relatedQuestions"
            :key="item.id"
            class="related-item"
            @click="handleRelatedQuestionClick(item.id)"
          >
            <div class="item-content">
              <el-tag size="small" :type="getQuestionTypeStyle(item.type)">
                {{ getQuestionTypeName(item.type) }}
              </el-tag>
              <span class="item-text">{{ item.questionContent }}</span>
            </div>
            <el-icon>
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 导航控制区 -->
      <div class="glass-card navigation-card">
        <div class="navigation-controls">
          <el-button
            @click="navigateQuestion('prev')"
            :disabled="!hasPrevQuestion"
            type="primary"
            plain
          >
            <el-icon><ArrowLeft /></el-icon>
            上一题
          </el-button>

          <el-button
            @click="resetQuestion"
            type="info"
            plain
            :disabled="!hasSubmitted"
          >
            <el-icon><RefreshLeft /></el-icon>
            重做此题
          </el-button>

          <el-button
            @click="backToList"
            plain
          >
            <el-icon><Back /></el-icon>
            返回题库
          </el-button>

          <el-button
            @click="navigateQuestion('next')"
            :disabled="!hasNextQuestion"
            type="primary"
            plain
          >
            下一题
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 装饰性动画区域 -->
      <div class="decoration-area">
        <div class="floating-badge" v-if="hasSubmitted && isCorrect">
          <img src="@/assets/img.png" alt="成就徽章" class="medal-icon" />
          <span>+1积分</span>
        </div>
      </div>
    </div>

    <!-- 右侧AI聊天区 -->
    <div class="right-panel">
      <div class="glass-card chat-container">
        <div class="chat-header">
          <div class="header-title">
            <el-avatar :size="32" src="/ai-avatar.png" />
            <h3>AI小助手</h3>
          </div>
          <el-tooltip content="清空对话">
            <el-button
              type="info"
              circle
              plain
              size="small"
              @click="clearChat"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>

        <div class="chat-messages" ref="chatContainer">
          <div
            v-for="(msg, index) in chatMessages"
            :key="index"
            :class="['message', msg.role]"
          >
            <el-avatar
              :size="32"
              :src="msg.role === 'ai' ? '/ai-avatar.png' : '/user-avatar.png'"
              :style="{
                flexShrink: 0,
                border: msg.role === 'ai' ? '2px solid #e0e7ff' : '2px solid #6366f1'
              }"
            />
            <div class="message-content">
              <div class="message-bubble">{{ msg.content }}</div>
              <div class="message-time">{{ msg.time || '刚刚' }}</div>
            </div>
          </div>
        </div>

        <div class="chat-input-wrapper">
          <div class="chat-input">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="3"
              resize="none"
              :placeholder="hasSubmitted ? '输入你的问题...' : '请先完成题目再提问...'"
              @keyup.enter.native="handleSendMessage"
              :disabled="!hasSubmitted"
            >
              <template #prefix>
                <el-icon>
                  <ChatLineRound />
                </el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              class="send-button"
              :disabled="!userInput.trim() || !hasSubmitted"
              @click="handleSendMessage"
            >
              发送
              <el-icon class="el-icon--right">
                <Position />
              </el-icon>
            </el-button>
          </div>
          <div class="input-tips">
            <template v-if="hasSubmitted">
              按 Enter 发送消息，Shift + Enter 换行
            </template>
            <template v-else>
              请先完成答题，才能使用AI助手哦
            </template>
          </div>
        </div>
      </div>

      <!-- 学习进度 -->
      <div class="glass-card progress-card" v-if="hasSubmitted">
        <h3>
          <el-icon><TrendCharts /></el-icon>
          学习进度
        </h3>
        <div class="progress-content">
          <div class="progress-item">
            <div class="progress-label">连续答题天数</div>
            <div class="progress-value">3天</div>
            <el-progress :percentage="60" :stroke-width="8" :show-text="false" />
          </div>
          <div class="progress-item">
            <div class="progress-label">今日完成题目</div>
            <div class="progress-value">5/10</div>
            <el-progress :percentage="50" :stroke-width="8" :show-text="false" status="success" />
          </div>
          <div class="progress-streak">
            <div
              v-for="day in 7"
              :key="day"
              :class="['streak-day', day <= 3 ? 'active' : '']"
            >
              {{ ['一', '二', '三', '四', '五', '六', '日'][day-1] }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动的装饰性元素 -->
    <div class="floating-elements">
      <div class="float-element e1"></div>
      <div class="float-element e2"></div>
      <div class="float-element e3"></div>
      <div class="float-element e4"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Help,
  Connection,
  ArrowRight,
  ArrowLeft,
  Position,
  Delete,
  ChatLineRound,
  Check,
  CircleCloseFilled,
  SuccessFilled,
  Select,
  Close,
  RefreshLeft,
  Back,
  TrendCharts
} from '@element-plus/icons-vue'
import { getQuestionById, getNextQuestion, getPrevQuestion, recommendQuestions } from '@/api/question.js'
import { addStudentDoPracticeDetailService } from '@/api/StudentDoPracticeDetail.js'

const route = useRoute()
const router = useRouter()
const questionId = ref(route.params.questionId)
// const questionId = 2
const chatContainer = ref(null)
const userInput = ref('')
const chatMessages = ref([])
const userAnswer = ref('')
const hasSubmitted = ref(false)
const showResultAnimation = ref(false)
const isCorrect = ref(false)
const hasPrevQuestion = ref(false)
const hasNextQuestion = ref(true)
const relatedQuestions = ref([])
const prevQuestionId = ref('')
const nextQuestionId = ref('')

// 模拟题目数据
const question = ref({
  // 初始为空对象，将通过API获取数据
})

// 获取题目类型名称
const getQuestionTypeName = (type) => {
  const typeMap = {
    '1': '选择题',
    '2': '填空题',
    '3': '判断题',
    '4': '简答题'
  }
  return typeMap[type] || '未知'
}

// 获取题目类型样式
const getQuestionTypeStyle = (type) => {
  const styleMap = {
    '1': '',
    '2': 'warning',
    '3': 'info',
    '4': 'success'
  }
  return styleMap[type] || ''
}

// 提交答案
const submitAnswer = async () => {
  if (!userAnswer.value) {
    ElMessage.warning('请先填写答案再提交')
    return
  }

  // 设置为已提交状态
  hasSubmitted.value = true

  console.log('用户回答:', userAnswer.value);
  console.log('正确答案:', question.value.questionContent?.answer);

  // 检查答案是否正确
  if (question.value.type === 4 || question.value.type === '4') {
    // 简答题需要人工评判，这里假设都是对的
    isCorrect.value = true
  } else if (question.value.type === 3 || question.value.type === '3') {
    // 判断题比较 - 转为相同类型后比较
    const userAns = Number(userAnswer.value);
    const correctAns = Number(question.value.questionContent?.answer);
    isCorrect.value = userAns === correctAns;
  } else if (question.value.type === 2 || question.value.type === '2') {
    // 填空题比较 - 移除空白后比较
    isCorrect.value = userAnswer.value.trim() === String(question.value.questionContent?.answer).trim();
  } else {
    // 选择题直接比较
    isCorrect.value = userAnswer.value === question.value.questionContent?.answer;
  }


  console.log('是否正确:', isCorrect.value);

  // 显示结果动画
  showResultAnimation.value = true
  setTimeout(() => {
    showResultAnimation.value = false
  }, 2000)

  // 添加AI提示消息
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  setTimeout(() => {
    chatMessages.value.push({
      role: 'ai',
      content: isCorrect.value
        ? '恭喜你答对了！你有任何问题都可以问我哦！'
        : '没关系，学习是一个过程。有什么不懂的地方可以向我提问！',
      time
    })
    scrollToBottom()
  }, 800)

  // 加载相关题目
  loadRelatedQuestions()

  // 更新学习进度
  updateStudyProgress()

  // 记录学生做题详情
  addStudentDoPracticeDetailService(questionId.value, isCorrect.value?1:0)
}

// 重置当前题目
const resetQuestion = () => {
  userAnswer.value = ''
  hasSubmitted.value = false
  showResultAnimation.value = false
  console.log('重置题目状态')
}

// 导航到其他题目
const navigateQuestion = async (direction) => {

  try {
    let nextId
    if (direction === 'next') {
      const nextRes = await getNextQuestion(questionId.value)
      hasNextQuestion.value = !!nextRes.data.id
      if(hasNextQuestion.value){
        nextId = nextRes.data.id
      }
    } else {
      const prevRes = await getPrevQuestion(questionId.value)
      hasPrevQuestion.value = !!prevRes.data.id
      if(hasPrevQuestion.value){
        nextId = prevRes.data.id
      }
    }
    // 直接跳转到相应页面
   await router.push(`/lesson/student/doPractice/${nextId}`)
  } catch (error) {
    console.error(`获取${direction === 'next' ? '下一题' : '上一题'}失败:`, error)
    ElMessage.error(`获取${direction === 'next' ? '下一题' : '上一题'}失败`)
  }
}

// 返回题库列表
const backToList = () => {
  router.push('/lesson/student/questionBank')
}

// 发送消息到AI助手
const handleSendMessage = async () => {
  if (!userInput.value.trim() || !hasSubmitted.value) return

  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: userInput.value,
    time
  })

  // 模拟AI响应
  setTimeout(() => {
    chatMessages.value.push({
      role: 'ai',
      content: `关于这个问题，我来解释一下...\n${question.value.suggestion || '这个题目的关键是理解概念并正确应用公式。'}`,
      time
    })
    scrollToBottom()
  }, 1000)

  userInput.value = ''
  await scrollToBottom()
}

// 滚动聊天窗口到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 清空聊天记录
const clearChat = () => {
  chatMessages.value = [{
    role: 'ai',
    content: '对话已清空，有什么问题都可以继续问我哦！',
    time: '刚刚'
  }]
}

// 加载题目数据
const loadQuestion = async () => {
  try {
    // 调用API获取数据
    const res = await getQuestionById(questionId.value)
    question.value = res.data

    // 重置状态
    resetQuestion()

    RelatedQuestions()

    // 检查是否有上一题和下一题
    try {
      const prevRes = await getPrevQuestion(questionId.value)
      hasPrevQuestion.value = !!prevRes.data.id
      if(hasPrevQuestion.value){
        prevQuestionId.value = prevRes.data.id
      }
      const nextRes = await getNextQuestion(questionId.value)
      hasNextQuestion.value = !!nextRes.data.id
      if(hasNextQuestion.value){
        nextQuestionId.value = nextRes.data.id
      }
    } catch (error) {
      console.error('获取题目导航信息失败:', error)
    }
  } catch (error) {
    console.error('获取题目详情失败:', error)
    ElMessage.error('获取题目详情失败')
  }
}

// 加载相关题目
const loadRelatedQuestions = () => {
  // 直接使用模拟数据，不再调用API
  RelatedQuestions()
}

// 处理相关题目点击
const handleRelatedQuestionClick = (id) => {
  router.push(`/lesson/student/doPractice/${id}`)
}

// 模拟API响应 - 题目数据
const mockQuestionData = () => {
  // 根据题目类型生成不同的模拟数据
  const questionType = 2

  let mockData = {
    id: questionId.value,
    type: questionType, // 使用数字类型
    difficulty: 3,
    tags: ['函数与导数', '微积分', '高等数学', '数学建模'],
    suggestion: '这道题目需要理解导数的几何意义，导数代表函数在某点的斜率。计算导数时需要用到导数公式：对于函数f(x)=x^n，其导数为f\'(x)=n·x^(n-1)。理解这个公式后，代入具体值计算即可得到结果。'
  }

  if (questionType === 1) { // 选择题
    mockData.questionContent = {
      content: '求函数f(x)=x²在x=2处的导数值是多少？',
      options: ['A. 2', 'B. 4', 'C. 8', 'D. 16'],
      answer: 'B'
    }
  } else if (questionType === 2) { // 填空题
    mockData.questionContent = {
      content: '计算函数f(x)=x³+2x在x=1处的导数。',
      answer: '5'
    }
  } else if (questionType === 3) { // 判断题
    mockData.questionContent = {
      content: '函数f(x)=|x|在x=0处是可导的。',
      answer: 0 // 使用数字类型 0 表示错误
    }
  } else { // 简答题
    mockData.questionContent = {
      content: '推导函数f(x)=sin(x)的导数，并解释其几何意义。',
      answer: 'f\'(x)=cos(x)。几何意义是正弦函数在各点的斜率等于该点对应的余弦值。这意味着当x=0时，斜率为1；当x=π/2时，斜率为0；当x=π时，斜率为-1，这与余弦函数的值完全吻合。'
    }
  }

  console.log('模拟题目数据:', mockData); // 添加日志便于调试
  return mockData;
}

// 相关题目数据
const RelatedQuestions = async () => {
  const res = await recommendQuestions(questionId.value)
  relatedQuestions.value = res.data
}

// 更新学习进度
const updateStudyProgress = () => {
  // 实际项目中应该调用API来更新用户的学习记录
  // 这里只是模拟更新效果
  setTimeout(() => {
    // 模拟学习进度更新动画
    const progressCard = document.querySelector('.progress-card')
    if (progressCard) {
      progressCard.classList.add('progress-updated')
      setTimeout(() => {
        progressCard.classList.remove('progress-updated')
      }, 1500)
    }
  }, 2500)
}

onMounted(async () => {
  // 初始化AI助手欢迎消息
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  chatMessages.value.push({
    role: 'ai',
    content: '你好！我是你的AI小助手。完成题目后，有任何问题都可以问我哦！',
    time
  })
  await loadQuestion()
})

// 监听题目ID变化
watch(() => route.params.questionId, async (newId) => {
  if (newId && newId !== questionId.value) {
    questionId.value = newId
    await loadQuestion()
  }
}, { immediate: true })
</script>

<style scoped>
.practice-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px 76px;
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #f6f8fc 0%, #e9f0f9 100%);
  position: relative;
  overflow: hidden;
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.left-panel {
  display: flex;
  flex-direction: column;
}

.main-question-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  overflow: hidden;
  height: 420px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.difficulty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tags-container {
  display: flex;
  gap: 8px;
}

.question-content h2,
.answer-section h2 {
  color: #1a1a1a;
  margin-bottom: 16px;
  font-size: 1.25rem;
  position: relative;
  display: inline-block;
}

.question-content h2:after,
.answer-section h2:after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #4f46e5, transparent);
  transform-origin: left;
  animation: slideIn 0.6s ease forwards;
}

@keyframes slideIn {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.content-text,
.answer-content {
  line-height: 1.6;
  color: #333;
  margin-bottom: 20px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 选项样式 */
.question-options {
  margin-top: 20px;
  animation: fadeIn 0.5s ease 0.2s both;
}

.option-wrapper {
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.option-wrapper:hover {
  transform: translateX(5px);
}

.option {
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
}

/* 填空题样式 */
.question-blank {
  margin-top: 20px;
  animation: fadeIn 0.5s ease 0.2s both;
}

.blank-input {
  max-width: 300px;
  margin-top: 16px;
}

.blank-input :deep(.el-input__inner) {
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: none;
}

.blank-input :deep(.el-input__inner:focus) {
  box-shadow: none;
  border-color: #dcdfe6;
  outline: none;
}

.blank-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
}

.blank-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
  border-color: #dcdfe6;
}

/* 判断题样式 */
.question-judge {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  animation: fadeIn 0.5s ease 0.2s both;
}

.judge-option {
  display: flex;
  align-items: center;
  margin: 0 20px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.judge-option:hover {
  transform: translateY(-5px);
}

.judge-option .el-icon {
  margin-right: 8px;
}

/* 简答题样式 */
.essay-input {
  margin-top: 16px;
  animation: fadeIn 0.5s ease 0.2s both;
}

.essay-input :deep(.el-textarea__inner) {
  border-radius: 10px;
  padding: 16px;
  transition: all 0.3s ease;
  line-height: 1.6;
}

.essay-input :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

/* 提交区域 */
.submit-area {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  animation: fadeIn 0.5s ease 0.3s both;
}

.submit-btn {
  min-width: 160px;
  height: 44px;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  border: none;
  border-radius: 22px;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

/* 答案区域 */
.answer-section {
  padding-top: 20px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease;
}

/* 结果动画 */
.result-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 50px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 10;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.result-animation.correct {
  border: 2px solid #10b981;
}

.result-animation.wrong {
  border: 2px solid #ef4444;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.result-animation.correct .result-icon {
  color: #10b981;
}

.result-animation.wrong .result-icon {
  color: #ef4444;
}

.result-text {
  font-size: 24px;
  font-weight: bold;
}

.result-animation.correct .result-text {
  color: #10b981;
}

.result-animation.wrong .result-text {
  color: #ef4444;
}

/* 提示卡片 */
.hint-card h3,
.related-questions h3,
.progress-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #1a1a1a;
  position: relative;
}

.hint-card h3:after,
.related-questions h3:after,
.progress-card h3:after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 40px;
  height: 3px;
  background: #4f46e5;
  border-radius: 3px;
}

.hint-content {
  color: #4b5563;
  line-height: 1.6;
  background: rgba(243, 244, 246, 0.7);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
  position: relative;
  overflow: hidden;
}

.hint-content:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent);
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

/* 相关题目样式 */
.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.related-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(5px);
  border-left-color: #4f46e5;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100% - 30px);
}

.item-text {
  color: #333;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 导航区域 */
.navigation-card {
  padding: 16px;
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.navigation-controls .el-button {
  transition: all 0.3s ease;
}

.navigation-controls .el-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 正确/错误选项样式 */
.correct-option {
  background: rgba(16, 185, 129, 0.15) !important;
  border-color: #10b981 !important;
  animation: correctPulse 1s;
}

@keyframes correctPulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.wrong-option {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: #ef4444 !important;
  text-decoration: line-through;
  animation: wrongShake 0.5s;
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.correct-answer {
  border-color: #10b981 !important;
  background-color: rgba(16, 185, 129, 0.05) !important;
  animation: correctGlow 2s infinite;
  border: none;
}

@keyframes correctGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); }
}

.wrong-answer {
  border-color: #ef4444 !important;
  background-color: rgba(239, 68, 68, 0.05) !important;
  border: none;
}

/* AI聊天区域样式 */
.right-panel {
  position: relative;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chat-container {
  height: 600px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  margin-bottom: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: rgba(248, 250, 252, 0.5);
  backdrop-filter: blur(8px);
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
  animation: messageSlide 0.3s ease;
}

@keyframes messageSlide {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
  font-size: 0.95rem;
  position: relative;
  white-space: pre-line;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.message.ai .message-bubble {
  background: linear-gradient(135deg, #e9f0ff 0%, #f5f7ff 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-top-left-radius: 4px;
  color: #1e293b;
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  color: white;
  border-top-right-radius: 4px;
}

.message-time {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
  opacity: 0.8;
}

.message.user .message-time {
  text-align: right;
}

.chat-input-wrapper {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.chat-input {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.chat-input :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  resize: none;
  transition: all 0.3s ease;
}

.chat-input :deep(.el-textarea__inner:focus) {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.chat-input :deep(.el-textarea__inner:disabled) {
  background: rgba(243, 244, 246, 0.5);
  color: #9ca3af;
}

.send-button {
  align-self: flex-end;
  height: 40px;
  border-radius: 10px;
  padding: 0 20px;
  font-weight: 500;
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  border: none;
  transition: all 0.3s ease;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
}

.input-tips {
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: right;
  padding-right: 8px;
}

/* 学习进度卡片 */
.progress-card {
  animation: fadeIn 0.5s ease 0.4s both;
  transition: all 0.3s ease;
}

.progress-card.progress-updated {
  box-shadow: 0 0 20px rgba(79, 70, 229, 0.5);
  transform: translateY(-5px);
  animation: progressPulse 1.5s ease;
}

@keyframes progressPulse {
  0% { transform: translateY(0); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); }
  50% { transform: translateY(-5px); box-shadow: 0 0 25px rgba(79, 70, 229, 0.6); }
  100% { transform: translateY(0); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); }
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-label {
  font-size: 0.9rem;
  color: #4b5563;
}

.progress-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
}

.progress-streak {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: space-between;
}

.streak-day {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(243, 244, 246, 0.8);
  color: #6b7280;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.streak-day.active {
  background: #4f46e5;
  color: white;
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.3);
}

/* 装饰性动画区域 */
.decoration-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-badge {
  position: absolute;
  top: 100px;
  right: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: floatInOut 3s ease-in-out forwards;
  z-index: 100;
}

@keyframes floatInOut {
  0% { transform: translateY(-50px); opacity: 0; }
  10% { transform: translateY(0); opacity: 1; }
  80% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-50px); opacity: 0; }
}

.medal-icon {
  width: 30px;
  height: 30px;
  content: url('@/assets/img.png');
  object-fit: contain;
  background-color: #f0f0f0;
  border-radius: 50%;
}

/* 浮动装饰元素 */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: -1;
}

.float-element {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(10px);
}

.e1 {
  width: 100px;
  height: 100px;
  background: rgba(99, 102, 241, 0.3);
  top: 10%;
  left: 5%;
  animation: float 15s ease-in-out infinite alternate;
}

.e2 {
  width: 150px;
  height: 150px;
  background: rgba(59, 130, 246, 0.3);
  bottom: 20%;
  right: 10%;
  animation: float 18s ease-in-out infinite alternate-reverse;
}

.e3 {
  width: 80px;
  height: 80px;
  background: rgba(236, 72, 153, 0.3);
  top: 40%;
  right: 25%;
  animation: float 12s ease-in-out infinite alternate;
}

.e4 {
  width: 120px;
  height: 120px;
  background: rgba(16, 185, 129, 0.3);
  bottom: 10%;
  left: 15%;
  animation: float 20s ease-in-out infinite alternate-reverse;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(30px, 20px) rotate(5deg); }
  100% { transform: translate(-20px, 40px) rotate(-5deg); }
}

.header-title .el-avatar {
  background-color: #e0f2fe;
  color: #0284c7;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message .el-avatar {
  background-color: #f0f0f0;
  color: #4b5563;
}
</style>
