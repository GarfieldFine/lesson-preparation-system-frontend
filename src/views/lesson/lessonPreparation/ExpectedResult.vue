<template>
  <div class="expected-results-container">
    <!-- 左侧展示区 -->
    <div class="display-section">
      <div class="header-section">
        <h2>教学预期结果</h2>
        <!-- 优化保存按钮 -->
        <el-button
          type="primary"
          :loading="saving"
          @click="saveResults"
          class="save-button"
          size="default"
        >
          <el-icon class="save-icon"><Document /></el-icon>
          保存预期结果
        </el-button>
      </div>
      <div class="results-content">
        <div v-if="currentResult" class="result-item">
          <p>{{ currentResult }}</p>
        </div>
        <div v-else class="empty-state">
          <p>暂无预期结果，请通过右侧与AI助手交流生成</p>
        </div>
      </div>

      <!-- 添加提示信息 -->
      <div v-if="tipMessage" class="tip-message">
        {{ tipMessage }}
      </div>

      <!-- 新增备选方案区域 -->
      <div class="alternative-section" v-if="alternatives.length > 0">
        <h3>备选方案</h3>
        <div class="alternatives-container">
          <div
            v-for="(alternative, index) in alternatives"
            :key="index"
            class="alternative-item"
            @click="selectAlternative(alternative, index)"
          >
            <p>方案 {{ index + 1 }}</p>
            <div class="alternative-content">{{ alternative }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改右侧AI聊天框的包装容器 -->
    <div class="chat-section-wrapper">
      <div class="chat-section">
        <div class="chat-header">
          <h3>AI助手</h3>
        </div>
        <div class="chat-messages" ref="chatContainer">
          <div v-for="(message, index) in chatHistory" :key="index"
               :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']">
            <div class="message-avatar">
              <el-avatar :size="32" :icon="message.role === 'user' ? 'User' : 'Service'" />
            </div>
            <div class="message-content">
              <p>{{ message.content }}</p>
            </div>
          </div>
        </div>
        <div class="chat-input-container">
          <div class="input-wrapper">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="3"
              resize="none"
              placeholder="请输入您的问题... (Enter 快速发送)"
              @keyup.enter.prevent="sendMessage"
            />
            <div class="button-wrapper">
              <el-button type="primary" :loading="loading" @click="sendMessage">
                <el-icon class="send-icon"><Position /></el-icon>
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, h } from 'vue'
import { Position, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  chapterLessonPreparationAiGenerateExpectedResultArrangementService,
  chapterLessonPreparationGetExpectedResultByIdService,
  chapterLessonPreparationSaveExpectedResultService
} from '@/api/chapterLessonPreparation.js'
import { useRoute } from 'vue-router'
const chapterLessonPreparationId = useRoute().params.chapterLessonPreparationId
const currentResult = ref('')  // 当前显示的主要结果
const alternatives = ref([])   // 初始化为空数组而不是null
const chatHistory = ref([
  {
    role: 'ai',
    content: '你好！我是AI助手，可以帮你优化预期结果安排相关内容，请问有什么需要帮助的吗？'
  }
])
const userInput = ref('')
const loading = ref(false)
const chatContainer = ref(null)
const tipMessage = ref('') // 新增提示信息ref
const saving = ref(false)

