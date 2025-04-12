<template>
  <div class="images-container">
    <multimedia-nav />
    <div class="content-area">
      <h2 class="page-title">教学图片资源</h2>
      
      <div class="filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索图片"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="categoryFilter" placeholder="分类" clearable class="category-select">
          <el-option label="全部" value="" />
          <el-option label="教学素材" value="teaching" />
          <el-option label="学生作品" value="student" />
          <el-option label="课程资源" value="course" />
        </el-select>
      </div>
      
      <div class="image-grid">
        <div 
          v-for="(image, index) in filteredImages" 
          :key="index"
          class="image-card"
          @click="previewImage(image)"
        >
          <div class="image-wrapper">
            <img :src="image.url" :alt="image.title" class="thumbnail" />
          </div>
          <div class="image-info">
            <h3 class="image-title">{{ image.title }}</h3>
            <div class="image-meta">
              <span class="category-tag">{{ image.category }}</span>
              <span class="date">{{ image.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      :title="currentImage.title"
      width="70%"
      center
      destroy-on-close
    >
      <div class="preview-container">
        <img :src="currentImage.url" :alt="currentImage.title" class="preview-image" />
      </div>
      <div class="preview-info">
        <p class="preview-description">{{ currentImage.description }}</p>
        <div class="preview-meta">
          <span>分类: {{ currentImage.category }}</span>
          <span>上传日期: {{ currentImage.date }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import MultimediaNav from './components/MultimediaNav.vue'

export default {
  name: 'ImagesPage',
  components: {
    MultimediaNav
  },
  setup() {
    const searchQuery = ref('')
    const categoryFilter = ref('')
    const previewVisible = ref(false)
    const currentImage = ref({})
    
    // 模拟图片数据
    const images = ref([
      {
        id: 1,
        title: '教学课件配图',
        url: 'https://picsum.photos/id/1/800/600',
        thumbnail: 'https://picsum.photos/id/1/400/300',
        description: '这是一张适合教学课件使用的配图，展示了学习场景。',
        category: '教学素材',
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
    
    // 过滤图片
    const filteredImages = computed(() => {
      return images.value.filter(image => {
        const matchesSearch = image.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            image.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || image.category.includes(categoryFilter.value)
        return matchesSearch && matchesCategory
      })
    })
    
    // 预览图片
    const previewImage = (image) => {
      currentImage.value = image
      previewVisible.value = true
    }
    
    return {
      searchQuery,
      categoryFilter,
      images,
      filteredImages,
      previewVisible,
      currentImage,
      previewImage
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