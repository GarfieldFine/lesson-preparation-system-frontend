<template>
  <div class="exam-gen-container">
    <div class="main-content">
      <div class="left-panel">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <h2>考试配置</h2>
              <el-tag type="success" effect="dark">AI辅助出题</el-tag>
            </div>
          </template>

          <el-form :model="examConfig" label-position="top" :rules="rules" ref="examFormRef">
            <el-form-item label="考试名称" prop="examName">
              <el-input v-model="examConfig.examName" placeholder="请输入考试名称"></el-input>
            </el-form-item>

            <el-form-item label="考试类型" prop="examType">
              <el-select v-model="examConfig.type" placeholder="请选择" style="width: 240px">
                <el-option
                  v-for="item in examConfigTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="考核章节" prop="selectedChapters">
              <el-card v-loading="loadingChapters">
              <el-scrollbar height="200px" class="chapters-scrollbar">
                <el-checkbox-group v-model="examConfig.selectedChapters">
                  <el-checkbox
                      v-for="chapter in courseChapters"
                      :key="chapter"
                      :label="chapter"
                      class="chapter-checkbox"
                  >
                    {{ chapter }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-scrollbar>
              </el-card>
            </el-form-item>

            <el-divider content-position="center">
              <div class="divider-content">
                <el-icon class="divider-icon"><Document /></el-icon>
                <span>题型设置</span>
              </div>
            </el-divider>

            <div class="question-types">
              <el-row :gutter="20">
                <el-col :span="12" v-for="(item, index) in questionTypes" :key="index">
                  <el-form-item :label="item.label" :prop="'questionCounts.' + index">
                    <el-input-number
                      v-model="examConfig.questionCounts[index]"
                      :min="0"
                      :max="20"
                      :step="1"
                      controls-position="right"
                      class="question-count-input"
                    ></el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <el-divider content-position="center">
              <div class="divider-content">
                <el-icon class="divider-icon"><Setting /></el-icon>
                <span>考试设置</span>
              </div>
            </el-divider>

            <el-form-item label="难易程度" prop="difficulty">
              <el-slider
                v-model="examConfig.difficulty"
                :marks="difficultyMarks"
                :step="1"
                :min="1"
                :max="5"
                show-stops
              ></el-slider>
            </el-form-item>

            <el-form-item label="考试时长(分钟)" prop="duration" style="margin-top: 40px">
              <el-input-number
                v-model="examConfig.duration"
                :min="15"
                :max="180"
                :step="5"
                controls-position="right"
              ></el-input-number>
            </el-form-item>

            <el-form-item label="考试开始时间" prop="startTime">
              <el-date-picker
                v-model="examConfig.startTime"
                type="datetime"
                placeholder="选择考试开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled-date="disabledDate"
                :disabled-hours="disabledHours"
              ></el-date-picker>
            </el-form-item>

            <el-form-item label="考试开始时间" prop="endTime">
              <el-date-picker
                v-model="examConfig.endTime"
                type="datetime"
                placeholder="选择考试开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled-date="disabledDate"
                :disabled-hours="disabledHours"
              ></el-date-picker>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="generating" @click="generateExam" class="generate-btn">
                {{ generating ? '生成中...' : '生成考试' }}
                <el-icon class="el-icon--right"><MagicStick /></el-icon>
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="stats-card" v-if="showStats">
          <template #header>
            <div class="card-header">
              <h3>考试统计</h3>
            </div>
          </template>
          <div class="chart-container" ref="pieChartRef"></div>
        </el-card>
      </div>

      <div class="right-panel">
        <el-card class="suggestion-card">
          <template #header>
            <div class="card-header">
              <h2>考试大纲</h2>
              <el-tag type="success" effect="dark">AI智能生成</el-tag>
            </div>
          </template>

          <div v-if="!examGenerated" class="empty-suggestion">
            <el-empty description="暂无考试大纲，请先生成考试">
              <el-button type="primary" @click="generateExam">立即生成</el-button>
            </el-empty>
          </div>

          <div v-else class="suggestion-content">
            <div class="suggestion-section">
              <div class="section-header">
                <el-icon class="section-icon"><Document /></el-icon>
                <h3>考试目标</h3>
              </div>
              <el-divider content-position="left"><el-icon><Star /></el-icon></el-divider>
              <div class="suggestion-items">
                <div class="suggestion-item">
                  <el-icon class="item-icon"><Aim /></el-icon>
                  <div class="item-content">
                    <h4>考核目的</h4>
                    <p>本次<span class="highlight">{{ examConfigTypeOptions[examConfig.type].label }}</span>旨在全面考察学生对课程知识点的掌握程度，重点评估学生的理解能力、应用能力和分析能力。</p>
                  </div>
                </div>
                <div class="suggestion-item">
                  <el-icon class="item-icon"><Warning /></el-icon>
                  <div class="item-content">
                    <h4>难度设置</h4>
                    <p>考试整体难度为<span class="highlight">{{ difficultyMarks[examConfig.difficulty] }}</span>，题型分布合理，确保能够区分不同水平的学生。</p>
                  </div>
                </div>
                <div class="suggestion-item">
                  <el-icon class="item-icon"><Timer /></el-icon>
                  <div class="item-content">
                    <h4>时间安排</h4>
                    <p>考试时长<span class="highlight">{{ examData.questionTotalTime }}分钟</span>，各题型分值比例：选择题30%，填空题20%，判断题20%，简答题30%。</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="suggestion-section">
              <div class="section-header">
                <el-icon class="section-icon"><Reading /></el-icon>
                <h3>考核内容</h3>
              </div>
              <el-divider content-position="left"><el-icon><Star /></el-icon></el-divider>
              <div class="suggestion-items">
                <div class="suggestion-item" v-for="(chapter, index) in examOutline.chapters" :key="index">
                  <el-icon class="item-icon"><Notebook /></el-icon>
                  <div class="item-content">
                    <h4>{{ chapter.chapterName }}</h4>
                    <p>{{ chapter.Emphasis }}</p>
                    <div class="knowledge-points">
                      <el-tag v-for="(point, pIndex) in chapter.points" :key="pIndex" size="small" effect="plain" class="knowledge-tag">{{ point }}</el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <el-button type="primary" class="view-detail-btn" @click="viewExamDetail">
              查看完整考试内容
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 悬浮按钮 -->
    <div
      class="floating-btn"
      :class="{ 'pulse': showPulse, 'visible': examGenerated }"
      @click="viewExamDetail"
    >
      <el-icon><View /></el-icon>
      <span>查看详情</span>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="考试详情"
      width="80%"
      top="5vh"
      :before-close="handleDialogClose"
    >
      <div class="exam-detail-content">
        <h1 class="exam-title">{{ examData.examName }}</h1>
        <div class="exam-info">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="考试时长">{{ examData.questionTotalTime }}分钟</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDateTime(examData.dueAt) }}</el-descriptions-item>
            <el-descriptions-item label="难度等级">
              <el-rate
                v-model="examData.difficulty"
                disabled
                text-color="#ff9900"
                score-template="{value}"
              ></el-rate>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="question-distribution">
          <h3>题目分布</h3>
          <div class="distribution-chart" ref="dialogChartRef"></div>
        </div>

        <div class="exam-preview-section">
          <h3>考试预览</h3>
          <div class="exam-preview-content">
            <div v-for="(type, typeIndex) in questionTypes" :key="typeIndex" class="question-section" v-show="examData.questions.filter(q => q.type === typeIndex+1).length > 0">
              <h2 class="section-title">{{ getRomanNumeral(typeIndex + 1) }}、{{ type.label }}（{{ examData.questions.filter(q => q.type === typeIndex+1).length }}题）</h2>

              <div v-for="(question, qIndex) in examData.questions.filter(q => q.type === typeIndex+1)" :key="qIndex" class="question-item">
                <div class="question-header">
                  <span class="question-number">{{ qIndex + 1 }}.</span>
                  <div class="question-content" v-html="question.content"></div>
                </div>

                <!-- 选择题 -->
                <div v-if="+question.type === 1" class="options-container">
                  <div v-for="(option, oIndex) in question.options" :key="oIndex" class="option-item" :class="{ 'correct-option': question.answer === String.fromCharCode(65 + oIndex) }">
                    <span class="option-label">{{ String.fromCharCode(65 + oIndex) }}.</span>
                    <span class="option-content">{{ option.split('.')[1] }}</span>
                  </div>
                  <div class="answer-section">
                    <span class="answer-label">正确答案:</span>
                    <span class="answer-content">{{ question.answer }}</span>
                  </div>
                </div>

                <!-- 填空题 -->
                <div v-else-if="+question.type === 2" class="blank-container">
                  <div class="essay-answer">
                    <p class="answer-label">参考答案:</p>
                    <div class="answer-content" v-html="question.answer"></div>
                  </div>
                </div>

                <!-- 判断题 -->
                <div v-else-if="+question.type === 3" class="judge-container">
                  <div class="answer-section">
                    <span class="answer-label">正确答案:</span>
                    <span class="answer-content">{{ question.answer ? '正确' : '错误' }}</span>
                  </div>
                </div>

                <!-- 简答题 -->
                <div v-else-if="+question.type === 4" class="essay-container">
                  <div class="essay-answer">
                    <p class="answer-label">参考答案:</p>
                    <div class="answer-content" v-html="question.answer"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>


      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="saveExam">
            保存考试
            <el-icon class="el-icon--right"><Check /></el-icon>
          </el-button>
          <el-button type="success" @click="exportExam">
            导出考试
            <el-icon class="el-icon--right"><Download /></el-icon>
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  MagicStick,
  View,
  Check,
  Download,
  Document,
  Star,
  Warning,
  Timer,
  Aim,
  Reading,
  ArrowRight,
  Setting,
  Notebook
} from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { format } from 'date-fns';
import {
  AiGenerateExamQuestionService,
  getQuestionsByExamQuestionGroupsIdControllerService,
  getCourseChaptersService, confirmAiGenerateExamQuestionService
} from '@/api/ExamQuestionGroup.js'

