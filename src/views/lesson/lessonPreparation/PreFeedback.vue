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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { aiAnalysePreLessonPracticeService } from '@/api/studentPracticeRecord.js'
import { ElMessage } from 'element-plus'
const router = useRouter()
const pieChartRef = ref(null)
const barChartRef = ref(null)
const aiSummary = ref('')
const teacherScheduleId = useRoute().params.teacherScheduleId
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

onMounted(async () => {
  ElMessage.info('正在加载中，请稍后')
  const res = await aiAnalysePreLessonPracticeService(teacherScheduleId,1)
  console.log(res)
  initPieChart(res.data.genChart[0])
  initBarChart(res.data.genChart[1])
  aiSummary.value = res.data.genResult
  ElMessage.success('加载完成')
})
</script>

<style scoped>
.pre-feedback-container {
  padding: 20px;
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
</style>
