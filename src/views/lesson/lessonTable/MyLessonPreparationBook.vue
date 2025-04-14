<script setup>
import { ref, onMounted, computed } from 'vue'
import { teacherScheduleGetListByLessonPreparationRecIdService } from '@/api/teacherSchedule.js'
import {
  lessonPreparationRecordGetClassNameService,
  lessonPreparationRecordAddClassService,
  getLessonPreparationRecordByIdService, lessonPreparationRecordUpdateTeachingPlanningService
} from '@/api/lessonPreparationRecord.js'
import { classGetAllNameService } from '@/api/class.js'
import { useRoute, useRouter } from 'vue-router'
import { chapterLessonPreparationGetListByLessonPreparationRecordIdService } from '@/api/chapterLessonPreparation.js'

const router = useRouter()
const LessonPreparationRecId = useRoute().params.lessonPreparationBookId
const classNameList = ref([])
const classList = ref([])
const lessonPreparationList = ref([])
const dialogFormVisible = ref(false)
const classId = ref('')
const activeCategory = ref(null) // 添加当前激活的分类状态
const hoverTimer = ref(null) // 添加悬停计时器
const isFinish = ref(1)
const teachingPlanDialogVisible = ref(false) // 教案章节列表弹窗显示状态
const chapterList = ref([]) // 教案章节列表

onMounted(async () => {
  const res = await teacherScheduleGetListByLessonPreparationRecIdService(LessonPreparationRecId)
  // console.log(res)
  lessonPreparationList.value = res.data
  const res1 = await lessonPreparationRecordGetClassNameService(LessonPreparationRecId)
  classNameList.value = res1.data
  const res2 = await classGetAllNameService()
  classList.value = res2.data
  // console.log(res1)
  const res3 = await getLessonPreparationRecordByIdService(LessonPreparationRecId)
  isFinish.value = res3.data.teachingState

})

const editDialogVisible = ref(false)
const currentLesson = ref(null)
const newTeachingPlanning = ref('')


// 修改ref定义
const popoverVisible = ref(false)
const popoverTriggerRef = ref(null)

// 修改打开方法
const openEditPopover = (lesson, event) => {
  currentLesson.value = lesson
  newTeachingPlanning.value = lesson.teachingPlanning || ''
  popoverTriggerRef.value = event.currentTarget
  popoverVisible.value = true
}
const handleSelectClick = (e) => {
  e.stopPropagation()
  e.preventDefault()  // 添加这行确保完全阻止默认行为
}

// 修改关闭方法
const closePopover = () => {
  popoverVisible.value = false
}

//更新课时对应的章节
const updateTeachingPlanning = async () => {
  if (!currentLesson.value || !newTeachingPlanning.value) return

  try {
    console.log(currentLesson.value.id, newTeachingPlanning.value)
    await lessonPreparationRecordUpdateTeachingPlanningService(
      currentLesson.value.id,
      newTeachingPlanning.value
    )
    console.log('修改成功')
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    popoverVisible.value = false
    // 刷新数据
    const res = await teacherScheduleGetListByLessonPreparationRecIdService(LessonPreparationRecId)
    lessonPreparationList.value = res.data
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 添加计算属性获取所有章节列表
const teachingPlannings = computed(() => {
  const plannings = new Set()
  let currentIndex = -1

  // 获取所有章节并确定当前章节位置
  const allPlannings = []
  lessonPreparationList.value.forEach(lesson => {
    if (lesson.teachingPlanning) {
      allPlannings.push(lesson.teachingPlanning)
      if (currentLesson.value && lesson.id === currentLesson.value.id) {
        currentIndex = allPlannings.length - 1
      }
    }
  })

  // 只保留当前章节之后的章节
  if (currentIndex >= 0) {
    for (let i = currentIndex + 1; i < allPlannings.length; i++) {
      plannings.add(allPlannings[i])
    }
  } else {
    // 如果没有当前章节，返回所有章节
    allPlannings.forEach(planning => plannings.add(planning))
  }
  return Array.from(plannings)
})

const handleSelectChange = (value) => {
  // 这里不需要阻止事件，因为change事件不会导致弹出层关闭
  newTeachingPlanning.value = value
}

const getPopoverPosition = () => {
  return {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px', // 保持原有宽度
    maxWidth: '90%', // 保持最大宽度
    animation: 'popover-fade-in 0.3s ease' // 保持动画效果
  }
}

// 使用计算属性将数组转换成字符串
const classesString = computed(() => {
  return classNameList.value.join(', ')
})

const goDetails = (teacherScheduleId) => {
  router.push(`/lesson/lesson_hour/mylessonpreparation/${teacherScheduleId}`)
}

const goAddClass = async () => {
  dialogFormVisible.value = false
  await lessonPreparationRecordAddClassService(LessonPreparationRecId, classId.value)
  ElMessage.success("添加成功")
  classId.value = ''
  const res1 = await lessonPreparationRecordGetClassNameService(LessonPreparationRecId)
  classNameList.value = res1.data
}

// 获取当前日期
const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
})