// 注册 ECharts 组件
echarts.use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

//
const  examQuestionGroupId = ref();

const loadingChapters = ref(true);

const examConfigTypeOptions = [
  { label: '期中考试', value: 0 },
  { label: '期末考试', value: 1 }
]
// 题型定义
const questionTypes = [
  { label: '选择题', value: 1, color: '#5470c6' },
  { label: '填空题', value: 2, color: '#91cc75' },
  { label: '判断题', value: 3, color: '#fac858' },
  { label: '简答题', value: 4, color: '#ee6666' }
];

// 难度标记
const difficultyMarks = {
  1: '简单',
  2: '较简单',
  3: '中等',
  4: '较难',
  5: '困难'
};

// 表单引用
const examFormRef = ref(null);

// 表单验证规则
const rules = {
  examName: [
    { required: true, message: '请输入考试名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请设置考试时长', trigger: 'change' },
    { type: 'number', min: 15, message: '考试时长不能少于15分钟', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择考试开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择考试结束时间', trigger: 'change' }
  ]
};

// 考试配置
const examConfig = reactive({
  examName: '',
  questionCounts: [1, 1, 1, 1], // 默认题目数量 [选择题, 填空题, 判断题, 简答题]
  difficulty: 3, // 默认中等难度
  duration: 60, // 默认60分钟
  type: 0, // 考试类型
  startTime: null,
  endTime: null,
  selectedChapters: [] // 选中的章节ID列表
});

// 课程章节列表
const courseChapters = ref([]);

// 考试大纲数据
const examOutline = reactive({
  goal: '',
  chapters: []
});

// 考试数据
const examData = reactive({
  lessonPreparationRecordId: 1,
  title: '',
  questionTotalTime: 0,
  choiceQuestionCount: 0,
  fillInQuestionCount: 0,
  judgementQuestionCount: 0,
  shortAnswerQuestionCount: 0,
  difficulty: 0,
  type: 0,
  dueAt: '',
  createdAt: '',
  questions: []
});

// 状态变量
const generating = ref(false);
const examGenerated = ref(false);
const showPulse = ref(false);
const detailDialogVisible = ref(false);
const previewStatus = ref('等待生成');
const showStats = ref(false);

// 图表引用
const pieChartRef = ref(null);
const dialogChartRef = ref(null);
let pieChart = null;
let dialogChart = null;

// 日期时间选择器限制
const disabledDate = (time) => {
  return time.getTime() < Date.now();
};

const disabledHours = () => {
  const hours = [];
  for (let i = 0; i < 8; i++) {
    hours.push(i);
  }
  return hours;
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  try {
    if (typeof dateTime === 'string') {
      return dateTime.replace('T', ' ').substring(0, 16);
    }
    return format(new Date(dateTime), 'yyyy-MM-dd HH:mm');
  } catch (error) {
    return dateTime;
  }
};

// 罗马数字转换
const getRomanNumeral = (num) => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return romanNumerals[num - 1] || num.toString();
};

