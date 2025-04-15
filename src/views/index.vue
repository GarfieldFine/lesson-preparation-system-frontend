<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  Clock,
  Calendar,
  Trophy,
  User,
  Connection,
  MagicStick,
  Reading,
  EditPen,
  Notebook,
  VideoPlay,
  Bell,
  ChatDotRound,
  Promotion,
  PictureFilled,
  Histogram,
  Link,
  Star,
  School,
  OfficeBuilding
} from '@element-plus/icons-vue'

const router = useRouter()

// 功能特色数据
const features = ref([
  {
    icon: 'Document',
    title: '丰富的题库资源',
    description: '超过2000道精选算法题目，覆盖从入门到高级的各种难度，包含详细的题解和多种编程语言支持'
  },
  {
    icon: 'Trophy',
    title: '实时竞赛系统',
    description: '参与各类编程竞赛，与全球程序员同台竞技，提升解题速度和算法思维，获得成长和荣誉'
  },
  {
    icon: 'Connection',
    title: '活跃的社区讨论',
    description: '与其他程序员交流解题思路，分享编程经验，结交志同道合的朋友，共同进步'
  },
  {
    icon: 'School',
    title: '智能教学助手',
    description: '基于AI的智能教学助手，为教师提供个性化的教学建议和资源推荐，提高教学效率'
  },
  {
    icon: 'Notebook',
    title: '课程模板库',
    description: '丰富的课程模板库，涵盖各个学科和教学场景，帮助教师快速创建高质量的课程'
  }
])

// 平台数据
const platformStats = ref([
  { label: '课程', value: '30+', unit: '门' },
  { label: '用户', value: '100+', unit: '人' },
  { label: '提交', value: '500+', unit: '次' }
])

// 最近备课记录
const recentLessons = ref([
  {
    title: '数据结构与算法基础',
    date: '2025-2-26',
    progress: 90,
    tags: ['计算机科学', '本科必修']
  },
  {
    title: '高级Web开发技术',
    date: '2023-10-12',
    progress: 75,
    tags: ['前端开发', '选修课']
  },
  {
    title: '人工智能导论',
    date: '2023-10-08',
    progress: 60,
    tags: ['人工智能', '研究生课程']
  }
])

// 教学网站推荐
const linkItems = ref([
  {
    // 网站标题
    title: '慕课网',
    // 网站图表
    icon: new URL('@/assets/muke.png', import.meta.url).href,
    // 网站描述
    desc: '慕课网，程序员的梦工厂。',
    // 网站链接
    link: 'https://www.imooc.com/',
  },
  {
    // 网站标题
    title: '中国大学MOOC',
    // 网站图表
    icon: new URL('@/assets/mooc.png', import.meta.url).href,
    // 网站描述
    desc: '中国大学MOOC，优质在线课程学习平台。',
    // 网站链接
    link: 'https://www.icourse163.org/',
  },
  {
    // 网站标题
    title: 'Gitee码云',
    // 网站图表
    icon: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.7QU2bAZD69TGYdJML5koWgHaEo?rs=1&pid=ImgDetMainf',
    // 网站描述
    desc: 'gitee优质代码开源平台',
    // 网站链接
    link: 'https://gitee.com/',
  }
])

// 教学动态
const teachingNews = ref([
  {
    title: '2025年教学创新大赛开始报名',
    date: '2025-4-15',
    type: '赛事活动'
  },
  {
    title: '新版教学评估系统上线通知',
    date: '20235-4-10',
    type: '系统更新'
  },
  {
    title: '关于加强课程思政建设的指导意见',
    date: '2025-2-16',
    type: '政策通知'
  }
])
// 建立图标映射
const iconMap = {
  Calendar,
  Document,
  ChatDotRound,
  Link
}

// 常用工具
const quickTools = ref([
  { name: '课程表', icon: 'Calendar', path: '/lesson/schedule' },
  { name: '在线OJ', icon: 'Document', path: 'http://localhost:5174' },
  { name: '学生反馈', icon: 'ChatDotRound', path: '/lesson/feedback' },
  { name: '教师端入口', icon: 'Link', path: 'http://localhost:4000/home' }
])

// 导航到备课页面
const navigateToLessonPrep = () => {
  router.push('/lesson/lesson_hour/mylessonpreparation')
}

// 导航到AI辅助备课页面
const navigateToAIPrep = () => {
  router.push('/lesson/mylessonpreparation')
}

// 页面动画控制
const animationState = reactive({
  heroLoaded: false,
  featuresLoaded: false,
  statsLoaded: false
})

