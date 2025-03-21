<template>
  <div class="teaching-activities-container">
    <!-- 左侧内容展示区域 -->
    <div class="content-area">
      <div class="header-actions">
        <h2>教学活动安排</h2>
        <button
          class="save-button"
          @click="saveActivities"
          :class="{ 'has-changes': hasUnsavedChanges }"
        >
          <i class="fas fa-save"></i> 保存更改
        </button>
      </div>
      <div class="activities-list">
        <draggable
          v-model="teachingActivities"
          :component-data="{
            name: 'flip-list'
          }"
          item-key="id"
          tag="ul"
          handle=".drag-handle"
          @start="isDragging = true"
          @end="handleDragEnd"
          v-if="teachingActivities.length>0"
        >
          <template #item="{element}">
            <li class="activity-item" :class="{ 'is-dragging': isDragging }">
              <div class="activity-header">
                <div class="drag-handle">
                  <i class="fas fa-grip-vertical"></i>
                </div>
                <h3>{{ element.title }}</h3>
              </div>
              <p>{{ element.description }}</p>
              <div class="activity-time">时长：{{ element.duration }}分钟</div>
            </li>
          </template>
        </draggable>
        <template v-else>
          <el-empty description="暂无教学活动" />
        </template>
      </div>
    </div>

    <!-- 右侧AI聊天区域 -->
    <div class="chat-area">
      <div class="chat-header">
        <div class="ai-info">
          <div class="ai-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="ai-details">
            <div class="ai-name">AI 助手</div>
            <div class="ai-status">
              <span class="status-dot"></span>
              <span class="status-text">在线</span>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-messages" ref="chatMessagesRef">
        <div v-for="(message, index) in chatHistory" :key="index"
             :class="['message', message.role === 'ai' ? 'ai-message' : 'user-message']">
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
      <div class="chat-input">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          placeholder="请输入您的问题..."
          :disabled="isGenerating"
        >
        <button @click="sendMessage" :disabled="isGenerating">
          <template v-if="isGenerating">
            AI生成中<span class="loading-dots">...</span>
          </template>
          <template v-else>
            发送
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import draggable from 'vuedraggable'
import {
  lessonHourAiGenerateTeachingActivitiesArrangementService,
  lessonHourGetTeachingActivitiesByTeacherScheduleIdService,
  lessonHourSaveTeachingActivitiesService
} from '@/api/lessonHourPreparationLesson.js'
import { h } from 'vue'
import { useRoute } from 'vue-router'
const teacherScheduleId = useRoute().params.teacherScheduleId

// 拖拽状态
const isDragging = ref(false)

// 响应式数据
const teachingActivities = ref([

])

const chatHistory = ref([])
const userInput = ref('')
const chatMessagesRef = ref(null)

// 添加未保存更改状态
const hasUnsavedChanges = ref(false)

// 添加生成状态
const isGenerating = ref(false)

