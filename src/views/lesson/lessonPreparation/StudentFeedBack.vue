<template>
  <div class="student-feedback-container">

    <div class="page-title">
      <h2 class="title-text">课程反馈</h2>
      <div class="title-decoration"></div>
    </div>

    <!-- 课程信息卡片 -->
    <div class="course-info-card">
      <div class="course-info-item">
        <span class="info-label">课程名称：</span>
        <span class="info-value">{{ courseInfo.courseName }}</span>
      </div>
      <div class="course-info-item">
        <span class="info-label">上课时间：</span>
        <span class="info-value">{{ courseInfo.lessonTime }}</span>
      </div>
    </div>

    <!-- 匿名提示 -->
    <el-alert
      title="本次反馈为匿名反馈，请按实情填写，帮助老师及时调整教学方法，提升课堂质量"
      type="info"
      :closable="false"
      show-icon
      class="anonymous-alert"
    />

    <!-- 提交反馈表单 -->
    <el-form
      ref="feedbackFormRef"
      :model="feedbackForm"
      :rules="rules"
      label-position="top"
      class="feedback-form"
    >
      <!-- 满意度选择 -->
      <el-form-item label="您对本节课的总体满意度是：" prop="satisfaction">
        <el-radio-group v-model="feedbackForm.satisfaction" class="satisfaction-options">
          <transition-group name="fade-stagger">
            <el-radio
              v-for="(option, index) in satisfactionOptions"
              :key="option.value"
              :label="option.value"
              :style="{'transition-delay': `${index * 0.1}s`}"
            >
              {{ option.label }}
            </el-radio>
          </transition-group>
        </el-radio-group>
      </el-form-item>

      <!-- 五个方面评分 -->
      <div class="rating-section">
        <h3>课堂表现评分</h3>
        <div class="rating-description">请在下列五个方面对您在本节课的表现进行评分（5星制）</div>

        <transition-group name="slide-fade" tag="div" class="rating-items">
          <el-form-item
            v-for="(item, index) in ratingItems"
            :key="item.name"
            :label="item.label"
            :prop="`ratings.${item.name}`"
            :style="{'transition-delay': `${index * 0.1}s`}"
            class="rating-item"
          >
            <div class="rating-row">
              <el-rate
                v-model="feedbackForm.ratings[item.name]"
                :colors="rateColors"
                show-score
                :score-template="`{value}分`"
                class="rating-stars"
              />
            </div>
          </el-form-item>
        </transition-group>
      </div>

      <!-- 文字评价 -->
      <el-form-item label="您对本节课的评价和建议：" prop="comment">
        <el-input
          v-model="feedbackForm.comment"
          type="textarea"
          :rows="5"
          placeholder="请输入您对本节课的评价、感受或对老师的建议..."
          resize="none"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item class="submit-section">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          {{ submitting ? '提交中...' : '提交反馈' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 提交成功弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="反馈提交成功"
      width="30%"
      center
      :show-close="false"
    >
      <div class="success-content">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <p>感谢您的反馈！</p>
        <p>您的意见对我们改进教学质量非常重要</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { addStudentPostLessonFeedbackService } from '@/api/feedback.js'

const router = useRouter()
const feedbackFormRef = ref(null)
const submitting = ref(false)
const dialogVisible = ref(false)
const teacherScheduleId = useRoute().params.teacherScheduleId
// 课程信息（假数据，实际应从API获取）
const courseInfo = ref({
  courseName: '高等数学（上）',
  lessonTime: '2023-10-15 08:00-09:40'
})

// 满意度选项
const satisfactionOptions = [
  { label: '非常满意', value: 4 },
  { label: '满意', value: 3 },
  { label: '一般', value: 2 },
  { label: '不满意', value: 1 }
]

// 评分项目
const ratingItems = [
  { label: '回答问题', name: 'answering' },
  { label: '课堂讨论', name: 'discussion' },
  { label: '实践参与', name: 'practice' },
  { label: '笔记记录', name: 'notes' },
  { label: '互动反馈', name: 'interaction' }
]

// 星级评分颜色
const rateColors = ['#C6D1DE', '#F7BA2A', '#FF9900']

// 表单数据
const feedbackForm = ref({
  teacherScheduleId: 30,
  satisfaction: '',
  ratings: {
    answering: 3,
    discussion: 3,
    practice: 3,
    notes: 3,
    interaction: 3
  },
  comment: ''
})

// 表单验证规则
const rules = {
  satisfaction: [
    { required: true, message: '请选择您对本节课的满意度', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入您的评价和建议', trigger: 'blur' },
    { min: 10, message: '评价内容至少10个字符', trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  feedbackFormRef.value.resetFields()
}

// 提交表单
const submitForm = async () => {
  if (!feedbackFormRef.value) return

  await feedbackFormRef.value.validate((valid, fields) => {
    if (valid) {
      submitFeedback()
    } else {
      console.log('表单验证失败', fields)
      ElMessage.error('请完成所有必填项')
    }
  })
}

// 提交反馈
const submitFeedback = async () => {
  submitting.value = true

  // 模拟API调用
  await addStudentPostLessonFeedbackService(feedbackForm.value)

  submitting.value = false
  dialogVisible.value = true

  // 提交成功后重置表单
  resetForm()

}

// 页面加载动画效果
onMounted(() => {

  // 初始化页面时可以添加一些额外的动画效果
})
</script>

<style scoped>
.student-feedback-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.nav-buttons {
  margin-bottom: 30px;
  text-align: center;
}

.nav-buttons .el-button {
  margin: 0 10px;
  width: 120px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.title-text {
  font-size: 28px;
  color: #409EFF;
  margin-bottom: 10px;
}

.title-decoration {
  height: 4px;
  width: 80px;
  background: linear-gradient(90deg, transparent, #409EFF, transparent);
  margin: 0 auto;
}

/* 课程信息卡片样式 */
.course-info-card {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-left: 3px solid #409EFF;
}

.course-info-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.info-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

.info-value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.anonymous-alert {
  margin-bottom: 30px;
}

.feedback-form {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  animation: slide-up 0.5s ease;
}

.satisfaction-options {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 10px;
}

.satisfaction-options .el-radio {
  margin-right: 10px;
  margin-bottom: 15px;
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.satisfaction-options .el-radio.is-checked {
  background-color: #f0f9ff;
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.rating-section {
  margin: 30px 0;
  padding: 25px;
  background-color: #f9fbfe;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.rating-section h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 10px;
}

.rating-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 25px;
}

.rating-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rating-item {
  margin-bottom: 5px;
}

.rating-row {
  display: flex;
  align-items: center;
}

.rating-stars {
  flex: 1;
}

.submit-section {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.submit-section .el-button {
  width: 140px;
  height: 50px;
  font-size: 16px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 50px;
  color: #67c23a;
  margin-bottom: 20px;
}

/* 动画效果 */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-stagger-enter-active,
.fade-stagger-leave-active {
  transition: all 0.5s ease;
}

.fade-stagger-enter-from,
.fade-stagger-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .satisfaction-options {
    flex-direction: column;
  }

  .satisfaction-options .el-radio {
    margin-right: 0;
    width: 100%;
  }

  .submit-section {
    flex-direction: column;
    align-items: center;
  }
}
</style>
