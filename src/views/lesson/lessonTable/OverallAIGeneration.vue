<template>
  <div class="overall-ai-generation">
    <!-- 顶部标题区域 -->
    <div class="header-section">
      <div class="header-wrapper">
        <div class="title-container">
          <h1 class="main-title">AI辅助备课</h1>
          <div class="meta-info">
            <div class="meta-badge">
              <el-icon><Clock /></el-icon>
              <span>课时：{{ lessonData.numberOfLessons || '0' }}</span>
            </div>
            <div class="meta-badge">
              <el-icon><Calendar /></el-icon>
              <span>创建时间：{{ formatDate(new Date()) }}</span>
            </div>
          </div>
        </div>
        <div class="action-area">
          <el-button
            type="primary"
            @click="generateAllWithAI"
            :loading="generatingAll"
            class="generate-button"
          >
            <el-icon><MagicStick /></el-icon>
            AI一键生成
          </el-button>
          <el-button class="save-button" @click="saveAllContent" :loading="saving">
            <el-icon><Check /></el-icon>
            保存全部内容
          </el-button>
        </div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <div class="navigation-tabs">
      <div
        class="nav-tab"
        :class="{ active: activeMenu === 'activities' }"
        @click="goToTeachingActivities"
      >
        <el-icon><Document /></el-icon>
        <span>教学活动安排</span>
      </div>
      <div
        class="nav-tab"
        :class="{ active: activeMenu === 'time' }"
        @click="goToTimeAllocation"
      >
        <el-icon><Timer /></el-icon>
        <span>时间分配</span>
      </div>
      <div
        class="nav-tab"
        :class="{ active: activeMenu === 'results' }"
        @click="goToExpectedResults"
      >
        <el-icon><Aim /></el-icon>
        <span>预期结果</span>
      </div>
      <div
        class="nav-tab"
        :class="{ active: activeMenu === 'content' }"
        @click="goToTeachingContent"
      >
        <el-icon><Reading /></el-icon>
        <span>教学内容</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧表单区域 -->
      <div class="form-section">
        <!-- 时间分配表单 -->
        <div class="time-allocation-form">
          <h2>时间分配</h2>
          <div class="form-group">
            <label>总课时时长 (分钟)</label>
            <el-input-number
              v-model="lessonData.totalDuration"
              :min="0"
              :max="180"
              @change="updateRemainingTime"
            />
          </div>

          <div class="time-phases">
            <div class="time-phase-item">
              <div class="phase-header">
                <span>课前准备</span>
                <el-input-number
                  v-model="lessonData.preparationTime"
                  :min="0"
                  :max="lessonData.totalDuration"
                  @change="updateRemainingTime"
                  size="small"
                />
                <span>分钟</span>
              </div>
            </div>

            <!-- 动态教学活动 -->
            <div
              v-for="(activity, index) in lessonData.activities"
              :key="index"
              class="time-phase-item"
            >
              <div class="phase-header">
                <el-input
                  v-model="activity.name"
                  placeholder="教学活动名称"
                  class="activity-name-input"
                />
                <el-input-number
                  v-model="activity.duration"
                  :min="0"
                  :max="lessonData.totalDuration"
                  @change="updateRemainingTime"
                  size="small"
                />
                <span>分钟</span>
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  @click="removeActivity(index)"
                />
              </div>
            </div>

            <div class="time-phase-item">
              <div class="phase-header">
                <span>总结回顾</span>
                <el-input-number
                  v-model="lessonData.summaryTime"
                  :min="0"
                  :max="lessonData.totalDuration"
                  @change="updateRemainingTime"
                  size="small"
                />
                <span>分钟</span>
              </div>
            </div>

            <div class="add-activity">
              <el-button
                type="primary"
                :icon="Plus"
                @click="addActivity"
              >
                添加教学活动
              </el-button>
            </div>

            <div class="time-summary">
              <div :class="['remaining-time', remainingTime < 0 ? 'negative' : '']">
                剩余时间: {{ remainingTime }} 分钟
              </div>
            </div>
          </div>
        </div>

        <!-- 教学内容表单 -->
        <div class="teaching-content-form">
          <h2>主要教学内容</h2>
          <el-input
            v-model="lessonData.mainContent"
            type="textarea"
            :rows="4"
            placeholder="请输入本节课的主要教学内容..."
          />
          <!-- 备选教学方案 -->
          <div v-if="teachContents.length > 0" class="alternative-results">
            <h3>备选方案</h3>
            <div class="alternatives-container">
              <div
                v-for="(teachContent, index) in teachContents"
                :key="index"
                class="alternative-item"
                @click="selectTeachContent(teachContent, index)"
              >
                <p>方案 {{ index + 1 }}</p>
                <div class="alternative-content">{{ teachContent }}</div>
              </div>
            </div>
          </div>
          <div class="ai-suggestion">
            <p>AI建议：{{ aiContentSuggestion }}</p>
            <el-button
              type="primary"
              size="small"
              @click="generateAIContent"
              :loading="generatingContent"
            >
              <el-icon><MagicStick /></el-icon>
              AI生成内容
            </el-button>
          </div>
        </div>

        <!-- 预期结果表单 -->
        <div class="expected-results-form">
          <h2>预期结果</h2>
          <el-input
            v-model="lessonData.expectedResult"
            type="textarea"
            :rows="4"
            placeholder="请输入本节课的预期学习结果..."
          />

          <!-- 备选预期结果 -->
          <div v-if="alternativeResults.length > 0" class="alternative-results">
            <h3>备选方案</h3>
            <div class="alternatives-container">
              <div
                v-for="(alternative, index) in alternativeResults"
                :key="index"
                class="alternative-item"
                @click="selectAlternative(alternative, index)"
              >
                <p>方案 {{ index + 1 }}</p>
                <div class="alternative-content">{{ alternative }}</div>
              </div>
            </div>
          </div>

          <div class="ai-suggestion">
            <el-button
              type="primary"
              size="small"
              @click="generateAIResults"
              :loading="generatingResults"
            >
              <el-icon><MagicStick /></el-icon>
              单独生成预期结果
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧AI聊天区域 -->
      <div class="chat-section">
        <div class="chat-container">
          <div class="chat-header">
            <div class="header-title">
              <el-avatar :size="36" class="ai-avatar">
                <el-icon><Service /></el-icon>
              </el-avatar>
              <div class="chat-header-info">
                <h3>AI 教学助手</h3>
                <span class="status-text">在线</span>
              </div>
            </div>
          </div>

          <div class="chat-messages" ref="chatContainer">
            <transition-group name="message-list" tag="div">
              <div
                v-for="(message, index) in chatMessages"
                :key="index"
                :class="['message', message.type]"
              >
                <el-avatar
                  v-if="message.type === 'ai'"
                  :size="32"
                  class="ai-message-avatar"
                >
                  <el-icon><Service /></el-icon>
                </el-avatar>
                <div class="message-content">
                  <div class="message-bubble">{{ message.content }}</div>
                  <div class="message-time" v-if="message.time">{{ message.time }}</div>
                </div>

              </div>
            </transition-group>
          </div>

          <div class="chat-input-container">
            <div class="chat-input">
              <el-input
                v-model="userInput"
                type="textarea"
                :rows="2"
                :disabled="isGenerating"
                :placeholder="isGenerating ? '正在生成回复中...' : '输入您的问题，获取更详细的教学建议...'"
                @keyup.enter.native="sendMessage"
                resize="none"
              />
              <el-button
                type="primary"
                :icon="Position"
                circle
                @click="sendMessage"
                :disabled="isGenerating"
              >
                <span v-if="isGenerating" class="loading-dots">...</span>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 教学建议轮播图 -->
        <div class="teaching-tips">
          <h3>教学建议</h3>
          <el-carousel :interval="5000" type="card" height="270px">
            <el-carousel-item v-for="(tip, index) in teachingTips" :key="index" style="height: 270px">
              <div class="tip-card">
                <div class="tip-icon">
                  <el-icon :size="24"><component :is="tip.icon" /></el-icon>
                </div>
                <h4>{{ tip.title }}</h4>
                <p>{{ tip.content }}</p>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Document,
  Timer,
  Aim,
  Reading,
  Check,
  Clock,
  Calendar,
  MagicStick,
  Delete,
  Plus,
  Position,
  Service,
  Star,
  Sunny,
  Lightning,
  Opportunity,
  Share,
  User
} from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  aiGenerationApproximateExpectedResultService,
  aiGenerationApproximateTeachingContentService, OverallAiGenerationService
} from '@/api/lessonHourPreparationLesson.js'

