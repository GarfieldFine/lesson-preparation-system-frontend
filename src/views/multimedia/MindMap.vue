<template>
  <div class="mindmap-container">
    <multimedia-nav />
    <div class="main-layout">
      <!-- 左侧思维导图库导航 -->
      <div class="left-panel">
        <h2 class="panel-title">思维导图库</h2>
        <el-input
          v-model="searchQuery"
          placeholder="搜索思维导图"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-tree
          :data="mindmapCategories"
          :props="defaultProps"
          @node-click="handleNodeClick"
          class="category-tree"
        />
        <div class="mindmap-list">
          <div
            v-for="(mindmap, index) in filteredMindmaps"
            :key="index"
            class="mindmap-item"
            @click="selectMindmap(mindmap)"
          >
            <div class="mindmap-preview">
              <img :src="mindmap.thumbnail" :alt="mindmap.title" class="thumbnail" />
            </div>
            <div class="mindmap-info">
              <h3 class="mindmap-title">{{ mindmap.title }}</h3>
              <div class="mindmap-meta">
                <span class="category-tag">{{ mindmap.category }}</span>
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
                <button class="action-btn" title="插入思维导图">
                  <i class="fas fa-project-diagram"></i>
                </button>
              </div>
            </div>
            <button class="send-btn">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="right-panel">
        <h2 class="panel-title">预览区域</h2>
        <div class="preview-container" v-if="currentMindmap.url">
          <div class="mindmap-canvas">
            <img :src="currentMindmap.fullImage" :alt="currentMindmap.title" class="full-mindmap" />
          </div>
          <div class="preview-info">
            <h4>{{ currentMindmap.title }}</h4>
            <p>{{ currentMindmap.description }}</p>
            <div class="preview-meta">
              <span>分类: {{ currentMindmap.category }}</span>
              <span>创建者: {{ currentMindmap.creator }}</span>
              <span>日期: {{ currentMindmap.date }}</span>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无预览内容" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import MultimediaNav from './components/MultimediaNav.vue'

export default {
  name: 'MindMapPage',
  components: {
    MultimediaNav
  },
  setup() {
    const searchQuery = ref('')
    const categoryFilter = ref('')
    const viewerVisible = ref(false)
    const currentMindmap = ref({})

    // 模拟思维导图数据
    const mindmaps = ref([
      {
        id: 1,
        title: '课程整体规划思维导图',
        thumbnail: 'https://picsum.photos/id/101/400/300',
        fullImage: 'https://picsum.photos/id/101/1200/800',
        description: '本思维导图展示了课程的整体规划结构，包括各个章节的关系和知识点分布。',
        category: '课程规划',
        creator: '张老师',
        date: '2023-04-15'
      },
      {
        id: 2,
        title: '第三章知识点关联',
        thumbnail: 'https://picsum.photos/id/102/400/300',
        fullImage: 'https://picsum.photos/id/102/1200/800',
        description: '详细展示了第三章各个知识点之间的关联和层次结构，帮助学生理解知识体系。',
        category: '知识点',
        creator: '李老师',
        date: '2023-05-22'
      },
      {
        id: 3,
        title: '项目教学流程图',
        thumbnail: 'https://picsum.photos/id/103/400/300',
        fullImage: 'https://picsum.photos/id/103/1200/800',
        description: '项目式教学的完整流程思维导图，包括项目准备、实施和评估各个环节。',
        category: '教学流程',
        creator: '王老师',
        date: '2023-06-10'
      },
      {
        id: 4,
        title: '核心概念关系图',
        thumbnail: 'https://picsum.photos/id/104/400/300',
        fullImage: 'https://picsum.photos/id/104/1200/800',
        description: '课程核心概念之间的关系图，展示了各个概念的联系和层次结构。',
        category: '知识点',
        creator: '赵老师',
        date: '2023-07-05'
      },
      {
        id: 5,
        title: '学期教学计划',
        thumbnail: 'https://picsum.photos/id/105/400/300',
        fullImage: 'https://picsum.photos/id/105/1200/800',
        description: '整个学期的教学计划思维导图，包括各个阶段的教学目标和内容安排。',
        category: '课程规划',
        creator: '刘老师',
        date: '2023-08-18'
      },
      {
        id: 6,
        title: '实验教学流程',
        thumbnail: 'https://picsum.photos/id/106/400/300',
        fullImage: 'https://picsum.photos/id/106/1200/800',
        description: '实验教学的完整流程思维导图，包括实验准备、实施和总结各个环节。',
        category: '教学流程',
        creator: '孙老师',
        date: '2023-09-30'
      }
    ])

    // 过滤思维导图
    const filteredMindmaps = computed(() => {
      return mindmaps.value.filter(mindmap => {
        const matchesSearch = mindmap.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            mindmap.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || mindmap.category.includes(categoryFilter.value)
        return matchesSearch && matchesCategory
      })
    })

    // 查看思维导图
    const viewMindmap = (mindmap) => {
      currentMindmap.value = mindmap
      viewerVisible.value = true
    }

    return {
      searchQuery,
      categoryFilter,
      mindmaps,
      filteredMindmaps,
      viewerVisible,
      currentMindmap,
      viewMindmap
    }
  }
}
</script>

<style lang="scss" scoped>
.mindmap-container {
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

.mindmap-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.mindmap-item {
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

.mindmap-preview {
  width: 100%;
  height: 160px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.mindmap-info {
  padding: 12px;
  background: white;
}

.mindmap-title {
  font-size: 14px;
  margin: 0 0 8px;
  color: #1e293b;
}

.mindmap-meta {
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

.mindmap-canvas {
  width: 100%;
  margin-bottom: 16px;
  
  img {
    width: 100%;
    border-radius: 8px;
  }
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
</style>