// 加载课程章节
const loadCourseChapters = async () => {

  try {
    const res = await getCourseChaptersService(1); // todo
    courseChapters.value = res.data;
    // 默认全选章节
    // examConfig.selectedChapters = courseChapters.value.map(chapter => chapter.id);
    examConfig.selectedChapters = courseChapters.value;
  } catch (error) {
    console.error('获取课程章节失败:', error);
    ElMessage.error('获取课程章节失败，请重试');
  }
};

// 生成考试大纲
const generateExamOutline = async () => {
  if (!examGenerated.value) return;

  try {
    const outlineData = {
      examName: examConfig.examName,
      difficulty: examConfig.difficulty,
      type: examConfig.type,
      chapters: examConfig.selectedChapters
    };

    setDefaultOutline();

    // const res = await AiGenerateExamOutlineService(outlineData);
    // const res = '';
    //
    // if (res.data) {
    //   examOutline.goal = res.data.goal || '';
    //   examOutline.chapters = res.data.chapters || [];
    // }
  } catch (error) {
    console.error('生成考试大纲失败:', error);
    ElMessage.warning('生成考试大纲失败，将显示默认大纲');
    // 设置默认大纲数据
    // setDefaultOutline();
  }
};

// 设置默认大纲数据
// const setDefaultOutline = () => {
//   examOutline.goal = `全面考核学生对${examConfig.examName}的掌握程度`;
//   examOutline.chapters = courseChapters.value
//     .filter(chapter => examConfig.selectedChapters.includes(chapter))
//     .map(chapter => ({
//       name: chapter,
//       description: `考核学生对${chapter}相关知识点的理解和应用能力。`,
//       points: ['基础概念', '核心原理', '实际应用']
//     }));
// };