const route = useRoute()
const router = useRouter()
const teacherScheduleId = route.params.teacherScheduleId

// 页面数据
const lessonData = ref({
  numberOfLessons: '1',
  totalDuration: 45,
  preparationTime: 5,
  summaryTime: 5,
  activities: [
    { name: '知识讲解', duration: 15 },
    { name: '互动环节', duration: 10 },
    { name: '练习巩固', duration: 10 }
  ],
  mainContent: '',
  expectedResult: ''
})

// 计算剩余时间
const remainingTime = ref(0)
const updateRemainingTime = () => {
  const total = lessonData.value.totalDuration
  const used = lessonData.value.preparationTime +
    lessonData.value.summaryTime +
    lessonData.value.activities.reduce((sum, activity) => sum + activity.duration, 0)
  remainingTime.value = total - used
}

// 初始化时计算一次剩余时间
onMounted(() => {
  updateRemainingTime()
  initChat()
})

// 添加教学活动
const addActivity = () => {
  lessonData.value.activities.push({
    name: '新教学活动',
    duration: 5
  })
  updateRemainingTime()
}

// 移除教学活动
const removeActivity = (index) => {
  lessonData.value.activities.splice(index, 1)
  updateRemainingTime()
}

// 监听总时长变化
watch(() => lessonData.value.totalDuration, () => {
  updateRemainingTime()
})

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 导航菜单
const activeMenu = ref('')

