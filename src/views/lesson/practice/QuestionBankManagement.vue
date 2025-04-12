<template>
  <div class="content-area">
    <div class="question-bank-section">
      <div class="section-header">
        <h2>题库管理</h2>
        <div class="header-actions">
          <el-button class="btn btn-outline" @click="openPublishDialog">
            <el-icon>
              <Download />
            </el-icon>
            发布
          </el-button>
          <el-button type="primary" class="btn btn-primary" @click="openAddQuestionDialog">
            <el-icon>
              <Plus />
            </el-icon>
            新增题目
          </el-button>
        </div>
      </div>

      <!-- 修改筛选栏结构 -->
      <div class="search-filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索题目..."
          class="search-box"
        />
        <div class="filter-row" style="display: flex;justify-content: space-between">
          <div>
            <el-radio-group v-model="bankFilter.type" class="filter-tags">
              <el-radio-button
                v-for="type in questionTypes"
                :key="type.value"
                :label="type.value"
              >
                {{ type.label }}
              </el-radio-button>
            </el-radio-group>

          </div>
          <el-select
            v-model="bankFilter.tags"
            multiple
            collapse-tags
            placeholder="选择标签"
            style="width: 240px"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </div>
      </div>

      <el-table
        :data="filteredBankQuestions"
        class="question-table"
        v-if="filteredBankQuestions.length > 0"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="content" label="题目内容" align="center">
          <template #default="{ row }">
            <div class="question-cell">
              {{ row.questionContent.length > 50 ? row.questionContent.substring(0, 50) + '...' : row.questionContent }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="题型" align="center">
          <template #default="{ row }">
            <span class="question-type-label" :class="row.type">
              {{ getQuestionTypeName(row.type) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" align="center">
          <template #default="{ row }">
            <div class="table-tags">
              <el-tag
                v-for="(tag, tagIdx) in row.tags"
                :key="tagIdx"
                size="small"
                class="table-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" align="center">
          <template #default="{ row }">
            <el-rate
              v-model="row.difficulty"
              disabled
              text-color="#ff9900"
            />
          </template>
        </el-table-column>
        <el-table-column prop="answerCount" label="回答次数" align="center" />
        <el-table-column label="操作" width="150" align="center">
          <template #default = "{ row }">
            <el-button-group style="display: flex">
              <!-- 查看按钮 -->
              <el-tooltip content="查看详情" placement="top" :show-after="0">
                <el-button type="primary" link style="padding: 6px" @click="goDetail(row.id)">
                  <el-icon>
                    <View />
                  </el-icon>
                </el-button>
              </el-tooltip>

              <!-- 编辑按钮 -->
              <el-tooltip content="编辑题目" placement="top" :show-after="0">
                <el-button type="primary" link style="padding: 6px">
                  <el-icon>
                    <Edit />
                  </el-icon>
                </el-button>
              </el-tooltip>

              <!-- 删除按钮 -->
              <el-tooltip content="删除题目" placement="top" :show-after="0">
                <el-button type="danger" link style="padding: 6px">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <template v-else>
        <el-empty v-loading="isLoading" description="暂无数据~~" />
      </template>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[8, 12, 14]"
        class="pagination"
        layout="sizes, prev, pager, next"
        @current-change="goPageQuery"
        @size-change="goPageQuery"
      />

    </div>
  </div>

  <!-- 发布题目对话框 -->
  <el-dialog
    v-model="publishDialogVisible"
    title="发布题目"
    width="700px"
    destroy-on-close
  >
    <div class="publish-dialog-content">
      <div class="publish-question-selection">
        <h3>选择要发布的题目</h3>
        <!-- 添加搜索筛选功能 -->
        <div class="publish-search-filter" style="margin-bottom: 12px">
          <el-input
            v-model="publishSearchQuery"
            placeholder="搜索题目..."
            class="search-box"
            style="margin-bottom: 8px"
          />
          <div class="filter-row">
            <el-radio-group v-model="publishFilter.type" class="filter-tags">
              <el-radio-button
                v-for="type in questionTypes"
                :key="type.value"
                :label="type.value"
              >
                {{ type.label }}
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 题目选择表格 -->
        <el-table
          :data="publishFilteredQuestions"
          @selection-change="handlePublishSelectionChange"
          height="300px"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="questionContent" label="题目内容" show-overflow-tooltip />
          <el-table-column prop="type" label="题型" width="110">
            <template #default="{ row }">
              <span class="question-type-label" :class="row.type">
                {{ getQuestionTypeName(row.type) }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加分页组件 -->
        <el-pagination
          v-model:current-page="publishCurrentPage"
          v-model:page-size="publishPageSize"
          :total="total"
          :page-sizes="[8, 12, 14]"
          class="pagination"
          style="margin-top: 12px"
          layout="sizes, prev, pager, next"
          @current-change="handlePublishPageChange"
          @size-change="handlePublishPageChange"
        />
      </div>

      <div class="selected-questions-list" v-if="selectedPublishQuestions.length > 0">
        <h3>已选题目 ({{ selectedPublishQuestions.length }})</h3>
        <div class="selected-questions-container">
          <el-row v-for="(question, index) in selectedPublishQuestions" :key="question.id" class="selected-question-item">
            <el-col :span="2">
              <div class="question-number">{{ index + 1 }}</div>
            </el-col>
            <el-col :span="18">
              <div class="question-title">{{ question.questionContent }}</div>
            </el-col>
            <el-col :span="4" class="question-actions">
              <el-button type="text" @click="moveQuestionUp(index)" :disabled="index === 0">
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button type="text" @click="moveQuestionDown(index)" :disabled="index === selectedPublishQuestions.length - 1">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <el-button type="text" @click="removeSelectedQuestion(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>

      <div class="publish-options">

        <h3>请输入标题</h3>
          <el-input
            v-model="title"
            placeholder="请输入标题..."
            class="search-box"
            style="margin-bottom: 8px"
          />
        <h3>发布类型</h3>
        <el-radio-group v-model="publishType" class="publish-type-options">
          <el-radio label="1">课前预习题</el-radio>
          <el-radio label="2">课后练习题</el-radio>
          <el-radio label="3">考试题目</el-radio>
          <el-radio label="4">普通练习题</el-radio>
        </el-radio-group>

        <!-- 添加截止时间选择器 -->
        <div class="deadline-selector" style="margin-top: 16px">
          <h3>截止时间</h3>
          <el-date-picker
            v-model="publishDeadline"
            type="datetime"
            placeholder="选择截止日期和时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePublishQuestions" :disabled="selectedPublishQuestions.length === 0">
          确认发布
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 新增题目对话框 -->
  <el-dialog
    v-model="addQuestionDialogVisible"
    title="新增题目"
    width="750px"
    destroy-on-close
  >
    <el-form
      ref="questionFormRef"
      :model="newQuestion"
      :rules="questionFormRules"
      label-width="100px"
      label-position="top"
      class="question-form"
    >
      <!-- 选择题目类型 -->
      <el-form-item label="题目类型" prop="type" required>
        <el-radio-group v-model="newQuestion.type" class="question-type-selector">
          <el-radio-button :label="1">选择题</el-radio-button>
          <el-radio-button :label="2">填空题</el-radio-button>
          <el-radio-button :label="3">判断题</el-radio-button>
          <el-radio-button :label="4">简答题</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 题目内容 -->
      <el-form-item label="题目内容" prop="questionContent" required>
        <el-input
          v-model="newQuestion.questionContent"
          type="textarea"
          :rows="4"
          placeholder="请输入题目内容..."
        />
      </el-form-item>

      <!-- 根据题目类型显示不同的答案输入组件 -->
      <!-- 选择题 -->
      <template v-if="newQuestion.type === 1">
        <div class="options-container">
          <div class="options-header">
            <h3>选项</h3>
            <el-button type="primary" size="small" @click="addOption">添加选项</el-button>
          </div>

          <el-form-item
            v-for="(option, index) in newQuestion.options"
            :key="index"
            :prop="`options.${index}.content`"
            :rules="{ required: true, message: '选项内容不能为空', trigger: 'blur' }"
            class="option-item"
          >
            <div class="option-row">
              <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
              <el-input v-model="option.content" placeholder="请输入选项内容"></el-input>
              <el-checkbox v-model="option.isCorrect" label="正确答案" border></el-checkbox>
              <el-button type="danger" icon="Delete" circle plain @click="removeOption(index)" v-if="newQuestion.options.length > 2"></el-button>
            </div>
          </el-form-item>
        </div>
      </template>

      <!-- 填空题 -->
      <template v-if="newQuestion.type === 2">
        <el-form-item label="答案" prop="answer" required>
          <el-input
            v-model="newQuestion.answer"
            type="textarea"
            :rows="3"
            placeholder="请输入正确答案，多个填空请用分号(;)分隔"
          />
        </el-form-item>
      </template>

      <!-- 判断题 -->
      <template v-if="newQuestion.type === 4">
        <el-form-item label="正确答案" prop="answer" required>
          <el-radio-group v-model="newQuestion.answer">
            <el-radio label="true">正确</el-radio>
            <el-radio label="false">错误</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>

      <!-- 简答题 -->
      <template v-if="newQuestion.type === 3">
        <el-form-item label="参考答案" prop="answer" required>
          <el-input
            v-model="newQuestion.answer"
            type="textarea"
            :rows="4"
            placeholder="请输入参考答案..."
          />
        </el-form-item>
      </template>

      <!-- 通用字段 -->
      <el-form-item label="难度" prop="difficulty" required>
        <el-rate
          v-model="newQuestion.difficulty"
          :texts="difficultyTexts"
          show-text
        />
      </el-form-item>

      <el-form-item label="解题提示" prop="hint">
        <el-input
          v-model="newQuestion.hint"
          type="textarea"
          :rows="2"
          placeholder="请输入解题提示..."
        />
      </el-form-item>

      <el-form-item label="题目标签" prop="tags">
        <el-select
          v-model="newQuestion.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请输入或选择标签"
          class="tag-select-full"
        >
          <el-option
            v-for="tag in allTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addQuestionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNewQuestion">确认添加</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Download, Plus, View, Edit, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { addAssessmentQuestionGroups, getPageQuestions } from '@/api/question.js'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
const route = useRoute()
const teacherScheduleId = route.params.teacherScheduleId
const router = useRouter()
const selectAll = ref(false)
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(50)
const title = ref('')
const mockQuestionBank = ref([])
const isLoading = ref(false)
onMounted(async () => {
  await goPageQuery()
})

// 修改1：修正questionTypes类型定义
const questionTypes = [
  { label: '全部', value: 'all' },
  { label: '选择题', value: 1 },
  { label: '填空题', value: 2 },
  { label: '简答题', value: 4 },
  { label: '判断题', value: 3 }
];

const bankFilter = ref({
  type: 'all',
  tags: []
});

// 修改2：优化后的过滤逻辑
const filteredBankQuestions = computed(() => {
  const searchTerm = searchQuery.value.trim().toLowerCase();
  const filterType = bankFilter.value.type;
  const filterTags = bankFilter.value.tags;

  return mockQuestionBank.value.filter(q => {
    // 题型过滤（修正类型比较）
    if (filterType !== 'all' && q.type !== Number(filterType)) {
      return false;
    }

    // 标签过滤（空数组时跳过）
    if (filterTags.length > 0 && !filterTags.every(t => q.tags.includes(t))) {
      return false;
    }

    // 关键词搜索（空值时跳过）
    if (searchTerm && !q.questionContent?.toLowerCase().includes(searchTerm)) {
      return false;
    }

    return true;
  });
});

// 修改3：增强标签生成逻辑
const allTags = computed(() => {
  const tags = new Set();
  mockQuestionBank.value.forEach(q => {
    q.tags.filter(t => t).forEach(t => tags.add(t.trim())); // 过滤空标签
  });
  return Array.from(tags).sort();
});

const getQuestionTypeName = (type) => {
  const typeMap = {
    1: '选择题',
    2: '填空题',
    4: '简答题',
    3: '判断题'
  }
  return typeMap[type] || type
}

const searchQuery = ref('')
const goDetail = (id) => {
  router.push(`/lesson/practice/question-detail/${id}`)
}
const handleCurrentChange = async () => {
  await goPageQuery()
}

const goPageQuery = async () => {
  isLoading.value = true
  //获取题库数据
  const res = await getPageQuestions(currentPage.value, pageSize.value,teacherScheduleId)
  mockQuestionBank.value = res.data.list
  total.value = res.data.total
  isLoading.value = false
}

// ---------- 发布题目功能增强 ----------
const publishDialogVisible = ref(false)
const selectedPublishQuestions = ref([])
const publishType = ref('regular')
const publishDeadline = ref('')  // 新增截止时间
const publishCurrentPage = ref(1) // 发布对话框的分页
const publishPageSize = ref(8)  // 发布对话框的每页条数
const publishSearchQuery = ref('') // 发布对话框的搜索
const publishFilter = ref({  // 发布对话框的筛选
  type: 'all',
  tags: []
})
const publishFilteredQuestions = computed(() => {
  const searchTerm = publishSearchQuery.value.trim().toLowerCase();
  const filterType = publishFilter.value.type;

  return mockQuestionBank.value.filter(q => {
    // 题型过滤（修正类型比较）
    if (filterType !== 'all' && q.type !== Number(filterType)) {
      return false;
    }

    // 关键词搜索（空值时跳过）
    if (searchTerm && !q.questionContent?.toLowerCase().includes(searchTerm)) {
      return false;
    }

    return true;
  });
})

const openPublishDialog = () => {
  publishDialogVisible.value = true
  selectedPublishQuestions.value = []
  publishDeadline.value = '' // 重置截止时间
  publishCurrentPage.value = 1 // 重置分页到第一页
  // 重置搜索和筛选
  publishSearchQuery.value = ''
  publishFilter.value = {
    type: 'all',
    tags: []
  }

  // 加载发布对话框的第一页数据
  handlePublishPageChange()
}

const handlePublishSelectionChange = (selection) => {
  // 只添加新选中的题目，保持已有顺序
  const currentIds = selectedPublishQuestions.value.map(q => q.id)
  const newSelected = selection.filter(q => !currentIds.includes(q.id))
  selectedPublishQuestions.value = [...selectedPublishQuestions.value, ...newSelected]
}

const moveQuestionUp = (index) => {
  if (index > 0) {
    const temp = selectedPublishQuestions.value[index]
    selectedPublishQuestions.value[index] = selectedPublishQuestions.value[index - 1]
    selectedPublishQuestions.value[index - 1] = temp
  }
}

const moveQuestionDown = (index) => {
  if (index < selectedPublishQuestions.value.length - 1) {
    const temp = selectedPublishQuestions.value[index]
    selectedPublishQuestions.value[index] = selectedPublishQuestions.value[index + 1]
    selectedPublishQuestions.value[index + 1] = temp
  }
}

const removeSelectedQuestion = (index) => {
  selectedPublishQuestions.value.splice(index, 1)
}

const handlePublishQuestions = () => {
  // 验证截止时间
  if (!publishDeadline.value && publishType.value !== 'regular') {
    ElMessage.warning('请设置截止时间')
    return
  }

  // // 这里实现发布逻辑，可以调用API进行发布
  // const publishTypeText = {
  //   preclass: '课前预习题',
  //   postclass: '课后练习题',
  //   exam: '考试题目',
  //   regular: '普通练习题'
  // }

  // 这里实现发布逻辑，可以调用API进行发布
  const publishTypeText = {
    1: '课前预习题',
    2: '课后练习题',
    3: '考试题目',
    4: '普通练习题'
  }

  const deadlineText = publishDeadline.value
    ? `，截止时间: ${publishDeadline.value}`
    : '';

  ElMessage.success(`成功将 ${selectedPublishQuestions.value.length} 道题目发布为${publishTypeText[publishType.value]}${deadlineText}`)
  publishDialogVisible.value = false

  //调用API
  const data = {
    teacherScheduleId: teacherScheduleId,
    type: publishType.value,
    dueAt: publishDeadline.value,
    title: title.value,
    questionCount: selectedPublishQuestions.value.length,
    questionIds: selectedPublishQuestions.value.map(q => (
      q.id
    ))
  }
  publishQuestions(data)
}

const publishQuestions = async (data) => {
  await addAssessmentQuestionGroups(data)
}

const handlePublishPageChange = async () => {
  // 在实际应用中，这里应该调用一个独立的API获取题目数据
  // 目前我们复用现有的API调用并更新mockQuestionBank
  isLoading.value = true
  const res = await getPageQuestions(publishCurrentPage.value, publishPageSize.value,teacherScheduleId)
  mockQuestionBank.value = res.data.list
  total.value = res.data.total
  isLoading.value = false
}

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7; // 禁用今天之前的日期
}

// ---------- 新增题目功能 ----------
const addQuestionDialogVisible = ref(false)
const questionFormRef = ref(null)
const difficultyTexts = ['简单', '较简单', '中等', '较难', '困难']

const newQuestion = ref({
  type: 1,
  questionContent: '',
  options: [
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ],
  answer: '',
  difficulty: 3,
  hint: '',
  tags: []
})

const questionFormRules = {
  questionContent: [
    { required: true, message: '请输入题目内容', trigger: 'blur' }
  ],
  answer: [
    { required: true, message: '请输入答案', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度', trigger: 'change' }
  ]
}

const openAddQuestionDialog = () => {
  addQuestionDialogVisible.value = true
  resetForm()
}

const resetForm = () => {
  newQuestion.value = {
    type: 1,
    questionContent: '',
    options: [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ],
    answer: '',
    difficulty: 3,
    hint: '',
    tags: []
  }

  if (questionFormRef.value) {
    questionFormRef.value.resetFields()
  }
}

const addOption = () => {
  newQuestion.value.options.push({ content: '', isCorrect: false })
}

const removeOption = (index) => {
  newQuestion.value.options.splice(index, 1)
}

const submitNewQuestion = () => {
  questionFormRef.value.validate((valid) => {
    if (!valid) {
      return false
    }

    // 验证选择题至少有一个正确答案
    if (newQuestion.value.type === 1) {
      const hasCorrectOption = newQuestion.value.options.some(opt => opt.isCorrect)
      if (!hasCorrectOption) {
        ElMessage.error('请至少选择一个正确答案')
        return false
      }
    }

    // 这里整理提交数据格式
    const questionData = {
      ...newQuestion.value,
      // 对选择题特殊处理，把答案整理成合适格式
      answer: newQuestion.value.type === 1
        ? newQuestion.value.options
          .map((opt, idx) => opt.isCorrect ? String.fromCharCode(65 + idx) : null)
          .filter(Boolean)
          .join(',')
        : newQuestion.value.answer
    }

    // 真实环境下，这里调用API添加题目
    // addQuestion(questionData).then(() => {
    //   ElMessage.success('题目添加成功')
    //   addQuestionDialogVisible.value = false
    //   goPageQuery() // 刷新列表
    // })

    console.log('提交题目数据:', questionData)
    ElMessage.success('题目添加成功')
    addQuestionDialogVisible.value = false
    // 在实际应用中可能需要刷新题目列表
  })
}
</script>

<style scoped>
/* 基础布局优化 */
.content-area {
  padding: 24px;
  background: #f8fafc;
  font-size: 14px; /* 统一基础字号 */
}

/* 头部区域优化 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px; /* 减少间距 */
}

.section-header h2 {
  font-size: 24px; /* 原32px过大 */
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px; /* 缩小按钮间距 */
}

/* 按钮样式优化 */
:deep(.el-button) {
  padding: 8px 16px; /* 更紧凑的padding */
  border-radius: 8px;
  font-size: 14px;
  height: auto;
  transition: all 0.2s;

  .el-icon {
    width: 16px; /* 统一图标尺寸 */
    height: 16px;
    margin-right: 6px; /* 调整图标间距 */
  }
}

.btn-outline {
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
}

.btn-primary {
  background: #0284c7;
  color: white;
}

/* 搜索筛选栏优化 */
.search-filter-bar {
  margin-bottom: 20px; /* 减少间距 */
  display: flex;
  flex-direction: column;
  gap: 12px; /* 缩小间距 */
}

:deep(.el-input.search-box .el-input__wrapper) {
  padding: 10px 16px; /* 更紧凑的padding */
  border-radius: 8px;
  font-size: 14px;
}

/* 筛选标签优化 */
:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.el-radio-button__inner) {
  padding: 8px 16px; /* 更紧凑的padding */
  font-size: 13px;
  border-radius: 20px !important;
  margin: 0 !important;
}

/* 表格优化 */
:deep(.el-table) {
  --el-table-row-height: 46px; /* 减少行高 */
  --el-table-header-bg-color: #f8fafc;
  border-radius: 12px;
  overflow: hidden;

  /* 表头样式 */

  th.el-table__cell {
    font-size: 14px !important;
    color: #1e293b !important;
    font-weight: 600;
    padding: 12px !important;
  }

  /* 表格内容 */

  td.el-table__cell {
    font-size: 14px !important;
    color: #1a1a1a;
    padding: 10px 12px !important; /* 紧凑padding */
  }

  /* 选择列对齐修正 */

  .el-checkbox {
    margin-left: 8px;
  }
}

.question-cell {
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4; /* 优化行高 */
}

/* 题型标签优化 */
.question-type-label {
  padding: 4px 10px;
  font-size: 13px;
  border-radius: 4px;
  background: rgba(2, 132, 199, 0.1);
  color: #0369a1;
}

/* 操作栏优化 */
:deep(.el-button--link) {
  padding: 6px;
  margin: 0 4px;

  .el-icon {
    width: 20px; /* 放大操作图标 */
    height: 20px;
    transition: transform 0.2s;
  }

  &:hover .el-icon {
    transform: scale(1.15);
  }
}

/* 标签样式优化 */
.table-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.table-tag {
  margin: 2px;
  font-size: 12px;
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
  background: rgba(203, 213, 225, 0.2);
}

/* 分页样式升级 */
:deep(.el-pagination) {
  --el-pagination-bg-color: #ffffff;
  --el-pagination-button-disabled-bg-color: #f8fafc;
  --el-pagination-button-color: #475569;
  --el-pagination-button-hover-color: #0284c7;
  --el-pagination-button-active-bg-color: #0284c7;
  margin-top: 24px;

  /* 主容器 */

  .btn-prev,
  .btn-next,
  .number {
    min-width: 36px;
    height: 36px;
    font-size: 14px;
    border-radius: 8px;
    margin: 0 4px;
    transition: all 0.2s ease;
    background: #f8fafc;

    &:hover:not(.is-active) {
      background: #e2e8f0;
      color: #1e293b;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    &.is-active {
      background: #0284c7 !important;
      color: white !important;
      font-weight: 500;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3);
    }
  }

  /* 禁用状态 */

  .btn-prev.is-disabled,
  .btn-next.is-disabled {
    background: #f8fafc;
    color: #cbd5e1;
  }

  /* 页码间隙 */

  .el-pager {
    gap: 4px;
  }

  /* 更明显的焦点状态 */

  .number:focus-visible {
    outline: 2px solid #bae6fd;
    outline-offset: 2px;
  }
}

/* 适配暗色按钮 */
:deep(.el-pagination button) {
  border: none !important;
  background: #f8fafc;

  .el-icon {
    font-size: 16px;
  }
}

/* 难度评分优化 */
:deep(.el-rate) {
  --el-rate-icon-size: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.tag-select {
  width: 240px;
}

:deep(.el-tooltip) {
  --el-tooltip-bg-color: #475569;
  --el-tooltip-text-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 4px;
  transition: opacity 0.2s ease;
}

/* 保持按钮间距 */
.el-button + .el-button {
  margin-left: 4px;
}

.pagination {
  justify-content: center;
}

/* 发布对话框样式 */
.publish-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.publish-question-selection h3,
.selected-questions-list h3,
.publish-options h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #1e293b;
}

.selected-questions-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px;
}

.selected-question-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 6px;
  background: #f8fafc;
}

.question-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #0284c7;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 500;
}

.question-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
}

.question-actions {
  display: flex;
  justify-content: flex-end;
}

.publish-type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* 新增题目对话框样式 */
.question-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 16px;
}

.question-type-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.options-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.options-header h3 {
  font-size: 16px;
  margin: 0;
  color: #1e293b;
}

.option-item {
  margin-bottom: 8px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 28px;
  background: #0284c7;
  color: white;
  border-radius: 50%;
  font-weight: 500;
}

.tag-select-full {
  width: 100%;
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