// 选择备选方案
const selectAlternative = (alternative, index) => {
  // 保存当前的预期结果
  const currentValue = currentResult.value

  // 更新预期结果为选中的备选方案
  currentResult.value = alternative

  // 将原来的预期结果放入备选方案中替换被选中的方案
  alternatives.value[index] = currentValue
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return

  // 添加用户消息到聊天历史
  chatHistory.value.push({
    role: 'user',
    content: userInput.value
  })

  loading.value = true

  try {
    // 调用实际的API服务
    const res = await chapterLessonPreparationAiGenerateExpectedResultArrangementService(chapterLessonPreparationId)

    // 更新预期结果和备选方案
    currentResult.value = res.data.mainResult || ''
    alternatives.value = res.data.alternatives || []

    // 设置提示信息
    tipMessage.value = "已为您生成教学预期结果和三个备选方案，您可以点击任意备选方案来替换当前的预期结果。"

    // 添加AI回复到聊天历史
    chatHistory.value.push({
      role: 'assistant',
      content: '已调整完成，如有任何需求请及时询问我'
    })

    userInput.value = ''

    // 滚动到最新消息
    await nextTick()
    scrollToBottom()

    ElMessage.success('生成成功')
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('生成失败')
  } finally {
    loading.value = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const Notification1 = () => {
  ElNotification({
    title: '温馨提示',
    message: h('i', { style: 'color: teal' }, '正在为你生成教学预期结果'),
    duration: 4000
  })
}
// 组件挂载时初始化
onMounted(async () => {
  try {
    const res = await chapterLessonPreparationGetExpectedResultByIdService(chapterLessonPreparationId)
    // 确保即使API返回null也会设置为空数组
    currentResult.value = res.data.mainResult || ''
    alternatives.value = res.data.alternatives || []

    if(!currentResult.value || alternatives.value.length === 0) {
      Notification1()
      const loading = ElLoading.service({
        lock: true,
        text: '正在进行时间分配...',
        background: 'rgba(255, 255, 255, 0.7)',
      })
      try {
        const res = await chapterLessonPreparationAiGenerateExpectedResultArrangementService(chapterLessonPreparationId)
        // 同样确保不会设置为null
        currentResult.value = res.data.mainResult || ''
        alternatives.value = res.data.alternatives || []

        // 设置提示信息
        tipMessage.value = "已为您生成教学预期结果和三个备选方案，您可以点击任意备选方案来替换当前的预期结果。"
        // 添加AI提示
        chatHistory.value.push({
          role: 'ai',
          content: '已为您生成教学预期结果和三个备选方案，您可以点击任意备选方案来替换当前的预期结果。'
        })
        ElMessage.success('生成成功')
      } catch (error) {
        ElMessage.error('生成失败')
        alternatives.value = [] // 确保发生错误时也是空数组
      } finally {
        loading.close()
      }
    }else{
      // 设置提示信息
      tipMessage.value = "已为您生成教学预期结果和三个备选方案，您可以点击任意备选方案来替换当前的预期结果。"
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
    alternatives.value = [] // 确保发生错误时也是空数组
  }
})

// 添加保存函数
const saveResults = async () => {
  if (!currentResult.value) {
    ElMessage.warning('请先生成教学预期结果')
    return
  }

  saving.value = true
  try {
    // 这里添加保存API调用
    await chapterLessonPreparationSaveExpectedResultService(chapterLessonPreparationId, {
      mainResult: currentResult.value,
      alternatives: alternatives.value
    })
    // 添加AI提示
    chatHistory.value.push({
      role: 'ai',
      content: '教学预期结果已成功保存！'
    })
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.expected-results-container {
  display: flex;
  height: 100%;
  gap: 20px;
  padding: 20px;
  position: relative; /* 添加相对定位 */
}

/* 添加标题和按钮的布局样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.header-section h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

/* 修改左侧展示区样式 */
.display-section {
  flex: 6;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto;
  margin-right: 400px; /* 为固定的聊天框留出空间 */
}

/* 添加聊天框包装容器样式 */
.chat-section-wrapper {
  position: fixed;
  top: 120px;
  right: 70px;
  width: 385px; /* 固定宽度 */
  height: 745px; /* 减去上下padding */
}

/* 修改聊天框样式 */
.chat-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.chat-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

/* 确保聊天消息区域可以滚动 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-left: 5px;
  background: #f8f9fa;
}

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  max-width: 100%;
}

.message-avatar {
  margin: 0 12px;
  flex-shrink: 0;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
  max-width: 80%;
}

.message-content p {
  margin: 0;
  line-height: 1.5;
  word-break: break-word;
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 12px 12px 0 12px;
}

.ai-message .message-content {
  background-color: #fff;
  color: #333;
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.chat-input-container {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
}

.input-wrapper {
  background: #fff;
  border-radius: 8px;
}

.input-wrapper :deep(.el-textarea__inner) {
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-wrapper :deep(.el-textarea__inner:focus) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.button-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.el-button {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.send-icon {
  margin-right: 6px;
}

/* 自定义滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-track {
  background-color: #f8f9fa;
}

.result-item {
  background-color: #f8f9fa;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 6px;
  border-left: 4px solid #1976d2;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 40px 0;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 新增备选方案相关样式 */
.alternative-section {
  margin-top: 30px;
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

.alternative-section h3 {
  margin-bottom: 16px;
  color: #333;
}

.alternatives-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.alternative-item {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.alternative-item::after {
  content: '点击切换';
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1976d2;
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
  border-color: #1976d2;
}

.alternative-item p {
  margin: 0 0 8px 0;
  font-weight: bold;
  color: #1976d2;
}

.alternative-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  max-height: 100px;
  overflow-y: auto;
}

/* 自定义备选方案内容的滚动条样式 */
.alternative-content::-webkit-scrollbar {
  width: 4px;
}

.alternative-content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 2px;
}

.alternative-content::-webkit-scrollbar-track {
  background-color: #f8f9fa;
}

/* 添加提示信息样式 */
.tip-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #e3f2fd;
  border-radius: 6px;
  color: #1976d2;
  font-size: 14px;
  text-align: center;
}

/* 优化保存按钮样式 */
.save-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-weight: 500;
  background: linear-gradient(145deg, #1976d2, #2196f3);
  border: none;
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
}

.save-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  background: linear-gradient(145deg, #1565c0, #1976d2);
}

.save-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.4);
}

.save-icon {
  font-size: 16px;
}
</style>
