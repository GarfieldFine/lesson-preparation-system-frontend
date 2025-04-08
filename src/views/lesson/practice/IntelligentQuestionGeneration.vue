<template>
  <div class="content-area">
    <!-- 自动出题区域 -->
    <div class="generate-section">
      <div class="section-header">
        <h2>智能出题</h2>
        <p>基于课程内容自动生成高质量习题</p>
      </div>

      <div class="creation-cards" v-loading="isLoading" element-loading-text="题目正在生成中，请耐心等待...">
        <el-row :gutter="24" class="card-row">
          <!-- 上传课程内容卡片 -->
          <el-col :span="12">
            <el-card class="creation-card upload-card" :body-style="{ padding: '24px' }">
              <div class="card-icon">
                <i class="fas fa-file-upload"></i>
              </div>
              <h3>上传课程内容</h3>
              <p>上传课程文档、PPT或教材内容</p>
              <el-upload
                class="upload-area custom-upload"
                drag
                multiple
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                accept=".doc,.docx,.pdf,.ppt,.pptx">
                <el-icon class="el-icon--upload"><i class="fas fa-cloud-upload-alt"></i></el-icon>
                <div class="el-upload__text">
                  拖放文件到此处或<em>浏览文件</em>
                </div>
                <template #tip>
                  <div class="file-hint">支持的格式: DOC, PDF</div>
                </template>
              </el-upload>

              <!-- 文件列表 -->
              <div v-if="uploadedFiles.length > 0" class="uploaded-files">
                <div v-for="(file, idx) in uploadedFiles"
                     :key="idx"
                     class="file-item">
                  <i class="fas" :class="getFileIcon(file.name)"></i>
                  <span class="file-name">{{ file.name }}</span>
                  <el-button class="remove-file-btn" type="text" @click="removeFile(idx)">
                    <i class="fas fa-times"></i>
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 题型选择卡片 -->
          <el-col :span="12">
            <el-card class="creation-card type-card" :body-style="{ padding: '24px' }">
              <div class="card-icon">
                <i class="fas fa-tasks"></i>
              </div>
              <h3>题型选择</h3>
              <p>选择需要生成的题目类型</p>
              <div class="question-types">
                <div v-for="(type, idx) in questionTypes"
                     :key="idx"
                     class="question-type-chip"
                     :class="{ selected: type.selected }"
                     @click="toggleQuestionType(idx)">
                  <i :class="type.icon"></i>
                  {{ type.name }}
                  <span v-if="type.selected" class="type-count">
                    {{ type.count || 0 }}
                  </span>
                </div>
              </div>

              <!-- 题型数量分配 -->
              <div v-if="hasSelectedTypes" class="type-distribution">
                <div v-for="type in selectedTypes"
                     :key="type.key"
                     class="distribution-item">
                  <label>{{ type.name }}</label>
                  <div class="count-control">
                    <el-button size="small" @click="adjustTypeCount(type.key, -1)">-</el-button>
                    <el-input-number
                      v-model="type.count"
                      :min="1"
                      :max="20"
                      size="small"
                      controls-position="right"
                      class="custom-input-number"
                    />
                    <el-button size="small" @click="adjustTypeCount(type.key, 1)">+</el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="24" class="card-row">
          <!-- 标签设置卡片 -->
          <el-col :span="12">
            <el-card class="creation-card tag-card" :body-style="{ padding: '24px' }">
              <div class="card-icon">
                <i class="fas fa-tags"></i>
              </div>
              <h3>标签设置</h3>
              <p>为题目添加标签分类</p>
              <div class="tag-input-area">
                <div class="tag-chips">
                  <el-tag
                    v-for="(tag, idx) in selectedTags"
                    :key="idx"
                    closable
                    class="custom-tag"
                    @close="removeTag(idx)">
                    {{ tag }}
                  </el-tag>
                </div>

                <div class="tag-input">
                  <el-autocomplete
                    v-model="newTag"
                    :fetch-suggestions="queryTagSuggestions"
                    placeholder="输入标签..."
                    @select="selectTagSuggestion"
                    @keyup.enter="addTag"
                    class="tag-autocomplete">
                    <template #append>
                      <el-button @click="addTag" :disabled="!newTag.trim()">
                        <i class="fas fa-plus"></i>
                      </el-button>
                    </template>
                  </el-autocomplete>
                </div>

                <!-- 常用标签 -->
                <div class="common-tags">
                  <h4>常用标签</h4>
                  <div class="common-tag-chips">
                    <el-tag
                      v-for="(tag, idx) in commonTags"
                      :key="idx"
                      effect="plain"
                      class="common-tag"
                      @click="addCommonTag(tag)">
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 生成设置卡片 -->
          <el-col :span="12">
            <el-card class="creation-card settings-card" :body-style="{ padding: '24px' }">
              <div class="card-icon">
                <i class="fas fa-sliders-h"></i>
              </div>
              <h3>生成设置</h3>
              <p style="margin-bottom: 8px">用户相关需求</p>
              <el-input
                v-model="userRequest"
                style="width: 340px;margin-bottom: 8px"
                :autosize="{ minRows: 2, maxRows: 4 }"
                type="textarea"
                resize="none"
                placeholder="请输入需求"
              />
              <div class="settings-form">
                <div class="form-group">
                  <label>难度系数</label>
                  <div class="difficulty-selector">
                    <div v-for="n in 5"
                         :key="n"
                         class="difficulty-level"
                         :class="{ active: generationSettings.difficulty >= n }"
                         @click="generationSettings.difficulty = n">
                      {{ n }}
                    </div>
                  </div>
                </div>

                <!-- 知识点覆盖设置 -->
                <div class="form-group">
                  <div class="coverage-option">
                    <el-switch
                      v-model="generationSettings.ensureCoverage"
                      class="custom-switch">
                    </el-switch>
                    <label>确保知识点全覆盖</label>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="generation-actions">
