<template>
  <div class="videos-container">


    <!-- 视频播放弹窗 -->
    <el-dialog
      v-model="playerVisible"
      :title="currentVideo.title"
      width="80%"
      destroy-on-close
    >
<!--      todo src是视频-->
      <div class="video-player-container">
        <video-player
          class="vjs-custom-skin"
          ref="videoPlayer"
          :options="playerOptions"
          :volume="0.6"
          src="https://iflytek-education.oss-cn-beijing.aliyuncs.com/user/2024/06/10/e0be2dbf4f2a44d38c24b6b4efd054f3.mp4"
        />
      </div>
    </el-dialog>



    <multimedia-nav />
    <div class="main-layout">
      <!-- 左侧视频库导航 -->
      <div class="left-panel">
        <h2 class="panel-title">视频库</h2>
<!--        <el-input-->
<!--          v-model="searchQuery"-->
<!--          placeholder="搜索视频"-->
<!--          prefix-icon="Search"-->
<!--          clearable-->
<!--          class="search-input"-->
<!--        />-->
        <el-tree
          :data="videoCategories"
          :props="defaultProps"
          @node-click="handleNodeClick"
          class="category-tree"
        />
        <div class="video-list">
          <div
            v-for="(video, index) in filteredVideos"
            :key="index"
            class="video-item"
            @click="selectVideo(video)"
          >
            <div class="video-wrapper">
              <img :src="video.thumbnail" :alt="video.title" class="thumbnail" />
              <div class="play-overlay">
                <el-icon class="play-icon"><VideoPlay /></el-icon>
              </div>
              <span class="duration">{{ video.duration }}</span>
            </div>
            <div class="video-info">
              <h3 class="video-title">{{ video.title }}</h3>
              <div class="video-meta">
                <span class="category-tag">{{ video.category }}</span>
                <span class="views">{{ video.views }} 次观看</span>
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
                <button class="action-btn" title="插入视频">
                  <i class="fas fa-video"></i>
                </button>
              </div>
            </div>
<!--            点击事件-->
            <button class="send-btn" @click="sendAIPrompt" >
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="right-panel">
        <h2 class="panel-title">预览区域</h2>
        <div class="preview-container" v-if="currentVideo.url">
          <div class="video-player">
            <iframe
              :src="currentVideo.embedUrl"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="embed-player"
            ></iframe>
          </div>
          <div class="preview-info">
            <h4>{{ currentVideo.title }}</h4>
            <p>{{ currentVideo.fullDescription }}</p>
            <div class="preview-meta">
              <span>分类: {{ currentVideo.category }}</span>
              <span>观看次数: {{ currentVideo.views }}</span>
              <span>上传时间: {{ currentVideo.uploadDate }}</span>
            </div>
            <div class="tags-container">
              <span class="tag" v-for="(tag, index) in currentVideo.tags" :key="index">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无预览内容" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import MultimediaNav from './components/MultimediaNav.vue'
import { VideoPlayer } from 'vue-video-player'
import 'video.js/dist/video-js.css'

