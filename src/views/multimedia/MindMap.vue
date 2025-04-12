<template>
  <div class="mindmap-container">
    <multimedia-nav />
    <div class="content-area">
      <h2 class="page-title">教学思维导图</h2>
      
      <div class="filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索思维导图"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="categoryFilter" placeholder="分类" clearable class="category-select">
          <el-option label="全部" value="" />
          <el-option label="课程规划" value="planning" />
          <el-option label="知识点" value="knowledge" />
          <el-option label="教学流程" value="process" />
        </el-select>
      </div>
      
      <div class="mindmap-grid">
        <div 
          v-for="(mindmap, index) in filteredMindmaps" 
          :key="index"
          class="mindmap-card"
          @click="viewMindmap(mindmap)"
        >
          <div class="mindmap-preview">
            <img :src="mindmap.thumbnail" :alt="mindmap.title" class="thumbnail" />
          </div>
          <div class="mindmap-info">
            <h3 class="mindmap-title">{{ mindmap.title }}</h3>
            <div class="mindmap-meta">
              <span class="category-tag">{{ mindmap.category }}</span>
              <span class="date">{{ mindmap.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 思维导图查看对话框 -->
    <el-dialog
      v-model="viewerVisible"
      :title="currentMindmap.title"
      width="80%"
      fullscreen
      destroy-on-close
    >
      <div class="mindmap-viewer">
        <div class="mindmap-canvas">
          <!-- 这里是简化的思维导图展示，实际项目中可以集成专业的思维导图库 -->
          <img :src="currentMindmap.fullImage" :alt="currentMindmap.title" class="full-mindmap" />
        </div>
        <div class="mindmap-details">
          <h3>{{ currentMindmap.title }}</h3>
          <p class="description">{{ currentMindmap.description }}</p>
          <div class="meta-info">
            <div class="meta-item">
              <span class="label">创建者:</span>
              <span>{{ currentMindmap.creator }}</span>
            </div>
            <div class="meta-item">
              <span class="label">创建日期:</span>
              <span>{{ currentMindmap.date }}</span>
            </div>
            <div class="meta-item">
              <span class="label">分类:</span>
              <span>{{ currentMindmap.category }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
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

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.page-title {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 20px;
  font-weight: 500;
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

.mindmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.mindmap-card {
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

.mindmap-preview {
  height: 200px;
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

.mindmap-info {
  padding: 16px;
}

.mindmap-title {
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mindmap-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
}

.category-tag {
  background-color: #f0f9ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
}

.mindmap-viewer {
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.mindmap-canvas {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  padding: 20px;
  overflow: auto;
}

.full-mindmap {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.mindmap-details {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
}

.description {
  margin-bottom: 16px;
  color: #606266;
  line-height: 1.6;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  gap: 8px;
}

.label {
  font-weight: 500;
  color: #333;
}
</style>