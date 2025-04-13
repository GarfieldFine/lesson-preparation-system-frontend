<template>
  <div class="teaching-content-container">
    <!-- 左侧教学内容区域 -->
    <div class="content-left" ref="contentRef">
      <MdPreview
        :modelValue="markdownContent"
        class="md-preview"
        previewTheme="default"
        :id="id"
        ref="previewRef"
        @scroll="handleScroll"
      />

      <!-- 移动保存按钮到这里，改为固定定位 -->
      <div class="save-button-container">
        <button class="media-button" @click="generateMedia" :disabled="isGeneratingMedia">
          <i class="el-icon-picture"></i>
          {{ isGeneratingMedia ? '生成中...' : '多媒体资源生成' }}
        </button>
        <button class="save-button" @click="saveContent" :disabled="isSaving">
          <i class="el-icon-upload"></i>
          {{ isSaving ? '保存中...' : '保存内容' }}
        </button>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="content-right">
      <!-- 右上角目录 -->
      <div class="catalog-section">
        <h3 class="section-title">目录</h3>
        <div class="catalog-content" ref="catalogRef">
          <div
            v-for="(item, index) in catalogItems"
            :key="index"
            :class="[
              'catalog-item',
              `level-${item.level}`,
              { active: activeHeader === item.text }
            ]"
            :ref="el => { if (activeHeader === item.text) activeItemRef = el }"
            @click="scrollToHeader(item.text)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>

      <!-- 右下角AI聊天框 -->
      <div class="chat-section">
        <h3 class="section-title">AI 助手</h3>
        <div class="chat-container">
          <div class="chat-messages" ref="chatMessagesRef">
            <div v-for="(msg, index) in chatMessages" :key="index"
                 :class="['message', msg.type]">
              {{ msg.content }}
            </div>
            <div v-if="isLoading || isGenerating" class="message ai loading">
              <div class="loading-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
          <div class="chat-input">
            <input v-model="chatInput"
                   @keyup.enter="sendMessage"
                   :disabled="isLoading || isGenerating"
                   placeholder="输入问题..." />
            <button @click="sendMessage" :disabled="isLoading || isGenerating">
              {{ isLoading ? '发送中...' : '发送' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, h } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { lessonHourPreparationGetTeachingContentByIdService,
  lessonHourPreparationAiReviseTeachingContentService,
  lessonHourPreparationSaveTeachingContentService }
  from '@/api/lessonHourPreparationLesson.js'
import { useRoute,useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const teacherScheduleId = useRoute().params.teacherScheduleId
const id = 'preview-only'
const previewRef = ref(null)
const contentRef = ref(null)

const router = useRouter()
// 初始化为空字符串
let markdownContent = ref('')

const Notification1 = () => {
  ElNotification({
    title: '温馨提示',
    message: h('i', { style: 'color: teal' }, '正在为你生成教学活动安排'),
    duration: 4000
  })
}
const decodeUnicode = (str) => {
  return str.replace(/\\u[\dA-Fa-f]{4}/g, function(match) {
    return String.fromCharCode(parseInt(match.substr(2), 16));
  })
}
// 添加生成状态控制
const isGenerating = ref(false)

// 修改 fetchContent 函数
const fetchContent = async () => {
  //查找数据库
  const res1 = await lessonHourPreparationGetTeachingContentByIdService(teacherScheduleId)
  if(res1.msg !== null){
    markdownContent.value = res1.msg
  }
  //如果没有数据则调用ai生成
  if(!markdownContent.value){
    isGenerating.value = true
    // 添加AI正在生成的消息
    chatMessages.value.push({
      type: 'system',
      content: '正在为你生成教学活动安排...'
    })
    Notification1()

    try {
      const eventSource = new EventSource(
        `http://localhost:8084/LessonHourPreparation/ai/teachingContent/${teacherScheduleId}`
      )

      eventSource.onopen = () => {
        console.log('SSE连接已建立')
      }

      eventSource.onmessage = (event) => {
        const data = event.data
        const obj = JSON.parse(data)
        // 拿到具体的内容
        const content = obj.content
        // Unicode转成中文
        const decodeContent = decodeUnicode(content)

        markdownContent.value += decodeContent

      }

      eventSource.addEventListener('end', function(event) {
        eventSource.close()
        isGenerating.value = false
        ElMessage.success('生成成功')
        // 添加生成完成的消息
        chatMessages.value.push({
          type: 'system',
          content: '教学活动安排已生成完成！'
        })
      })

      eventSource.onerror = (error) => {
        console.error('SSE错误:', error)
        if (error.eventPhase === EventSource.CLOSED) {
          console.log('SSE连接已关闭')
          eventSource.close()
          ElMessage.success('生成成功')
        } else {
          console.log('SSE连接发生错误，正在关闭连接')
          eventSource.close()
          ElMessage.error('连接出错，请重试')
        }
      }

      // 添加超时处理
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          console.log('SSE连接超时，正在关闭')
          eventSource.close()
          ElMessage.warning('连接超时，请重试')
        }
      }, 600000) // 30秒超时

    } catch (error) {
      console.error('发生错误:', error)
      ElMessage.error('生成失败')
      isGenerating.value = false
    }
  }
}

