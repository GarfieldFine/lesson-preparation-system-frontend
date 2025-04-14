<template>
  <div class="student-detail-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-page-header @back="goBack" :icon="ArrowLeft">
        <template #content>
          <div class="page-header-content">
            <span class="text-large font-600 mr-3">学生详情</span>
            <el-tag type="success" effect="dark" v-if="studentInfo.status === 0">在读</el-tag>
            <el-tag type="info" effect="dark" v-else>休学</el-tag>
          </div>
        </template>
      </el-page-header>
    </div>

    <!-- 学生基本信息卡片 -->
    <el-card class="student-info-card">
      <div class="student-info-header">
        <div class="student-avatar-container">
          <el-avatar :size="100" :src="'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' ">
            {{ studentInfo.name?.substring(0, 1) }}
          </el-avatar>
          <div class="student-name-info">
            <h2>{{ studentInfo.name }}</h2>
            <div class="student-id">学号：{{ studentInfo.studentId }}</div>
            <div class="student-tags">
              <el-tag v-if="studentInfo.isExcellent" type="danger" effect="plain">优秀学生</el-tag>
              <el-tag v-if="studentInfo.position" type="warning" effect="plain">{{ studentInfo.position }}</el-tag>
            </div>
          </div>
        </div>
        <div class="student-basic-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="学院">{{ studentInfo.academy }}</el-descriptions-item>
            <el-descriptions-item label="专业">{{ studentInfo.major }}</el-descriptions-item>
            <el-descriptions-item label="年级">{{ studentInfo.grade }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{ studentInfo.className }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ studentInfo.gender === 1 ? '男' : '女' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ studentInfo.phone }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>

    <!-- 学习情况总览 -->
    <el-card class="study-overview-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><TrendCharts /></el-icon> 学习情况总览</span>
          <el-radio-group v-model="timeRange" size="small">
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="semester">本学期</el-radio-button>
            <el-radio-button label="year">本学年</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="overview-stats">
        <div class="stat-item">
          <div class="stat-value">{{ overviewData.attendanceRate }}%</div>
          <div class="stat-label">出勤率</div>
          <el-progress :percentage="overviewData.attendanceRate" :color="getProgressColor(overviewData.attendanceRate)" />
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ overviewData.gpa }}</div>
          <div class="stat-label">GPA</div>
          <el-progress :percentage="overviewData.gpaPercentage" :color="getProgressColor(overviewData.gpaPercentage)" />
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ overviewData.creditCompleted }}/{{ overviewData.creditTotal }}</div>
          <div class="stat-label">已修学分/总学分</div>
          <el-progress :percentage="(overviewData.creditCompleted / overviewData.creditTotal) * 100" :color="getProgressColor((overviewData.creditCompleted / overviewData.creditTotal) * 100)" />
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ overviewData.classParticipation }}%</div>
          <div class="stat-label">课堂参与度</div>
          <el-progress :percentage="overviewData.classParticipation" :color="getProgressColor(overviewData.classParticipation)" />
        </div>
      </div>
    </el-card>

    <!-- 各科成绩分析 -->
    <el-card class="subject-analysis-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><DataAnalysis /></el-icon> 各科成绩分析</span>
        </div>
      </template>
      <div class="chart-container">
        <div id="subjectRadarChart" class="chart"></div>
        <div id="scoreLineChart" class="chart"></div>
      </div>
    </el-card>

    <!-- 教师科目详情 -->
    <el-card class="teacher-subject-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><Reading /></el-icon> {{ teacherSubject.name }} 学习详情</span>
          <el-tag type="success">{{ teacherSubject.teacher }}老师</el-tag>
        </div>
      </template>
      <div class="subject-detail-container">
        <div class="subject-stats">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="subject-stat-item">
                <div class="stat-icon"><el-icon><Medal /></el-icon></div>
                <div class="stat-content">
                  <div class="stat-value">{{ teacherSubject.rank }}</div>
                  <div class="stat-label">班级排名</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="subject-stat-item">
                <div class="stat-icon"><el-icon><Histogram /></el-icon></div>
                <div class="stat-content">
                  <div class="stat-value">{{ teacherSubject.avgScore }}</div>
                  <div class="stat-label">班级平均分</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="subject-stat-item">
                <div class="stat-icon"><el-icon><TopRight /></el-icon></div>
                <div class="stat-content">
                  <div class="stat-value">{{ teacherSubject.improvement }}%</div>
                  <div class="stat-label">进步幅度</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="subject-exams">
          <h3>考试记录</h3>
          <el-table :data="teacherSubject.exams" stripe style="width: 100%">
            <el-table-column prop="date" label="考试日期" width="180" />
            <el-table-column prop="name" label="考试名称" width="160">
              <template #default="examType">
                {{examType === 0 ? '期中考试' : '期末考试'}}
              </template>
            </el-table-column>
            <el-table-column prop="score" label="分数" width="80" />
            <el-table-column prop="fullScore" label="满分" width="80" />
            <el-table-column prop="grade" label="等级" width="80" />
            <el-table-column prop="gpa" label="绩点" width="80" />
            <el-table-column label="得分率">
              <template #default="scope">
                <el-progress :percentage="(scope.row.score / scope.row.fullScore) * 100" :format="format" />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="practice-completion">
          <h3>课程作业与实验完成情况</h3>
          <div id="practiceCompletionChart" class="chart"></div>
          <div class="practice-stats">
            <el-row :gutter="20">
              <el-col :span="8" v-for="(item, index) in teacherSubject.practiceStats" :key="index">
                <div class="practice-stat-item">
                  <div class="practice-stat-title">{{ item.title }}</div>
                  <div class="practice-stat-value">{{ item.value }}</div>
                  <div class="practice-stat-desc">{{ item.description }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </el-card>

    <!-- AI学习总结 -->
    <el-card class="ai-summary-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><ChatDotRound /></el-icon> AI学习总结</span>
        </div>
      </template>
      <div class="ai-summary-content">
        <div class="ai-avatar">
          <el-avatar :size="60" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
        </div>
        <div class="ai-message">
          <div class="ai-message-header">
            <span class="ai-name">智能学习助手</span>
            <span class="ai-time">{{ formatDate(new Date()) }}</span>
          </div>
          <div class="ai-message-content">
            <p>{{ aiSummary.generalComment }}</p>
            <h4>优势:</h4>
            <ul>
              <li>{{ aiSummary.strengths }}</li>
            </ul>
            <h4>需要改进:</h4>
            <ul>
              <li>{{ aiSummary.improvements }}</li>
            </ul>
            <h4>学习建议:</h4>
            <p>{{ aiSummary.suggestions }}</p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 学习轨迹 -->
    <el-card class="learning-path-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><Position /></el-icon> 学习轨迹</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in learningActivities"
          :key="index"
          :timestamp="activity.time"
          :type="activity.type"
          :color="activity.color"
          :hollow="activity.hollow"
        >
          {{ activity.content }}
          <div class="timeline-detail" v-if="activity.detail">{{ activity.detail }}</div>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 学情分析 -->
    <el-card class="subject-analysis-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><DataAnalysis /></el-icon> 学情分析</span>
        </div>
      </template>
      
      <!-- 学习进度 -->
      <div class="analysis-section">
        <h3><el-icon><TrendCharts /></el-icon> 学习进度</h3>
        <div class="progress-grid">
          <div class="progress-item" v-for="(item, index) in learningProgress" :key="index">
            <div class="progress-label">{{ item.label }}</div>
            <el-progress 
              type="circle" 
              :percentage="item.percentage"
              :color="item.color"
              :stroke-width="10"
            />
            <div class="progress-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>

      <!-- 知识点掌握情况 -->
      <div class="analysis-section">
        <h3><el-icon><Reading /></el-icon> 知识点掌握情况</h3>
        <div class="knowledge-chart">
          <div id="knowledgeBarChart" class="chart"></div>
        </div>
        <div class="knowledge-tags">
          <el-tag 
            v-for="(tag, index) in knowledgeTags" 
            :key="index"
            :type="tag.type"
            effect="light"
            class="knowledge-tag"
          >
            {{ tag.name }}: {{ tag.score }}分
          </el-tag>
        </div>
      </div>

      <!-- 学习建议 -->
      <div class="analysis-section">
        <h3><el-icon><ChatDotRound /></el-icon> 学习建议</h3>
        <div class="suggestion-list">
          <div class="suggestion-item" v-for="(suggestion, index) in learningAdvice" :key="index">
            <div class="suggestion-icon">
              <el-icon :size="24" :color="suggestion.color">
                <component :is="suggestion.icon"></component>
              </el-icon>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">{{ suggestion.title }}</div>
              <div class="suggestion-desc">{{ suggestion.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 推荐资源 -->
    <el-card class="recommended-resources-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><Collection /></el-icon> 推荐资源</span>
        </div>
      </template>
      <el-tabs v-model="activeResourceTab" class="resource-tabs">
        <el-tab-pane label="习题集" name="exercises">
          <div class="resource-list">
            <div v-for="(item, index) in recommendedExercises" :key="index" class="resource-item">
              <div class="resource-title">
                <el-icon><Document /></el-icon>
                <span>{{ item.title }}</span>
              </div>
              <div class="resource-info">
                <el-tag size="small" :type="item.difficultyType">{{ item.difficulty }}</el-tag>
                <span class="resource-count">{{ item.questionCount }}题</span>
              </div>
              <div class="resource-reason">推荐理由：{{ item.reason }}</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="OJ题目" name="oj">
          <div class="resource-list">
            <div v-for="(item, index) in recommendedOJ" :key="index" class="resource-item">
              <div class="resource-title">
                <el-icon><Monitor /></el-icon>
                <span>{{ item.title }}</span>
              </div>
              <div class="resource-info">
                <el-tag size="small" :type="item.difficultyType">{{ item.difficulty }}</el-tag>
                <span class="resource-type">{{ item.type }}</span>
              </div>
              <div class="resource-reason">推荐理由：{{ item.reason }}</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="学习视频" name="videos">
          <div class="resource-list">
            <div v-for="(item, index) in recommendedVideos" :key="index" class="resource-item">
              <div class="resource-title">
                <el-icon><VideoCamera /></el-icon>
                <span>{{ item.title }}</span>
              </div>
              <div class="resource-info">
                <span class="video-duration"><el-icon><Timer /></el-icon> {{ item.duration }}</span>
                <span class="video-teacher">{{ item.teacher }}</span>
              </div>
              <div class="resource-reason">推荐理由：{{ item.reason }}</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as echarts from 'echarts'
import {
  ArrowLeft,
  TrendCharts,
  DataAnalysis,
  Reading,
  Medal,
  Histogram,
  TopRight,
  ChatDotRound,
  Position,
  Collection,
  Document,
  Monitor,
  VideoCamera,
  Timer,
  Aim,
  Lightning,
  Star
} from '@element-plus/icons-vue'
import { getStudentDetailService } from '@/api/students.js'

const router = useRouter()
const route = useRoute()
const studentId = route.query.studentId
const teacherScheduleId = route.query.teacherScheduleId

const getStudentDetailDto = ref({
  studentId: studentId,
  classId: 1,
  teacherId: 1,
  teacherScheduleId: teacherScheduleId,
  lessonPreparationRecordId:1
})

// 返回上一页
const goBack = () => {
  router.go(-1)
}
const colors = ['#67C23A', '#409EFF', '#E6A23C', '#F56C6C', '#909399', '#00C0A8']
const getRandomColor = () => {
  const index = Math.floor(Math.random() * colors.length)
  return colors[index]
}
const getRandomHollow = () => {
  return Math.random() < 0.5
}
// 时间范围选择
const timeRange = ref('semester')

// 学生基本信息
const studentInfo = ref({
  name: '张小明',
  studentId: '2023010101',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  college: '计算机学院',
  major: '软件工程',
  grade: '2023级',
  class: '软工2301班',
  gender: 'male',
  phone: '13800138000',
  status: 'active',
  isExcellent: true,
  isMonitor: false,
  isLeader: true
})

// 学习情况总览数据
const overviewData = ref({
  attendanceRate: 98,
  gpa: 3.8,
  gpaPercentage: 95, // 按4.0满分计算的百分比
  creditCompleted: 85,
  creditTotal: 150,
  classParticipation: 85
})

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage < 60) return '#F56C6C'
  if (percentage < 80) return '#E6A23C'
  return '#67C23A'
}

// 教师科目详情
const teacherSubject = ref({
  name: '高等数学',
  teacher: '李明',
  rank: '5/42',
  avgScore: 92,
  improvement: 15,
  exams: [
    { date: '2023-11-15', name: '期末考试', score: 92, fullScore: 100, grade: 'A', gpa: 4.0 },
    { date: '2023-09-20', name: '期中考试', score: 88, fullScore: 100, grade: 'B+', gpa: 3.5 }
  ],
  practiceStats: [
    { title: '作业完成率', value: '95%', description: '班级平均: 85%' },
    { title: '实验成绩', value: '优秀', description: '超过班级80%同学' },
    { title: '课堂表现', value: '积极', description: '教师评价: 良好' }
  ]
})

// 格式化进度条显示
const format = (percentage) => {
  return `${percentage}%`
}

// 学习进度数据
const learningProgress = ref([
  {
    label: '课程进度',
    percentage: 85,
    color: '#67C23A',
    description: '已完成85%的课程内容'
  },
  {
    label: '作业完成率',
    percentage: 92,
    color: '#409EFF',
    description: '按时提交率92%'
  },
  {
    label: '实验完成度',
    percentage: 78,
    color: '#E6A23C',
    description: '完成率78%'
  }
])

// 知识点掌握情况
const knowledgeTags = ref([
  { name: '数据结构', score: 92, type: 'success' },
  { name: '算法分析', score: 85, type: 'primary' },
  { name: '编程基础', score: 95, type: 'success' },
  { name: '数据库', score: 88, type: 'primary' },
  { name: '网络原理', score: 82, type: 'warning' },
  { name: '操作系统', score: 78, type: 'warning' }
])

// 学习建议
const learningAdvice = ref([
  {
    title: '重点关注',
    description: '建议加强网络原理和操作系统相关知识的学习',
    icon: 'Aim',
    color: '#F56C6C'
  },
  {
    title: '优势巩固',
    description: '在数据结构和编程基础方面表现优秀，建议参加相关竞赛',
    icon: 'Star',
    color: '#67C23A'
  },
  {
    title: '学习方法',
    description: '建议多做实验，提高动手能力，加深对理论知识的理解',
    icon: 'Lightning',
    color: '#E6A23C'
  }
])

// AI学习总结
const aiSummary = ref({
  generalComment: '张小明同学在本学期表现出色，尤其在高等数学和程序设计课程上有明显的优势。学习态度积极，课堂参与度高，能够主动思考问题并积极参与小组讨论。',
  strengths: [
    '编程能力突出，在课程设计和实验中表现优秀',
    '学习习惯良好，作业和实验报告按时提交率高',
    '善于团队协作，在小组项目中能够发挥领导作用'
  ],
  improvements: [
    '英语口语表达需要加强，建议参加英语角活动',
    '部分理论课程的知识点掌握不够系统',
    '时间管理能力有待提高，特别是在多课程项目并行时'
  ],
  suggestions: '建议在保持现有学习习惯的基础上，可以参加更多学术讲座拓展专业视野，加入相关专业竞赛提升实践能力。同时建议制定更合理的学习计划，平衡各课程的学习时间，提高学习效率。对于英语能力的提升，可以考虑参加校内外英语活动或选修相关课程。'
})

// 学习轨迹
const learningActivities = ref([
  { time: '2023-11-20 14:30', content: '提交数据库课程设计', detail: '学生信息管理系统，评分：优秀', type: 'success', color: '#67C23A', hollow: false },
  { time: '2023-11-18 09:15', content: '参加计算机网络实验课', detail: '网络协议分析实验，表现积极', type: 'primary', color: '#409EFF', hollow: false },
  { time: '2023-11-15 16:00', content: '大学英语四级考试', detail: '得分550分，顺利通过', type: 'warning', color: '#E6A23C', hollow: false },
  { time: '2023-11-10 10:30', content: '高等数学期中考试', detail: '得分92分，专业排名第5', type: 'success', color: '#67C23A', hollow: false },
  { time: '2023-11-05 08:00', content: '参加学术讲座', detail: '人工智能与未来发展，获得1学时', type: 'info', color: '#909399', hollow: true }
])

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 推荐资源相关数据
const activeResourceTab = ref('exercises')

// 推荐习题集
// 推荐习题集
const recommendedExercises = ref([
  {
    title: '二叉树遍历与应用专题',
    difficulty: '中等',
    difficultyType: 'warning',
    questionCount: 45,
    reason: '帮助你掌握二叉树的各种遍历方法和实际应用场景'
  },
  {
    title: '图论算法基础练习',
    difficulty: '简单',
    difficultyType: 'success',
    questionCount: 30,
    reason: '通过基础图论问题帮助你理解图的表示和基本操作'
  },
  {
    title: '动态规划经典问题集',
    difficulty: '困难',
    difficultyType: 'danger',
    questionCount: 35,
    reason: '包含经典动态规划题目，提升你的算法设计能力'
  }
])

// 推荐OJ题目
const recommendedOJ = ref([
  {
    title: '矩阵快速幂算法实现',
    difficulty: '中等',
    difficultyType: 'warning',
    type: '算法实现',
    reason: '适合提升你的代码实现能力'
  },
  {
    title: '最短路径问题求解',
    difficulty: '困难',
    difficultyType: 'danger',
    type: '图论算法',
    reason: '帮助你深入理解图论算法的应用'
  },
  {
    title: '简单数据结构实现',
    difficulty: '简单',
    difficultyType: 'success',
    type: '基础训练',
    reason: '巩固基本的数据结构知识'
  }
])

// 推荐学习视频
const recommendedVideos = ref([
  {
    title: '二叉树数据结构详解',
    duration: '45分钟',
    teacher: '王教授',
    reason: '系统讲解二叉树的基本概念、遍历方法和实际应用场景'
  },
  {
    title: '常见排序算法分析与实现',
    duration: '60分钟',
    teacher: '李教授',
    reason: '深入剖析各种排序算法的原理、实现和性能比较'
  },
  {
    title: '动态规划解题技巧',
    duration: '50分钟',
    teacher: '张教授',
    reason: '通过经典例题讲解动态规划的思路和解题方法'
  }
])


const randomCount = () => {
  return Math.floor(Math.random() * (100 - 40 + 1)) + 40;
}

// 初始化图表
onMounted(async () => {

  const res = await getStudentDetailService(getStudentDetailDto.value)

  studentInfo.value = res.data.students
  learningActivities.value = res.data.learningActivitiesList.map(item => ({
    ...item,
    color: getRandomColor(),
    hollow: getRandomHollow()
  }))

  aiSummary.value = res.data.aiStudentSummaries
  teacherSubject.value = res.data.studentSubjectDetail
  const courseNameList = res.data.courseNameList
  const scoreList = res.data.scoreList

  // 初始化雷达图
  const radarChart = echarts.init(document.getElementById('subjectRadarChart'))
  const radarOption = {
    title: {
      text: '各科成绩雷达图',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {},
    legend: {
      data: ['本人成绩', '班级平均']
    },
    radar: {
      indicator: [
        { name: courseNameList[0], max: 100 },
        { name: courseNameList[1], max: 100 },
        { name: courseNameList[2], max: 100 },
        { name: courseNameList[3], max: 100 },
        { name: courseNameList[4], max: 100 },
        { name: courseNameList[5], max: 100 }
      ]
    },
    series: [{
      name: '成绩对比',
      type: 'radar',
      data: [
        {
          value: scoreList,
          name: '本人成绩',
          areaStyle: {
            color: 'rgba(64, 158, 255, 0.6)'
          },
          lineStyle: {
            color: '#409EFF'
          }
        },
        {
          value: [75, 80, 82, 78, 76, 70],
          name: '班级平均',
          areaStyle: {
            color: 'rgba(103, 194, 58, 0.6)'
          },
          lineStyle: {
            color: '#67C23A'
          }
        }
      ]
    }]
  }
  radarChart.setOption(radarOption)

  // 初始化折线图
  const lineChart = echarts.init(document.getElementById('scoreLineChart'))
  const lineOption = {
    title: {
      text: '近期考试成绩趋势',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['数学', '语文', '英语', '物理', '化学']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['大一上期中', '大一上期末', '大一下期中', '大一下期末', '大二上期中']
    },
    yAxis: {
      type: 'value',
      min: 60,
      max: 100
    },
    series: [
      {
        name: '高等数学',
        type: 'line',
        data: [85, 88, 92, 90, 94],
        smooth: true,
        lineStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '大学英语',
        type: 'line',
        data: [82, 80, 85, 87, 88],
        smooth: true,
        lineStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '程序设计',
        type: 'line',
        data: [90, 92, 95, 94, 96],
        smooth: true,
        lineStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: '数据结构',
        type: 'line',
        data: [null, null, 88, 90, 92],
        smooth: true,
        lineStyle: {
          color: '#F56C6C'
        }
      },
      {
        name: '计算机网络',
        type: 'line',
        data: [null, null, null, null, 85],
        smooth: true,
        lineStyle: {
          color: '#909399'
        }
      }
    ]
  }
  lineChart.setOption(lineOption)

  // 初始化知识点掌握情况图表
  const knowledgeChart = echarts.init(document.getElementById('knowledgeBarChart'))
  const knowledgeOption = {
    title: {
      text: '知识点掌握度分析',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: knowledgeTags.value.map(tag => tag.name),
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '掌握度',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}分'
        }
      }
    ],
    series: [
      {
        name: '得分',
        type: 'bar',
        data: knowledgeTags.value.map(tag => tag.score),
        itemStyle: {
          color: function(params) {
            const score = params.data
            if (score >= 90) return '#67C23A'
            if (score >= 80) return '#409EFF'
            if (score >= 70) return '#E6A23C'
            return '#F56C6C'
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}分'
        }
      }
    ]
  }
  knowledgeChart.setOption(knowledgeOption)

  // 初始化练习题完成情况图表
  const practiceChart = echarts.init(document.getElementById('practiceCompletionChart'))
  const practiceOption = {
    title: {
      text: '练习题类型分布与正确率',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['完成数量', '正确率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['课堂作业', '实验报告', '课程设计', '小组项目', '课堂讨论']
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '完成度',
        min: 0,
        max: 100,
        position: 'left',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      {
        type: 'value',
        name: '得分率',
        min: 0,
        max: 100,
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '完成度',
        type: 'bar',
        data: [randomCount(), randomCount(), randomCount(), randomCount(), randomCount()],
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      },
      {
        name: '得分率',
        type: 'line',
        yAxisIndex: 1,
        data: [randomCount(), randomCount(), randomCount(), randomCount(), randomCount()],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#F56C6C'
        },
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }
  practiceChart.setOption(practiceOption)

  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    radarChart.resize()
    lineChart.resize()
    practiceChart.resize()
  })
})
</script>

