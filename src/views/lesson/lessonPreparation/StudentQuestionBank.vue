<template>
  <div class="question-bank-container">
    <div class="page-header">
      <h1 class="title">
        <el-icon class="icon"><Collection /></el-icon>
        学习宝藏库
      </h1>
      <p class="subtitle">这里有丰富的题目等你挑战！加油！</p>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section glass-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="类型">
          <el-select v-model="filterForm.type" placeholder="题目类型" clearable style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="选择题" value="1" />
            <el-option label="填空题" value="2" />
            <el-option label="判断题" value="3" />
            <el-option label="简答题" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="filterForm.difficulty" placeholder="难度级别" clearable  style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="简单" value="1" />
            <el-option label="较简单" value="2" />
            <el-option label="中等" value="3" />
            <el-option label="较困难" value="4" />
            <el-option label="困难" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="知识点">
          <el-select
            v-model="filterForm.courseName"
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择知识点"
            style="width: 240px"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag.courseName"
              :label="tag.courseName"
              :value="tag.courseName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="搜索题目" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchQuestions">
            搜索
            <el-icon class="el-icon--right"><Search /></el-icon>
          </el-button>
          <el-button @click="resetFilter">
            重置
            <el-icon class="el-icon--right"><RefreshRight /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 题目列表 -->
    <div class="question-list-section">
      <div class="list-header">
        <h2>
          <el-icon><Files /></el-icon>
          题目列表
        </h2>
        <div class="list-controls">
          <span class="question-count">共找到 <b>{{ total }}</b> 道题目</span>
          <el-switch
            v-model="viewMode"
            inline-prompt
            :active-value="'card'"
            :inactive-value="'list'"
            active-text="卡片"
            inactive-text="列表"
          />
        </div>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="cards-view">
        <el-empty v-if="questions.length === 0" description="暂无题目，请调整筛选条件" />
        <div v-else class="cards-grid">
          <div
            v-for="question in questions"
            :key="question.id"
            class="question-card glass-card"
            @click="goToQuestion(question.id)"
          >
            <div class="card-header">
              <el-tag :type="getQuestionTypeStyle(question.type)" effect="light">
                {{ getQuestionTypeName(question.type) }}
              </el-tag>
              <div class="difficulty-stars">
                <el-rate
                  v-model="question.difficulty"
                  disabled
                  text-color="#ff9900"
                />
              </div>
            </div>
            <div class="card-content">
              <p class="question-text">{{ question.questionContent }}</p>
            </div>
            <div class="card-footer">
              <div class="tags">
                <el-tag
                  v-for="tag in question.tags"
                  :key="tag"
                  size="small"
                  effect="plain"
                  class="tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <el-button size="small" type="primary" text @click="goStartPractice">开始做题</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <el-empty v-if="questions.length === 0" description="暂无题目，请调整筛选条件" />
        <el-table
          v-else
          :data="questions"
          style="width: 100%"
          @row-click="row => goToQuestion(row.id)"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="questionContent" label="题目" min-width="300" show-overflow-tooltip />
          <el-table-column label="类型" width="100">
            <template #default="scope">
              <el-tag :type="getQuestionTypeStyle(scope.row.type)">
                {{ getQuestionTypeName(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="难度" width="120">
            <template #default="scope">
              <el-rate
                v-model="scope.row.difficulty"
                disabled
                text-color="#ff9900"
              />
            </template>
          </el-table-column>
          <el-table-column label="知识点" min-width="200">
            <template #default="scope">
              <el-tag
                v-for="tag in scope.row.tags"
                :key="tag"
                size="small"
                effect="plain"
                class="tag"
              >
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click.stop="goToQuestion(scope.row.id)"
              >
                做题
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[9, 12, 14, 16]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Collection, Search, RefreshRight, Files } from '@element-plus/icons-vue'
import { getStudentQuestionList } from '@/api/question.js'
import { courseGetAllNameService } from '@/api/course.js'
// import { getQuestionList } from '@/api/question.js'

const router = useRouter()
const questions = ref([])
const total = ref(0)
const currentPage = ref(2)
const pageSize = ref(10)
const viewMode = ref('card')

// 筛选表单
const filterForm = reactive({
  type: '',
  difficulty: '',
  courseName: '',
  keyword: ''
})

// 知识点选项
const tagOptions = ref([
  '函数与导数',
  '线性代数',
  '微积分',
  '概率论',
  '数据结构',
  '算法',
  'Python基础',
  '机器学习'
])

// 获取题目列表
const fetchQuestions = async () => {
  try {
    const res = await getStudentQuestionList({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filterForm
    })
    questions.value = res.data.list
    total.value = res.data.total
    const res1 = await courseGetAllNameService()
    tagOptions.value = res1.data
  } catch (error) {
    console.error('获取题目列表失败:', error)
    ElMessage.error('获取题目列表失败')
  }
}

// 搜索题目
const searchQuestions = () => {
  currentPage.value = 1
  fetchQuestions()
}

// 重置筛选条件
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    if (Array.isArray(filterForm[key])) {
      filterForm[key] = []
    } else {
      filterForm[key] = ''
    }
  })
  currentPage.value = 1
  fetchQuestions()
}

// 页面大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchQuestions()
}

// 页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchQuestions()
}

// 跳转到做题页面
const goToQuestion = (id) => {
  router.push(`/lesson/student/doPractice/${id}`)
}

// 获取题目类型名称
const getQuestionTypeName = (type) => {
  const typeMap = {
    '1': '选择题',
    '2': '填空题',
    '3': '判断题',
    '4': '简答题'
  }
  return typeMap[type] || '未知'
}

// 获取题目类型样式
const getQuestionTypeStyle = (type) => {
  const styleMap = {
    '1': '',
    '2': 'warning',
    '3': 'info',
    '4': 'success'
  }
  return styleMap[type] || ''
}

// 模拟数据
const mockQuestions = () => {
  questions.value = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    questionContent: i % 2 === 0
      ? '求函数f(x)=x²在x=2处的导数'
      : '判断命题：任意两个连续函数的复合函数也是连续的',
    type: String((i % 4) + 1),
    difficulty: (i % 3) + 1,
    tags: i % 2 === 0
      ? ['函数与导数', '微积分']
      : ['概率论', '线性代数']
  }))
  total.value = 100
}

onMounted(() => {
  // 在实际项目中应该调用API获取数据
   fetchQuestions()
  // 模拟数据
 // mockQuestions()
})
</script>

<style scoped>
.question-bank-container {
  padding: 24px;
  padding-bottom: 2px;;
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #f6f8fc 0%, #e9f0f9 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 2.2rem;
  color: #4f46e5;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.icon {
  font-size: 1.8rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.question-list-section {
  margin-bottom: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  color: #1a1a1a;
  margin: 0;
}

.list-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.question-count {
  color: #6b7280;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.question-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  height: 100%;
  transition: all 0.3s ease;
  overflow: hidden;
}

.question-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.card-content {
  flex-grow: 1;
  padding: 16px 0;
}

.question-text {
  color: #1a1a1a;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 50px;
  padding-top: 20px;
}

/* 表格样式 */
.list-view {
  margin-bottom: 24px;
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

:deep(.el-table__row) {
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.el-table__row:hover) {
  background-color: rgba(79, 70, 229, 0.05) !important;
}

:deep(.el-table__header) {
  background-color: rgba(79, 70, 229, 0.08);
}

:deep(.el-pagination) {
  justify-content: center;
}
</style>
