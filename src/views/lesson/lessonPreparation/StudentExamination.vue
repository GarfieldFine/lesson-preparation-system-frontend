<template>
  <div class="examination-container">
    <div v-if="+isExamSubmitted === 2" class="exam-waiting-container glass-card">
      <div class="waiting-content">
        <div class="waiting-icon">
          <el-icon><Loading /></el-icon>
        </div>
        <h2 class="waiting-title">你已完成考试，请等待结果</h2>
        <div class="waiting-animation">
          <div class="dot-pulse"></div>
        </div>
        <p class="waiting-description">老师正在批改你的试卷，结果将很快公布</p>
      </div>
    </div>

    <!-- 考试结果展示组件 -->
    <div v-if="+isExamSubmitted === 1" class="exam-result-container glass-card">
      <div class="result-header">
        <h1>{{ examData.examName || '期末考试' }} - 考试结果</h1>
        <div class="result-meta">
          <el-tag type="success" effect="dark">
            <el-icon><CircleCheck /></el-icon>
            已完成
          </el-tag>
        </div>
      </div>

      <div class="result-content">
        <div class="score-circle">
          <svg viewBox="0 0 100 100">
            <circle class="score-background" cx="50" cy="50" r="40"></circle>
            <circle class="score-value" cx="50" cy="50" r="40" :style="{ 'stroke-dashoffset': 251.2 * (1 - scorePercentage / 100) }"></circle>
          </svg>
          <div class="score-content">
            <div class="score-number">{{ examScore }}</div>
            <div class="score-total">/ {{ examMaxScore }}</div>
          </div>
        </div>

        <div class="score-details">
          <div class="score-percentage-display">
            <div class="percentage-number">{{ scorePercentage }}%</div>
            <div class="percentage-bar">
              <div class="percentage-fill" :style="{ width: `${scorePercentage}%`, backgroundColor: scoreLevel.color }"></div>
            </div>
          </div>

          <div class="score-level" :style="{ color: scoreLevel.color }">
            <el-icon>
              <component :is="scoreLevel.icon" />
            </el-icon>
            <span>{{ scoreLevel.text }}</span>
          </div>

          <!--          <div class="result-message">-->
          <!--            <p v-if="scorePercentage >= 90">太棒了！你的表现非常出色，继续保持！</p>-->
          <!--            <p v-else-if="scorePercentage >= 75">做得很好！再接再厉，你会做得更好！</p>-->
          <!--            <p v-else-if="scorePercentage >= 60">恭喜通过考试！多加练习，成绩会更上一层楼！</p>-->
          <!--            <p v-else>别灰心！失败是成功之母，继续努力！</p>-->
          <!--          </div>-->
          <div class="result-message">
            <p>{{aiAnalysis}}</p>
          </div>

          <div class="result-actions">
            <el-button type="primary" @click="goToQuestionBank">
              <el-icon><Collection /></el-icon>
              查看题库
            </el-button>
            <el-button type="success" @click="goToLessonPreparation">
              <el-icon><Reading /></el-icon>
              返回课前准备
            </el-button>
          </div>
        </div>
      </div>

      <!-- 装饰性元素 -->
      <div class="result-decoration">
        <div class="confetti-piece"></div>
        <div class="confetti-piece"></div>
        <div class="confetti-piece"></div>
        <div class="confetti-piece"></div>
        <div class="confetti-piece"></div>
        <div class="confetti-piece"></div>
        <div class="confetti-piece"></div>
        <div class="confetti-piece"></div>
        <div class="confetti-piece"></div>
        <div class="confetti-piece"></div>
      </div>
    </div>
    <!-- 以下内容只在未提交考试时显示 -->
    <template v-if="+isExamSubmitted === 0">
      <!-- 顶部考试信息和倒计时 -->
      <div class="exam-header glass-card" style="margin-right: 100px;margin-left: 100px;">
        <div class="exam-info">
          <h2>{{ examData.examName || '期末考试' }}</h2>
          <div class="exam-meta">
            <el-tag type="warning" effect="dark">
              <el-icon><Timer /></el-icon>
              考试中
            </el-tag>
            <span class="total-questions">共 {{ examData.questions.length }} 题</span>
          </div>
        </div>

        <!-- 摄像头监控组件 -->
        <div class="camera-container" v-if="showCamera">
          <video id="video" width="120px" height="120px" autoplay="autoplay"></video>
          <canvas id="canvas" width="120px" height="120px" style="display: none;"></canvas>
          <div class="camera-controls">
            <el-button size="small" type="primary" @click="toggleCamera" :icon="cameraActive ? 'Close' : 'VideoCamera'">
              {{ cameraActive ? '关闭摄像头' : '开启摄像头' }}
            </el-button>
            <el-button size="small" type="success" @click="takePhoto" :disabled="!cameraActive">
              <el-icon><Camera /></el-icon> 拍照
            </el-button>
          </div>
        </div>

        <!-- 中间动画组件 -->
        <div class="exam-status-animation">
          <div class="progress-circle-container">
            <div class="progress-circle">
              <svg viewBox="0 0 100 100">
                <circle class="progress-background" cx="50" cy="50" r="40"></circle>
                <circle class="progress-value" cx="50" cy="50" r="40" :style="{ 'stroke-dashoffset': progressCircleOffset }"></circle>
              </svg>
              <div class="progress-content">
                <div class="progress-percentage">{{ Math.round((answeredCount / examData.questions.length) * 100) }}%</div>
                <div class="progress-label">完成度</div>
              </div>
            </div>
          </div>
          <div class="status-icons">
            <div class="status-icon" :class="{ 'active': answeredCount > 0 }">
              <el-icon><Edit /></el-icon>
              <div class="icon-label">答题中</div>
            </div>
            <div class="status-icon" :class="{ 'active': answeredCount === examData.questions.length }">
              <el-icon><Select /></el-icon>
              <div class="icon-label">已完成</div>
            </div>
          </div>
        </div>

        <div class="countdown-wrapper" :class="{ 'warning': timeRemaining <= 15 * 60 }">
          <div class="countdown-label">剩余时间</div>
          <div class="countdown">
            <span class="time-unit">{{ formatTime(timeRemaining).hours }}</span>
            <span class="time-separator">:</span>
            <span class="time-unit">{{ formatTime(timeRemaining).minutes }}</span>
            <span class="time-separator">:</span>
            <span class="time-unit">{{ formatTime(timeRemaining).seconds }}</span>
          </div>
        </div>
      </div>

      <!-- 左侧内容区 -->
      <div class="left-panel">
        <!-- 主要题目卡片 -->
        <div class="glass-card main-question-card" style="margin-right: 50px;margin-left: 100px;width: 1000px;">
          <div class="question-header">
            <div class="question-meta">
              <div class="question-number">第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ examData.questions.length }} 题</div>
              <el-tag :type="getQuestionTypeStyle(currentQuestion.type)">
                {{ getQuestionTypeName(currentQuestion.type) }}
              </el-tag>
              <div class="difficulty">
                <span class="label">难度：</span>
                <el-rate
                  v-model="currentQuestion.difficulty"
                  disabled
                  text-color="#ff9900"
                />
              </div>
            </div>
          </div>

          <div class="question-content">
            <h2>题目描述</h2>
            <div class="content-text">{{ currentQuestion?.content }}</div>

            <!-- 选择题选项展示和作答 -->
            <div v-if="currentQuestion.type === '1' || currentQuestion.type === 1" class="question-options">
              <el-radio-group v-model="userAnswers[currentQuestionIndex]">
                <div
                  v-for="(option, index) in currentQuestion?.options"
                  :key="index"
                  class="option-wrapper"
                >
                  <el-radio :label="String.fromCharCode(65 + index)">
                    <div class="option">
                      <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                      {{ option.split('.')[1] || option }}
                    </div>
                  </el-radio>
                </div>
              </el-radio-group>
            </div>

            <!-- 填空题作答 -->
            <div v-else-if="currentQuestion.type === '2' || currentQuestion.type === 2" class="question-blank">
              <el-input
                v-model="userAnswers[currentQuestionIndex]"
                placeholder="请输入你的答案"
                class="blank-input"
              />
            </div>

            <!-- 判断题作答 -->
            <div v-else-if="currentQuestion.type === '3' || currentQuestion.type === 3" class="question-judge">
              <el-radio-group v-model="userAnswers[currentQuestionIndex]">
                <el-radio label="1" class="judge-option">
                  <el-icon><Select /></el-icon>
                  正确
                </el-radio>
                <el-radio label="0" class="judge-option">
                  <el-icon><Close /></el-icon>
                  错误
                </el-radio>
              </el-radio-group>
            </div>

            <!-- 简答题作答 -->
            <div v-else-if="currentQuestion.type === '4' || currentQuestion.type === 4" class="question-essay">
              <el-input
                v-model="userAnswers[currentQuestionIndex]"
                type="textarea"
                :rows="6"
                placeholder="请在此处输入你的答案"
                class="essay-input"
              />
            </div>
          </div>
        </div>

        <!-- 导航控制区 -->
        <div class="glass-card navigation-card" style="margin-right: 50px;margin-left: 100px;width: 1000px;">
          <div class="navigation-controls">
            <el-button
              @click="navigateQuestion('prev')"
              :disabled="currentQuestionIndex === 0"
              type="primary"
              plain
            >
              <el-icon><ArrowLeft /></el-icon>
              上一题
            </el-button>

            <el-button
              @click="submitExam"
              type="danger"
              plain
            >
              <el-icon><CircleCheck /></el-icon>
              交卷
            </el-button>

            <el-button
              @click="navigateQuestion('next')"
              :disabled="currentQuestionIndex === examData.questions.length - 1"
              type="primary"
              plain
            >
              下一题
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧答题卡区域 -->
      <div class="right-panel">
        <div class="glass-card answer-sheet" style="transform: translateX(-100px)">
          <h3>
            <el-icon><Document /></el-icon>
            答题卡
          </h3>
          <div class="question-grid">
            <div
              v-for="(_, index) in examData.questions"
              :key="index"
              class="question-item"
              :class="{
              'current': index === currentQuestionIndex,
              'answered': userAnswers[index] !== undefined && userAnswers[index] !== ''
            }"
              @click="goToQuestion(index)"
            >
              {{ index + 1 }}
            </div>
          </div>
          <div class="answer-sheet-legend">
            <div class="legend-item">
              <div class="legend-color current"></div>
              <span>当前题目</span>
            </div>
            <div class="legend-item">
              <div class="legend-color answered"></div>
              <span>已答题目</span>
            </div>
            <div class="legend-item">
              <div class="legend-color"></div>
              <span>未答题目</span>
            </div>
          </div>
          <div class="exam-progress">
            <div class="progress-label">
              <span>答题进度</span>
              <span>{{ answeredCount }}/{{ examData.questions.length }}</span>
            </div>
            <el-progress
              :percentage="(answeredCount / examData.questions.length) * 100"
              :stroke-width="10"
              :show-text="false"
              :status="answeredCount === examData.questions.length ? 'success' : ''"
            />
          </div>
          <el-button type="danger" @click="submitExam" class="submit-exam-btn">
            交卷
            <el-icon class="el-icon--right"><CircleCheck /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 浮动的装饰性元素 -->
      <div class="floating-elements">
        <div class="float-element e1"></div>
        <div class="float-element e2"></div>
        <div class="float-element e3"></div>
        <div class="float-element e4"></div>
      </div>

      <!-- 时间警告弹窗 -->
      <el-dialog
        v-model="timeWarningVisible"
        title="时间提醒"
        width="400px"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        center
      >
        <div class="time-warning-content">
          <el-icon class="warning-icon"><WarningFilled /></el-icon>
          <p>考试时间仅剩 <span class="highlight">15分钟</span>，请抓紧时间完成答题！</p>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="timeWarningVisible = false">我知道了</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 提交确认弹窗 -->
      <el-dialog
        v-model="submitConfirmVisible"
        title="确认提交"
        width="400px"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        center
      >
        <div class="submit-confirm-content">
          <p>您还有 <span class="highlight">{{ examData.questions.length - answeredCount }}</span> 题未作答，确定要提交吗？</p>
          <p class="submit-warning">提交后将无法修改答案！</p>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="submitConfirmVisible = false">继续答题</el-button>
            <el-button type="danger" @click="confirmSubmit">确认提交</el-button>
          </div>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Timer,
  Document,
  ArrowRight,
  ArrowLeft,
  Select,
  Close,
  CircleCheck,
  WarningFilled,
  Collection,
  Reading,
  Loading,
  VideoCamera,
  Camera
} from '@element-plus/icons-vue'
import {
  getQuestionsByExamQuestionGroupsIdControllerService,
  lessonPreparationRecordGetByIdService
} from '@/api/ExamQuestionGroup.js'
import { submitExamAnswerService } from '@/api/studentExamRecord.js'