// 按照teachingPlanning字段对课时进行分组
const lessonCategories = computed(() => {
  const categories = {}
  lessonPreparationList.value.forEach(lesson => {
    const planning = lesson.teachingPlanning || '未设置计划'
    if (!categories[planning]) {
      categories[planning] = []
    }
    categories[planning].push(lesson)
  })
  return categories
})

// 将分组后的数据转换为数组形式，方便在模板中使用
const categoriesArray = computed(() => {
  return Object.entries(lessonCategories.value).map(([planning, lessons]) => ({
    planning,
    lessons,
    count: lessons.length,
    firstDate: lessons[0].fullClassTime ? new Date(lessons[0].fullClassTime) : new Date()
  }))
})

// 设置当前激活的分类（添加延迟）
const setActiveCategory = (planning) => {
  // 清除之前的计时器
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value)
  }

  // 设置新的计时器，延迟800毫秒后展开
  hoverTimer.value = setTimeout(() => {
    activeCategory.value = planning
  }, 800)
}

// 鼠标离开时清除计时器并关闭展开
const clearActiveCategory = () => {
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value)
    hoverTimer.value = null
  }
  activeCategory.value = null
}

// 格式化日期显示
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 计算课程完成率
const completionRate = computed(() => {
  if (lessonPreparationList.value.length === 0) return 0
  const completed = lessonPreparationList.value.filter(lesson =>
    new Date(lesson.fullClassTime) < new Date()
  ).length
  return Math.round((completed / lessonPreparationList.value.length) * 100)
})

// 添加随机颜色生成函数
const getRandomColor = (index) => {
  // 预定义一组好看的渐变色组合
  const gradients = [
    { start: '#3b82f6', end: '#6366f1' }, // 蓝紫
    { start: '#10b981', end: '#059669' }, // 绿色
    { start: '#f59e0b', end: '#d97706' }, // 橙色
    { start: '#ec4899', end: '#be185d' }, // 粉色
    { start: '#8b5cf6', end: '#7c3aed' }, // 紫色
    { start: '#06b6d4', end: '#0891b2' }, // 青色
    { start: '#ef4444', end: '#dc2626' }, // 红色
    { start: '#64748b', end: '#475569' }  // 灰色
  ];

  // 根据索引选择颜色，如果超出范围则循环使用
  return gradients[index % gradients.length];
}

const goToTeachingCalendar = () => {
// 这里是跳转到教学日历页面的逻辑
  console.log('跳转到教学日历页面')
// 实际实现可以使用 router.push 进行路由跳转
  router.push(`/lesson/teachingCalendar/${LessonPreparationRecId}`)
}
const goToExamGen = () => {
// 这里是跳转到教学日历页面的逻辑
  console.log('跳转到考试试卷逻辑生成')
// 实际实现可以使用 router.push 进行路由跳转
  router.push(`/lesson/examGen/${LessonPreparationRecId}`)
}

// 打开教案章节列表弹窗
const openTeachingPlanDialog = async () => {
  // chapterList.value = [
  //   { id: 1, chapterName: '第一章：课程介绍', createTime: '2023-09-01' },
  //   { id: 2, chapterName: '第二章：基础知识', createTime: '2023-09-05' },
  //   { id: 3, chapterName: '第三章：进阶内容', createTime: '2023-09-10' }
  // ]
  const res4 = await chapterLessonPreparationGetListByLessonPreparationRecordIdService(LessonPreparationRecId)
  chapterList.value = res4.data
  teachingPlanDialogVisible.value = true
}