// 在组件挂载时获取内容
onMounted(async () => {
  await fetchContent()
})

// 聊天相关
const chatMessages = ref([
  { type: 'system', content: '你好！我是AI助手，可以帮你优化教学内容，请问有什么需要帮助的吗' }
])
const chatInput = ref('')
const isLoading = ref(false)
const chatMessagesRef = ref(null)

// 添加新的 ref 用于跟踪当前活动的标题
const activeHeader = ref('')

// 添加 refs
const catalogRef = ref(null)
const activeItemRef = ref(null)

// 修改 watch 函数，调整滚动行为
watch(activeHeader, async (newHeader) => {
  if (!newHeader || !catalogRef.value || !activeItemRef.value) return

  await nextTick()

  const container = catalogRef.value
  const activeItem = activeItemRef.value

  // 计算滚动位置
  const containerRect = container.getBoundingClientRect()
  const itemRect = activeItem.getBoundingClientRect()

  // 计算项目相对于容器的位置
  const relativeTop = itemRect.top - containerRect.top
  const relativeBottom = itemRect.bottom - containerRect.top
  const containerHeight = containerRect.height

  // 定义可见区域的边界（保持一定的边距）
  const topMargin = containerHeight * 0.2  // 顶部 20% 的边距
  const bottomMargin = containerHeight * 0.2  // 底部 20% 的边距

  // 只在项目不在理想可见区域时滚动
  if (relativeTop < topMargin) {
    // 如果项目太靠近顶部，滚动使其位于顶部边距位置
    container.scrollTo({
      top: container.scrollTop + (relativeTop - topMargin),
      behavior: 'smooth'
    })
  } else if (relativeBottom > (containerHeight - bottomMargin)) {
    // 如果项目太靠近底部，滚动使其位于底部边距位置
    container.scrollTo({
      top: container.scrollTop + (relativeBottom - containerHeight + bottomMargin),
      behavior: 'smooth'
    })
  }
})

// 添加防抖函数
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// 修改滚动处理函数
const handleScroll = debounce(() => {
  const previewEl = previewRef.value?.$el
  if (!previewEl) return

  const scrollContainer = previewEl.querySelector('.md-editor-preview')
  if (!scrollContainer) return

  const headers = scrollContainer.querySelectorAll('h1, h2, h3, h4, h5, h6')
  if (!headers || headers.length === 0) return

  let closestHeader = null
  let minDistance = Infinity
  const scrollTop = scrollContainer.scrollTop
  const containerHeight = scrollContainer.clientHeight

  headers.forEach(header => {
    // 获取标题相对于滚动容器的位置
    const headerTop = header.offsetTop - scrollContainer.offsetTop
    const distance = Math.abs(headerTop - scrollTop)

    if (distance < minDistance) {
      minDistance = distance
      closestHeader = header
    }
  })

  if (closestHeader) {
    const headerText = closestHeader.textContent.trim()
    activeHeader.value = headerText
  }
}, 100)

