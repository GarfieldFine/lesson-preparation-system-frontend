<template>
  <div class="container">
    <!-- 左侧内容区域 -->
    <div class="content-section">
      <div class="header-section">
        <h2>课时教学时间分配</h2>
        <button class="save-btn" @click="saveTimeAllocation">
          <i class="fas fa-save"></i> 保存
        </button>
      </div>
      <div class="subject-info">
        <input
          v-model="currentSubject.name"
          class="editable-title"
          placeholder="输入章节名称"
        >
        <div class="duration-input">
          <span>总课时时长:</span>
          <input
            v-model.number="currentSubject.totalDuration"
            type="number"
            class="duration-field"
          >
          <span>分钟</span>
        </div>
      </div>
      <div class="timeline-container">
        <div v-for="(phase, index) in currentSubject.phases"
             :key="index"
             class="timeline-item">
          <div class="time-block">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              class="delete-phase-btn"
              @click="deletePhase(index)"
            ></el-button>
            <div class="time">
              <input
                v-model.number="phase.duration"
                type="number"
                class="duration-input"
                @input="validateDuration(phase)"
              >分钟
            </div>
            <input
              v-model="phase.name"
              class="phase-name-input"
              placeholder="阶段名称"
            >
          </div>
          <div class="phase-content">
            <h4>教学内容</h4>
            <textarea
              v-model="phase.content"
              class="content-textarea"
              placeholder="请输入教学内容"
              rows="1"
              @input="autoGrow($event.target)"
              @focus="showInteractionTips($event, phase)"
              @blur="hideInteractionTips"
              @click="showEditPanel($event, phase, 'content')"
            ></textarea>
            <!-- 添加提示框 -->
            <div v-if="showTips && isInteractionPhase(phase)" class="interaction-tips" :style="tipsPosition">
              <div class="tips-header">
                <el-icon><Bell /></el-icon>
                <span>互动方式建议</span>
              </div>
              <div class="tips-content">
                <div v-for="(tip, index) in interactionTips"
                     :key="index"
                     class="tip-item"
                >
                  <el-icon><Check /></el-icon>
                  <span>{{ tip }}</span>
                </div>
              </div>
            </div>
            <h4>教学建议</h4>
            <textarea
              v-model="phase.suggestion"
              class="content-textarea"
              placeholder="请输入教学建议"
              rows="1"
              @input="autoGrow($event.target)"
              @click="showEditPanel($event, phase, 'suggestion')"
            ></textarea>

            <!-- 添加编辑面板 -->
            <div
              v-if="showEditPanelFlag && selectedPhase === phase"
              class="edit-panel"
              :style="editPanelPosition"
              v-click-outside="hideEditPanel"
            >
              <div class="edit-panel-header">
                <span>{{ editingType === 'content' ? '教学内容' : '教学建议' }}</span>
                <el-button
                  type="primary"
                  size="small"
                  @click="hideEditPanel"
                >
                  完成
                </el-button>
              </div>
              <div class="edit-panel-content">
                <el-input
                  v-model="phase[editingType]"
                  type="textarea"
                  :rows="6"
                  :placeholder="editingType === 'content' ? '请输入教学内容' : '请输入教学建议'"
                />
              </div>
            </div>
          </div>
        </div>
        <button @click="addPhase" class="add-phase-btn">
          添加教学阶段
        </button>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-section">
      <div class="chat-header">
        <el-avatar :size="36" class="fas fa-robot" />
        <div class="chat-header-info">
          <h3>AI 教学助手</h3>
          <span class="status-text">在线</span>
        </div>
      </div>
      <div class="chat-messages" ref="chatContainer">
        <div v-for="(message, index) in chatMessages"
             :key="index"
             :class="['message', message.type]">
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time" v-if="message.time">{{ message.time }}</div>
        </div>
      </div>
      <div class="chat-input-container">
        <div class="chat-input">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="1"
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
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, h } from 'vue'
import {
  chapterLessonPreparationAiGenerateTimeAllocationArrangementService,
  chapterLessonPreparationAiReviseTimeAllocationService,
  chapterLessonPreparationGetTimeAllocationByIdService,
  chapterLessonPreparationSaveTimeAllocationService
} from '@/api/chapterLessonPreparation.js'
import { Delete, Bell, Check, Position } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
const chapterLessonPreparationId = useRoute().params.chapterLessonPreparationId