// 导航方法
const goToTeachingActivities = () => {
  router.push(`/lesson/lesson_hour/mylessonpreparation/TeachingContent/${teacherScheduleId}`)
}

const goToTimeAllocation = () => {
  router.push(`/lesson/lesson_hour/mylessonpreparation/TimeAllocation/${teacherScheduleId}`)
}

const goToExpectedResults = () => {
  router.push(`/lesson/lesson_hour/mylessonpreparation/ExpectedResult/${teacherScheduleId}`)
}

const goToTeachingContent = () => {
  router.push(`/lesson/lesson_hour/mylessonpreparation/ExpectedResult/${teacherScheduleId}`)
}

// AI聊天相关
const chatMessages = ref([
  { type: 'ai', content: '你好！我是AI教学助手，可以帮助你完善教学计划。请告诉我你需要什么帮助？' }
])
const userInput = ref('')
const isGenerating = ref(false)
const chatContainer = ref(null)

// 初始化聊天
const initChat = () => {
  chatMessages.value = [
    { type: 'ai', content: '你好！我是AI教学助手，可以帮助你完善教学计划。请告诉我你需要什么帮助？' }
  ]
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isGenerating.value) return

  // 添加用户消息
  chatMessages.value.push({
    type: 'user',
    content: userInput.value
  })

  const userQuestion = userInput.value
  userInput.value = ''
  isGenerating.value = true

  try {
    // 这里可以添加与AI交互的逻辑
    // 模拟AI回复
    setTimeout(() => {
      chatMessages.value.push({
        type: 'ai',
        content: '我已收到你的问题，正在思考如何帮助你优化教学计划。请稍等片刻，我会根据你提供的信息给出建议。'
      })

      isGenerating.value = false
      // 确保消息滚动到底部
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
      })
    }, 1500)
  } catch (error) {
    ElMessage.error('生成回复失败，请重试')
    isGenerating.value = false
  }
}

// 教学建议轮播图数据
const teachingTips = [
  {
    icon: 'Sunny',
    title: '课堂互动技巧',
    content: '通过提问和小组讨论来提高学生参与度，让课堂更加生动活跃。'
  },
  {
    icon: 'Lightning',
    title: '知识点串联',
    content: '将新知识点与学生已掌握的知识建立联系，帮助学生更好理解和记忆。'
  },
  {
    icon: 'Star',
    title: '案例教学法',
    content: '使用实际案例来解释抽象概念，让学习更加直观和有趣。'
  },
  {
    icon: 'Lightning',
    title: '课堂节奏把控',
    content: '合理安排教学节奏，注意劳逸结合，保持学生的注意力。'
  },
  {
    icon: 'Opportunity',
    title: '及时反馈',
    content: '通过随堂测试了解学生掌握情况，及时调整教学策略。'
  },
  {
    icon: 'Share',
    title: '资源推荐',
    content: '推荐优质教学资源和补充材料，帮助学生拓展知识面。'
  }
]

// AI内容建议
const aiContentSuggestion = ref('根据您的时间分配，建议重点讲解核心知识点，并留出足够的互动和练习时间。')
const teachContents = ref([])
const generatingContent = ref(false)