<!--        <el-button class="custom-btn btn-secondary">-->
<!--          <i class="fas fa-magic"></i> 生成并发布-->
<!--        </el-button>-->
        <el-button type="primary" class="custom-btn btn-primary" @click="generateQuestions">
          <i class="fas fa-bolt"></i> 开始生成
        </el-button>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="showPreviewModal"
      title="预览分布"
      width="800px"
      class="preview-dialog"
      :show-close="true"
      @close="closePreview">
      <div class="modal-content">
        <!-- 预览内容 -->
      </div>
    </el-dialog>

    <!-- 生成成功弹窗 -->
    <el-dialog
      v-model="showSuccessModal"
      title="生成成功"
      width="460px"
      class="success-dialog"
      :show-close="true"
      center>
      <div class="success-content">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>题目生成成功！</h3>
        <p>您的题目已经成功生成，请前往题库查看和管理。</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="showSuccessModal = false">关闭</el-button>
          <el-button type="primary" class="confirm-btn" @click="goToQuestionBank">
            <i class="fas fa-arrow-right"></i> 前往题库
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { goGenerateQuestions } from '@/api/question.js'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter();
const teacherScheduleId = useRoute().params.teacherScheduleId

const uploadedFiles = ref([]);
const showPreviewModal = ref(false);
const showSuccessModal = ref(false);
const isLoading = ref(false);

const questionTypes = ref([
  { name: '选择题', icon: 'fas fa-check-circle', key: 'choice', selected: true, count: 5 },
  { name: '填空题', icon: 'fas fa-pencil-alt', key: 'fill', selected: true, count: 5 },
  { name: '简答题', icon: 'fas fa-paragraph', key: 'essay', selected: true, count: 2 },
  { name: '判断题', icon: 'fas fa-balance-scale', key: 'judge', selected: false, count: 0 }
]);

const userRequest = ref('')
const selectedTags = ref(['数据结构', '栈']);
const newTag = ref('');
const generationSettings = ref({
  difficulty: 3,
  ensureCoverage: true
});

const commonTags = ref(['栈', '队列', '树', '图','查找','排序','递归','贪心算法','分治算法','动态规划','回溯算法','分支限界算法','图论','图算法','图搜索算法','图遍历算法']);

const selectedTypes = computed(() => {
  return questionTypes.value.filter(type => type.selected);
});

const hasSelectedTypes = computed(() => {
  return selectedTypes.value.length > 0;
});

// 文件处理方法
const handleFileChange = (file) => {
  uploadedFiles.value.push(file.raw);
};

const handleFileRemove = (file, fileList) => {
  const index = uploadedFiles.value.findIndex(f => f.name === file.name);
  if (index !== -1) {
    uploadedFiles.value.splice(index, 1);
  }
};

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1);
};

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'ppt': 'fa-file-powerpoint',
    'pptx': 'fa-file-powerpoint'
  };
  return iconMap[ext] || 'fa-file';
};

// 题型选择方法
const toggleQuestionType = (index) => {
  questionTypes.value[index].selected = !questionTypes.value[index].selected;
};

const adjustTypeCount = (key, change) => {
  const type = questionTypes.value.find(t => t.key === key);
  if (type) {
    type.count = Math.max(1, Math.min(20, (type.count || 0) + change));
  }
};

// 标签相关方法
const addTag = () => {
  if (newTag.value && !selectedTags.value.includes(newTag.value)) {
    selectedTags.value.push(newTag.value);
    newTag.value = '';
  }
};

const removeTag = (index) => {
  selectedTags.value.splice(index, 1);
};