// 当前科目的教学时间分配
const currentSubject = ref({
  name: '',
  totalDuration: '',
  phases: []
})

const Notification1 = () => {
  ElNotification({
    title: '温馨提示',
    message: h('i', { style: 'color: teal' }, '正在为你生成时间分配'),
    duration: 4000
  })
}
onMounted(async () => {
  const res = await chapterLessonPreparationGetTimeAllocationByIdService(chapterLessonPreparationId)
  console.log(res)
  currentSubject.value = res.data
  if (!currentSubject.value.phases) {
    Notification1()
    // 添加loading
    const loading = ElLoading.service({
      lock: true,
      text: '正在进行时间分配...',
      background: 'rgba(255, 255, 255, 0.7)',
    })
    try {
      const res = await chapterLessonPreparationAiGenerateTimeAllocationArrangementService(chapterLessonPreparationId)
      currentSubject.value = res.data
      ElMessage.success('生成成功')
    } catch (error) {
      ElMessage.error('生成失败')
    } finally {
      loading.close() // 关闭loading
    }
  }
})

// 聊天消息列表
const chatMessages = ref([
  {
    type: 'ai',
    content: '你好！我是你的教学规划助手。我可以帮你：\n1. 调整教学时间分配\n2. 提供更详细的教学建议\n3. 解答课程设计相关问题'
  }
])

const userInput = ref('')
const chatContainer = ref(null)

// 添加生成状态控制
const isGenerating = ref(false)

// 添加新的教学阶段
const addPhase = () => {
  currentSubject.value.phases.push({
    name: '新教学阶段',
    duration: 5,
    content: '',
    suggestion: ''
  })
}

// 验证时长输入
const validateDuration = (phase) => {
  if (phase.duration < 0) phase.duration = 0
  if (phase.duration > currentSubject.value.totalDuration) {
    phase.duration = currentSubject.value.totalDuration
  }
}

// 监听总时长变化
watch(() => currentSubject.value.totalDuration, (newValue) => {
  if (newValue < 0) currentSubject.value.totalDuration = 0
})