export default {
  name: 'VideosPage',
  components: {
    MultimediaNav,
    VideoPlay,
    VideoPlayer
  },
  setup() {
    const searchQuery = ref('')
    const categoryFilter = ref('')
    const playerVisible = ref(false)
    const currentVideo = ref({})
    const videoPlayer = ref(null)

    // 播放器配置
    let playerOptions = ref({
      // height: 200,
      // width: document.documentElement.clientWidth, //播放器宽度
      playbackRates: [0.7, 1.0, 1.5, 2.0], // 播放速度
      autoplay: 'any', // 如果true,浏览器准备好时开始回放。
      muted: true, // 默认情况下将会消除任何音频。
      loop: true, // 导致视频一结束就重新开始。
      preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
      language: 'zh-CN',
      aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
      fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
      notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
      controls: true,
      controlBar: {
        timeDivider: true,
        durationDisplay: true,
        remainingTimeDisplay: false,
        fullscreenToggle: true // 全屏按钮
      }
    })

    // 监听当前视频变化
    watch(() => currentVideo.value, (newVideo) => {
      if (newVideo && newVideo.url) {
        playerOptions.value.sources[0].src = newVideo.url
      }
    })

    // 播放器准备就绪
    const onPlayerReady = () => {
      console.log('播放器准备就绪')
    }

    // 关闭播放器
    const handleClosePlayer = () => {
      if (videoPlayer.value) {
        videoPlayer.value.pause()
      }
      playerVisible.value = false
    }
    const aiPrompt = ref('')
    const isTyping = ref(false)
    const chatMessages = ref([])
    const messagesContainer = ref(null)

    // 视频分类数据
    const videoCategories = ref([
      {
        label: '全部视频',
        children: [
          {
            label: '教学示范',
            children: [
              { label: '课堂管理' },
              { label: '教学技巧' },
              { label: '示范课' }
            ]
          },
          {
            label: '课程讲解',
            children: [
              { label: '数学' },
              { label: '物理' },
              { label: '化学' },
              { label: '生物' }
            ]
          },
          {
            label: '实验演示',
            children: [
              { label: '物理实验' },
              { label: '化学实验' },
              { label: '生物实验' }
            ]
          }
        ]
      }
    ])

    const defaultProps = {
      children: 'children',
      label: 'label'
    }

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
      }
    ])

    // 根据搜索和分类过滤视频
    const filteredVideos = computed(() => {
      return videos.value.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            video.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || video.category === categoryFilter.value
        return matchesSearch && matchesCategory
      })
    })

    // 选择视频
    const selectVideo = (video) => {
      currentVideo.value = video
      playerVisible.value = true
    }

    // 处理分类树节点点击
    const handleNodeClick = (data) => {
      if (!data.children) {
        categoryFilter.value = data.label
      }
    }

    // 发送AI提示
    const sendAIPrompt = async () => {
      if (!aiPrompt.value.trim()) return

      const userMessage = {
        type: 'user',
        content: aiPrompt.value
      }
      chatMessages.value.push(userMessage)

      // 清空输入并滚动到底部
      aiPrompt.value = ''
      await nextTick()
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight

      // 模拟AI回复
      isTyping.value = true
      setTimeout(() => {
        const aiMessage = {
          type: 'ai',
          content: '我理解您的问题。这个视频确实展示了一些很好的教学技巧。建议您特别关注视频中关于课堂互动设计的部分，这对提高学生参与度很有帮助。您还可以结合自己的教学实践，思考如何将这些方法应用到具体课程中。'
        }
        chatMessages.value.push(aiMessage)
        isTyping.value = false

        // 滚动到底部
        nextTick(() => {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        })
      }, 2000)
    }

    return {
      searchQuery,
      categoryFilter,
      videoCategories,
      defaultProps,
      videos,
      filteredVideos,
      playerVisible,
      currentVideo,
      handleNodeClick,
      selectVideo,
      aiPrompt,
      isTyping,
      chatMessages,
      messagesContainer,
      sendAIPrompt,
      playerOptions
    }
    //
    // // 模拟视频数据
    // const video = ref([
    //   {
    //     id: 1,
    //     title: '高效课堂教学技巧',
    //     description: '本视频介绍了提高课堂教学效率的实用技巧和方法。',
    //     fullDescription: '本视频详细介绍了提高课堂教学效率的实用技巧和方法，包括课堂组织、互动设计、提问技巧等多个方面。适合各学科教师观看学习，帮助改进教学方法，提升教学质量。',
    //     thumbnail: 'https://picsum.photos/id/111/400/225',
    //     embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    //     duration: '15:24',
    //     category: '教学示范',
    //     views: 1245,
    //     uploadDate: '2023-05-15',
    //     tags: ['教学技巧', '课堂管理', '教师发展']
    //   },
    //   {
    //     id: 2,
    //     title: '数学概念可视化教学',
    //     description: '通过可视化方式讲解抽象数学概念，帮助学生理解。',
    //     fullDescription: '本视频通过生动的可视化方式讲解抽象数学概念，将复杂的数学理论转化为直观的图像和动画，帮助学生更好地理解和掌握知识点。视频中包含多个实例和应用场景，适合数学教师和学生观看。',
    //     thumbnail: 'https://picsum.photos/id/112/400/225',
    //     embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    //     duration: '23:10',
    //     category: '课程讲解',
    //     views: 2367,
    //     uploadDate: '2023-06-22',
    //     tags: ['数学教学', '可视化', '概念讲解']
    //   },
    //   {
    //     id: 3,
    //     title: '物理实验：电磁感应现象',
    //     description: '详细演示电磁感应实验的操作步骤和注意事项。',
    //     fullDescription: '本视频详细演示了电磁感应实验的完整操作步骤、实验现象和注意事项。视频中包含多个经典电磁感应实验的演示，并对实验原理进行了深入浅出的讲解，帮助学生理解电磁感应的物理本质。适合物理教师课前准备和学生预习复习使用。',
    //     thumbnail: 'https://picsum.photos/id/113/400/225',
    //     embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    //     duration: '18:45',
    //     category: '实验演示',
    //     views: 1876,
    //     uploadDate: '2023-04-10',
    //     tags: ['物理实验', '电磁感应', '实验教学']
    //   },
    //   {
    //     id: 4,
    //     title: '有效的小组合作学习策略',
    //     description: '介绍如何组织和引导学生进行高效的小组合作学习。',
    //     fullDescription: '本视频全面介绍了如何组织和引导学生进行高效的小组合作学习，包括小组分配、角色设定、任务设计、过程管理和评价方式等多个环节。视频中结合了多个成功案例，展示了不同学科和年级段的小组合作学习实践，为教师提供了可操作的指导和建议。',
    //     thumbnail: 'https://picsum.photos/id/114/400/225',
    //     embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    //     duration: '20:36',
    //     category: '教学示范',
    //     views: 3421,
    //     uploadDate: '2023-07-05',
    //     tags: ['合作学习', '小组活动', '课堂组织']
    //   },
    //   {
    //     id: 5,
    //     title: '化学实验：酸碱中和反应',
    //     description: '演示酸碱中和反应的实验过程和现象观察。',
    //     fullDescription: '本视频详细演示了酸碱中和反应的完整实验过程、现象观察和数据记录。视频中包含多个经典中和反应实验，展示了不同指示剂的颜色变化，pH值的测量方法，以及滴定曲线的绘制过程。同时对实验原理和注意事项进行了详细讲解，适合化学教师和学生使用。',
    //     thumbnail: 'https://picsum.photos/id/115/400/225',
    //     embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    //     duration: '16:58',
    //     category: '实验演示',
    //     views: 1532,
    //     uploadDate: '2023-08-18',
    //     tags: ['化学实验', '酸碱中和', '实验教学']
    //   },
    //   {
    //     id: 6,
    //     title: '语文阅读教学策略',
    //     description: '分享提高学生阅读理解能力的有效教学策略。',
    //     fullDescription: '本视频分享了提高学生阅读理解能力的多种有效教学策略，包括阅读前预测、阅读中标注、阅读后总结等方法。视频结合了不同类型文本的教学案例，展示了如何引导学生进行深度阅读和批判性思考，培养学生的阅读兴趣和能力。适合语文教师和阅读教学研究者观看。',
    //     thumbnail: 'https://picsum.photos/id/116/400/225',
    //     embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    //     duration: '25:12',
    //     category: '课程讲解',
    //     views: 2845,
    //     uploadDate: '2023-09-30',
    //     tags: ['语文教学', '阅读理解', '教学策略']
    //   }
    // ])
    //
    // // 过滤视频
    // const filteredVideos = computed(() => {
    //   return videos.value.filter(video => {
    //     const matchesSearch = video.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    //                         video.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    //     const matchesCategory = !categoryFilter.value || video.category.includes(categoryFilter.value)
    //     return matchesSearch && matchesCategory
    //   })
    // })
    //
    // // 相关视频
    // const relatedVideos = computed(() => {
    //   if (!currentVideo.value.id) return []
    //
    //   return videos.value
    //     .filter(video => video.id !== currentVideo.value.id && video.category === currentVideo.value.category)
    //     .slice(0, 3)
    // })
    //
    // // 播放视频
    // const playVideo = (video) => {
    //   currentVideo.value = video
    //   playerVisible.value = true
    // }
    //
    // return {
    //   searchQuery,
    //   categoryFilter,
    //   videos,
    //   filteredVideos,
    //   playerVisible,
    //   currentVideo,
    //   relatedVideos,
    //   playVideo
    // }
  }
}
</script>

