<template>
  <div class="post-feedback-container">
    <!-- 导航按钮 -->
    <div class="nav-buttons">
      <el-button type="primary" @click="router.push(`/lesson/pre-feedback/${teacherScheduleId}`)">课前反馈</el-button>
      <el-button type="warning" :disabled="true">课后反馈</el-button>
    </div>

    <!-- 统计图表部分 -->
    <div class="charts-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <div ref="satisfactionChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <div ref="participationChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>学生反馈关键词</span>
                <el-tag type="info" size="small">词频统计</el-tag>
              </div>
            </template>
<!--            <word-cloud :data="predefinedKeywords"></word-cloud>-->
            <div ref="wordCloudChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 学生反馈展示 -->
    <el-card class="feedback-card">
      <template #header>
        <div class="card-header">
          <span>学生反馈</span>
        </div>
      </template>
      <div class="timeline-container">
        <el-timeline>
          <el-timeline-item
            v-for="(feedback, index) in studentFeedbacks"
            :key="index"
            :timestamp="feedback.time"
            :type="getRandomType()"
          >
            <el-card class="feedback-item">
              <template #header>
                <div class="feedback-header">
                  <span> 匿名同学 </span>
                  <el-rate
                    v-model="feedback.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </div>
              </template>
              <p>{{ feedback.content }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- AI 总结部分 -->
    <el-card class="summary-card">
      <template #header>
        <div class="card-header">
          <span><i class="el-icon-s-opportunity"></i> AI 课堂效果总结</span>
          <el-tag type="success" size="small">智能分析</el-tag>
        </div>
      </template>
      <div class="summary-content">
        <el-row>
          <el-col :span="24">
            <div class="ai-message">
              <div class="message-bubble">
                <p v-html="formatAiSummary(aiSummary)"></p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'


import { useRoute, useRouter } from 'vue-router'
import { analysisStudentPostLessonFeedback, getWordCloudInfo } from '@/api/feedback.js'


const router = useRouter()
const satisfactionChartRef = ref(null)
const participationChartRef = ref(null)
const wordCloudChartRef = ref(null)

const aiSummary = ref('本节课学生参与度较高，课堂氛围活跃。根据统计，90%的学生能够积极参与课堂互动，85%的学生对课程内容表示满意。建议在下次课程中增加更多实践环节，进一步提高学习效果。')
const teacherScheduleId = useRoute().params.teacherScheduleId
const studentFeedbacks = ref([
  {
    studentName: '匿名同学',
    time: '2024-03-15 14:30',
    rating: 5,
    content: '今天的课程很有趣，老师讲解得非常清楚，特别是实践部分收获很大。'
  },
  {
    studentName: '匿名同学',
    time: '2024-03-15 14:28',
    rating: 4,
    content: '课程内容充实，但是感觉节奏稍快，希望能多一些练习时间。'
  },
  {
    studentName: '匿名同学',
    time: '2024-03-15 14:25',
    rating: 4.5,
    content: '整体不错，建议增加一些实际案例分析。'
  },
  {
    studentName: '匿名同学',
    time: '2024-03-15 14:25',
    rating: 4.5,
    content: '整体不错，建议增加一些实际案例分析。'
  },
  {
    studentName: '匿名同学',
    time: '2024-03-15 14:25',
    rating: 4.5,
    content: '整体不错，建议增加一些实际案例分析。'
  },
])

// 初始化满意度图表
const initSatisfactionChart = (res) => {
  const chart = echarts.init(satisfactionChartRef.value)
  const option = {
    title: {
      text: '课程满意度分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: res.satisfactionList[3], name: '非常满意' },
          { value: res.satisfactionList[2], name: '满意' },
          { value: res.satisfactionList[1], name: '一般' },
          { value: res.satisfactionList[0], name: '不满意' }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 初始化参与度图表
const initParticipationChart = (res) => {
  const chart = echarts.init(participationChartRef.value)
  const option = {
    title: {
      text: '课堂参与度指标',
      left: 'center'
    },
    radar: {
      indicator: [
        { name: '回答问题', max: 5 },
        { name: '课堂讨论', max: 5 },
        { name: '实践参与', max: 5 },
        { name: '笔记记录', max: 5 },
        { name: '互动反馈', max: 5 }
      ]
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [res.indicatorList[0], res.indicatorList[1], res.indicatorList[2], res.indicatorList[3], res.indicatorList[4]],
            name: '参与度指标'
          }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 添加随机类型生成函数
const getRandomType = () => {
  const types = ['success', 'warning', 'danger', 'info', 'primary']
  return types[Math.floor(Math.random() * types.length)]
}

// 格式化AI总结内容，突出显示关键数据和建议
const formatAiSummary = (text) => {
  if (!text) return '';

  // 替换百分比数据为带颜色的突出显示
  let formatted = text.replace(/(\d+)%/g, '<span class="highlight-percent">$1%</span>');

  // 将"建议"部分用特殊样式突出
  if (formatted.includes('建议')) {
    const parts = formatted.split('建议');
    if (parts.length > 1) {
      formatted = parts[0] + '<div class="suggestion-section"><span class="suggestion-label">建议</span>' + parts[1] + '</div>';
    }
  }

  return formatted;
}
const predefinedKeywords = ref([
  { name: '课程内容', value: 3000 },
  { name: '讲解清晰', value: 2800 },
  { name: '实践环节', value: 2600 },
  { name: '互动性', value: 2400 },
  { name: '有趣', value: 2200 },
  { name: '案例分析', value: 2000 },
  { name: '节奏适中', value: 1800 },
  { name: '收获很大', value: 1600 },
  { name: '教学方法', value: 1400 },
  { name: '课堂氛围', value: 1200 },
  { name: '知识点', value: 1000 },
  { name: '练习时间', value: 900 },
  { name: '理解深入', value: 800 },
  { name: '思路清晰', value: 700 },
  { name: '难度适中', value: 600 },
  { name: '生动形象', value: 500 },
  { name: '启发思考', value: 450 },
  { name: '实用性强', value: 400 },
  { name: '课件设计', value: 350 },
  { name: '提问方式', value: 300 },
  { name: '反馈及时', value: 250 },
  { name: '学习效果', value: 200 }
]);

// 初始化词云图
const initWordCloudChart = () => {
  // 使用预设的关键词数据，确保词云图能够正确显示

  if(wordCloudChartRef.value){
    const chart = echarts.init(wordCloudChartRef.value);
    const option = {
      series: [{
        type: 'wordCloud',
        shape: 'star',
        left: 'center',
        top: 'center',
        width: '80%',
        height: '80%',
        right: null,
        bottom: null,
        sizeRange: [12, 50],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            return getRandomColor();
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        data: predefinedKeywords.value
      }]
    };

    chart.setOption(option)
  }

}

// 生成随机颜色
const getRandomColor = () => {
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
  return colors[Math.floor(Math.random() * colors.length)];
};

onMounted(async () => {
  try {
    const res = await analysisStudentPostLessonFeedback(teacherScheduleId)
    initSatisfactionChart(res.data)
    initParticipationChart(res.data)
    // 确保即使没有反馈数据也能显示词云图
    const res1 = await getWordCloudInfo()
    predefinedKeywords.value = res1.data
    initWordCloudChart()
    studentFeedbacks.value = res.data.studentFeedbacks
    aiSummary.value = res.data.aiSummary
  } catch (error) {
    console.error('获取反馈数据失败:', error)
    ElMessage.error('获取反馈数据失败，请稍后再试')
  }
})
</script>

<style scoped>
.post-feedback-container {
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

.summary-card,
.feedback-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.card-header i {
  margin-right: 8px;
  color: #409EFF;
}

.summary-content {
  line-height: 1.8;
  color: #333;
  padding: 10px 0;
}

.ai-avatar {
  float: left;
  margin-right: 15px;
}

.ai-message {
  overflow: hidden;
}

.message-bubble {
  background-color: #f0f9ff;
  border-radius: 12px;
  padding: 15px 20px;
  position: relative;
  margin-bottom: 15px;
  border-left: 4px solid #409EFF;
}

.message-bubble:before {
  content: '';
  position: absolute;
  left: -12px;
  top: 15px;
  border-width: 8px;
  border-style: solid;
  border-color: transparent #f0f9ff transparent transparent;
}

.highlight-percent {
  font-weight: bold;
  color: #f56c6c;
  background-color: rgba(245, 108, 108, 0.1);
  padding: 2px 5px;
  border-radius: 4px;
}

.suggestion-section {
  margin-top: 10px;
  padding: 10px;
  background-color: #f2f6fc;
  border-radius: 6px;
  border-left: 3px solid #67c23a;
}

.suggestion-label {
  font-weight: bold;
  color: #67c23a;
  margin-right: 5px;
}

.summary-content {
  line-height: 1.6;
  color: #666;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feedback-item {
  margin-bottom: 10px;
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

.timeline-container {
  height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

/* 自定义滚动条样式 */
.timeline-container::-webkit-scrollbar {
  width: 6px;
}

.timeline-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

/* 隐藏 Firefox 滚动条 */
.timeline-container {
  scrollbar-width: thin;
  scrollbar-color: #dcdfe6 #f1f1f1;
}
</style>