// 跳转到教案详情页面
const goToTeachingPlan = (chapterId) => {
  // 这里是跳转到教案生成页面的逻辑
  console.log('跳转到教案生成页面', chapterId)
  // 实际实现可以使用 router.push 进行路由跳转
  router.push(`/lesson/teachingPlan/${LessonPreparationRecId}`)
  teachingPlanDialogVisible.value = false
}

</script>

<template>
  <div class="dashboard-container">
    <!-- 头部信息区域 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="page-title">备课系统</h1>
        <p class="date-display">{{ currentDate }}</p>
      </div>
      <div class="header-right">
        <div class="progress-card">
          <div class="progress-info">
            <span class="progress-label">课程完成率</span>
            <span class="progress-percentage">{{ completionRate }}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{width: `${completionRate}%`}"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 班级信息卡片 -->
    <div class="class-info-card">
      <div class="card-content">
        <div class="info-section">
          <div class="info-icon">
            <i class="el-icon-school"></i>
          </div>
          <div class="info-details">
            <h3 class="info-title">授课班级</h3>
            <p class="info-value">{{ classesString || '暂无班级' }}</p>
          </div>
        </div>
        <div class="teaching-tools-buttons">
          <el-button type="primary" class="teaching-tool-button" @click="goToTeachingCalendar">
            <i class="el-icon-date"></i> 教学日历
          </el-button>
          <el-button v-if="isFinish === 0" type="success" class="teaching-tool-button" @click="openTeachingPlanDialog">
            <i class="el-icon-document"></i> 教案
          </el-button>
          <el-button type="warning" class="teaching-tool-button" @click="goToExamGen">
            <i class="el-icon-date"></i> 考试试卷生成
          </el-button>
          <el-button type="primary" class="add-class-button" @click="dialogFormVisible = true">
            <i class="el-icon-plus"></i> 添加班级
          </el-button>
        </div>
      </div>
    </div>

    <!-- 课时列表 -->
    <div class="lessons-section">
      <h2 class="section-title">课时安排</h2>

      <div class="categories-container" v-if="lessonPreparationList.length > 0">
        <!-- 分类卡片 -->
        <div
          v-for="(category, index) in categoriesArray"
          :key="category.planning"
          class="category-card"
          :class="{'active-category': activeCategory === category.planning}"
          @mouseenter="setActiveCategory(category.planning)"
          @mouseleave="clearActiveCategory"
        >
          <div class="category-header">
            <div class="category-icon" :style="{
              background: `linear-gradient(135deg, ${getRandomColor(index).start}20, ${getRandomColor(index).end}40)`
            }">
              <i class="el-icon-notebook-1" :style="{ color: getRandomColor(index).start }"></i>
            </div>
            <div class="category-info">
              <h3 class="category-title">{{ category.planning }}</h3>
              <p class="category-meta">
                <span class="category-count">{{ category.count }}个课时</span>
                <span class="category-date">开始于: {{ formatDate(category.firstDate) }}</span>
              </p>
            </div>
            <div class="category-arrow" :style="{
              background: activeCategory === category.planning ?
                `${getRandomColor(index).end}20` : '#f1f5f9',
              color: activeCategory === category.planning ?
                getRandomColor(index).end : '#64748b'
            }">
              <i :class="[activeCategory === category.planning ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"></i>
            </div>
          </div>

          <!-- 该分类下的课时列表 -->
          <transition name="expand">
            <div class="category-lessons" v-show="activeCategory === category.planning">
              <div
                v-for="(lesson, lessonIndex) in category.lessons"
                :key="lesson.id"
                class="lesson-card"
                :class="{'past-lesson': new Date(lesson.fullClassTime) < new Date()}"
                @click="goDetails(lesson.id)"
              >
                <div class="lesson-left">
                  <div class="lesson-number-container">
                    <span class="lesson-number">{{ lessonIndex + 1 }}</span>
                  </div>
                </div>

                <div class="lesson-middle">
                  <h3 class="lesson-title">第 {{ lessonIndex + 1 }} 课时</h3>
                  <div class="lesson-details">
                    <div class="lesson-time">
                      <i class="el-icon-date time-icon"></i>
                      <span>{{ new Date(lesson.fullClassTime).getMonth() + 1 }}月{{ new Date(lesson.fullClassTime).getDate() }}日</span>
                    </div>
                    <div class="lesson-clock">
                      <i class="el-icon-time clock-icon"></i>
                      <span>{{ lesson.classTimeStart ? new Date(lesson.classTimeStart).toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'}) : '未设置' }}</span>
                    </div>
                    <div class="lesson-location" v-if="lesson.classroom">
                      <i class="el-icon-location location-icon"></i>
                      <span>{{ lesson.classroom }}</span>
                    </div>
                  </div>
                </div>

                <div class="lesson-right">
                  <div class="status-badge" :class="[new Date(lesson.fullClassTime) < new Date() ? 'completed' : 'upcoming']">
                    {{ new Date(lesson.fullClassTime) < new Date() ? '已上' : '未上' }}
                  </div>
                  <!-- new Date(lesson.fullClassTime) >= new Date() -->
                  <!-- 修改课时卡片中的按钮 -->
                  <el-button
                    v-if="true"
                    class="edit-button"
                    size="small"
                    @click.stop="openEditPopover(lesson, $event)"
                  >
                    修改
                  </el-button>

                  <div class="action-button">
                    <i class="el-icon-right"></i>
                  </div>
                </div>
              </div>
              <!-- 添加弹出层 -->
              <teleport to="body" v-if="popoverVisible">
                <div  class="popover-overlay">
                  <div class="popover-content" :style="getPopoverPosition()">
                    <div class="popover-header">
                      <h3>修改课时章节</h3>
                      <i class="el-icon-close" @click="closePopover"></i>
                    </div>
                    <div class="popover-body">
                      <el-select
                        v-model="newTeachingPlanning"
                        placeholder="请选择章节"
                        class="teaching-planning-select"
                        @change="handleSelectChange"
                        @click.native.stop="handleSelectClick"
                      >
                        <el-option
                          v-for="planning in teachingPlannings"
                          :key="planning"
                          :label="planning"
                          :value="planning"
                        />
                      </el-select>
                    </div>
                    <div class="popover-footer">
                      <el-button plain class="cancel-button" @click="closePopover">取消</el-button>
                      <el-button
                        type="primary"
                        class="confirm-button"
                        @click="updateTeachingPlanning"
                        :disabled="!newTeachingPlanning"
                      >
                        确认修改
                      </el-button>
                    </div>
                  </div>
                </div>
              </teleport>
            </div>
          </transition>
        </div>
      </div>

      <div class="empty-container" v-else>
        <div class="empty-illustration">
          <i class="el-icon-document"></i>
        </div>
        <p class="empty-text">该备本能暂无课时安排</p>
        <p class="empty-subtext">教师可以在系统中添加课时计划</p>
      </div>
    </div>
  </div>

  <!-- 添加班级对话框 -->
  <el-dialog
    v-model="dialogFormVisible"
    title="添加授课班级"
    width="480px"
    custom-class="modern-dialog"
    :show-close="true"
  >
    <div class="dialog-body">
      <p class="dialog-description">从下方选择一个班级添加到备本中</p>
      <el-select v-model="classId" placeholder="选择要添加的班级" class="class-select">
        <el-option
          v-for="cl in classList"
          :key="cl.id"
          :label="cl.className"
          :value="cl.id"
        >
          <div class="option-content">
            <i class="el-icon-user-solid option-icon"></i>
            <span>{{ cl.className }}</span>
          </div>
        </el-option>
      </el-select>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button plain class="cancel-button" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" class="confirm-button" @click="goAddClass" :disabled="!classId">
          确认添加
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 教案章节列表弹窗 -->
  <el-dialog
    v-model="teachingPlanDialogVisible"
    title="选择教案章节"
    width="600px"
    custom-class="chapter-dialog"
    :show-close="true"
    :close-on-click-modal="false"
  >
    <div class="dialog-body chapter-list-container">
      <p class="dialog-description">请选择要查看的教案章节</p>

      <div class="chapter-list">
        <div
          v-for="chapter in chapterList"
          :key="chapter.id"
          class="chapter-item"
          @click="goToTeachingPlan(chapter.id)"
        >
          <div class="chapter-icon">
            <i class="el-icon-document"></i>
          </div>
          <div class="chapter-info">
            <h3 class="chapter-title">{{ chapter.chapterName }}</h3>
            <p class="chapter-date">创建于: {{ chapter.createTime.split('T')[0] }}</p>
          </div>
          <div class="chapter-action">
            <i class="el-icon-right"></i>
          </div>
        </div>
      </div>

      <div v-if="chapterList.length === 0" class="empty-chapter-list">
        <div class="empty-icon">
          <i class="el-icon-document"></i>
        </div>
        <p class="empty-text">暂无教案章节</p>
        <p class="empty-subtext">请先创建教案章节</p>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
// 全局样式
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(145deg, #f5f7fa 0%, #e6eef8 100%);
  padding: 2rem;
  color: #2c3e50;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

// 添加教学工具按钮样式
.teaching-tools-buttons {
  display: flex;
  gap: 10px;
}

.teaching-tool-button {
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  }

  i {
    margin-right: 0.5rem;
  }
}

// 教案章节列表样式
.chapter-dialog {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    position: relative;
    overflow: hidden;

    &:before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
      opacity: 0.6;
      pointer-events: none;
    }

    .el-dialog__title {
      font-size: 1.25rem;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }

  .dialog-body {
    padding: 0;
  }

  .chapter-list-container {
    padding: 1.75rem;
    background: linear-gradient(145deg, #ffffff, #f9fafc);
  }

  .dialog-description {
    margin-bottom: 1.75rem;
    color: #64748b;
    font-size: 1rem;
    text-align: center;
    position: relative;
    padding-bottom: 1rem;

    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(to right, #3b82f6, #6366f1);
      border-radius: 3px;
    }
  }

  .chapter-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .chapter-item {
    display: flex;
    align-items: center;
    padding: 1.25rem;
    background: #f8fafc;
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: 1px solid rgba(226, 232, 240, 0.8);
    position: relative;
    overflow: hidden;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(to bottom, #3b82f6, #6366f1);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      background: #f0f5ff;
      transform: translateY(-4px);
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.15), 0 8px 10px -6px rgba(59, 130, 246, 0.1);
      border-color: rgba(191, 219, 254, 0.6);

      &:before {
        opacity: 1;
      }
    }
  }

  .chapter-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1.25rem;
    font-size: 1.5rem;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transition: all 0.3s ease;

    .chapter-item:hover & {
      transform: scale(1.1);
      background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
    }
  }

  .chapter-info {
    flex: 1;
    transition: transform 0.3s ease;

    .chapter-item:hover & {
      transform: translateX(4px);
    }
  }

  .chapter-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.375rem 0;
    transition: color 0.3s ease;

    .chapter-item:hover & {
      color: #3b82f6;
    }
  }

  .chapter-date {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
    display: flex;
    align-items: center;

    &:before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #6366f1;
      margin-right: 0.5rem;
      opacity: 0.7;
    }
  }

  .chapter-action {
    color: #64748b;
    font-size: 1.25rem;
    transition: all 0.3s ease;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(241, 245, 249, 0.8);

    .chapter-item:hover & {
      color: white;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }
  }
}