// 生成考试
const generateExam = async () => {
  // 表单验证
  if (!examFormRef.value) return;

  await examFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请完善考试配置信息');
      return;
    }

    // 检查是否至少选择了一种题型
    const totalQuestions = examConfig.questionCounts.reduce((sum, count) => sum + count, 0);
    if (totalQuestions === 0) {
      ElMessage.error('请至少选择一种题型');
      return;
    }

    // 检查是否选择了章节
    if (examConfig.selectedChapters.length === 0) {
      ElMessage.error('请至少选择一个考核章节');
      return;
    }

    generating.value = true;
    previewStatus.value = '生成中...';

    try {
      // 准备考试数据
      examData.title = examConfig.examName;
      examData.questionTotalTime = examConfig.duration;
      examData.difficulty = examConfig.difficulty;
      examData.dueAt = examConfig.endTime;
      examData.createdAt = examConfig.startTime;
      examData.type = examConfig.type;
      examData.choiceQuestionCount = examConfig.questionCounts[0];
      examData.fillInQuestionCount = examConfig.questionCounts[1];
      examData.judgementQuestionCount = examConfig.questionCounts[2];
      examData.shortAnswerQuestionCount = examConfig.questionCounts[3];
      examData.chapters = examConfig.selectedChapters; // 添加选中的章节ID

      const res = await AiGenerateExamQuestionService(examData);
      examQuestionGroupId.value = res.data.examQuestionGroupsId

      examOutline.chapters = res.data.syllabus
      // 更新状态
      examGenerated.value = true;
      previewStatus.value = '已生成';
      showStats.value = true;

      // 生成考试大纲
      // await generateExamOutline();

      // 显示脉冲动画
      showPulse.value = true;
      setTimeout(() => {
        showPulse.value = false;
      }, 3000);

      // 初始化图表
      nextTick(() => {
        initPieChart();
      });

      ElMessage.success('考试内容生成成功！');
    } catch (error) {
      console.error('生成考试失败:', error);
      ElMessage.error('生成考试失败，请重试');
      previewStatus.value = '生成失败';
    } finally {
      generating.value = false;
    }
  });
};