// 方法
const scrollToBottom = () => {
  const chatMessages = chatMessagesRef.value
  chatMessages.scrollTop = chatMessages.scrollHeight
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isGenerating.value) return

  isGenerating.value = true
  try {
    // 添加用户消息到聊天记录
    chatHistory.value.push({
      role: 'user',
      content: userInput.value
    })

    // 模拟AI回复
    chatHistory.value.push({
      role: 'ai',
      content: '我理解您的需求，让我为您调整教学活动安排...'
    })

    // 这里添加与AI交互的逻辑
    const aiResponse = await lessonHourAiReviseTeachingActivitiesService(teachingActivities.value, userInput.value)
    teachingActivities.value = aiResponse.data

    // 模拟AI回复
    chatHistory.value.push({
      role: 'ai',
      content: '已调整完成，如有任何需求请及时询问我'
    })

    userInput.value = ''
    await nextTick()
    scrollToBottom()
  } catch (error) {
    ElMessage.error('AI生成失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 添加初始化方法
const initChat = () => {
  chatHistory.value.push({
    role: 'ai',
    content: '你好！我是AI助手，可以帮你优化教学活动安排相关内容，请问有什么需要帮助的吗？'
  })
}
const Notification1 = () => {
  ElNotification({
    title: '温馨提示',
    message: h('i', { style: 'color: teal' }, '正在为你生成教学活动安排'),
    duration: 4000
  })
}

// 组件挂载时初始化聊天
onMounted(async () => {
  initChat()
  const res = await lessonHourGetTeachingActivitiesByTeacherScheduleIdService(teacherScheduleId)
  teachingActivities.value = res.data
  if(teachingActivities.value.length === 0) {
    Notification1()
    // 添加loading
    const loading = ElLoading.service({
      lock: true,
      text: '正在生成教学活动安排...',
      background: 'rgba(255, 255, 255, 0.7)',
    })
    try {
      const res = await lessonHourAiGenerateTeachingActivitiesArrangementService(teacherScheduleId)
      teachingActivities.value = res.data
      ElMessage.success('生成成功')
    } catch (error) {
      ElMessage.error('生成失败')
    } finally {
      loading.close() // 关闭loading
    }
  }
})

// 修改拖拽结束处理函数
const handleDragEnd = () => {
  isDragging.value = false
  hasUnsavedChanges.value = true
}

// 保存方法
const saveActivities = async () => {
  try {
    // 这里添加实际的保存逻辑，例如发送API请求
    await lessonHourSaveTeachingActivitiesService(teachingActivities.value,teacherScheduleId)

    hasUnsavedChanges.value = false

    // 添加AI提示
    chatHistory.value.push({
      role: 'ai',
      content: '教学活动顺序已成功保存！'
    })
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('保存失败:', error)
    // 可以添加错误提示
  }
}

// 更新draggable的事件处理
const dragConfig = {
  start: () => isDragging.value = true,
  end: handleDragEnd
}
</script>

<style scoped>
.activities-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 添加过渡动画样式 */
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: linear-gradient(145deg, #e3f2fd, #bbdefb) !important;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.15) !important;
}

.teaching-activities-container {
  display: flex;
  height: 100%;
  min-height: 600px;
}

.content-area {
  flex: 1;
  padding: 20px;
  border-right: 1px solid #eee;
  overflow-y: auto;
  margin-right: 440px;
  background: linear-gradient(145deg, #ffffff, #fafafa);
  border-radius: 12px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.02);
}

.activities-list {
  margin-top: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.03);
}

.activity-item {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  padding: 18px;
  margin-bottom: 18px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.activity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.drag-handle {
  cursor: move;
  padding: 6px;
  color: #888;
  transition: all 0.3s ease;
}

.drag-handle:hover {
  color: #1976d2;
  transform: scale(1.1);
}

.activity-item.is-dragging {
  opacity: 0.7;
  transform: scale(1.02) rotate(1deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.activity-time {
  color: #666;
  font-size: 0.9em;
  margin-top: 10px;
  padding: 4px 8px;
  background: rgba(25, 118, 210, 0.08);
  border-radius: 4px;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.activity-time::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(25, 118, 210, 0.05),
    rgba(25, 118, 210, 0.1),
    rgba(25, 118, 210, 0.05)
  );
  transform: translateX(-100%);
  animation: shimmerTime 2s infinite;
}

@keyframes shimmerTime {
  100% { transform: translateX(100%); }
}

.chat-area {
  width: 400px;
  display: flex;
  height: 780px;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
  background: linear-gradient(to bottom, #ffffff, #fafafa);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  margin: 20px 20px 20px 20px;
  position: fixed;
  right: 50px;
  top: 85px;
  bottom: 20px;
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #eaeaea;
}

.ai-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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

.ai-avatar i {
  font-size: 20px;
  color: #2196f3;
}

.ai-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4CAF50;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 13px;
  color: #666;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
  position: relative;
}

.chat-messages::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, rgba(248, 249, 250, 1), rgba(248, 249, 250, 0));
  pointer-events: none;
}

.message {
  margin-bottom: 20px;
  max-width: 85%;
  position: relative;
  transition: transform 0.2s ease;
}

.message:hover {
  transform: translateY(-1px);
}

.message-content {
  padding: 14px 18px;
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  line-height: 1.6;
  position: relative;
  overflow: hidden;
}

.message-content::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3));
  border-radius: 0 14px 14px 0;
}