const queryTagSuggestions = (queryString, callback) => {
  if (queryString) {
    const results = commonTags.value
      .filter(tag => tag.toLowerCase().includes(queryString.toLowerCase()) &&
        !selectedTags.value.includes(tag))
      .map(tag => ({ value: tag }));
    callback(results);
  } else {
    callback([]);
  }
};

const selectTagSuggestion = (item) => {
  if (item && item.value && !selectedTags.value.includes(item.value)) {
    selectedTags.value.push(item.value);
    newTag.value = '';
  }
};

const addCommonTag = (tag) => {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag);
  }
};

// 预览和生成方法
const showPreview = () => {
  showPreviewModal.value = true;
};

const closePreview = () => {
  showPreviewModal.value = false;
};

const goToQuestionBank = () => {
  showSuccessModal.value = false;
  // 跳转到题库页面
  router.push(`/lesson/practice/question-bank/${teacherScheduleId}`);
};

const generateQuestions = async () => {
  //收集数据
  const aiGenerateQuestionDto = ref({
    teacherScheduleId: teacherScheduleId,

    choiceQuestionCount: questionTypes.value[0].selected?questionTypes.value[0].count:0,

    fillInQuestionCount: questionTypes.value[1].selected?questionTypes.value[1].count:0,

    judgementQuestionCount: questionTypes.value[3].selected?questionTypes.value[3].count:0,

    shortAnswerQuestionCount: questionTypes.value[2].selected?questionTypes.value[2].count:0,

    difficulty: generationSettings.value.difficulty,

    userRequest: userRequest.value,

    tags: selectedTags.value
  })
  isLoading.value = true;
  try {
    await goGenerateQuestions(aiGenerateQuestionDto.value)
    isLoading.value = false;
    // 显示成功弹窗而不是简单的消息提示
    showSuccessModal.value = true;
  } catch (error) {
    isLoading.value = false;
    ElMessage.error('生成题目失败，请稍后重试');
  }
};
</script>

<style scoped>
.content-area {
  padding: 24px;
  background: #f8fafc;
}

.section-header {
  margin-bottom: 32px;
  text-align: center;
}

.section-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.section-header p {
  color: #64748b;
  font-size: 16px;
}

.creation-cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.card-row {
  margin-bottom: 24px;
}

/* 卡片样式调整 */
.creation-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

.creation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
}

/* 图标样式 */
.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 24px;
}

.upload-card .card-icon {
  background: #e0f2fe;
  color: #0284c7;
}

.type-card .card-icon {
  background: #fef3c7;
  color: #d97706;
}

.tag-card .card-icon {
  background: #dcfce7;
  color: #16a34a;
}

.settings-card .card-icon {
  background: #f3e8ff;
  color: #9333ea;
}

.creation-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.creation-card p {
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
}

/* 上传区域自定义样式 */
.custom-upload {
  width: 100%;
}

.custom-upload .el-upload {
  width: 100%;
}