onMounted(() => {
  nextTick(() => {
    const previewEl = previewRef.value?.$el
    if (!previewEl) return

    const scrollContainer = previewEl.querySelector('.md-editor-preview')
    if (scrollContainer) {
      // 直接给滚动容器添加事件监听
      scrollContainer.addEventListener('scroll', handleScroll)

      // 初始检查
      handleScroll()

      // 更新清理函数
      cleanup = () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  })
})

// 确保定义了 cleanup 变量
let cleanup = null

onUnmounted(() => {
  if (cleanup) {
    cleanup()
  }
})

// 解析markdown内容生成目录项
const catalogItems = computed(() => {
  const lines = markdownContent.value.split('\n')
  const items = []

  lines.forEach(line => {
    // 匹配标题行
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2]
      items.push({ level, text })
    }
  })

  return items
})

// 修改 scrollToHeader 函数
const scrollToHeader = (headerText) => {
  const headers = contentRef.value?.querySelectorAll('h1, h2, h3, h4, h5, h6')
  if (!headers) return

  for (const header of headers) {
    if (header.textContent.trim() === headerText) {
      header.scrollIntoView({ behavior: 'smooth', block: 'start' })
      activeHeader.value = headerText
      break
    }
  }
}

// 修改发送消息的函数
const sendMessage = async () => {
  if (!chatInput.value.trim() || isLoading.value) return

  const userMessage = chatInput.value.trim()
  chatInput.value = ''

  // 添加用户消息
  chatMessages.value.push({
    type: 'user',
    content: userMessage
  })

  // 立即滚动到底部
  await scrollToBottom()

  // 显示加载状态
  isLoading.value = true

  try {
    // 调用AI接口
    const response = await lessonHourPreparationAiReviseTeachingContentService(markdownContent.value, userMessage)

    markdownContent.value = response.msg

    // 添加AI回复
    chatMessages.value.push({
      type: 'ai',
      content: '已帮您优化教学活动安排相关内容，请问还有什么需要帮助的吗'
    })

    // AI回复后再次滚动到底部
    await scrollToBottom()

  } catch (error) {
    chatMessages.value.push({
      type: 'system',
      content: '抱歉，发生了一些错误，请稍后重试。'
    })
    console.error('Chat error:', error)
    await scrollToBottom()
  } finally {
    isLoading.value = false
  }

}

// 修改滚动函数
const scrollToBottom = async () => {
  await nextTick()
  const chatContainer = chatMessagesRef.value
  if (chatContainer) {
    const scrollHeight = chatContainer.scrollHeight
    const clientHeight = chatContainer.clientHeight
    const maxScroll = scrollHeight - clientHeight

    chatContainer.scrollTop = maxScroll

    // 确保滚动到位
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }, 50)
  }
}

// 添加保存相关的状态
const isSaving = ref(false)

// 添加保存功能
const saveContent = async () => {
  if (isSaving.value) return

  isSaving.value = true
  try {
    await lessonHourPreparationSaveTeachingContentService(
      teacherScheduleId, // 这里使用实际的ID
      markdownContent.value
    )

    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}
// 添加保存和多媒体生成相关的状态
const isGeneratingMedia = ref(false)

// 添加多媒体资源生成功能
const generateMedia = async () => {
  if (isGeneratingMedia.value) return

  isGeneratingMedia.value = true
  try {
    // 这里添加多媒体资源生成的API调用
    // 示例：await generateMediaResourceService(chapterLessonPreparationId, markdownContent.value)
    // 模拟API调用
    // await new Promise(resolve => setTimeout(resolve, 1000))
    router.push("/lesson/lesson_hour/multimedia/ppt")
    ElMessage.success('多媒体资源生成成功')
  } catch (error) {
    console.error('多媒体资源生成失败:', error)
    ElMessage.error('多媒体资源生成失败，请重试')
  } finally {
    isGeneratingMedia.value = false
  }
}
</script>

<style scoped>
.teaching-content-container {
  display: flex;
  height: 100vh;
  padding: 20px;
  gap: 24px;
  background-color: #f8f9fa;
}

.content-left {
  flex: 2;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  padding-left: 10px;
  padding-right: 10px;
  overflow: hidden;
  position: relative;
}

.content-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 320px;
  max-width: 420px;
  height: calc(100vh - 40px); /* 修改高度计算 */
}

.catalog-section, .chat-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.catalog-section {
  flex: 0 0 40%; /* 减小目录的高度比例 */
  margin-bottom: 0; /* 移除底部边距，由 gap 控制间距 */
  display: flex;
  flex-direction: column;
  min-height: 200px; /* 设置最小高度 */
  max-height: 400px; /* 设置最大高度 */
}