.user-message {
  margin-left: auto;
}

.user-message .message-content {
  position: relative;
  background: linear-gradient(145deg, #e3f2fd, #bbdefb);
  color: #1565c0;
}

.ai-message {
  margin-right: auto;
}

.ai-message .message-content {
  position: relative;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.chat-input {
  padding: 16px 20px;
  background: linear-gradient(to bottom, #fafafa, #ffffff);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 12px;
  position: relative;
}

.chat-input::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.chat-input input {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 24px;
  outline: none;
  transition: all 0.3s ease;
  font-size: 0.95em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.chat-input input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
  transform: translateY(-1px);
}

.chat-input button {
  padding: 12px 26px;
  background: linear-gradient(135deg, #1976d2, #1565c0);
  box-shadow: 0 2px 6px rgba(25, 118, 210, 0.3);
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
}

.chat-input button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1565c0, #0d47a1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions h2 {
  font-size: 1.5em;
  color: #2c3e50;
  position: relative;
  padding-bottom: 8px;
}

.header-actions h2::before {
  display: none;
}

.header-actions h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #1976d2, transparent);
  border-radius: 3px;
}

.header-actions h2::before {
  display: none;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.save-button:hover {
  background: #43A047;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.save-button:active {
  transform: translateY(0);
}

.save-button.has-changes {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes dotsAnimation {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
  100% { content: ''; }
}

.loading-dots {
  display: inline-block;
  width: 16px;
  text-align: left;
}

.loading-dots::after {
  content: '';
  animation: dotsAnimation 1.5s infinite;
}

.activity-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-header h3::after {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #1976d2;
  border-radius: 50%;
  opacity: 0.6;
}

.message-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
}

/* 添加滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #bbdefb, #90caf9);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #90caf9, #64b5f6);
}

/* 添加动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message {
  animation: fadeIn 0.3s ease forwards;
}

/* 优化拖拽手柄效果 */
.drag-handle i {
  transition: all 0.3s ease;
}

.drag-handle:hover i {
  transform: scale(1.2);
  color: #1976d2;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
}

/* 添加左侧装饰条 */
.activity-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #1976d2, #64b5f6);
  border-radius: 4px 0 0 4px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.activity-item:hover::before {
  opacity: 1;
}

/* 添加活动描述样式 */
.activity-item p {
  color: #666;
  line-height: 1.6;
  margin: 8px 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  border-left: 2px solid rgba(25, 118, 210, 0.2);
}

/* 优化空状态样式 */
.el-empty {
  padding: 40px;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px dashed rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.el-empty::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: radial-gradient(circle at center, rgba(25, 118, 210, 0.03) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 添加卡片hover时的微妙光效 */
.activity-item::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
  transform: scale(0);
  transition: transform 0.6s;
  pointer-events: none;
}

.activity-item:hover::after {
  transform: scale(1);
}

/* 为活动项添加装饰性边框 */
.activity-item {
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.activity-item::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  height: 3px;
  background: linear-gradient(to right, #1976d2, #64b5f6);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px 8px 0 0;
}

.activity-item:hover::after {
  opacity: 1;
}

/* 为时间标签添加图标 */
.activity-time {
  position: relative;
}

.activity-time::before {
  display: none;
}

/* 为描述文本添加样式 */
.activity-item p {
  position: relative;
  padding-left: 12px;
}

.activity-item p::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #1976d2, transparent);
  border-radius: 1px;
}

/* 为拖拽手柄添加提示效果 */
.drag-handle {
  position: relative;
}

.drag-handle::after {
  content: '拖动排序';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.drag-handle:hover::after {
  transform: translateX(-50%) scale(1);
  opacity: 1;
}
</style>
