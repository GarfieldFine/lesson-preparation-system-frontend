<template>
  <div class="content-area">
    <div class="stats-section">
      <div class="section-header">
        <h2>统计分析</h2>
        <p>课程练习数据可视化分析</p>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <label>时间范围:</label>
          <select v-model="statsFilter.timeRange">
            <option value="week">最近一周</option>
            <option value="month">最近一月</option>
            <option value="semester">本学期</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        <div class="filter-group">
          <label>班级:</label>
          <select v-model="statsFilter.class">
            <option value="all">全部班级</option>
            <option value="class1">高一(1)班</option>
            <option value="class2">高一(2)班</option>
            <option value="class3">高一(3)班</option>
          </select>
        </div>
        <div class="filter-group">
          <label>标签:</label>
          <select v-model="statsFilter.tag">
            <option value="all">全部标签</option>
            <option v-for="(tag, idx) in availableTags" :key="idx" :value="tag">{{ tag }}</option>
          </select>
        </div>
        <button class="btn btn-primary">
          <i class="fas fa-filter"></i> 应用筛选
        </button>
      </div>

      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-card-header">
            <h3>题目回答频次排行</h3>
            <div class="card-actions">
              <i class="fas fa-redo"></i>
              <i class="fas fa-ellipsis-v"></i>
            </div>
          </div>
          <div class="chart-container" ref="answerFrequencyChart"></div>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3>错误率排行</h3>
            <div class="card-actions">
              <i class="fas fa-redo"></i>
              <i class="fas fa-ellipsis-v"></i>
            </div>
          </div>
          <div class="chart-container" ref="errorRateChart"></div>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3>题型分布</h3>
            <div class="card-actions">
              <i class="fas fa-redo"></i>
              <i class="fas fa-ellipsis-v"></i>
            </div>
          </div>
          <div class="chart-container" ref="questionTypeChart"></div>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3>学生进度分布</h3>
            <div class="card-actions">
              <i class="fas fa-redo"></i>
              <i class="fas fa-ellipsis-v"></i>
            </div>
          </div>
          <div class="chart-container" ref="studentProgressChart"></div>
        </div>
      </div>

      <div class="performance-insights">
        <div class="section-header">
          <h2>教学洞察</h2>
        </div>

        <div class="insights-cards">
          <div class="insight-card">
            <div class="insight-icon warning">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="insight-content">
              <h4>需要关注的知识点</h4>
              <p>微分方程解法的应用题错误率超过65%，建议加强教学。</p>
            </div>
            <button class="btn btn-text">查看详情</button>
          </div>

          <div class="insight-card">
            <div class="insight-icon success">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="insight-content">
              <h4>优势知识领域</h4>
              <p>函数图像分析题正确率达90%以上，可以适当提高难度。</p>
            </div>
            <button class="btn btn-text">查看详情</button>
          </div>

          <div class="insight-card">
            <div class="insight-icon info">
              <i class="fas fa-lightbulb"></i>
            </div>
            <div class="insight-content">
              <h4>学习建议</h4>
              <p>基于学生答题数据，建议增加实际应用场景的练习题。</p>
            </div>
            <button class="btn btn-text">查看详情</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const statsFilter = ref({
  timeRange: 'month',
  class: 'all',
  tag: 'all'
});

const availableTags = ref(['微积分', '函数', '高一', '几何', '代数', '概率', '统计', '物理应用']);

const answerFrequencyChart = ref(null);
const errorRateChart = ref(null);
const questionTypeChart = ref(null);
const studentProgressChart = ref(null);

onMounted(() => {
  initCharts();
});

const initCharts = () => {
  // 初始化答题频次图表
  const frequencyChart = echarts.init(answerFrequencyChart.value);
  frequencyChart.setOption({
    title: { text: '题目答题频次TOP10' },
    tooltip: {},
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: ['题目1', '题目2', '题目3', '题目4', '题目5'] },
    series: [{
      type: 'bar',
      data: [234, 187, 156, 123, 98],
      itemStyle: {
        color: '#0284c7'
      }
    }]
  });

  // 初始化错误率图表
  const errorChart = echarts.init(errorRateChart.value);
  errorChart.setOption({
    title: { text: '错误率最高的题目' },
    tooltip: {},
    xAxis: { type: 'value', max: 100 },
    yAxis: { type: 'category', data: ['题目A', '题目B', '题目C', '题目D', '题目E'] },
    series: [{
      type: 'bar',
      data: [85, 72, 68, 65, 60],
      itemStyle: {
        color: '#ef4444'
      }
    }]
  });

  // 初始化题型分布图表
  const typeChart = echarts.init(questionTypeChart.value);
  typeChart.setOption({
    title: { text: '题型分布' },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 435, name: '选择题' },
        { value: 234, name: '填空题' },
        { value: 156, name: '简答题' },
        { value: 98, name: '判断题' }
      ]
    }]
  });

  // 初始化学生进度图表
  const progressChart = echarts.init(studentProgressChart.value);
  progressChart.setOption({
    title: { text: '学生完成进度分布' },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [12, 25, 38, 42, 15],
      itemStyle: {
        color: '#22c55e'
      }
    }]
  });

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    frequencyChart.resize();
    errorChart.resize();
    typeChart.resize();
    progressChart.resize();
  });
};
</script>

<style scoped>
.content-area {
  padding: 24px;
  background: #f8fafc;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.section-header p {
  color: #64748b;
}

.filter-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group label {
  color: #475569;
  font-weight: 500;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  background: white;
  color: #1e293b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stats-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stats-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.stats-card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.card-actions i {
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.card-actions i:hover {
  color: #0284c7;
}

.chart-container {
  height: 300px;
}

.performance-insights {
  margin-top: 32px;
}

.insights-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.insight-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.insight-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.insight-icon.warning {
  background: #fff7ed;
  color: #ea580c;
}

.insight-icon.success {
  background: #f0fdf4;
  color: #16a34a;
}

.insight-icon.info {
  background: #eff6ff;
  color: #2563eb;
}

.insight-content {
  flex: 1;
}

.insight-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.insight-content p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.btn-text {
  color: #0284c7;
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-text:hover {
  color: #0369a1;
  background: #f0f9ff;
  border-radius: 4px;
}
</style>