// 修改发送消息方法
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
    const res = await chapterLessonPreparationAiReviseTimeAllocationService(currentSubject.value, userQuestion)
    currentSubject.value = res.data
    chatMessages.value.push({
      type: 'ai',
      content: '已根据你的需求修改教学时间分配，如果还有其他问题请及时询问我'
    })
  } catch (error) {
    ElMessage.error('生成回复失败，请重试')
  } finally {
    isGenerating.value = false
    // 确保消息滚动到底部
    await nextTick()
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 自动调整文本框高度
const autoGrow = (element) => {
  element.style.height = "5px";
  element.style.height = (element.scrollHeight) + "px";
}

// 保存时间分配
const saveTimeAllocation = async () => {
  try {
    // 这里添加实际的保存逻辑
    // 例如发送到后端API
    await chapterLessonPreparationSaveTimeAllocationService(currentSubject.value, chapterLessonPreparationId)

    // 模拟保存成功
    chatMessages.value.push({
      type: 'ai',
      content: '课时教学时间分配已成功保存！'
    })
  } catch (error) {
    chatMessages.value.push({
      type: 'ai',
      content: '保存失败，请稍后重试。'
    })
  }
}

// 添加删除阶段方法
const deletePhase = (index) => {
  ElMessageBox.confirm(
    '确定要删除这个教学阶段吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    currentSubject.value.phases.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 添加提示相关的响应式变量
const showTips = ref(false)
const tipsPosition = ref({
  top: '0px',
  left: '0px'
})

// 判断是否是互动环节
const isInteractionPhase = (phase) => {
  return phase.name.startsWith('互动')
}

// 显示互动提示
const showInteractionTips = (event, phase) => {
  if (isInteractionPhase(phase)) {
    const rect = event.target.getBoundingClientRect()
    tipsPosition.value = {
      top: `${rect.top}px`,
      left: `${rect.right + 10}px`
    }
    showTips.value = true
  }
}

// 隐藏互动提示
const hideInteractionTips = () => {
  showTips.value = false
}

// 定义互动方式列表
const interactionTips = [
  '小组讨论',
  '角色扮演',
  '头脑风暴',
  '案例分析',
  '实践演示',
  '问答互动',
  '游戏化学习'
]

// 添加编辑面板相关的响应式变量
const showEditPanelFlag = ref(false)
const editPanelPosition = ref({
  top: '0px',
  left: '0px'
})
const selectedPhase = ref(null)
const editingType = ref('content')

// 显示编辑面板
const showEditPanel = (event, phase, type) => {
  const rect = event.target.getBoundingClientRect()
  editPanelPosition.value = {
    top: `${rect.bottom + 5}px`,
    left: `${rect.left}px`
  }
  selectedPhase.value = phase
  editingType.value = type
  showEditPanelFlag.value = true
}

// 隐藏编辑面板
const hideEditPanel = () => {
  showEditPanelFlag.value = false
  selectedPhase.value = null
}
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  position: relative;
  padding-right: 400px; /* 为固定定位的聊天框留出空间 */
}

.content-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-width: 0; /* 防止flex子项溢出 */
}

.subject-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.timeline-container {
  margin-top: 20px;
}

.timeline-item {
  position: relative;
  padding: 20px;
  padding-bottom: 5px;
  margin-bottom: 20px;
  border-left: 3px solid #1976d2;
  background-color: #f8f9fa;
  border-radius: 0 8px 8px 0;
}

.time-block {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}

.delete-phase-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.timeline-item:hover .delete-phase-btn {
  opacity: 1;
}

.time {
  background-color: #1976d2;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.time input {
  width: 35px;
  background: transparent;
  border: none;
  color: white;
  text-align: center;
  font-size: 1em;
  padding: 0;
}

.time input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.phase-name-input {
  flex: 1;
  border: none;
  background: transparent;
  font-weight: bold;
  color: #03d5f6 ;
  font-size: 1.1em;
  padding: 4px 8px;
}

.phase-name-input:focus {
  background-color: rgba(25, 118, 210, 0.05);
  border-radius: 4px;
}

.phase-content {
  margin-left: 10px;
}

.phase-content h4 {
  margin: 10px 0 5px 0;
  color: #1976d2;
  font-size: 1.1em;
}

.content-textarea {
  width: 100%;
  min-height: 24px;
  padding: 2px 0;
  border: none;
  background: transparent;
  color: #666;
  font-size: 1em;
  line-height: 1.5;
  resize: none;
  font-family: inherit;
  overflow: hidden;
}

.content-textarea:focus {
  outline: none;
  background-color: rgba(25, 118, 210, 0.05);
  border-radius: 4px;
}

/* Remove number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.chat-section {
  position: fixed;
  right: 55px;
  top: 105px;
  bottom: 20px;
  width: 380px;
  height: 780px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

.chat-header-info {
  flex: 1;
}

.chat-header-info h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.status-text {
  font-size: 12px;
  color: #67c23a;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f8f9fa;
}

.message {
  max-width: 85%;
  margin-bottom: 16px;
  clear: both;
}

.message.user {
  float: right;
  margin-left: 15%;
}

.message.ai {
  float: left;
  margin-right: 15%;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
}

.user .message-content {
  background-color: #409eff;
  color: white;
  border-radius: 12px 12px 0 12px;
}

.ai .message-content {
  background-color: white;
  color: #303133;
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.chat-input-container {
  padding: 16px;
  background-color: white;
  border-top: 1px solid #ebeef5;
}

.chat-input {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

:deep(.el-textarea__inner) {
  min-height: 40px !important;
  max-height: 100px;
  padding: 8px 12px;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.el-button.el-button--primary) {
  padding: 8px;
  font-size: 18px;
}

/* 自定义滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-track {
  background-color: transparent;
}

.editable-title {
  font-size: 1.5em;
  font-weight: bold;
  border: 1px solid transparent;
  background: transparent;
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  transition: border-color 0.3s;
}

.editable-title:hover, .editable-title:focus {
  border-color: #e0e0e0;
  border-radius: 4px;
}

.editable-title:focus {
  background-color: rgba(25, 118, 210, 0.05);
  border-color: #1976d2;
  border-radius: 4px;
}

.duration-input {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1em;
  color: #666;
}

.duration-field {
  width: 40px;
  padding: 4px 1px;
  border: 1px solid transparent;
  border-radius: 4px;
  text-align: center;
  font-size: 1.1em;
  background: transparent;
  transition: border-color 0.3s;
}

.duration-field:hover, .duration-field:focus {
  border-color: #e0e0e0;
}

.duration-field:focus {
  background-color: rgba(25, 118, 210, 0.05);
  border-color: #1976d2;
}

.add-phase-btn {
  width: 100%;
  padding: 10px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.add-phase-btn:hover {
  background-color: #1565c0;
}

/* 移除之前的通用focus样式 */
input:focus, textarea:focus {
  outline: none;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #43a047;
}

.save-btn:active {
  background-color: #388e3c;
}

/* 调整删除按钮样式 */
:deep(.el-button.el-button--danger) {
  padding: 8px;
  min-height: auto;
}

:deep(.el-button.el-button--danger:hover) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.interaction-tips {
  position: fixed;
  background: white;
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 240px;
  z-index: 1000;
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.tips-header {
  background: #1976d2;
  color: white;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tips-content {
  padding: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  transition: all 0.3s ease;
  border-radius: 6px;
  cursor: pointer;
}

.tip-item:hover {
  background-color: #f5f7fa;
  transform: translateX(4px);
}

.tip-item .el-icon {
  color: #67c23a;
  font-size: 16px;
}

/* 修改动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.interaction-tips {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 添加响应式阴影效果 */
.interaction-tips:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

/* 添加加载动画样式 */
.loading-dots {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  animation: dotAnimation 1.4s infinite;
  letter-spacing: 2px;
  font-weight: bold;
}

@keyframes dotAnimation {
  0% {
    width: 0;
  }
  25% {
    width: 6px;
  }
  50% {
    width: 12px;
  }
  75% {
    width: 18px;
  }
  100% {
    width: 24px;
  }
}

/* 禁用状态样式 */
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
  cursor: not-allowed;
}

:deep(.el-button.is-disabled) {
  opacity: 0.8;
  cursor: not-allowed;
}

/* 更新编辑面板样式 */
.edit-panel {
  position: fixed;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  width: 420px;
  animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #ebeef5;
  backdrop-filter: blur(10px);
}

.edit-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(to right, #f8f9fa, #ffffff);
}

.edit-panel-header span {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
  background: linear-gradient(120deg, #1976d2, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.edit-panel-content {
  padding: 20px;
}

.edit-panel-content :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  background-color: #fafafa;
}

.edit-panel-content :deep(.el-textarea__inner:hover) {
  border-color: #409eff;
  background-color: #ffffff;
}

.edit-panel-content :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  background-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 更新动画效果 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 更新按钮样式 */
.edit-panel-header :deep(.el-button--primary) {
  background: linear-gradient(to right, #1976d2, #2196f3);
  border: none;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.edit-panel-header :deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.edit-panel-header :deep(.el-button--primary:active) {
  transform: translateY(0);
}

/* 添加面板悬停效果 */
.edit-panel:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
  transition: all 0.3s ease;
}

/* 添加hover效果 */
.content-textarea:hover {
  background-color: rgba(25, 118, 210, 0.05);
  cursor: pointer;
}
</style>
