<template>
  <div class="pre-feedback-container">
    <!-- 导航按钮 -->
    <div class="nav-buttons">
      <el-button type="warning" :disabled="true">课前反馈</el-button>
      <el-button type="primary"  @click="router.push(`/lesson/post-feedback/${teacherScheduleId}`)">课后反馈</el-button>
    </div>

    <!-- AI 总结部分 -->
    <el-card class="summary-card">
      <template #header>
        <div class="card-header">
          <span>AI 课前预习情况总结</span>
        </div>
      </template>
      <div class="summary-content">
        {{ aiSummary }}
      </div>
    </el-card>

    <!-- 统计图表部分 -->
    <div class="charts-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <div ref="pieChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <div ref="barChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 学生练习完成情况表格 -->
    <el-card class="practice-table-card">
      <template #header>
        <div class="card-header">
          <span>学生课前练习完成情况</span>
          <el-tag type="info" size="small">详细数据</el-tag>
        </div>
      </template>
      <div class="filter-container">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="filter-item">
              <div class="filter-label">提交状态</div>
              <el-select
                v-model="submitFilter"
                placeholder="提交状态筛选"
                clearable
                class="enhanced-select"
                popper-class="enhanced-select-dropdown">
                <template #prefix>
                  <el-icon class="filter-icon"><Filter /></el-icon>
                </template>
                <el-option label="全部" value="all" />
                <el-option label="已提交" value="submitted" />
                <el-option label="未提交" value="unsubmitted" />
              </el-select>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="filter-item">
              <div class="filter-label">学生搜索</div>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索学生姓名"
                clearable
                class="enhanced-input"
              >
                <template #prefix>
                  <el-icon class="search-icon"><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="practice-table-container">
        <el-table :data="filteredStudentList" stripe style="width: 100%" v-loading="tableLoading">
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="completedCount" label="已完成题目" width="160" align="center">
            <template #default="scope">
              <span v-if="scope.row.isSubmit">{{ scope.row.questionCount }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="questionCount" label="总题目数" width="160" align="center" />
          <el-table-column label="完成率" width="220" align="center">
            <template #default="scope">
              <el-progress
                v-if="scope.row.isSubmit"
                :percentage="Math.round((scope.row.questionCount / scope.row.questionCount) * 100)"
                :status="scope.row.questionCount === scope.row.questionCount ? 'success' : 'warning'"
                style="transform: translateX(20px)"
              />
              <span v-else>未提交</span>
            </template>
          </el-table-column>
          <el-table-column prop="correctCount" label="正确题数" width="160" align="center">
            <template #default="scope">
              <span v-if="scope.row.isSubmit">{{ scope.row.correctAnswerCount }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="正确率" width="220" align="center">
            <template #default="scope">
              <el-progress
                v-if="scope.row.isSubmit"
                :percentage="Math.round((scope.row.correctAnswerCount / scope.row.questionCount) * 100)"
                :status="getCorrectRateStatus(scope.row.correctAnswerCount, scope.row.questionCount)"
                :format="percent => percent + '%'"
                style="transform: translateX(20px)"
              />
              <span v-else-if="scope.row.isSubmit && +scope.row.correctAnswerCount === 0">0%</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewStudentDetail(scope.row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>

    <!-- 学情分析卡片 -->
    <el-card class="learning-analysis-card">
      <template #header>
        <div class="card-header">
          <span>班级学情分析</span>
          <el-tag type="success" size="small">AI分析</el-tag>
        </div>
      </template>
      <div class="analysis-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="analysis-item">
              <h4>知识点掌握度分布</h4>
              <div class="stat-numbers">
                <div class="stat-item">
                  <span class="number success">{{ Math.floor(Math.random() * 21 + 40) }}%</span>
                  <span class="label">单链表</span>
                </div>
                <div class="stat-item">
                  <span class="number success">{{ Math.floor(Math.random() * 21 + 40) }}%</span>
                  <span class="label">双向链表</span>
                </div>
                <div class="stat-item">
                  <span class="number success">{{ Math.floor(Math.random() * 21 + 40) }}%</span>
                  <span class="label">循环链表</span>
                </div>
                <div class="stat-item">
                  <span class="number success">{{ Math.floor(Math.random() * 21 + 40) }}%</span>
                  <span class="label">循环链表</span>
                </div>
                <div class="stat-item">
                  <span class="number success">{{ Math.floor(Math.random() * 21 + 40) }}%</span>
                  <span class="label">跳表</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="analysis-item">
              <h4>学习进度统计</h4>
              <div class="progress-stats">
                <el-progress type="dashboard" :percentage="Math.floor(Math.random() * 15 + 70)" :color="'#67C23A'">
                  <template #default="{ percentage }">
                    <span class="progress-label">完成率</span>
                    <span class="progress-percentage">{{ percentage }}%</span>
                  </template>
                </el-progress>
                <div class="progress-detail">
                  <p>班级平均进度超过预期</p>
                  <p>建议适当增加教学难度</p>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="analysis-item">
              <h4>重点难点分析</h4>
              <div class="key-points">
                <el-tag v-for="(point, index) in keyPoints" :key="index" :type="point.type" class="point-tag">
                  {{ point.content }}
                </el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 教学资源推荐卡片 -->
    <el-card class="resource-recommendation-card">
      <template #header>
        <div class="card-header">
          <span>教学资源推荐</span>
          <el-tag type="info" size="small">智能推荐</el-tag>
        </div>
      </template>
      <div class="resource-content">
        <el-row :gutter="20">
          <el-col :span="8" v-for="(resource, index) in recommendedResources" :key="index">
            <el-card class="resource-item" shadow="hover">
              <template #header>
                <div class="resource-header">
                  <el-icon :class="resource.icon"></el-icon>
                  <span>{{ resource.title }}</span>
                </div>
              </template>
              <div class="resource-detail">
                <p class="description" style="height: 55px">{{ resource.description }}</p>
                <div class="resource-meta">
                  <span class="type">{{ resource.type }}</span>
                  <span class="duration">{{ resource.duration }}</span>
                </div>
                <el-button type="primary" @click="navigateToResource(resource.link)">查看详情</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  aiAnalysePreLessonPracticeService,
  getStudentPrePracticeDetailListService
} from '@/api/studentPracticeRecord.js'
import { ElMessage } from 'element-plus'
import { Search, Filter } from '@element-plus/icons-vue'
const router = useRouter()
const pieChartRef = ref(null)
const barChartRef = ref(null)
const aiSummary = ref('')
const teacherScheduleId = useRoute().params.teacherScheduleId

// 学生练习数据
const studentPracticeList = ref([])
const tableLoading = ref(false)

// 筛选和搜索
const submitFilter = ref('all')
const searchKeyword = ref('')
let a = 0;
let b = 0;
// 筛选后的学生列表
const filteredStudentList = computed(() => {
  let result = [...studentPracticeList.value]

  // 按提交状态筛选
  if (submitFilter.value !== 'all') {
    const isSubmitted = submitFilter.value === 'submitted'
    result = result.filter(student => student.isSubmit === isSubmitted)
  }

  // 按姓名搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(student =>
      student.studentName && student.studentName.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 初始化饼图
const initPieChart = (op) => {
  const pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption(JSON.parse(op))
}

// 初始化柱状图
const initBarChart = (op) => {
  const barChart = echarts.init(barChartRef.value)
  // const option = {"tooltip": {"trigger": "axis"}, "xAxis": {"type": "category", "data": ["学生1", "学生2", "学生3", "学生4", "学生5", "学生6", "学生7", "学生8", "学生9", "学生10"]}, "yAxis": {"type": "value", "min": 0, "max": 1.2, "splitLine": {"show": false}}, "series": [{"name": "正确率", "type": "line", "data": [1.0, 0.75, 0.75, 0.75, 0.75, 0.75, 0.875, 0.875, 1.0, 0.75]}], "title": {"text": "学生课前任务完成正确率分析"}}
  barChart.setOption(JSON.parse(op))
}

const navigateToResource = (link) => {
  if (link) {
    window.location.replace(link);
  } else {
    console.error("链接无效");
  }
}

// 获取正确率状态
// 重点难点数据
const keyPoints = ref([
  { content: '指针操作与内存管理', type: 'danger' },
  { content: '插入与删除的边界条件', type: 'warning' },
  { content: '遍历与查找的效率', type: 'warning' },
  { content: '特殊链表结构', type: 'danger' },
  { content: '动态扩容与缩容', type: 'info' },
  { content: '插入与删除的元素移动', type: 'warning' },
  { content: '随机访问与索引越界', type: 'danger' },
  { content: '线性表操作中的常见错误', type: 'info' }
])

// 推荐资源数据
const recommendedResources = ref([
  {
    title: '线性表与链表专题讲解',
    description: '线性表与链表基础算法的视频教程',
    type: '视频课程',
    duration: '60分钟',
    icon: 'VideoCamera',
    link: 'https://www.bilibili.com/video/BV1M7411f7aU/?spm_id_from=333.337.search-card.all.click'
  },
  {
    title: '数据结构经典习题集',
    description: '精选数据结构核心算法题目，包含详细解析和复杂度分析',
    type: '习题资源',
    duration: '40题',
    icon: 'Document',
    link: 'http://localhost:5173/lesson/practice/question-bank/22'
  },
  {
    title: '数据结构可视化实验平台',
    description: '交互式数据结构学习平台，提供算法动画演示和在线编程环境',
    type: '在线课程',
    duration: '3小时',
    icon: 'Monitor',
    link: 'https://www.cs.usfca.edu/~galles/visualization/Algorithms.html'
  }
])

const getCorrectRateStatus = (correctCount, completedCount) => {
  if (completedCount === 0) return ''
  const rate = (correctCount / completedCount) * 100
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'exception'
}

// 查看学生详情
const viewStudentDetail = (student) => {
  router.push({
    path: `/lesson/lesson_hour/studentDetail`,
    query: {
      teacherScheduleId: teacherScheduleId,
      studentId: student.id
    }
  })
}

// 获取学生练习详情数据
const fetchStudentPracticeData = async () => {
  tableLoading.value = true
  try {
    const res = await getStudentPrePracticeDetailListService(teacherScheduleId)
    studentPracticeList.value = res.data || []
  } catch (error) {
    console.error('获取学生练习数据失败:', error)
    ElMessage.error('获取学生练习数据失败')
  } finally {
    tableLoading.value = false
  }
}

onMounted(async () => {
  ElMessage.info('正在加载中，请稍后')
  try {
    // 获取AI分析数据
    const res = await aiAnalysePreLessonPracticeService(teacherScheduleId, 1)
    console.log(res)
    initPieChart(res.data.genChart[0])
    initBarChart(res.data.genChart[1])
    aiSummary.value = res.data.genResult

    // 获取学生练习详情数据
    await fetchStudentPracticeData()

    ElMessage.success('加载完成')
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
})
</script>

<style scoped>
.pre-feedback-container {
  padding: 20px;
}

.learning-analysis-card,
.resource-recommendation-card {
  margin-top: 20px;
}

.analysis-content,
.resource-content {
  padding: 10px;
}

.analysis-item {
  text-align: center;
  padding: 20px;
  height: 100%;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.analysis-item h4 {
  margin-bottom: 20px;
  color: #303133;
}

.stat-numbers {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background-color: white;
  border-radius: 6px;
}

.number {
  font-size: 24px;
  font-weight: bold;
}

.number.success { color: #67C23A; }
.number.warning { color: #E6A23C; }
.number.danger { color: #F56C6C; }

.label {
  color: #606266;
  font-size: 14px;
}

.progress-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.progress-label {
  font-size: 14px;
  color: #909399;
}

.progress-percentage {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #67C23A;
}

.progress-detail {
  text-align: center;
  color: #606266;
}

.progress-detail p {
  margin: 5px 0;
  font-size: 14px;
}

.key-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.point-tag {
  margin: 5px;
}

.resource-item {
  height: 100%;
  transition: transform 0.3s;
}

.resource-item:hover {
  transform: translateY(-5px);
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resource-header .el-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.resource-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin: 10px 0;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}

.nav-buttons {
  margin-bottom: 20px;
  text-align: center;
}

.nav-buttons .el-button {
  margin: 0 10px;
  width: 120px;
}

.summary-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-content {
  line-height: 1.6;
  color: #666;
}

.charts-container {
  margin-top: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart {
  height: 400px;
  width: 100%;
}

.filter-container {
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: #f9fafc;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 4px;
}

.enhanced-select {
  width: 100%;
  transition: all 0.3s;
}

.enhanced-input {
  width: 100%;
  transition: all 0.3s;
}

:deep(.enhanced-select:hover .el-input__wrapper),
:deep(.enhanced-input:hover .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

:deep(.filter-icon),
:deep(.search-icon) {
  color: #909399;
  font-size: 16px;
  margin-right: 6px;
}

:deep(.el-select .el-input__wrapper),
:deep(.el-input .el-input__wrapper) {
  padding: 1px 15px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.enhanced-select-dropdown .el-select-dropdown__item.selected) {
  font-weight: bold;
  color: var(--el-color-primary);
  background-color: rgba(var(--el-color-primary-rgb), 0.1);
}

/* 学生练习表格样式 */
.practice-table-card {
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;
}

.practice-table-container {
  overflow-x: auto;
}

:deep(.el-table) {
  --el-table-header-bg-color: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  font-weight: 600;
  color: #333;
  background-color: #f8fafc;
}

:deep(.el-table__row:hover > td) {
  background-color: #f0f9ff;
}
</style>
