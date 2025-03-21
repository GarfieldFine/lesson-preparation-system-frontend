<template>
  <div class="question-detail-container">
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

          <!-- 添加选择题选项展示 -->
          <div v-if="question.type === 1" class="question-options">
            <div v-for="option in question.questionContent?.options" :key="option" class="option">
              {{ option }}
            </div>
          </div>
        </div>

        <div class="answer-section">
          <h2>参考答案</h2>
          <div class="answer-content">
            <span v-if="question.type === 3">{{ question.questionContent?.answer === 1?'✔':'✘'}}</span>
            <span v-else>{{ question.questionContent?.answer }}</span>
          </div>
        </div>
      </div>

      <!-- 题目提示卡片 -->
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
      <div class="glass-card related-questions">
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
    </div>

    <!-- 右侧AI聊天区 -->
    <div class="right-panel">
      <div class="glass-card chat-container">
        <div class="chat-header">
          <div class="header-title">
            <el-avatar :size="32" src="/ai-avatar.png" />
            <h3>AI助手</h3>
          </div>
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
              placeholder="输入你的问题..."
              @keyup.enter.native="handleSendMessage"
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
              :disabled="!userInput.trim()"
              @click="handleSendMessage"
            >
              发送
              <el-icon class="el-icon--right">
                <Position />
              </el-icon>
            </el-button>
          </div>
          <div class="input-tips">
            按 Enter 发送消息，Shift + Enter 换行
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Help, Connection, ArrowRight, Position, Delete, ChatLineRound } from '@element-plus/icons-vue'
import { getQuestionById, recommendQuestions } from '@/api/question.js'
const route = useRoute()
const router = useRouter()
const questionId = route.params.questionId
const chatContainer = ref(null)
const userInput = ref('')
const chatMessages = ref([])

// 模拟题目数据
const question = ref({
  // 初始为空对象，将通过API获取数据
})

// 模拟相关题目数据
const relatedQuestions = ref([
  {
    id: 2,
    questionContent: '求函数f(x)=x³在x=2处的导数',
    type: '1'
  },
  {
    id: 3,
    questionContent: '计算g(x)=sin(x)在x=π/2处的导数',
    type: '2'
  },
  {
    id: 4,
    questionContent: '证明复合函数的导数法则',
    type: '3'
  }
])

const getQuestionTypeName = (type) => {
  const typeMap = {
    '1': '选择题',
    '2': '填空题',
    '3': '判断题',
    '4': '简答题'
  }
  return typeMap[type] || type
}

const getQuestionTypeStyle = (type) => {
  const styleMap = {
    '1': '',
    '2': 'warning',
    '3': 'info',
    '4': 'success'
  }
  return styleMap[type] || ''
}

const handleSendMessage = async () => {
  if (!userInput.value.trim()) return

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
      content: `这是一个模拟的AI响应，实际项目中需要接入后端API。`,
      time
    })
    scrollToBottom()
  }, 1000)

  userInput.value = ''
  await scrollToBottom()
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const clearChat = () => {
  chatMessages.value = [{
    role: 'ai',
    content: '对话已清空，有什么问题都可以继续问我哦！',
    time: '12:00'
  }]
}

const handleRelatedQuestionClick = async (id) => {
  // 实际项目中这里需要根据路由参数获取题目详情
  const res = await getQuestionById(id)
  question.value = res.data
}

onMounted(async () => {

  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  chatMessages.value.push({
    role: 'ai',
    content: '你好！我是你的AI助手，有任何关于这道题的问题都可以问我哦！',
    time
  })

  // 实际项目中这里需要根据路由参数获取题目详情
  const res = await getQuestionById(questionId)
  question.value = res.data

  const res1 = await recommendQuestions(questionId)
  relatedQuestions.value = res1.data
})

</script>

<style scoped>
.question-detail-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #f6f8fc 0%, #e9f0f9 100%);
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-question-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.question-content, .answer-section {
  h2 {
    color: #1a1a1a;
    margin-bottom: 16px;
    font-size: 1.25rem;
  }
}

.content-text, .answer-content {
  line-height: 1.6;
  color: #333;
}

.hint-card, .related-questions {
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    color: #1a1a1a;
  }
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateX(4px);
  }
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-text {
  color: #333;
  font-size: 0.9rem;
}

.right-panel {
  position: relative;
  height: 710px;
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
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
  border-radius: 0 0 16px 16px;
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

.send-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.send-button:active {
  transform: translateY(0);
}

.input-tips {
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: right;
  padding-right: 8px;
}


/* 调整消息布局 */
.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
  margin-bottom: 16px;

  &.ai {
    align-self: flex-start;

    .el-avatar {
      background: #f0f4ff;
    }
  }

  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .el-avatar {
      background: #e0e7ff;
    }
  }
}

.message-bubble {
  max-width: 480px;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  transition: all 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    top: 12px;
    width: 8px;
    height: 8px;
    transform: rotate(45deg);
  }
}

.message.ai .message-bubble {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.1);
  margin-left: 8px;

  &::after {
    left: -4px;
    background: rgba(255, 255, 255, 0.95);
  }
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  margin-right: 8px;

  &::after {
    right: -4px;
    background: #6366f1;
  }
}

.message-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
  padding: 0 8px;
}

/* 添加选项样式 */
.question-options {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option {
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  border: none;
}
</style>