// 添加展开/收起动画
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px; // 足够大的高度以容纳内容
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

// 头部区域样式
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  .page-title {
    font-size: 2rem;
    font-weight: 600;
    color: #1e3a8a;
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.5px;
  }

  .date-display {
    font-size: 1rem;
    color: #64748b;
    margin: 0;
  }
}

.header-right {
  .progress-card {
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
    color: white;
    width: 220px;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .progress-label {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .progress-percentage {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .progress-bar-container {
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
}

// 班级信息卡片
.class-info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  overflow: hidden;

  .card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
  }

  .info-section {
    display: flex;
    align-items: center;
  }

  .info-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    font-size: 1.5rem;
  }

  .info-details {
    .info-title {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0 0 0.25rem 0;
    }

    .info-value {
      color: #1e293b;
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }
  }

  .add-class-button {
    background: #3b82f6;
    border: none;
    border-radius: 10px;
    padding: 0.75rem 1.25rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);

    &:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
    }

    i {
      margin-right: 0.5rem;
    }
  }
}

// 课时列表部分
.lessons-section {
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1.5rem;
    position: relative;
    padding-left: 1rem;

    &:before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: linear-gradient(to bottom, #3b82f6, #6366f1);
      border-radius: 2px;
    }
  }

  // 分类容器样式
  .categories-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  // 分类卡片样式
  .category-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s ease;

    &.active-category {
      box-shadow: 0 8px 30px rgba(59, 130, 246, 0.15);
    }

    .category-header {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      position: relative;
      z-index: 1; /* 确保在上层，可以接收点击事件 */

      &:hover {
        background-color: #f8fafc;
      }
    }

    .category-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1.25rem;
      font-size: 1.5rem;
    }

    .category-info {
      flex: 1;
    }

    .category-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.375rem 0;
    }

    .category-meta {
      display: flex;
      align-items: center;
      color: #64748b;
      font-size: 0.875rem;
      margin: 0;
    }

    .category-count {
      margin-right: 1rem;
      display: flex;
      align-items: center;

      &:before {
        content: "";
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #3b82f6;
        margin-right: 0.5rem;
      }
    }

    .category-date {
      display: flex;
      align-items: center;

      &:before {
        content: "";
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #8b5cf6;
        margin-right: 0.5rem;
      }
    }

    .category-arrow {
      margin-left: 1rem;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      transition: all 0.3s ease;

      .active-category & {
        transform: rotate(180deg);
        background: #e0f2fe;
        color: #3b82f6;
      }
    }

    // 分类下的课时列表
    .category-lessons {
      padding: 1.5rem 1.25rem 1.25rem; // 增加顶部内边距
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1rem;
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      transition: all 0.3s ease; // 确保过渡效果平滑
    }
  }

  .lessons-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 1.5rem;
  }

  .lesson-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    padding: 1.25rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 6px;
      height: 100%;
      background: linear-gradient(to bottom, #3b82f6, #6366f1);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);

      &:before {
        opacity: 1;
      }

      .action-button {
        opacity: 1;
        transform: translateX(0);
      }
    }

    &.past-lesson {
      &:before {
        background: linear-gradient(to bottom, #10b981, #059669);
      }
    }
  }

  .lesson-left {
    margin-right: 1.25rem;

    .lesson-number-container {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lesson-number {
      font-size: 1.25rem;
      font-weight: 700;
      color: #3b82f6;
    }
  }

  .lesson-middle {
    flex: 1;

    .lesson-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .lesson-details {
      display: flex;
      align-items: center;
      color: #64748b;
      font-size: 0.9rem;
    }

    .lesson-time, .lesson-clock, .lesson-location {
      display: flex;
      align-items: center;
      margin-right: 1rem;

      i {
        margin-right: 0.375rem;
        font-size: 1rem;
      }
    }

    .time-icon {
      color: #6366f1;
    }

    .clock-icon {
      color: #8b5cf6;
    }

    .location-icon {
      color: #ec4899;
    }
  }

  .lesson-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;

    .status-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;

      &.completed {
        background-color: rgba(16, 185, 129, 0.1);
        color: #059669;
      }

      &.upcoming {
        background-color: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }
    }

    .action-button {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.3s ease;
    }
  }

  // 空状态样式
  .empty-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;

    .empty-illustration {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;

      i {
        font-size: 2.5rem;
        color: #3b82f6;
      }
    }

    .empty-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .empty-subtext {
      font-size: 1rem;
      color: #64748b;
      margin: 0;
    }
  }
}