.custom-upload .el-upload-dragger {
  width: 100%;
  height: auto;
  padding: 32px 24px;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.custom-upload .el-upload-dragger:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.el-icon--upload {
  font-size: 32px !important;
  color: #3b82f6 !important;
  margin-bottom: 16px;
}

.el-upload__text {
  color: #64748b;
}

.el-upload__text em {
  color: #3b82f6;
  font-style: normal;
  cursor: pointer;
}

.file-hint {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}

/* 上传文件列表 */
.uploaded-files {
  margin-top: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 8px;
  animation: slideIn 0.3s ease-out;
}

.file-item i {
  margin-right: 12px;
  color: #3b82f6;
}

.file-item .file-name {
  flex: 1;
  font-size: 14px;
  color: #475569;
}

.remove-file-btn {
  padding: 4px;
  font-size: 14px;
  color: #94a3b8;
}

.remove-file-btn:hover {
  color: #ef4444;
}

/* 问题类型选择 */
.question-types {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.question-type-chip {
  padding: 12px 12px;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
}

.question-type-chip:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.question-type-chip.selected {
  background: #3b82f6;
  color: white;
}

.type-count {
  margin-left: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

/* 题型数量分配 */
.type-distribution {
  margin-top: 16px;
}

.distribution-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.count-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-input-number {
  width: 80px;
}

/* 标签相关样式 */
.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.custom-tag {
  padding: 8px 16px;
  background: #f0f9ff !important;
  color: #0284c7 !important;
  border-color: #e0f2fe !important;
  border-radius: 20px !important;
  font-size: 14px;
  animation: fadeIn 0.3s ease-out;
}

.tag-input {
  margin-bottom: 16px;
}


.tag-autocomplete {
  /* 基础尺寸 */
  width: 100%;
  margin: 8px 0;

  /* 输入框主体样式 */
  .el-input__wrapper {
    background: #f8fafc;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    transition: all 0.3s ease;

    /* 输入框聚焦状态 */
    &.is-focus {
      box-shadow: 0 0 0 2px rgba(99,102,241,0.2) !important;
      background: #fff;
    }

    /* 输入文字样式 */
    .el-input__inner {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #1e293b;
      padding: 0 12px;
    }
  }

  /* 右侧按钮样式 */
  .el-input-group__append {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    border-radius: 0 8px 8px 0;
    padding: 0 16px;
    box-shadow: none;
    transition: all 0.3s ease;

    /* 按钮悬停效果 */
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 6px rgba(99,102,241,0.3);
    }

    /* 禁用状态 */
    .el-button.is-disabled {
      background: #94a3b8;
      opacity: 0.7;
    }

    /* 图标样式 */
    .fa-plus {
      color: white;
      font-size: 14px;
    }
  }

  /* 占位符文字 */
  ::placeholder {
    color: #94a3b8;
    font-weight: 300;
    letter-spacing: 0.5px;
  }
}

/* 下拉建议列表样式 */
.el-autocomplete__popper {
  border-radius: 8px !important;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
  border: 1px solid #f1f5f9 !important;

  .el-popper__arrow {
    display: none;
  }

  .el-autocomplete__menu-item {
    padding: 8px 16px;
    color: #475569;
    transition: all 0.2s ease;

    &:hover {
      background: #f8fafc;
      transform: translateX(4px);
    }

    &.highlighted {
      background: #e0e7ff;
      color: #6366f1;
      font-weight: 500;
    }
  }
}

/* 常用标签 */
.common-tags {
  margin-top: 16px;
}

.common-tags h4 {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.common-tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.common-tag {
  padding: 4px 12px;
  background: #f1f5f9 !important;
  border-color: #e2e8f0 !important;
  border-radius: 16px !important;
  font-size: 12px;
  color: #475569 !important;
  cursor: pointer;
}

.common-tag:hover {
  background: #e2e8f0 !important;
}

/* 难度选择器 */
.difficulty-selector {
  display: flex;
  justify-content: flex-start;
  gap: 5px;
  margin-top: 14px;
  margin-bottom: 20px;
}

.difficulty-level {
  width: 30px;
  height: 30px;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  border-radius: 4px;
}

.difficulty-level.active {
  background-color: #4caf50;
  transform: scale(1.1);
  color: white;
}

.difficulty-level:hover:not(.active) {
  background-color: #bbb;
}

/* 开关自定义样式 */
.coverage-option {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-switch {
  --el-switch-on-color: #3b82f6;
}

/* 操作按钮 */
.generation-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  animation: fadeInUp 0.5s ease-out;
}

.custom-btn {
  padding: 12px 24px !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  transition: all 0.3s ease !important;
  font-size: 16px !important;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #0ea5e9) !important;
  border: none !important;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
}

.btn-secondary {
  background: white !important;
  color: #475569 !important;
  border: 1px solid #e2e8f0 !important;
}

.btn-secondary:hover {
  background: #f8fafc !important;
}

/* 预览弹窗 */
.preview-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

/* 动画效果 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .el-col {
    width: 100% !important;
    margin-bottom: 24px;
  }
}

@media (max-width: 640px) {
  .section-header h2 {
    font-size: 28px;
  }

  .custom-btn {
    padding: 10px 16px !important;
    font-size: 14px !important;
  }
}

/* 成功弹窗样式 */
.success-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
  position: relative;
}

.success-dialog :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.success-dialog :deep(.el-dialog__headerbtn) {
  position: absolute;
  top: 20px;
  right: 20px;
}

.success-dialog :deep(.el-dialog__body) {
  padding: 30px 24px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.success-icon {
  font-size: 72px;
  color: #10b981;
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out;
}

.success-content h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.success-content p {
  color: #64748b;
  font-size: 16px;
  line-height: 1.6;
  max-width: 320px;
  margin: 0 auto;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 10px;
}

.cancel-btn {
  background: #f1f5f9 !important;
  border: none !important;
  color: #475569 !important;
  padding: 10px 20px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.cancel-btn:hover {
  background: #e2e8f0 !important;
  transform: translateY(-2px);
}

.confirm-btn {
  background: linear-gradient(135deg, #3b82f6, #0ea5e9) !important;
  border: none !important;
  padding: 10px 20px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.confirm-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
}

/* 加载状态自定义样式 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

:deep(.el-loading-spinner) {
  top: 45%;
}

:deep(.el-loading-text) {
  color: #3b82f6;
  font-size: 16px;
  margin-top: 16px;
  font-weight: 500;
}

:deep(.el-loading-spinner .circular) {
  width: 50px;
  height: 50px;
}
</style>
