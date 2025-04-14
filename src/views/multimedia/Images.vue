<template>
  <div class="images-container">
    <multimedia-nav />
    <div class="main-layout">
      <!-- 左侧图库导航 -->
      <div class="left-panel">
        <h2 class="panel-title">图片库</h2>
<!--        <el-input-->
<!--          v-model="searchQuery"-->
<!--          placeholder="搜索图片"-->
<!--          prefix-icon="Search"-->
<!--          clearable-->
<!--          class="search-input"-->
<!--        />-->
        <el-tree
          :data="imageCategories"
          :props="defaultProps"
          @node-click="handleNodeClick"
          class="category-tree"
        />
        <div class="image-list">
          <div
            v-for="(image, index) in filteredImages"
            :key="index"
            class="image-item"
            @click="selectImage(image)"
          >
            <div class="image-wrapper">
              <img :src="image.url" :alt="image.title" class="thumbnail" />
            </div>
            <div class="image-info">
              <h3 class="image-title">{{ image.title }}</h3>
              <div class="image-meta">
                <span class="category-tag">{{ image.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间AI对话区域 -->
      <div class="chat-section">
        <div class="chat-container">
          <div class="chat-messages" ref="messagesContainer">
            <div class="message-date">今天</div>
            <div v-for="(message, idx) in chatMessages" :key="idx"
                 :class="['message', message.type]">
              <div class="message-avatar">
                <i v-if="message.type === 'ai'" class="fas fa-robot"></i>
                <img v-else src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="用户头像">
              </div>
              <div class="message-content">
                <div class="message-text" v-html="message.content"></div>
                <div v-if="message.type === 'ai'" class="message-actions">
                  <button class="action-btn">
                    <i class="fas fa-copy"></i> 复制
                  </button>
                  <button class="action-btn">
                    <i class="fas fa-thumbs-up"></i> 有帮助
                  </button>
                </div>
              </div>
            </div>

            <div v-if="isTyping" class="message ai">
              <div class="message-avatar">
                <i class="fas fa-robot"></i>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <div class="input-container">
              <textarea
                v-model="aiPrompt"
                placeholder="输入您的问题..."
                @keyup.enter.exact="sendAIPrompt"
                @keyup.enter.shift.exact="aiPrompt += '\n'"
                rows="1"
                ref="promptInput"
              ></textarea>
              <div class="input-actions">
                <button class="action-btn" title="上传文件">
                  <i class="fas fa-paperclip"></i>
                </button>
                <button class="action-btn" title="插入图片">
                  <i class="fas fa-image"></i>
                </button>
              </div>
            </div>
            <button class="send-btn" @click="sendAIPrompt" :disabled="!aiPrompt.trim()">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="right-panel">
        <h2 class="panel-title">预览区域</h2>
        <div class="preview-container" v-if="currentImage.url">
          <img :src="currentImage.url" :alt="currentImage.title" class="preview-image" />
        </div>
        <el-empty v-else description="暂无预览内容" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import MultimediaNav from './components/MultimediaNav.vue'

export default {
  name: 'ImagesPage',
  components: {
    MultimediaNav
  },
  setup() {
    const searchQuery = ref('')
    const categoryFilter = ref('')
    const currentImage = ref({})
    const aiPrompt = ref('')
    const isTyping = ref(false)
    const messagesContainer = ref(null)
    const promptInput = ref(null)

    // 图片分类数据
    const imageCategories = ref([
      {
        label: '我的图片'
      },
      {
        label: '知识点',
        children: [
          { label: '线性表的基本概念' },
          { label: '单链表' },
          { label: '双向链表' },
          { label: '循环链表' },
          { label: '头插法' },
          { label: '尾插法' },
          { label: '删除节点' },
          { label: '遍历链表' },
        ]
      }
    ])

    const defaultProps = {
      children: 'children',
      label: 'label'
    }

    //todo 模拟图片数据
    const images = ref([
      {
        id: 1,
        title: '教学课件配图',
        url: 'https://picsum.photos/id/1/800/600',
        thumbnail: 'https://picsum.photos/id/1/400/300',
        description: '这是一张适合教学课件使用的配图，展示了学习场景。',
        // 筛选字段
        category: '单链表',
        date: '2023-05-15'
      },
      {
        id: 2,
        title: '学生项目展示',
        url: 'https://picsum.photos/id/20/800/600',
        thumbnail: 'https://picsum.photos/id/20/400/300',
        description: '学生完成的项目作品展示，体现了创新思维和实践能力。',
        category: '学生作品',
        date: '2023-06-22'
      },
      {
        id: 3,
        title: '课程概念图',
        url: 'https://picsum.photos/id/36/800/600',
        thumbnail: 'https://picsum.photos/id/36/400/300',
        description: '课程核心概念的可视化图表，帮助学生理解复杂概念。',
        category: '课程资源',
        date: '2023-04-10'
      },
      {
        id: 4,
        title: '实验室设备',
        url: 'https://picsum.photos/id/42/800/600',
        thumbnail: 'https://picsum.photos/id/42/400/300',
        description: '实验室设备的高清图片，用于教学演示和设备介绍。',
        category: '教学素材',
        date: '2023-07-05'
      },
      {
        id: 5,
        title: '学生小组讨论',
        url: 'https://picsum.photos/id/64/800/600',
        thumbnail: 'https://picsum.photos/id/64/400/300',
        description: '学生小组讨论场景，展示了协作学习的过程。',
        category: '教学素材',
        date: '2023-08-18'
      },
      {
        id: 6,
        title: '期末项目作品',
        url: 'https://picsum.photos/id/65/800/600',
        thumbnail: 'https://picsum.photos/id/65/400/300',
        description: '学生期末项目的优秀作品展示。',
        category: '学生作品',
        date: '2023-06-30'
      },
      {
        id: 7,
        title: '教学流程图',
        url: 'https://picsum.photos/id/76/800/600',
        thumbnail: 'https://picsum.photos/id/76/400/300',
        description: '课程教学流程的图形化表示，帮助理解教学过程。',
        category: '课程资源',
        date: '2023-03-25'
      },
      {
        id: 8,
        title: '实践活动照片',
        url: 'https://picsum.photos/id/91/800/600',
        thumbnail: 'https://picsum.photos/id/91/400/300',
        description: '学生参与实践活动的照片记录，展示了动手能力的培养过程。',
        category: '教学素材',
        date: '2023-09-12'
      }
    ])

    // AI对话消息
    const chatMessages = ref([
      {
        type: 'ai',
        content: '你好！我是你的AI教学助手。我可以帮你：<br>1. 分析和处理教学图片<br>2. 生成教学相关图片<br>3. 提供图片使用建议<br>4. 回答图片相关问题'
      }
    ])

    // 过滤图片
    const filteredImages = computed(() => {
      return images.value.filter(image => {
        const matchesSearch = image.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            image.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || image.category.includes(categoryFilter.value)
        return matchesSearch && matchesCategory
      })
    })

    // 选择图片
    const selectImage = (image) => {
      currentImage.value = image
    }

    // 处理分类树点击
    const handleNodeClick = (data) => {
      categoryFilter.value = data.label
    }

    // 发送AI提示
    const sendAIPrompt = async () => {
      if (!aiPrompt.value.trim()) return

      // 添加用户消息
      chatMessages.value.push({
        type: 'user',
        content: aiPrompt.value.replace(/\n/g, '<br>')
      })

      // 清空输入框
      aiPrompt.value = ''

      // 自动调整输入框高度
      adjustTextareaHeight()

      // 滚动到底部
      await scrollToBottom()

      // 显示AI正在输入状态
      isTyping.value = true
      await scrollToBottom()

      // 模拟AI响应延迟
      setTimeout(async () => {
        isTyping.value = false

        //todo  添加AI响应（增加逻辑）-->提交过代码，可以去找
        chatMessages.value.push({
          type: 'ai',
          content: '我理解你的问题，让我思考一下...'
        })

        await scrollToBottom()
      }, 1500)
    }

    const scrollToBottom = async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const adjustTextareaHeight = () => {
      if (promptInput.value) {
        promptInput.value.style.height = 'auto'
        promptInput.value.style.height = promptInput.value.scrollHeight + 'px'
      }
    }

    watch(() => aiPrompt.value, () => {
      adjustTextareaHeight()
    })

    onMounted(() => {
      scrollToBottom()
    })

    return {
      searchQuery,
      categoryFilter,
      images,
      filteredImages,
      currentImage,
      selectImage,
      imageCategories,
      defaultProps,
      handleNodeClick,
      // AI对话相关
      aiPrompt,
      isTyping,
      chatMessages,
      messagesContainer,
      promptInput,
      sendAIPrompt
    }
  }
}
</script>

<style lang="scss" scoped>
.images-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-layout {
  display: flex;
  flex: 1;
  gap: 24px;
  padding: 20px;
  overflow: hidden;
}

.left-panel {
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-title {
  font-size: 18px;
  font-weight: 500;
  color: #1e293b;
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #e2e8f0;
}

.search-input {
  margin: 16px;
}

.category-tree {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.image-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.image-item {
  margin-bottom: 16px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.image-wrapper {
  width: 100%;
  height: 160px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.image-info {
  padding: 12px;
  background: white;
}

.image-title {
  font-size: 14px;
  margin: 0 0 8px;
  color: #1e293b;
}

.image-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-tag {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.chat-section {
  flex: 1;
  min-width: 400px;
  max-width: 600px;
}

.chat-container {
  height: calc(100vh - 100px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.message-date {
  text-align: center;
  margin: 16px 0;
  color: #64748b;
  font-size: 14px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.message.ai {
  flex-direction: row;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0284c7;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message.ai .message-content {
  background: #f8fafc;
  color: #1e293b;
}

.message.user .message-content {
  background: #0284c7;
  color: white;
}

.message-text {
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  border-radius: 4px;

  &:hover {
    background: #e2e8f0;
    color: #0284c7;
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.input-container {
  flex: 1;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: flex-end;
}

textarea {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  max-height: 120px;
  font-size: 14px;
  line-height: 1.5;
  padding: 4px 0;
}

.input-actions {
  display: flex;
  gap: 8px;
  padding-left: 8px;
  border-left: 1px solid #e2e8f0;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #0284c7;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #0369a1;
  }

  &:disabled {
    background: #e2e8f0;
    cursor: not-allowed;
  }
}

.right-panel {
  width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.preview-image {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 16px;
}

.preview-info {
  h4 {
    font-size: 16px;
    margin: 0 0 8px;
    color: #1e293b;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 16px;
    line-height: 1.5;
  }
}

.preview-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-input {
  width: 300px;
}

.category-select {
  width: 150px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.image-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  background-color: #fff;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
}

.image-wrapper {
  height: 180px;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.image-info {
  padding: 12px;
}

.image-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
}

.category-tag {
  background-color: #f0f9ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
}

.preview-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-info {
  padding: 0 20px;
}

.preview-description {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  color: #606266;
  font-size: 14px;
}
</style>