// 生成AI内容
const generateAIContent = async () => {
  generatingContent.value = true
  try {
    // 模拟API调用
    const res = await aiGenerationApproximateTeachingContentService(teacherScheduleId)
    lessonData.value.mainContent = res.data.mainTeachContent
    teachContents.value = res.data.teachContent
    ElMessage.success('内容生成成功')
    generatingContent.value = false
    // setTimeout(() => {
    //   lessonData.value.mainContent = '本节课将重点讲解以下内容：\n1. 核心概念的基本原理和应用场景\n2. 关键知识点的详细解析和示例\n3. 常见问题的解决方法和技巧\n\n通过互动环节加深学生理解，并通过练习巩固所学知识。'
    //   ElMessage.success('内容生成成功')
    //   generatingContent.value = false
    // }, 2000)
  } catch (error) {
    ElMessage.error('生成失败，请重试')
    generatingContent.value = false
  }
}


// 选择教学内容
const selectTeachContent = (teachContent, index) => {
  // 保存当前的教学内容
  const currentValue = lessonData.value.mainContent

  // 更新教学内容为选中的备选方案
  lessonData.value.mainContent = teachContent

  // 将原来的教学内容放入备选方案中替换被选中的方案
  teachContents.value[index] = currentValue

  ElMessage.success('已切换教学内容')
}

// 预期结果相关
const alternativeResults = ref([])
const generatingResults = ref(false)

// 生成AI预期结果
const generateAIResults = async () => {
  generatingResults.value = true
  try {
    // 模拟API调用
    const res = await aiGenerationApproximateExpectedResultService(teacherScheduleId)
    lessonData.value.expectedResult = res.data.mainResult
    alternativeResults.value = res.data.alternatives
    ElMessage.success('预期结果生成成功')
    generatingResults.value = false

    // setTimeout(() => {
    //   lessonData.value.expectedResult = '学生能够理解并掌握本节课的核心概念，能够独立分析和解决相关问题，并能够在实际场景中应用所学知识。'
    //
    //   // 生成备选方案
    //   alternativeResults.value = [
    //     '学生能够清晰地解释核心概念的基本原理，并能够举例说明其应用场景，同时能够识别和解决基础问题。',
    //     '学生不仅能够掌握基本知识点，还能够分析复杂问题，提出创新性解决方案，并能够评估不同方案的优缺点。',
    //     '学生能够建立知识体系，将本节课内容与已学知识融会贯通，并能够进行自主探究和拓展学习。'
    //   ]
    //
    //   ElMessage.success('预期结果生成成功')
    //   generatingResults.value = false
    // }, 2000)
  } catch (error) {
    ElMessage.error('生成失败，请重试')
    generatingResults.value = false
  }
}

// 选择备选方案
const selectAlternative = (alternative, index) => {
  // 保存当前的预期结果
  const currentValue = lessonData.value.expectedResult

  // 更新预期结果为选中的备选方案
  lessonData.value.expectedResult = alternative

  // 将原来的预期结果放入备选方案中替换被选中的方案
  alternativeResults.value[index] = currentValue

  ElMessage.success('已切换预期结果')
}

// 统一AI生成功能
const generatingAll = ref(false)
const generateAllWithAI = async () => {
  // 检查是否有必要的输入
  if (lessonData.value.totalDuration <= 0) {
    ElMessage.warning('请先设置总课时时长')
    return
  }

  generatingAll.value = true
  try {
    // 添加AI回复
    chatMessages.value.push({
      type: 'ai',
      content: '正在根据您提供的信息生成完整的教学计划，请稍候...',
    })

    // 确保消息滚动到底部
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })

    // 模拟API调用 - 实际项目中应替换为真实的API调用

      // // 生成教学内容
      // lessonData.value.mainContent = '本节课将重点讲解以下内容：\n1. 核心概念的基本原理和应用场景\n2. 关键知识点的详细解析和示例\n3. 常见问题的解决方法和技巧\n\n通过互动环节加深学生理解，并通过练习巩固所学知识。'
      //
      // // 生成预期结果
      // lessonData.value.expectedResult = '学生能够理解并掌握本节课的核心概念，能够独立分析和解决相关问题，并能够在实际场景中应用所学知识。'
      //
      // // 生成备选方案
      // alternativeResults.value = [
      //   '学生能够清晰地解释核心概念的基本原理，并能够举例说明其应用场景，同时能够识别和解决基础问题。',
      //   '学生不仅能够掌握基本知识点，还能够分析复杂问题，提出创新性解决方案，并能够评估不同方案的优缺点。',
      //   '学生能够建立知识体系，将本节课内容与已学知识融会贯通，并能够进行自主探究和拓展学习。'
      // ]
      await OverallAiGenerationService(lessonData.value)

      // 添加AI回复
      chatMessages.value.push({
        type: 'ai',
        content: '已根据您提供的信息生成完整的教学计划！包括教学内容和预期结果。您可以查看并根据需要进行调整。'
      })

      // 确保消息滚动到底部
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
      })

      ElMessage.success('AI生成完成')
      generatingAll.value = false

  } catch (error) {
    ElMessage.error('生成失败，请重试')
    generatingAll.value = false
  }
}

