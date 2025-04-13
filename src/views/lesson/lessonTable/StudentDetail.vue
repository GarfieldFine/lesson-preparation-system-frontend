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
              <el-tag v-if= "studentInfo.position" type="warning" effect="plain">{{ studentInfo.position }}</el-tag>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
  Position
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
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.chart {
  height: 350px;
  flex: 1;
  min-width: 300px;
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