// 模拟生成题目
const generateMockQuestions = () => {
  const questions = [];

  // 生成选择题
  for (let i = 0; i < examConfig.questionCounts[0]; i++) {
    questions.push({
      type: 0,
      content: `这是第${i + 1}道选择题，请选择正确的选项。`,
      options: ['选项A的内容', '选项B的内容', '选项C的内容', '选项D的内容'],
      answer: String.fromCharCode(65 + Math.floor(Math.random() * 4)) // A, B, C, D
    });
  }

  // 生成填空题
  for (let i = 0; i < examConfig.questionCounts[1]; i++) {
    questions.push({
      type: 1,
      content: `这是第${i + 1}道填空题，请填写正确的答案。`,
      blanks: ['填空1的答案', '填空2的答案']
    });
  }

  // 生成判断题
  for (let i = 0; i < examConfig.questionCounts[2]; i++) {
    questions.push({
      type: 2,
      content: `这是第${i + 1}道判断题，请判断对错。`,
      answer: Math.random() > 0.5 // true or false
    });
  }

  // 生成简答题
  for (let i = 0; i < examConfig.questionCounts[3]; i++) {
    questions.push({
      type: 3,
      content: `这是第${i + 1}道简答题，请简要回答。`,
      answer: '这是简答题的参考答案，包含了关键点和详细解释。学生需要根据题目要求进行分析和回答，展示自己的理解和知识掌握程度。'
    });
  }

  return questions;
};

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return;

  // 计算各题型数量
  const counts = [examData.choiceQuestionCount, examData.fillInQuestionCount, examData.judgementQuestionCount, examData.shortAnswerQuestionCount];

  // examData.questions.forEach(q => {
  //   counts[q.type]++;
  // });

  // 准备数据
  const pieData = questionTypes.map((type, index) => ({
    name: type.label,
    value: counts[index],
    itemStyle: {
      color: type.color
    }
  })).filter(item => item.value > 0);

  // 初始化图表
  if (pieChart) {
    pieChart.dispose();
  }

  pieChart = echarts.init(pieChartRef.value);
  pieChart.setOption({
    title: {
      text: '题型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: pieData.map(item => item.name)
    },
    series: [
      {
        name: '题目数量',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: pieData
      }
    ]
  });

  window.addEventListener('resize', () => {
    pieChart && pieChart.resize();
  });
};

// 初始化对话框中的图表
const initDialogChart = () => {
  if (!dialogChartRef.value) return;

  // 计算各题型数量
  // const counts = [0, 0, 0, 0];
  // examData.questions.forEach(q => {
  //   counts[q.type]++;
  // });

  const counts = [examData.choiceQuestionCount, examData.fillInQuestionCount, examData.judgementQuestionCount, examData.shortAnswerQuestionCount];

  // 准备数据
  const pieData = questionTypes.map((type, index) => ({
    name: type.label,
    value: counts[index],
    itemStyle: {
      color: type.color
    }
  })).filter(item => item.value > 0);

  // 初始化图表
  if (dialogChart) {
    dialogChart.dispose();
  }

  dialogChart = echarts.init(dialogChartRef.value);
  dialogChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: pieData.map(item => item.name)
    },
    series: [
      {
        name: '题目数量',
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  });
};