// 保存所有内容
const saving = ref(false)
const saveAllContent = async () => {
  saving.value = true
  try {
    // 这里添加实际的保存逻辑
    // 模拟API调用
    setTimeout(() => {
      ElMessage.success('所有内容保存成功')
      saving.value = false

      // 添加AI回复
      chatMessages.value.push({
        type: 'ai',
        content: '您的教学计划已成功保存！如需进一步调整，随时告诉我。'
      })

      // 确保消息滚动到底部
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
      })
    }, 1500)
  } catch (error) {
    ElMessage.error('保存失败，请重试')
    saving.value = false
  }
}
</script>

<style scoped>
.overall-ai-generation {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部标题区域 */
.header-section {
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.title-container {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 24px;
  color: #409eff;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.meta-info {
  display: flex;
  gap: 16px;
}

.meta-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.action-area {
  display: flex;
  gap: 12px;
}

.generate-button {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-weight: 400;
}

.save-button {
  background-color: #67c23a;
  color: white;
  border: none;
  padding: 10px 20px;
  font-weight: 400;
}

/* 导航菜单 */
.navigation-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  border-bottom: 2px solid transparent;
}

.nav-tab:hover {
  color: #409eff;
}

.nav-tab.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
  flex-wrap: wrap;
}

/* 左侧表单区域 */
.form-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  min-width: 0;
  width: 65%;
}

.time-allocation-form,
.teaching-content-form,
.expected-results-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #ebeef5;
}

.form-section h2 {
  font-size: 16px;
  color: #303133;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
}

.time-phases {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.time-phase-item {
  background-color: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  border-left: 2px solid #409eff;
}

.time-phase-item:hover {
  background-color: #ecf5ff;
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-name-input {
  max-width: 200px;
}

.add-activity {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.time-summary {
  margin-top: 16px;
  padding: 12px;
  background-color: #ecf5ff;
  border-radius: 6px;
  text-align: center;
}

.remaining-time {
  font-weight: 500;
  color: #409eff;
}

.remaining-time.negative {
  color: #f56c6c;
}

.ai-suggestion {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #f0f9eb;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 2px solid #67c23a;
}

.ai-suggestion p {
  margin: 0;
  color: #67c23a;
  flex: 1;
}

/* 备选预期结果 */
.alternative-results {
  margin-top: 16px;
}

.alternative-results h3 {
  font-size: 15px;
  color: #606266;
  margin-bottom: 12px;
  font-weight: 600;
}

.alternatives-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
  padding-top: 4px;
}

.alternative-item {
  flex: 0 0 220px;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.alternative-item::after {
  content: '点击切换';
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #409eff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  transition: all 0.3s ease;
}

.alternative-item:hover::after {
  bottom: 10px;
  opacity: 1;
}

.alternative-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.alternative-item p {
  margin-top: 0;
  margin-bottom: 10px;
  font-weight: 600;
  color: #409eff;
  position: relative;
  padding-left: 8px;
}

.alternative-item p::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background-color: #409eff;
  border-radius: 2px;
}

.alternative-content {
  font-size: 14px;
  color: #606266;
  max-height: 100px;
  overflow-y: auto;
  line-height: 1.5;
}

/* 右侧AI聊天区域 */
.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 380px;
  max-width: 400px;
  margin-right: 30px;
  width: 30%;
  position: relative;
}

.chat-container {
  background-color: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  height: 680px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.2);
  flex-shrink: 0;
  overflow: hidden;
}

.chat-header .ai-avatar {
  width: 36px;
  height: 36px;
}

.ai-avatar::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  transform: rotate(45deg);
  animation: shimmer 3s infinite linear;
}

@keyframes shimmer {
  from { transform: rotate(45deg) translateY(-100%); }
  to { transform: rotate(45deg) translateY(100%); }
}

.chat-header-info {
  display: flex;
  flex-direction: column;
}

.chat-header-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.status-text {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-text::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4CAF50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.6; transform: scale(0.8); }
}

