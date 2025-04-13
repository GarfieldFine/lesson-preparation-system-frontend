<template>
  <div class="videos-container">
    <multimedia-nav />
    <div class="content-area">
      <h2 class="page-title">推荐教学视频</h2>
      
      <div class="filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索视频"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="categoryFilter" placeholder="分类" clearable class="category-select">
          <el-option label="全部" value="" />
          <el-option label="教学示范" value="demonstration" />
          <el-option label="课程讲解" value="lecture" />
          <el-option label="实验演示" value="experiment" />
        </el-select>
      </div>
      
      <div class="video-grid">
        <div 
          v-for="(video, index) in filteredVideos" 
          :key="index"
          class="video-card"
          @click="playVideo(video)"
        >
          <div class="video-thumbnail">
            <img :src="video.thumbnail" :alt="video.title" class="thumbnail-img" />
            <div class="play-overlay">
              <el-icon class="play-icon"><VideoPlay /></el-icon>
            </div>
            <span class="duration">{{ video.duration }}</span>
          </div>
          <div class="video-info">
            <h3 class="video-title">{{ video.title }}</h3>
            <p class="video-description">{{ video.description }}</p>
            <div class="video-meta">
              <span class="category-tag">{{ video.category }}</span>
              <span class="views">{{ video.views }} 次观看</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 视频播放对话框 -->
    <el-dialog
      v-model="playerVisible"
      :title="currentVideo.title"
      width="80%"
      destroy-on-close
      class="video-player-dialog"
    >
      <div class="video-player">
        <div class="player-container">
          <!-- 实际项目中可以集成视频播放器组件 -->
          <iframe 
            :src="currentVideo.embedUrl" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="embed-player"
          ></iframe>
        </div>
        <div class="video-details">
          <h3>{{ currentVideo.title }}</h3>
          <div class="meta-row">
            <span class="views">{{ currentVideo.views }} 次观看</span>
            <span class="upload-date">上传于 {{ currentVideo.uploadDate }}</span>
          </div>
          <p class="full-description">{{ currentVideo.fullDescription }}</p>
          
          <div class="tags-container">
            <span class="tag" v-for="(tag, index) in currentVideo.tags" :key="index">
              {{ tag }}
            </span>
          </div>
          
          <div class="related-videos" v-if="relatedVideos.length > 0">
            <h4>相关视频</h4>
            <div class="related-list">
              <div 
                v-for="(video, index) in relatedVideos" 
                :key="index"
                class="related-video-item"
                @click="playVideo(video)"
              >
                <div class="related-thumbnail">
                  <img :src="video.thumbnail" :alt="video.title" />
                  <span class="duration">{{ video.duration }}</span>
                </div>
                <div class="related-info">
                  <h5>{{ video.title }}</h5>
                  <span class="views">{{ video.views }} 次观看</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import MultimediaNav from './components/MultimediaNav.vue'