.section-title {
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf2f7;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 0 0 auto; /* 标题不参与伸缩 */
}

.catalog-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  scroll-behavior: smooth; /* 添加平滑滚动 */
}

.catalog-content :deep(.md-catalog) {
  margin: 0;
  padding: 0;
  list-style: none;
}

.catalog-content :deep(.md-catalog-link) {
  padding: 6px 12px;
  color: #4a5568;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border-radius: 6px;
  display: block;
  text-decoration: none !important;
  line-height: 1.4;
  margin: 4px 0;
  cursor: pointer;
}

.catalog-content :deep(.md-catalog-link):hover {
  background-color: #edf2f7;
  transform: translateX(4px);
}

.catalog-content :deep(.md-catalog-link.active) {
  color: #3182ce;
  background-color: #ebf8ff;
}

.catalog-content :deep(.md-catalog-link-1) {
  font-weight: 600;
}

.catalog-content :deep(.md-catalog-link-2) {
  padding-left: 24px;
}

.catalog-content :deep(.md-catalog-link-3) {
  padding-left: 36px;
}

/* 自定义滚动条样式 */
.catalog-content::-webkit-scrollbar {
  width: 6px;
}

.catalog-content::-webkit-scrollbar-track {
  background: #f8fafc;
}

.catalog-content::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.catalog-content::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.chat-section {
  flex: 1; /* 让聊天区域占据剩余空间 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 475px; /* 设置最小高度 */
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出 */
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  min-height: 0;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* 添加这行以改善移动端滚动 */
}

.message {
  margin: 12px 0;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 85%;
  font-size: 0.95rem;
  line-height: 1.5;
  position: relative;
  animation: fadeIn 0.3s ease;
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

.message.system {
  background: #e2e8f0;
  color: #4a5568;
  align-self: center;
  max-width: 90%;
  font-size: 0.9rem;
}

.message.user {
  background: #3182ce;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.message.ai {
  background: white;
  border: 1px solid #e2e8f0;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  color: #2d3748;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.chat-input input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.chat-input input:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1);
}

.chat-input button {
  padding: 10px 20px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.chat-input button:hover {
  background: #2c5282;
  transform: translateY(-1px);
}

.chat-input button:active {
  transform: translateY(1px);
}

.md-preview {
  height: 100%;
  overflow-y: auto;
  font-size: 1rem;
  line-height: 1.6;
  scroll-behavior: smooth;
}

/* 自定义滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f8fafc;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.loading-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.loading-dots .dot {
  width: 8px;
  height: 8px;
  background: #3182ce;
  border-radius: 50%;
  opacity: 0.6;
  animation: dot-pulse 1.4s infinite ease-in-out both;
}

.loading-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.message.loading {
  background: #f7fafc;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.chat-input input:disabled,
.chat-input button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.catalog-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  color: #4a5568;
  font-size: 0.95rem;
}

.catalog-item:hover {
  background-color: #edf2f7;
  transform: translateX(4px);
}

.catalog-item.level-1 {
  font-weight: 600;
  color: #2d3748;
}

.catalog-item.level-2 {
  padding-left: 24px;
}

.catalog-item.level-3 {
  padding-left: 36px;
  font-size: 0.9rem;
}

.catalog-item.level-4,
.catalog-item.level-5,
.catalog-item.level-6 {
  padding-left: 48px;
  font-size: 0.9rem;
  color: #718096;
}

.catalog-item.active {
  color: #3182ce;
  background-color: #ebf8ff;
  font-weight: 600;
}

/* 确保滚动容器有正确的样式 */
.content-left :deep(.md-editor-preview) {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.save-button-container {
  position: absolute;
  top: 36px;
  right: 46px;
  z-index: 100;
  display: flex;
  gap: 12px;
}

.media-button,
.save-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


.save-button:hover {
  background: #2c5282;
  transform: translateY(-1px);
}

.media-button:active,
.save-button:active {
  transform: translateY(1px);
}

.media-button:disabled,
.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #64748b;
}

.media-button {
  background: #38a169; /* 使用绿色区分多媒体按钮 */
}

.save-button i {
  font-size: 1.1em;
}
</style>