// 对话框样式
.modern-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  transform: translateZ(0);


  animation: dialogFadeIn 0.3s ease-out;

  :deep(.el-dialog__header) {
    background: linear-gradient(to right, #3b82f6, #6366f1);
    padding: 1.25rem 1.5rem;
    margin-right: 0;
    position: relative;
    overflow: hidden;

    &:before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
      opacity: 0.6;
      pointer-events: none;
    }

    .el-dialog__title {
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .el-dialog__headerbtn {
      top: 1.25rem;
      right: 1.5rem;
      transition: all 0.2s ease;

      &:hover {
        transform: rotate(90deg);
      }

      .el-dialog__close {
        color: white;
        font-size: 1.25rem;
        transition: all 0.2s ease;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 1.5rem;
  }

  .dialog-body {
    .dialog-description {
      margin: 0 0 1.5rem 0;
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .class-select {
      width: 100%;

      :deep(.el-input__wrapper) {
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        padding: 0.625rem 1rem;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        &.is-focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.1);
        }
      }
    }

    .option-content {
      display: flex;
      align-items: center;

      .option-icon {
        color: #3b82f6;
        margin-right: 0.75rem;
        font-size: 1.125rem;
      }
    }
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #f1f5f9;
    padding: 1.25rem 1.5rem;
    background: #f8fafc;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    .cancel-button {
      border: 1px solid #e2e8f0;
      color: #64748b;
      background: transparent;
      border-radius: 10px;
      padding: 0.625rem 1.25rem;
      transition: all 0.3s ease;

      &:hover {
        border-color: #cbd5e1;
        color: #475569;
        background: #f1f5f9;
        transform: translateY(-2px);
      }
    }

    .confirm-button {
      background: linear-gradient(to right, #3b82f6, #6366f1);
      border: none;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      border-radius: 10px;
      padding: 0.625rem 1.5rem;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: linear-gradient(to right, #2563eb, #4f46e5);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
      }

      &:disabled {
        background: #94a3b8;
        box-shadow: none;
        cursor: not-allowed;
        opacity: 0.7;
      }
    }
  }

  // 空状态样式
  .empty-chapter-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1.5rem;
    text-align: center;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed #cbd5e1;

    .empty-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      font-size: 2rem;
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15);
    }

    .empty-text {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .empty-subtext {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0;
    }
  }
}
.popover-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.002);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popover-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.001);
  width: 400px;
  max-width: 90%;
  animation: popover-fade-in 0.3s ease;
  border: 1px solid #e2e8f0;
}