// 查看考试详情
const viewExamDetail = async () => {
  if (!examGenerated.value) {
    ElMessage.warning('请先生成考试内容');
    return;
  }

  const res = await getQuestionsByExamQuestionGroupsIdControllerService(examQuestionGroupId.value)
  examData.questions = res.data.questions

  detailDialogVisible.value = true;

  // 初始化对话框中的图表
  nextTick(() => {
    initDialogChart();
  });
};

// 关闭对话框
const handleDialogClose = (done) => {
  done();
};

// 保存考试
const saveExam = () => {
  // 实际项目中应调用API保存考试
  ElMessageBox.confirm(
    '确定要保存此考试吗？',
    '保存确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    // 保存操作
      confirmAiGenerateExamQuestionService(examQuestionGroupId.value)
      ElMessage.success('考试保存成功！');
      detailDialogVisible.value = false;
  }).catch(() => {
    // 取消保存
  });
};

// 导出考试
const exportExam = () => {
  // 实际项目中应实现导出功能
  ElMessage.success('考试导出功能将在后续版本中实现');
};

// 监听窗口大小变化，重绘图表
window.addEventListener('resize', () => {
  pieChart && pieChart.resize();
  dialogChart && dialogChart.resize();
});

// 组件挂载时初始化
onMounted(() => {
  // 设置默认结束时间为当前时间后7天
  const defaultEndTime = new Date();
  examConfig.startTime = defaultEndTime.toISOString().replace('Z', '');
  defaultEndTime.setDate(defaultEndTime.getDate() + 7);
  defaultEndTime.setHours(12, 0, 0, 0);
  examConfig.endTime = defaultEndTime.toISOString().replace('Z', '');

  loadingChapters.value = true;
  // 加载课程章节
  loadCourseChapters();

  loadingChapters.value = false;
});
</script>

<style scoped>
.exam-gen-container {
  position: relative;
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
}

.main-content {
  display: flex;
  gap: 20px;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  flex: 1.5;
}

.config-card, .suggestion-card, .stats-card {
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
  border: none;
}