onMounted(() => {
  // 页面加载后依次触发动画
  setTimeout(() => {
    animationState.heroLoaded = true
  }, 300)
  setTimeout(() => {
    animationState.featuresLoaded = true
  }, 800)
  setTimeout(() => {
    animationState.statsLoaded = true
  }, 1200)
})
</script>

<template>
  <div class="home-container">
    <!-- 顶部横幅区域 -->
    <div class="hero-section" :class="{ 'animate-hero': animationState.heroLoaded }">
      <div class="hero-content">
        <div class="hero-badge">教育创新平台</div>
        <h1 class="main-title">智能备课系统</h1>
        <p class="subtitle">提升您的教学效率，打造个性化课程，让备课变得轻松愉快</p>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="navigateToLessonPrep" class="primary-button">
            <el-icon>
              <Document />
            </el-icon>
            开始备课
          </el-button>
          <el-button type="success" size="large" @click="navigateToAIPrep" class="success-button">
            <el-icon>
              <MagicStick />
            </el-icon>
            AI辅助备课
          </el-button>
        </div>
        <div class="hero-pattern"></div>
      </div>
      <div class="hero-decoration">
        <div class="floating-icon icon-1">
          <el-icon>
            <Document />
          </el-icon>
        </div>
        <div class="floating-icon icon-2">
          <el-icon>
            <School />
          </el-icon>
        </div>
        <div class="floating-icon icon-3">
          <el-icon>
            <MagicStick />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 平台特色区域 -->
    <div class="features-section" :class="{ 'animate-features': animationState.featuresLoaded }">
      <div class="section-header">
        <h2 class="section-title">智能备课平台特色</h2>
        <p class="section-subtitle">我们提供全面的智能备课工具和资源，帮助您成为更优秀的教育工作者</p>
        <div class="section-divider"></div>
      </div>

      <div class="features-grid">
        <div v-for="(feature, index) in features" :key="index" class="feature-card"
             :style="{'animation-delay': index * 0.1 + 's'}">
          <div class="feature-icon">
            <el-icon :size="40" color="#6366f1">
              <component :is="feature.icon" />
            </el-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
          <div class="feature-hover-effect"></div>
        </div>
      </div>
    </div>

    <!-- 平台数据统计 -->
    <div class="stats-section" :class="{ 'animate-stats': animationState.statsLoaded }">
      <div class="stats-background"></div>
      <h2 class="section-title">平台数据</h2>
      <p class="section-subtitle">智能备课系统已帮助无数教师提升教学效率和质量</p>

      <div class="stats-container">
        <div v-for="(stat, index) in platformStats" :key="index" class="stat-item"
             :style="{'animation-delay': index * 0.2 + 's'}">
          <div class="stat-icon">
            <el-icon :size="30" v-if="index === 0">
              <Document />
            </el-icon>
            <el-icon :size="30" v-else-if="index === 1">
              <User />
            </el-icon>
            <el-icon :size="30" v-else>
              <Histogram />
            </el-icon>
          </div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}{{ stat.unit }}</div>
        </div>
      </div>
    </div>

    <!-- 最近备课记录 -->
    <div class="recent-lessons-section">
      <div class="section-header">
        <h2 class="section-title">最近备课</h2>
        <el-button type="primary" plain size="small" class="view-all-button">
          查看全部
          <el-icon class="el-icon--right">
            <ArrowRight />
          </el-icon>
        </el-button>
      </div>
      <div class="lessons-container">
        <el-card v-for="(lesson, index) in recentLessons" :key="index" class="lesson-card">
          <div class="lesson-header">
            <h3 class="lesson-title">{{ lesson.title }}</h3>
            <span class="lesson-date">
              <el-icon><Calendar /></el-icon>
              {{ lesson.date }}
            </span>
          </div>
          <div class="lesson-tags">
            <el-tag v-for="(tag, tagIndex) in lesson.tags" :key="tagIndex" size="small" effect="plain"
                    class="lesson-tag">{{ tag }}
            </el-tag>
          </div>
          <div class="lesson-progress">
            <span class="progress-label">完成度: {{ lesson.progress }}%</span>
            <el-progress :percentage="lesson.progress" :stroke-width="8"
                         :color="lesson.progress > 80 ? '#67C23A' : lesson.progress > 50 ? '#E6A23C' : '#F56C6C'" />
          </div>
          <div class="lesson-actions">
            <el-button type="primary" plain size="small">
              <el-icon>
                <Reading />
              </el-icon>
              继续备课
            </el-button>
            <el-button type="info" plain size="small">
              <el-icon>
                <EditPen />
              </el-icon>
              编辑
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 教学网站推荐 -->
    <div class="resources-section">
      <div class="section-header">
        <h2 class="section-title" style="margin-left: 30px">教学网站推荐</h2>
        <p class="section-subtitle">精选优质教学网站，助力您的教学工作</p>
      </div>
      <div class="resources-container" style="margin: 0 15px;">
        <el-card v-for="(item, index) in linkItems" :key="index" class="resource-card">
          <div class="resource-icon">
            <img :src="item.icon" alt="网站图标"
                 style="width: 180px; height: 75px; border-radius: 8px;margin-left: 35px;transform: translateX(-70px)" />
          </div>
          <div class="resource-content">
            <h3 class="resource-title">{{ item.title }}</h3>
            <div class="resource-meta">
              <span class="resource-type">教育网站</span>
            </div>
            <div class="resource-description" style="margin-top: 10px; color: #6b7280;">
              {{ item.desc }}
            </div>
          </div>
          <el-button type="primary" text class="resource-button" @click="window.open(item.link, '_blank')">访问网站
          </el-button>
        </el-card>
      </div>
    </div>

    <!-- 教学动态与常用工具 -->
    <div class="news-tools-section">
      <!-- 教学动态 -->
      <div class="news-section">
        <div class="section-header">
          <h2 class="section-title">教学动态</h2>
          <el-button type="primary" text>更多</el-button>
        </div>
        <div class="news-list">
          <div v-for="(news, index) in teachingNews" :key="index" class="news-item">
            <div class="news-type-badge" :class="'news-type-' + news.type.replace(/\s+/g, '-').toLowerCase()">
              {{ news.type }}
            </div>
            <div class="news-content">
              <h3 class="news-title">{{ news.title }}</h3>
              <span class="news-date">{{ news.date }}</span>
            </div>
            <el-icon class="news-arrow">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 常用工具 -->
      <div class="tools-section">
        <div class="section-header">
          <h2 class="section-title">常用工具</h2>
        </div>
        <div class="tools-grid">
          <div v-for="(tool, index) in quickTools" :key="index" class="tool-item">
            <el-icon :size="24">
              <component :is="iconMap[tool.icon]" />
            </el-icon>
            <span class="tool-name">{{ tool.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="footer-section">
      <div class="footer-content">
        <div class="footer-logo">
          <h3>智能备课系统</h3>
          <p>帮助大学教师高效备课的智能平台</p>
        </div>
        <div class="footer-links">
          <div class="footer-links-group">
            <h4>关于我们</h4>
            <a href="#">平台介绍</a>
            <a href="#">团队成员</a>
            <a href="#">联系我们</a>
          </div>
          <div class="footer-links-group">
            <h4>帮助中心</h4>
            <a href="#">使用指南</a>
            <a href="#">常见问题</a>
            <a href="#">意见反馈</a>
          </div>
          <div class="footer-links-group">
            <h4>资源中心</h4>
            <a href="#">教学资源</a>
            <a href="#">教师社区</a>
            <a href="#">培训课程</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 智能备课系统 - 帮助大学教师高效备课的智能平台</p>
        <div class="footer-social">
          <el-icon :size="20">
            <ChatDotRound />
          </el-icon>
          <el-icon :size="20">
            <Bell />
          </el-icon>
          <el-icon :size="20">
            <Link />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

/* 顶部横幅区域 */
.hero-section {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 70px 40px;
  margin: 30px 0;
  color: white;
  text-align: center;
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
  opacity: 0;
  transform: translateY(20px);
}

.animate-hero {
  opacity: 1;
  transform: translateY(0);
}

.hero-badge {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 20px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.4;
  pointer-events: none;
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: float 6s infinite ease-in-out;
}

.icon-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.icon-2 {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.icon-3 {
  top: 30%;
  right: 25%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.main-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to right, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.35rem;
  margin-bottom: 32px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.9;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.primary-button, .success-button {
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.primary-button:hover, .success-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* 平台特色区域 */
.features-section {
  padding: 70px 0;
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.animate-features {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  margin-bottom: 40px;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1f2937;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
  border-radius: 3px;
}

.section-subtitle {
  font-size: 1.15rem;
  color: #6b7280;
  max-width: 700px;
  margin: 0 auto 20px;
  line-height: 1.6;
}

.section-divider {
  width: 100px;
  height: 2px;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
  margin: 0 auto 40px;
  opacity: 0.5;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.feature-card {
  background-color: white;
  border-radius: 16px;
  padding: 35px 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.8);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

.feature-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.feature-card:hover .feature-hover-effect {
  transform: scaleX(1);
}

.feature-icon {
  background-color: rgba(99, 102, 241, 0.1);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.15);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
  background-color: rgba(99, 102, 241, 0.15);
}

.feature-title {
  font-size: 1.35rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
  position: relative;
}

.feature-description {
  color: #6b7280;
  line-height: 1.7;
  font-size: 1.05rem;
  flex-grow: 1;
}

/* 平台数据统计 */
.stats-section {
  background-color: #f9fafb;
  padding: 70px 0;
  text-align: center;
  border-radius: 16px;
  margin: 50px 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.animate-stats {
  opacity: 1;
  transform: translateY(0);
}

.stats-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" fill="%236366f1" opacity="0.05"/></svg>');
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-top: 50px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-icon {
  background-color: rgba(99, 102, 241, 0.1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #6366f1;
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.15);
}

.stat-value {
  font-size: 3rem;
  font-weight: 800;
  color: #6366f1;
  margin-bottom: 12px;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1.2rem;
  color: #4b5563;
  font-weight: 500;
}

/* 最近备课记录 */
.recent-lessons-section {
  padding: 70px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.view-all-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.lessons-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.lesson-card {
  transition: all 0.4s ease;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.lesson-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.lesson-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.lesson-date {
  font-size: 0.9rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.lesson-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.lesson-tag {
  font-size: 0.8rem;
}

.lesson-progress {
  margin: 20px 0;
}

.progress-label {
  display: block;
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 10px;
  font-weight: 500;
}

.lesson-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

/* 教学网站推荐 */
.resources-section {
  padding: 70px 0;
  background-color: #f9fafb;
  border-radius: 16px;
  margin: 50px 0;
}

.resources-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 40px;
}

.resource-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.resource-icon {
  //background-color: rgba(99, 102, 241, 0.1);
  //width: 60px;
  //height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #6366f1;
}

.resource-content {
  flex-grow: 1;
}

.resource-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.resource-type {
  font-size: 0.9rem;
  color: #6b7280;
  background-color: rgba(99, 102, 241, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

.resource-rating {
  display: flex;
  align-items: center;
}

.resource-downloads {
  font-size: 0.9rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
}

.resource-button {
  margin-top: 16px;
  align-self: flex-end;
}

/* 教学动态与常用工具 */
.news-tools-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 50px 0;
}

.news-section, .tools-section {
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.news-list {
  margin-top: 20px;
}

.news-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
}

.news-item:last-child {
  border-bottom: none;
}

.news-item:hover {
  transform: translateX(5px);
}

.news-type-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-right: 15px;
  min-width: 80px;
  text-align: center;
}

.news-type-赛事活动 {
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.news-type-系统更新 {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.news-type-政策通知 {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.news-content {
  flex-grow: 1;
}

.news-title {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 5px 0;
}

.news-date {
  font-size: 0.85rem;
  color: #6b7280;
}

.news-arrow {
  color: #6b7280;
  margin-left: 10px;
  transition: transform 0.3s ease;
}

.news-item:hover .news-arrow {
  transform: translateX(5px);
  color: #6366f1;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  gap: 10px;
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.tool-item:hover {
  background-color: rgba(99, 102, 241, 0.1);
  transform: translateY(-5px);
  border-color: rgba(99, 102, 241, 0.3);
}

.tool-item .el-icon {
  color: #6366f1;
}

.tool-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1f2937;
}

/* 底部区域 */
.footer-section {
  padding: 60px 50px 30px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  margin-top: 70px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.footer-logo h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 10px 0;
}

.footer-logo p {
  color: #6b7280;
  font-size: 1rem;
}

.footer-links {
  display: flex;
  gap: 60px;
}

.footer-links-group h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 15px 0;
}

.footer-links-group a {
  display: block;
  color: #6b7280;
  margin-bottom: 10px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links-group a:hover {
  color: #6366f1;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid #e5e7eb;
}

.footer-bottom p {
  color: #6b7280;
  margin: 0;
}

.footer-social {
  display: flex;
  gap: 15px;
}

.footer-social .el-icon {
  color: #6b7280;
  cursor: pointer;
  transition: color 0.3s ease;
}

.footer-social .el-icon:hover {
  color: #6366f1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .stats-container {
    flex-direction: column;
    gap: 40px;
  }

  .news-tools-section {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-direction: column;
    gap: 30px;
  }

  .footer-links {
    flex-direction: column;
    gap: 30px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>