.popover-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }

  .el-icon-close {
    cursor: pointer;
    color: #999;
    font-size: 18px;

    &:hover {
      color: #666;
    }
  }
}

.popover-body {
  padding: 20px;
}

.popover-footer {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@keyframes popover-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 保持原有的select样式
.teaching-planning-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 0.5rem 1rem;
  }
}

.edit-button{
  background-color: rgb(242, 174, 184);
  border-radius: 50px;
}

</style>

<!-- 添加全局样式 -->
<style lang="scss">
.chapter-dialog {
  border-radius: 16px !important;
  overflow: hidden;

  .el-dialog__header {
    background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
    margin-right: 0 !important;

    .el-dialog__title {
      color: white !important;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: white !important;
        font-size: 18px;
      }

      &:hover {
        .el-dialog__close {
          color: rgba(255,255,255,0.8) !important;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 0 !important;
  }
}

/* 弹窗内容区样式 */
.chapter-list-container {
  padding: 24px;

  .dialog-description {
    margin-bottom: 24px;
    color: #64748b;
    text-align: center;
    position: relative;
    padding-bottom: 12px;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 2px;
      background: #3b82f6;
    }
  }

  .chapter-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .chapter-item {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid #e2e8f0;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
      border-color: #3b82f6;

      .chapter-action {
        color: #3b82f6;
        transform: translateX(4px);
      }
    }
  }

  .chapter-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #dbeafe;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;

    i {
      color: #3b82f6;
      font-size: 20px;
    }
  }

  .chapter-info {
    flex: 1;

    .chapter-title {
      margin: 0;
      font-size: 16px;
      color: #1e293b;
    }

    .chapter-date {
      margin: 4px 0 0;
      font-size: 12px;
      color: #64748b;
    }
  }

  .chapter-action {
    color: #94a3b8;
    transition: all 0.3s;
  }

  .empty-chapter-list {
    text-align: center;
    padding: 40px 0;

    .empty-icon {
      i {
        font-size: 48px;
        color: #cbd5e1;
      }
    }

    .empty-text {
      color: #64748b;
      margin: 16px 0 8px;
    }

    .empty-subtext {
      color: #94a3b8;
      font-size: 12px;
      margin: 0;
    }
  }
}

</style>