.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
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
  margin-left: auto;
  margin-right: 0;
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
  word-break: break-word;
}

.message.ai .message-bubble {
  background: linear-gradient(135deg, #e9f0ff 0%, #f5f7ff 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-top-left-radius: 4px;
  color: #1e293b;
  margin-left: 8px;
  position: relative;
}

.message.ai .message-bubble::after {
  content: "";
  position: absolute;
  top: 12px;
  left: -4px;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  background: #f5f7ff;
  border-left: 1px solid rgba(99, 102, 241, 0.1);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  color: white;
  border-top-right-radius: 4px;
  margin-right: 8px;
  position: relative;
}

.message.user .message-bubble::after {
  content: "";
  position: absolute;
  top: 12px;
  right: -4px;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  background: #4f46e5;
}

.ai-message-avatar {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.2);
  position: relative;
  overflow: hidden;
}

.ai-avatar::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  transform: rotate(45deg);
  animation: shimmer 3s infinite linear;
}

@keyframes shimmer {
  from { transform: rotate(45deg) translateY(-100%); }
  to { transform: rotate(45deg) translateY(100%); }
}

.chat-header-info {
  display: flex;
  flex-direction: column;
}

.chat-header-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.status-text {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-text::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4CAF50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.6; transform: scale(0.8); }
}

.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
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
  margin-left: auto;
  margin-right: 0;
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
  word-break: break-word;
}

.message.ai .message-bubble {
  background: linear-gradient(135deg, #e9f0ff 0%, #f5f7ff 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-top-left-radius: 4px;
  color: #1e293b;
  margin-left: 8px;
  position: relative;
}

.message.ai .message-bubble::after {
  content: "";
  position: absolute;
  top: 12px;
  left: -4px;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  background: #f5f7ff;
  border-left: 1px solid rgba(99, 102, 241, 0.1);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  color: white;
  border-top-right-radius: 4px;
  margin-right: 8px;
  position: relative;
}

.message.user .message-bubble::after {
  content: "";
  position: absolute;
  top: 12px;
  right: -4px;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  background: #4f46e5;
}

.ai-message-avatar {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.2);
  position: relative;
  overflow: hidden;
}

.user-message-avatar {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
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

.chat-input-container {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.8);
}

.chat-input {
  display: flex;
  gap: 12px;
  position: relative;
  margin-bottom: 8px;
}

.chat-input .el-textarea__inner {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  resize: none;
  transition: all 0.3s ease;
}

.chat-input .el-textarea__inner:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.chat-input .el-textarea__inner:disabled {
  background: rgba(243, 244, 246, 0.5);
  color: #9ca3af;
}

.chat-input .el-button {
  align-self: flex-end;
  height: 40px;
  border-radius: 10px;
  padding: 0 20px;
  font-weight: 500;
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-input .el-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.chat-input .el-button:active:not(:disabled) {
  transform: translateY(0);
}

.input-tips {
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: right;
  padding-right: 8px;
}

.loading-dots {
  display: inline-block;
  position: relative;
}

.loading-dots::after {
  content: "";
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    content: ".";
  }
  33% {
    content: "..";
  }
  66% {
    content: "...";
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 教学建议轮播图 */
.teaching-tips {
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid #ebeef5;
  height: 360px;
  position: relative;
  background-image: linear-gradient(to bottom right, rgba(64, 158, 255, 0.05), rgba(103, 194, 58, 0.05));
}

.teaching-tips::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  z-index: 0;
}

.teaching-tips h3 {
  font-size: 20px;
  color: #303133;
  margin-top: 0;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
  font-weight: 600;
  position: relative;
  display: inline-block;
}

.teaching-tips h3::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: #409eff;
}

.tip-card {
  height: 100%;
  padding: 24px;
  background-color: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid #ebeef5;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.tip-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, #409eff, #67c23a);
}

.tip-card:hover {
  background-color: #f9fbff;
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.tip-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9eb 100%);
  color: #409eff;
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.tip-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #409eff, #67c23a) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
}

.tip-card:hover .tip-icon {
  transform: scale(1.1) rotate(5deg);
}

.tip-card h4 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 16px 0;
  font-weight: 600;
  position: relative;
  padding-bottom: 10px;
}

.tip-card h4::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background-color: #67c23a;
}

.tip-card p {
  font-size: 15px;
  color: #606266;
  margin: 0;
  line-height: 1.8;
  max-width: 90%;
  margin: 0 auto;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
}
</style>