const route = useRoute()
const router = useRouter()
const examId = route.params.examQuestionGroupId
// const examId = 6

// 考试数据
const examData = reactive({
  examName: '期末考试',
  duration: 60, // 分钟
  questions: []
})

// 用户答案
const userAnswers = reactive([])
const currentQuestionIndex = ref(0)
const currentQuestion = computed(() => examData.questions[currentQuestionIndex.value] || {})

// 计算已答题数量
const answeredCount = computed(() => {
  return userAnswers.filter(answer => answer !== undefined && answer !== '').length
})

// 计算进度圆环的偏移量
const progressCircleOffset = computed(() => {
  const totalLength = 251.2 // 圆的周长 2 * PI * r
  const percentage = answeredCount.value / examData.questions.length
  return totalLength * (1 - percentage)
})

// 倒计时相关
const timeRemaining = ref(0) // 剩余秒数
const countdownInterval = ref(null)
const timeWarningVisible = ref(false)
const timeWarningShown = ref(false)
const isExamSubmitted = ref(0)

// 提交确认
const submitConfirmVisible = ref(false)

// 页面离开警告
const pageLeaveWarningEnabled = ref(true)

// 摄像头相关
const showCamera = ref(true) // 是否显示摄像头组件
const cameraActive = ref(false) // 摄像头是否激活
const mediaStream = ref(null) // 媒体流