.config-card {
  background: linear-gradient(to bottom, #ffffff, #f9fafc);
  border-top: 4px solid #409eff;
}

.suggestion-card {
  background: linear-gradient(to bottom, #ffffff, #f9fafc);
  border-top: 4px solid #67c23a;
}

.stats-card {
  background: linear-gradient(to bottom, #ffffff, #f9fafc);
  border-top: 4px solid #e6a23c;
}

.config-card:hover, .suggestion-card:hover, .stats-card:hover {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(to right, #f0f5ff, #ecf5ff);
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
}

.card-header h2, .card-header h3 {
  margin: 0;
  color: #303133;
  font-weight: 600;
  position: relative;
  padding-left: 12px;
}

.card-header h2::before, .card-header h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: #409eff;
  border-radius: 2px;
}

.question-types {
  margin-bottom: 20px;
}

.question-count-input {
  width: 100%;
}

.el-form-item {
  margin-bottom: 22px;
  transition: all 0.3s ease;
}

.el-form-item:hover {
  transform: translateX(5px);
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.el-input__wrapper, .el-select__wrapper {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.el-input__wrapper:hover, .el-select__wrapper:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.el-input-number.is-controls-right .el-input-number__decrease,
.el-input-number.is-controls-right .el-input-number__increase {
  background-color: #f5f7fa;
  transition: all 0.2s ease;
}

.el-input-number.is-controls-right .el-input-number__decrease:hover,
.el-input-number.is-controls-right .el-input-number__increase:hover {
  background-color: #e6f1ff;
}

.generate-btn {
  width: 100%;
  margin-top: 20px;
  font-size: 16px;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #007bff);
  border: none;
  border-radius: 24px;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.generate-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s ease;
}

.generate-btn:hover {
  background: linear-gradient(135deg, #66b1ff, #0069d9);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.generate-btn:hover::before {
  left: 100%;
}

.chart-container {
  height: 300px;
  margin-top: 10px;
}

.divider-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-weight: 500;
  padding: 0 12px;
  background: #f0f5ff;
  border-radius: 16px;
  height: 28px;
}

.divider-icon {
  font-size: 16px;
}

.el-divider--horizontal {
  margin: 30px 0;
}

.el-slider__runway {
  height: 8px;
  background-color: #e4e7ed;
  border-radius: 4px;
}

.el-slider__bar {
  height: 8px;
  background: linear-gradient(to right, #409eff, #95d475);
  border-radius: 4px;
}

.el-slider__button-wrapper {
  top: -16px;
  width: 36px;
  height: 36px;
}

.el-slider__button {
  width: 20px;
  height: 20px;
  border: 2px solid #409eff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.el-slider__button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.empty-suggestion {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.suggestion-content {
  padding: 20px;
}

.suggestion-section {
  margin-bottom: 30px;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.suggestion-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.section-icon {
  font-size: 24px;
  color: #409eff;
}

.section-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.suggestion-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.suggestion-item {
  display: flex;
  gap: 15px;
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateX(5px);
}

.knowledge-points {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.knowledge-tag {
  transition: all 0.3s ease;
}

.knowledge-tag:hover {
  transform: scale(1.05);
}

.chapters-scrollbar {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  width: 400px;
}

.chapter-checkbox {
  display: block;
  margin-bottom: 8px;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.chapter-checkbox:hover {
  background-color: #f0f5ff;
  transform: translateX(5px);
}

.item-icon {
  font-size: 24px;
  color: #67c23a;
  align-self: flex-start;
  margin-top: 3px;
}

.item-content {
  flex: 1;
}

.item-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.item-content p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.highlight {
  color: #f56c6c;
  font-weight: bold;
  padding: 0 3px;
}

.view-detail-btn {
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #67c23a, #409eff);
  border: none;
  height: 44px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.view-detail-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.exam-title {
  text-align: center;
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
}

.exam-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.exam-info p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.section-title {
  margin-top: 30px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ebeef5;
  color: #303133;
  font-size: 18px;
}

.question-item {
  margin-bottom: 25px;
  padding: 15px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.question-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  margin-bottom: 10px;
}

.question-number {
  font-weight: bold;
  margin-right: 8px;
  color: #409eff;
}

.options-container, .blank-container, .judge-container, .essay-container {
  margin-left: 24px;
}

.option-item, .blank-item {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
}

.option-label, .blank-label {
  margin-right: 8px;
  font-weight: 500;
  color: #606266;
}

.judge-options {
  display: flex;
  gap: 20px;
}

.judge-option {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.essay-answer {
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.answer-label {
  font-weight: bold;
  color: #67c23a;
  margin-bottom: 5px;
}

.answer-content {
  color: #606266;
  line-height: 1.6;
}

/* 悬浮按钮样式 */
.floating-btn {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #67c23a, #409eff);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 999;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0);
}

.floating-btn.visible {
  opacity: 1;
  transform: scale(1);
}

.floating-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.floating-btn span {
  font-size: 12px;
  margin-top: 4px;
}

/* 脉冲动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.pulse {
  animation: pulse 1s infinite;
}

/* 详情对话框样式 */
.exam-detail-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 15px;
}

.distribution-chart {
  height: 300px;
  margin: 20px 0;
  border-radius: 8px;
  background-color: #f9f9f9;
  padding: 15px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.exam-preview-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.exam-preview-section h3 {
  color: #409eff;
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px dashed #e6e6e6;
}

.exam-preview-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.question-detail-item {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 6px;
  background-color: #f8f9fa;
  border-left: 4px solid #409eff;
}

.correct-option {
  background-color: rgba(103, 194, 58, 0.1);
  border-left: 3px solid #67c23a;
}

.answer-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .left-panel, .right-panel {
    flex: 1;
    width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .exam-info {
    flex-direction: column;
    gap: 10px;
  }

  .floating-btn {
    width: 50px;
    height: 50px;
    right: 20px;
    bottom: 20px;
  }
}
</style>