export default {
  name: 'VideosPage',
  components: {
    MultimediaNav
  },
  setup() {
    const searchQuery = ref('')
    const categoryFilter = ref('')
    const playerVisible = ref(false)
    const currentVideo = ref({})
    
    // 模拟视频数据
    const videos = ref([
      {
        id: 1,
        title: '高效课堂教学技巧',
        description: '本视频介绍了提高课堂教学效率的实用技巧和方法。',
        fullDescription: '本视频详细介绍了提高课堂教学效率的实用技巧和方法，包括课堂组织、互动设计、提问技巧等多个方面。适合各学科教师观看学习，帮助改进教学方法，提升教学质量。',
        thumbnail: 'https://picsum.photos/id/111/400/225',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '15:24',
        category: '教学示范',
        views: 1245,
        uploadDate: '2023-05-15',
        tags: ['教学技巧', '课堂管理', '教师发展']
      },
      {
        id: 2,
        title: '数学概念可视化教学',
        description: '通过可视化方式讲解抽象数学概念，帮助学生理解。',
        fullDescription: '本视频通过生动的可视化方式讲解抽象数学概念，将复杂的数学理论转化为直观的图像和动画，帮助学生更好地理解和掌握知识点。视频中包含多个实例和应用场景，适合数学教师和学生观看。',
        thumbnail: 'https://picsum.photos/id/112/400/225',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '23:10',
        category: '课程讲解',
        views: 2367,
        uploadDate: '2023-06-22',
        tags: ['数学教学', '可视化', '概念讲解']
      },
      {
        id: 3,
        title: '物理实验：电磁感应现象',
        description: '详细演示电磁感应实验的操作步骤和注意事项。',
        fullDescription: '本视频详细演示了电磁感应实验的完整操作步骤、实验现象和注意事项。视频中包含多个经典电磁感应实验的演示，并对实验原理进行了深入浅出的讲解，帮助学生理解电磁感应的物理本质。适合物理教师课前准备和学生预习复习使用。',
        thumbnail: 'https://picsum.photos/id/113/400/225',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '18:45',
        category: '实验演示',
        views: 1876,
        uploadDate: '2023-04-10',
        tags: ['物理实验', '电磁感应', '实验教学']
      },
      {
        id: 4,
        title: '有效的小组合作学习策略',
        description: '介绍如何组织和引导学生进行高效的小组合作学习。',
        fullDescription: '本视频全面介绍了如何组织和引导学生进行高效的小组合作学习，包括小组分配、角色设定、任务设计、过程管理和评价方式等多个环节。视频中结合了多个成功案例，展示了不同学科和年级段的小组合作学习实践，为教师提供了可操作的指导和建议。',
        thumbnail: 'https://picsum.photos/id/114/400/225',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '20:36',
        category: '教学示范',
        views: 3421,
        uploadDate: '2023-07-05',
        tags: ['合作学习', '小组活动', '课堂组织']
      },
      {
        id: 5,
        title: '化学实验：酸碱中和反应',
        description: '演示酸碱中和反应的实验过程和现象观察。',
        fullDescription: '本视频详细演示了酸碱中和反应的完整实验过程、现象观察和数据记录。视频中包含多个经典中和反应实验，展示了不同指示剂的颜色变化，pH值的测量方法，以及滴定曲线的绘制过程。同时对实验原理和注意事项进行了详细讲解，适合化学教师和学生使用。',
        thumbnail: 'https://picsum.photos/id/115/400/225',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '16:58',
        category: '实验演示',
        views: 1532,
        uploadDate: '2023-08-18',
        tags: ['化学实验', '酸碱中和', '实验教学']
      },
      {
        id: 6,
        title: '语文阅读教学策略',
        description: '分享提高学生阅读理解能力的有效教学策略。',
        fullDescription: '本视频分享了提高学生阅读理解能力的多种有效教学策略，包括阅读前预测、阅读中标注、阅读后总结等方法。视频结合了不同类型文本的教学案例，展示了如何引导学生进行深度阅读和批判性思考，培养学生的阅读兴趣和能力。适合语文教师和阅读教学研究者观看。',
        thumbnail: 'https://picsum.photos/id/116/400/225',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '25:12',
        category: '课程讲解',
        views: 2845,
        uploadDate: '2023-09-30',
        tags: ['语文教学', '阅读理解', '教学策略']
      }
    ])
    
    // 过滤视频
    const filteredVideos = computed(() => {
      return videos.value.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            video.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || video.category.includes(categoryFilter.value)
        return matchesSearch && matchesCategory
      })
    })
    
    // 相关视频
    const relatedVideos = computed(() => {
      if (!currentVideo.value.id) return []
      
      return videos.value
        .filter(video => video.id !== currentVideo.value.id && video.category === currentVideo.value.category)
        .slice(0, 3)
    })
    
    // 播放视频
    const playVideo = (video) => {
      currentVideo.value = video
      playerVisible.value = true
    }
    
    return {
      searchQuery,
      categoryFilter,
      videos,
      filteredVideos,
      playerVisible,
      currentVideo,
      relatedVideos,
      playVideo
    }
  }
}
</script>

<style lang="scss" scoped>
.videos-container {
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

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.video-card {
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

.video-thumbnail {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.video-card:hover .thumbnail-img {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 48px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  padding: 16px;
}

.video-title {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.video-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.category-tag {
  background-color: #f0f9ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
}

.video-player-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.video-player {
  display: flex;
  flex-direction: column;
}

.player-container {
  width: 100%;
  background-color: #000;
  aspect-ratio: 16/9;
}

.embed-player {
  width: 100%;
  height: 100%;
}

.video-details {
  padding: 20px;
}

.meta-row {
  display: flex;
  gap: 16px;
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
}

.full-description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.tag {
  background-color: #f5f7fa;
  color: #606266;