// 开启/关闭摄像头
const toggleCamera = () => {
  if (cameraActive.value) {
    stopCamera()
  } else {
    startCamera()
  }
}

// 开启摄像头
const startCamera = () => {
  const constraints = {
    video: {width: 500, height: 500},
    audio: false // 考试监控不需要音频
  }

  const video = document.getElementById('video')

  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream
      mediaStream.value = stream
      video.play()
      cameraActive.value = true
    })
    .catch((err) => {
      console.error('摄像头启动失败:', err)
      ElMessage.error('摄像头启动失败，请检查设备权限')
    })
}

// 关闭摄像头
const stopCamera = () => {
  const video = document.getElementById('video')

  if (mediaStream.value) {
    const tracks = mediaStream.value.getTracks()
    tracks.forEach((track) => {
      track.stop() // 停止视频流
    })

    video.srcObject = null
    mediaStream.value = null
    cameraActive.value = false
  }
}

// 拍照功能
const takePhoto = () => {
  if (!cameraActive.value) return

  const video = document.getElementById('video')
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')

  // 绘制视频帧到画布
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  // 可以在这里添加将照片保存或上传到服务器的逻辑
  // 例如：
  // const imageData = canvas.toDataURL('image/png')
  // 上传imageData到服务器

  ElMessage.success('已拍照记录')
}

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