<style scoped>
/* 推荐资源卡片样式 */
.recommended-resources-card {
  margin-top: 20px;
}

.resource-tabs {
  width: 100%;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.resource-item {
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.resource-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.resource-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.resource-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.resource-count,
.resource-type,
.video-duration,
.video-teacher {
  display: flex;
  align-items: center;
  gap: 4px;
}

.resource-reason {
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.5;
}


.student-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-header-content {
  display: flex;
  align-items: center;
}

.student-info-card,
.study-overview-card,
.subject-analysis-card,
.teacher-subject-card,
.ai-summary-card,
.learning-path-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.card-header .el-icon {
  margin-right: 5px;
  color: #409EFF;
}

.student-info-header {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.student-avatar-container {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.student-name-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.student-name-info h2 {
  margin: 0;
  color: #303133;
}

.student-id {
  color: #909399;
  font-size: 14px;
}

.student-tags {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.student-basic-info {
  flex: 1;
}

.overview-stats {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.stat-item {
  flex: 1;
  min-width: 200px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.chart-container {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  .chart {
    flex: 1;
    height: 400px;
  }
}

.knowledge-chart {
  margin: 20px 0;
  .chart {
    width: 100%;
    height: 400px;
  }
}

/* 学情分析样式 */
.analysis-section {
  margin-bottom: 30px;

  h3 {
    font-size: 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.progress-item {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .progress-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 15px;
  }

  .progress-desc {
    font-size: 12px;
    color: #909399;
    margin-top: 10px;
  }
}

.knowledge-chart {
  margin-bottom: 20px;
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;

  .knowledge-tag {
    font-size: 14px;
  }
}

.suggestion-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .suggestion-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: rgba(64, 158, 255, 0.1);
    border-radius: 50%;
  }

  .suggestion-content {
    flex: 1;

    .suggestion-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #303133;
    }

    .suggestion-desc {
      font-size: 14px;
      color: #606266;
      line-height: 1.5;
    }
  }
}

.subject-detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.subject-stats {
  margin-bottom: 20px;
}

.subject-stat-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.stat-icon {
  font-size: 24px;
  color: #409EFF;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.subject-exams {
  margin-bottom: 20px;
}

.subject-exams h3,
.practice-completion h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.practice-stats {
  margin-top: 20px;
}

.practice-stat-item {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.practice-stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.practice-stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.practice-stat-desc {
  font-size: 12px;
  color: #909399;
}

.ai-summary-content {
  display: flex;
  gap: 20px;
}

.ai-avatar {
  flex-shrink: 0;
}

.ai-message {
  flex: 1;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  position: relative;
}

.ai-message::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 20px;
  border-width: 10px 10px 10px 0;
  border-style: solid;
  border-color: transparent #f8f9fa transparent transparent;
}

.ai-message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ai-name {
  font-weight: bold;
  color: #409EFF;
}

.ai-time {
  color: #909399;
  font-size: 12px;
}

.ai-message-content {
  color: #303133;
  line-height: 1.6;
}

.ai-message-content h4 {
  margin: 15px 0 5px;
  color: #606266;
}

.ai-message-content ul {
  padding-left: 20px;
  margin: 5px 0 15px;
}

.timeline-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .student-info-header {
    flex-direction: column;
  }

  .overview-stats {
    flex-direction: column;
  }

  .chart-container {
    flex-direction: column;
  }

  .chart {
    width: 100%;
  }
}
</style>