<style lang="scss" scoped>
.videos-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-layout {
  display: flex;
  flex: 1;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.left-panel {
  width: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-title {
  padding: 16px;
  margin: 0;
  font-size: 18px;
  color: #333;
  border-bottom: 1px solid #eee;
}

.search-input {
  margin: 16px;
}

.category-tree {
  padding: 16px;
  flex-shrink: 0;
}

.video-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.video-item {
  margin-bottom: 16px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.video-wrapper {
  position: relative;
  aspect-ratio: 16/9;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;

  .play-icon {
    font-size: 48px;
    color: #fff;
  }
}

.video-item:hover .play-overlay {
  opacity: 1;
}

.duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  padding: 12px;
  background: #fff;
}

.video-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.category-tag {
  background: #f0f9ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
}

.chat-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.message-date {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin: 16px 0;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  &.ai {
    flex-direction: row;

    .message-content {
      background: #f0f9ff;
      border-radius: 0 12px 12px 12px;
    }
  }

  &.user {
    flex-direction: row-reverse;

    .message-content {
      background: #6366f1;
      color: #fff;
      border-radius: 12px 0 12px 12px;
    }
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img, i {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  i {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e0e7ff;
    color: #6366f1;
  }
}

.message-content {
  padding: 12px 16px;
  max-width: 70%;
  word-break: break-word;
}

.message-text {
  line-height: 1.5;
  font-size: 14px;
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #e0e7ff;
  }

  i {
    font-size: 14px;
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;

  span {
    width: 8px;
    height: 8px;
    background: #6366f1;
    border-radius: 50%;
    animation: typing 1s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.chat-input {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

.input-container {
  flex: 1;
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

textarea {
  border: none;
  background: none;
  resize: none;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  width: 100%;
  min-height: 24px;
  max-height: 120px;

  &::placeholder {
    color: #999;
  }
}

.input-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.send-btn {
  align-self: flex-end;
  background: #6366f1;
  color: #fff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #4f46e5;
  }

  i {
    font-size: 16px;
  }
}

.right-panel {
  width: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.video-player {
  aspect-ratio: 16/9;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.embed-player {
  width: 100%;
  height: 100%;
}

.preview-info {
  h4 {
    margin: 0 0 12px;
    font-size: 18px;
    color: #333;
  }

  p {
    color: #666;
    line-height: 1.6;
    font-size: 14px;
    margin-bottom: 16px;
  }
}

.preview-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .tag {
    background: #f0f9ff;
    color: #409eff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
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

.video-player-container {
  width: 100%;
  background: #000;
  aspect-ratio: 16/9;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vjs-custom-skin {
  width: 100%;
  height: 100%;

  :deep(.video-js) {
    width: 100%;
    height: 100%;
  }
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
}
</style>