// 格式化时间
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0')
  }
}

// 开始倒计时
const startCountdown = () => {
  // 设置初始时间（分钟转秒）
  timeRemaining.value = examData.duration * 60

  countdownInterval.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--

      // 当剩余15分钟时显示警告
      if (timeRemaining.value === 15 * 60 && !timeWarningShown.value) {
        timeWarningVisible.value = true
        timeWarningShown.value = true
      }

      // 当时间用完时自动提交
      if (timeRemaining.value === 0) {
        clearInterval(countdownInterval.value)
        ElMessage.warning('考试时间已结束，系统将自动提交您的答卷')
        confirmSubmit()
      }
    }
  }, 1000)
}

// 导航到其他题目
const navigateQuestion = (direction) => {
  if (direction === 'next' && currentQuestionIndex.value < examData.questions.length - 1) {
    currentQuestionIndex.value++
  } else if (direction === 'prev' && currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

// 跳转到指定题目
const goToQuestion = (index) => {
  currentQuestionIndex.value = index
}

// 提交考试
const submitExam = () => {
  // 检查是否有未完成的题目
  if (answeredCount.value < examData.questions.length) {
    submitConfirmVisible.value = true
  } else {
    confirmSubmit()
  }
}

// 确认提交
const confirmSubmit = async () => {
  // 关闭提交确认弹窗
  submitConfirmVisible.value = false

  // 停止倒计时
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }

  // 禁用页面离开警告
  pageLeaveWarningEnabled.value = false

  // 提交答案到后端
  console.log('提交答案:', userAnswers)

  try {
    const res = await submitExamAnswerService(examId, JSON.stringify(userAnswers))
    const score = res.data

    // 更新考试结果数据
    // isExamSubmitted.value = true
    isExamSubmitted.value = 2
    examScore.value = score || 0

    // 显示提交成功消息
    ElMessage.success('考试已提交成功！')
  } catch (error) {
    console.error('提交考试失败:', error)
    ElMessage.error('提交考试失败，请稍后重试')
  }
}

// 考试结果相关
// const isExamSubmitted = ref(false)
const aiAnalysis = ref('')
const examScore = ref(0)
const examMaxScore = ref(100)
const scorePercentage = computed(() => Math.round((examScore.value / examMaxScore.value) * 100))
const scoreLevel = computed(() => {
  const score = scorePercentage.value
  if (score >= 90) return { text: '优秀', color: '#67c23a', icon: 'CircleCheck' }
  if (score >= 75) return { text: '良好', color: '#409eff', icon: 'Star' }
  if (score >= 60) return { text: '及格', color: '#e6a23c', icon: 'Medal' }
  return { text: '需要努力', color: '#f56c6c', icon: 'Warning' }
})

// 加载考试数据
const loadExamData = async () => {
  try {
    // 这里调用API获取考试数据
    const res = await lessonPreparationRecordGetByIdService(examId)
    console.log(res.data)
    // 检查学生是否已提交过考试
    if (+res.data.isSubmit === 1) {
      // 学生已完成考试，只显示分数
      // isExamSubmitted.value = true
      isExamSubmitted.value = 1
      examScore.value = res.data.score || 0
      examMaxScore.value = res.data.maxScore || 100
      examData.examName = res.data.title || '期末考试'
      aiAnalysis.value = res.data.aiAnalysis
      return // 直接返回，不加载题目内容
    }

    // 学生未完成考试，显示题目
    examData.examName = res.data.title
    examData.duration = res.data.duration
    examData.questions = res.data.questions
    // 初始化用户答案数组
    userAnswers.length = examData.questions.length

    // 开始倒计时
    startCountdown()
  } catch (error) {
    console.error('获取考试数据失败:', error)
    ElMessage.error('获取考试数据失败')
  }
}

// 生成模拟题目数据
const generateMockQuestions = () => {
  const questions = []

  // 选择题
  for (let i = 0; i < 5; i++) {
    questions.push({
      id: `choice_${i}`,
      type: 1,
      difficulty: Math.floor(Math.random() * 3) + 2,
      questionContent: {
        content: `这是第${i+1}道选择题，请选择正确答案。`,
        options: [
          'A. 选项一',
          'B. 选项二',
          'C. 选项三',
          'D. 选项四'
        ],
        answer: String.fromCharCode(65 + Math.floor(Math.random() * 4))
      }
    })
  }

  // 填空题
  for (let i = 0; i < 3; i++) {
    questions.push({
      id: `blank_${i}`,
      type: 2,
      difficulty: Math.floor(Math.random() * 3) + 2,
      questionContent: {
        content: `这是第${i+1}道填空题，请填写正确答案。`,
        answer: '正确答案'
      }
    })
  }

  // 判断题
  for (let i = 0; i < 3; i++) {
    questions.push({
      id: `judge_${i}`,
      type: 3,
      difficulty: Math.floor(Math.random() * 3) + 2,
      questionContent: {
        content: `这是第${i+1}道判断题，请判断对错。`,
        answer: Math.random() > 0.5 ? '1' : '0'
      }
    })
  }

  // 简答题
  for (let i = 0; i < 2; i++) {
    questions.push({
      id: `essay_${i}`,
      type: 4,
      difficulty: Math.floor(Math.random() * 3) + 3,
      questionContent: {
        content: `这是第${i+1}道简答题，请详细回答。`,
        answer: '这是参考答案，包含关键点1、关键点2和关键点3。'
      }
    })
  }

  return questions
}

// 页面离开警告
const handleBeforeUnload = (e) => {
  if (pageLeaveWarningEnabled.value) {
    e.preventDefault()
    e.returnValue = '考试未完成，离开页面将视为交卷。确定要离开吗？'
    return e.returnValue
  }
}

// 路由离开守卫
const handleRouteLeave = (to, from, next) => {
  if (pageLeaveWarningEnabled.value) {
    ElMessageBox.confirm(
      '考试未完成，离开页面将视为交卷。确定要离开吗？',
      '警告',
      {
        confirmButtonText: '确定离开',
        cancelButtonText: '继续考试',
        type: 'warning',
      }
    )
      .then(() => {
        // 用户确认离开，提交考试
        confirmSubmit()
        next()
      })
      .catch(() => {
        // 用户取消离开，继续考试
        next(false)
      })
  } else {
    next()
  }
}

// 导航函数
const goToQuestionBank = () => {
  router.push('/lesson/student/questionBank')
}

const goToLessonPreparation = () => {
  router.push('/lesson/student/lessonPreparation')
}

onMounted(async () => {

  const loading = ElLoading.service({
    lock: true,
    text: '正在加载考试内容...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  // 加载考试数据
  await loadExamData()

  loading.close()

  // if(!isExamSubmitted.value) {
  //   // 添加页面离开事件监听
  //   window.addEventListener('beforeunload', handleBeforeUnload)
  //
  //   // 添加路由离开守卫
  //   const unwatch = router.beforeEach(handleRouteLeave)
  //
  // }

  if(+isExamSubmitted.value === 0) {

    // 添加页面离开事件监听
    window.addEventListener('beforeunload', handleBeforeUnload)

    // 添加路由离开守卫
    const unwatch = router.beforeEach(handleRouteLeave)

    // 组件卸载时清理
    onBeforeUnmount(() => {
      // 清除倒计时
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
      }

      // 移除事件监听
      window.removeEventListener('beforeunload', handleBeforeUnload)

      // 移除路由守卫
      unwatch()

      // 关闭摄像头
      if (cameraActive.value) {
        stopCamera()
      }
    })

  }

})
</script>

<style scoped>
/* 等待结果样式 */
.exam-waiting-container {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease;
  text-align: center;
  min-height: 400px;
}

.waiting-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
}

.waiting-icon {
  font-size: 48px;
  color: #4f46e5;
  margin-bottom: 24px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.waiting-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 24px;
  background: linear-gradient(45deg, #4f46e5, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientText 3s ease infinite;
}

.waiting-description {
  font-size: 16px;
  color: #666;
  margin-top: 16px;
  line-height: 1.6;
}

.waiting-animation {
  margin: 20px 0;
}

.dot-pulse {
  position: relative;
  left: -9999px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #4f46e5;
  color: #4f46e5;
  box-shadow: 9999px 0 0 -5px;
  animation: dot-pulse 1.5s infinite linear;
  animation-delay: 0.25s;
}

.dot-pulse::before, .dot-pulse::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #4f46e5;
  color: #4f46e5;
}

.dot-pulse::before {
  box-shadow: 9984px 0 0 -5px;
  animation: dot-pulse-before 1.5s infinite linear;
  animation-delay: 0s;
}

.dot-pulse::after {
  box-shadow: 10014px 0 0 -5px;
  animation: dot-pulse-after 1.5s infinite linear;
  animation-delay: 0.5s;
}

@keyframes dot-pulse-before {
  0% { box-shadow: 9984px 0 0 -5px; }
  30% { box-shadow: 9984px 0 0 2px; }
  60%, 100% { box-shadow: 9984px 0 0 -5px; }
}

@keyframes dot-pulse {
  0% { box-shadow: 9999px 0 0 -5px; }
  30% { box-shadow: 9999px 0 0 2px; }
  60%, 100% { box-shadow: 9999px 0 0 -5px; }
}

@keyframes dot-pulse-after {
  0% { box-shadow: 10014px 0 0 -5px; }
  30% { box-shadow: 10014px 0 0 2px; }
  60%, 100% { box-shadow: 10014px 0 0 -5px; }
}

/* 考试结果样式 */
.exam-result-container {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;

  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.result-header h1 {
  font-size: 2rem;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #4f46e5, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientText 3s ease infinite;
}

@keyframes gradientText {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.result-meta {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.result-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  width: 100%;
  max-width: 900px;
}

.score-circle {
  position: relative;
  width: 200px;
  height: 200px;
  animation: bounceIn 1s ease 0.3s both;
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

.score-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-background {
  fill: none;
  stroke: rgba(0, 0, 0, 0.05);
  stroke-width: 8;
}

.score-value {
  fill: none;
  stroke: #67c23a;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 251.2;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1.5s ease;
  animation: scoreCircle 1.5s ease forwards;
}

@keyframes scoreCircle {
  from { stroke-dashoffset: 251.2; }
}

.score-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  font-size: 3rem;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.score-total {
  font-size: 1.2rem;
  color: #999;
}

.score-details {
  flex: 1;
  max-width: 500px;
}

.score-percentage-display {
  margin-bottom: 24px;
  animation: fadeIn 0.5s ease 0.6s both;
}

.percentage-number {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.percentage-bar {
  height: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  background: #67c23a;
  border-radius: 6px;
  width: 0;
  transition: width 1.5s ease;
}

.score-level {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 24px 0;
  animation: fadeIn 0.5s ease 0.9s both;
}

.result-message {
  background: rgba(255, 255, 255, 0.5);
  padding: 20px;
  border-radius: 12px;
  margin: 24px 0;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
  border-left: 4px solid #4f46e5;
  animation: fadeIn 0.5s ease 1.2s both;
}

.result-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  animation: fadeIn 0.5s ease 1.5s both;
}

.result-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 30px;
  background: #ffd300;
  top: 0;
  opacity: 0;
}

.confetti-piece:nth-child(1) {
  left: 7%;
  transform: rotate(-40deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 182ms;
  animation-duration: 1116ms;
  background: #7b68ee;
}

.confetti-piece:nth-child(2) {
  left: 14%;
  transform: rotate(4deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 161ms;
  animation-duration: 1076ms;
  background: #ff1493;
}

.confetti-piece:nth-child(3) {
  left: 21%;
  transform: rotate(-51deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 481ms;
  animation-duration: 1103ms;
  background: #ff6347;
}

.confetti-piece:nth-child(4) {
  left: 28%;
  transform: rotate(61deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 334ms;
  animation-duration: 708ms;
  background: #00bfff;
}

.confetti-piece:nth-child(5) {
  left: 35%;
  transform: rotate(-52deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 302ms;
  animation-duration: 776ms;
  background: #3cb371;
}

.confetti-piece:nth-child(6) {
  left: 42%;
  transform: rotate(38deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 180ms;
  animation-duration: 1168ms;
  background: #87ceeb;
}

.confetti-piece:nth-child(7) {
  left: 49%;
  transform: rotate(11deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 395ms;
  animation-duration: 1200ms;
  background: #ff69b4;
}

.confetti-piece:nth-child(8) {
  left: 56%;
  transform: rotate(49deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 14ms;
  animation-duration: 887ms;
  background: #32cd32;
}

.confetti-piece:nth-child(9) {
  left: 63%;
  transform: rotate(-72deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 149ms;
  animation-duration: 805ms;
  background: #ffa500;
}

.confetti-piece:nth-child(10) {
  left: 70%;
  transform: rotate(10deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 351ms;
  animation-duration: 1059ms;
  background: #9370db;
}

@keyframes makeItRain {
  from {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  to {
    transform: translateY(1000px);
  }
}

.examination-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
  padding: 24px;
  padding-top: 40px;
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #f6f8fc 0%, #e9f0f9 100%);
  position: relative;
  overflow: hidden;
}

.exam-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 16px;
}

.exam-info h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: #333;
}

.exam-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.total-questions {
  font-size: 0.9rem;
  color: #666;
}

.countdown-wrapper {
  text-align: center;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.countdown-wrapper.warning {
  background: rgba(255, 87, 51, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 87, 51, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 87, 51, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 87, 51, 0); }
}

.countdown-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.countdown {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-unit {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 40px;
  text-align: center;
}

.time-separator {
  margin: 0 4px;
  color: #666;
}

.countdown-wrapper.warning .countdown {
  color: #f56c6c;
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
.glass-card1 {
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

.question-number {
  font-weight: bold;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 4px 12px;
  border-radius: 16px;
}

.difficulty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-content h2 {
  color: #1a1a1a;
  margin-bottom: 16px;
  font-size: 1.25rem;
  position: relative;
  display: inline-block;
}

.question-content h2:after {
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

.content-text {
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

/* 导航控制区 */
.navigation-card {
  margin-top: auto;
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 右侧答题卡 */
.right-panel {
  display: flex;
  flex-direction: column;
}

.answer-sheet {
  height: 100%;
}

.answer-sheet h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.2rem;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.question-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.question-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.question-item.current {
  background: #409eff;
  color: white;
  border-color: #409eff;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.question-item.answered {
  background: #67c23a;
  color: white;
  border-color: #67c23a;
}

.answer-sheet-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.6);
}

.legend-color.current {
  background: #409eff;
}

.legend-color.answered {
  background: #67c23a;
}

.exam-progress {
  margin-top: 24px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #666;
}

.submit-exam-btn {
  margin-top: 24px;
  width: 100%;
}

/* 浮动装饰元素 */
.floating-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.float-element {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  filter: blur(40px);
}

.e1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #4f46e5, #06b6d4);
  top: -100px;
  left: -100px;
  animation: float1 15s infinite alternate ease-in-out;
}

.e2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(45deg, #f59e0b, #ef4444);
  bottom: -50px;
  right: -50px;
  animation: float2 18s infinite alternate ease-in-out;
}

.e3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #10b981, #3b82f6);
  bottom: 30%;
  left: 10%;
  animation: float3 20s infinite alternate ease-in-out;
}

.e4 {
  width: 180px;
  height: 180px;
  background: linear-gradient(45deg, #8b5cf6, #ec4899);
  top: 20%;
  right: 15%;
  animation: float4 25s infinite alternate ease-in-out;
}

@keyframes float1 {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(50px, 50px) rotate(10deg); }
}

@keyframes float2 {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-30px, -50px) rotate(-15deg); }
}

@keyframes float3 {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(40px, -30px) rotate(8deg); }
}

@keyframes float4 {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-40px, 40px) rotate(-12deg); }
}

/* 时间警告弹窗 */
.time-warning {
  text-align: center;
}

.time-warning-icon {
  font-size: 48px;
  color: #e6a23c;
  margin-bottom: 16px;
  animation: pulse 1.5s infinite;
}

/* 提交确认弹窗 */
.submit-confirm {
  text-align: center;
}

.submit-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 16px;
}

.submit-stats {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

/* 等待结果状态样式 */
.exam-waiting-container {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 40px;
  text-align: center;
  animation: fadeIn 0.8s ease;
}

.waiting-content {
  max-width: 500px;
}

.waiting-icon {
  font-size: 60px;
  color: #409eff;
  margin-bottom: 24px;
}

.waiting-icon .el-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.waiting-title {
  font-size: 1.8rem;
  margin-bottom: 24px;
  color: #333;
}

.waiting-description {
  font-size: 1.1rem;
  color: #666;
  margin-top: 24px;
}

.waiting-animation {
  margin: 30px auto;
  width: 80px;
  text-align: center;
}

.dot-pulse {
  position: relative;
  left: -9999px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #409eff;
  color: #409eff;
  box-shadow: 9999px 0 0 -5px;
  animation: dot-pulse 1.5s infinite linear;
  animation-delay: 0.25s;
}

.dot-pulse::before, .dot-pulse::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #409eff;
  color: #409eff;
}

.dot-pulse::before {
  box-shadow: 9984px 0 0 -5px;
  animation: dot-pulse-before 1.5s infinite linear;
  animation-delay: 0s;
}

.dot-pulse::after {
  box-shadow: 10014px 0 0 -5px;
  animation: dot-pulse-after 1.5s infinite linear;
  animation-delay: 0.5s;
}

@keyframes dot-pulse-before {
  0% { box-shadow: 9984px 0 0 -5px; }
  30% { box-shadow: 9984px 0 0 2px; }
  60%, 100% { box-shadow: 9984px 0 0 -5px; }
}

@keyframes dot-pulse {
  0% { box-shadow: 9999px 0 0 -5px; }
  30% { box-shadow: 9999px 0 0 2px; }
  60%, 100% { box-shadow: 9999px 0 0 -5px; }
}

@keyframes dot-pulse-after {
  0% { box-shadow: 10014px 0 0 -5px; }
  30% { box-shadow: 10014px 0 0 2px; }
  60%, 100% { box-shadow: 10014px 0 0 -5px; }
}

/* 摄像头组件样式 */
.camera-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

#video {
  border-radius: 8px;
  border: 2px solid #4f46e5;
  background-color: #f0f0f0;
  object-fit: cover;
}

.camera-controls {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .examination-container {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "left"
      "right";
  }

  .right-panel {
    max-width: 100%;
  }

  .question-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (max-width: 768px) {
  .exam-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .question-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .question-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* 中间动画组件样式 */
.exam-status-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0 20px;
}

.progress-circle-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.progress-circle {
  position: relative;
  width: 100%;
  height: 100%;
}

.progress-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-background {
  fill: none;
  stroke: rgba(0, 0, 0, 0.05);
  stroke-width: 8;
}

.progress-value {
  fill: none;
  stroke: #4f46e5;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 251.2;
  stroke-dashoffset: 251.2;
  transition: stroke-dashoffset 0.8s ease;
}

.progress-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.progress-label {
  font-size: 0.8rem;
  color: #666;
}

.status-icons {
  display: flex;
  gap: 24px;
}

.status-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.status-icon.active {
  opacity: 1;
}

.status-icon .el-icon {
  font-size: 24px;
  padding: 8px;
  border-radius: 50%;
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  transition: all 0.3s ease;
}

.status-icon.active .el-icon {
  background: rgba(79, 70, 229, 0.2);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.icon-label {
  font-size: 0.8rem;
  color: #666;
}

/* 修改exam-header样式以适应新组件 */
.exam-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 16px;
}

.countdown-wrapper {
  text-align: center;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.countdown-wrapper.warning {
  background: rgba(255, 87, 51, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 87, 51, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 87, 51, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 87, 51, 0); }
}

.countdown-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.countdown {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-unit {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 40px;
  text-align: center;
}

.time-separator {
  margin: 0 4px;
  color: #666;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.question-number {
  font-weight: bold;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 4px 12px;
  border-radius: 16px;
}

.difficulty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-content h2 {
  color: #1a1a1a;
  margin-bottom: 16px;
  font-size: 1.25rem;
  position: relative;
  display: inline-block;
}

.question-content h2:after {
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

.content-text {
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

/* 导航控制区 */
.navigation-card {
  margin-top: auto;
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 右侧答题卡 */
.right-panel {
  display: flex;
  flex-direction: column;
}

.answer-sheet {
  height: 100%;
}

.answer-sheet h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.2rem;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.question-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.question-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.question-item.current {
  background: #409eff;
  color: white;
  border-color: #409eff;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.question-item.answered {
  background: #67c23a;
  color: white;
  border-color: #67c23a;
}

.answer-sheet-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.6);
}

.legend-color.current {
  background: #409eff;
}

.legend-color.answered {
  background: #67c23a;
}

.exam-progress {
  margin-top: 24px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #666;
}

.submit-exam-btn {
  margin-top: 24px;
  width: 100%;
}

/* 浮动装饰元素 */
.floating-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.float-element {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  filter: blur(40px);
}

.e1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #4f46e5, #06b6d4);
  top: -100px;
  left: -100px;
  animation: float1 15s infinite alternate ease-in-out;
}

.e2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(45deg, #f59e0b, #ef4444);
  bottom: -50px;
  right: -50px;
  animation: float2 18s infinite alternate ease-in-out;
}

.e3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #10b981, #3b82f6);
  bottom: 30%;
  left: 10%;
  animation: float3 20s infinite alternate ease-in-out;
}

.e4 {
  width: 180px;
  height: 180px;
  background: linear-gradient(45deg, #8b5cf6, #ec4899);
  top: 20%;
  right: 15%;
  animation: float4 25s infinite alternate ease-in-out;
}

@keyframes float1 {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(50px, 50px) rotate(10deg); }
}

@keyframes float2 {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-30px, -50px) rotate(-15deg); }
}

@keyframes float3 {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(40px, -30px) rotate(8deg); }
}

@keyframes float4 {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-40px, 40px) rotate(-12deg); }
}

/* 时间警告弹窗 */
.time-warning {
  text-align: center;
}

.time-warning-icon {
  font-size: 48px;
  color: #e6a23c;
  margin-bottom: 16px;
  animation: pulse 1.5s infinite;
}

/* 提交确认弹窗 */
.submit-confirm {
  text-align: center;
}

.submit-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 16px;
}

.submit-stats {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

/* 等待结果状态样式 */
.exam-waiting-container {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 40px;
  text-align: center;
  animation: fadeIn 0.8s ease;
}

.waiting-content {
  max-width: 500px;
}

.waiting-icon {
  font-size: 60px;
  color: #409eff;
  margin-bottom: 24px;
}

.waiting-icon .el-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.waiting-title {
  font-size: 1.8rem;
  margin-bottom: 24px;
  color: #333;
}

.waiting-description {
  font-size: 1.1rem;
  color: #666;
  margin-top: 24px;
}

.waiting-animation {
  margin: 30px auto;
  width: 80px;
  text-align: center;
}

.dot-pulse {
  position: relative;
  left: -9999px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #409eff;
  color: #409eff;
  box-shadow: 9999px 0 0 -5px;
  animation: dot-pulse 1.5s infinite linear;
  animation-delay: 0.25s;
}

.dot-pulse::before, .dot-pulse::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #409eff;
  color: #409eff;
}

.dot-pulse::before {
  box-shadow: 9984px 0 0 -5px;
  animation: dot-pulse-before 1.5s infinite linear;
  animation-delay: 0s;
}

.dot-pulse::after {
  box-shadow: 10014px 0 0 -5px;
  animation: dot-pulse-after 1.5s infinite linear;
  animation-delay: 0.5s;
}

@keyframes dot-pulse-before {
  0% { box-shadow: 9984px 0 0 -5px; }
  30% { box-shadow: 9984px 0 0 2px; }
  60%, 100% { box-shadow: 9984px 0 0 -5px; }
}

@keyframes dot-pulse {
  0% { box-shadow: 9999px 0 0 -5px; }
  30% { box-shadow: 9999px 0 0 2px; }
  60%, 100% { box-shadow: 9999px 0 0 -5px; }
}

@keyframes dot-pulse-after {
  0% { box-shadow: 10014px 0 0 -5px; }
  30% { box-shadow: 10014px 0 0 2px; }
  60%, 100% { box-shadow: 10014px 0 0 -5px; }
}
</style>
