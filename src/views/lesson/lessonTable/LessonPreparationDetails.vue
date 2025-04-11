<script setup>
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { onMounted,ref} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapterLessonPreparationGetListByIdService, chapterLessonPreparationAiGenerateTeachingSignService, chapterLessonPreparationUpdateService } from '@/api/chapterLessonPreparation.js'

import {
  Document,
  Timer,
  Aim,
  Reading,
  Check,
  Clock,
  Calendar,
  Edit,
  VideoCamera,
  EditPen,
  Files,
  MagicStick
} from '@element-plus/icons-vue'

import 'md-editor-v3/lib/preview.css';

import 'md-editor-v3/lib/style.css';
import { ElMessage } from 'element-plus'


const teacherScheduleId = useRoute().params.teacherScheduleId

//备课
const lessonPreparation = ref({

})
const AiGenerateTeachingSign = ref({
  topic: '',
  teachingContentArrangementStr: '',
  timeAllocation: [],
  numberOfLessons: '',
  expectedResultStr: ''
})
//弹窗控制变量
const dialogFormVisible = ref(false)
//加载控制变量
const fullscreenLoading = ref(false)
const teachingSignDto = ref({
  teacherScheduleId: teacherScheduleId,
})
const router = useRouter()

onMounted(async () => {
})

//获取多媒体资源
const getMultimedia=async ()=>{
  //todo 判断教学内容是否生成
  // const res= await (teacherScheduleId);
  const res=false;
  //说明教学内容已经存在
  if(res){
    //todo 获取多媒体资源
    // createMultimedia(teacherScheduleId);
  }else{
    ElMessage.error('请先生成教学内容');
  }
}

//获取备课
const getLessonPreparation = async () => {
  const res = await chapterLessonPreparationGetListByIdService(teacherScheduleId)
  console.log(res)
  lessonPreparation.value = res.data
}
getLessonPreparation()
//获取教学贴士
const getTeachingTips = async () => {
  const res = await chapterLessonPreparationGetListByIdService(teacherScheduleId)
  console.log(res);
  lessonPreparation.value = res.data
}



const goAiGenerate = async () => {
  fullscreenLoading.value = true;
  const res = await chapterLessonPreparationAiGenerateTeachingSignService(teacherScheduleId)
  console.log(res)
  fullscreenLoading.value = false
  AiGenerateTeachingSign.value = res.data
  dialogFormVisible.value = false
  ElMessage.success('生成成功')
}

const openConfirm = () => {
  router.push(`/lesson/overAllGeneration/${teacherScheduleId}`)
}

const saveContent = async () => {
  const res = await chapterLessonPreparationUpdateService(teacherScheduleId, AiGenerateTeachingSign.value)
  console.log(res)
  ElMessage.success('保存成功')
}

// Add navigation methods
const goToTeachingActivities = () => {
  router.push(`/lesson/lesson_hour/mylessonpreparation/TeachingActivitiesArrangement/${teacherScheduleId}`)
}

const goToTimeAllocation = () => {
  router.push(`/lesson/lesson_hour/mylessonpreparation/TimeAllocation/${teacherScheduleId}`)
}

const goToExpectedResults = () => {
  router.push(`/lesson/lesson_hour/mylessonpreparation/ExpectedResult/${teacherScheduleId}`)
}
//前往多媒体资源
const goToMultimedia= () => {
  router.push(`/lesson/lesson_hour/multimedia/ppt/${teacherScheduleId}`)
}

const goToTeachingContent = () => {
  router.push(`/lesson/lesson_hour/mylessonpreparation/TeachingContent/${teacherScheduleId}`)
}

const goPracticeQuestionGeneration = () => {
  router.push(`/lesson/practice/generate/${teacherScheduleId}`)
}
const goPreFeedBack = () => {
  router.push(`/lesson/pre-feedback/${teacherScheduleId}`)
}
const goRestore = () => {
  ElMessage.success('保存成功')
}
// 添加当前激活的菜单状态
const activeMenu = ref('')

// 添加教学贴士数据
const teachingTips = [
  {
    icon: 'Sunny',
    title: '课堂互动技巧',
    content: '通过提问和小组讨论来提高学生参与度，让课堂更加生动活跃。'
  },
  {
    icon: 'Lightning',
    title: '知识点串联',
    content: '将新知识点与学生已掌握的知识建立联系，帮助学生更好理解和记忆。'
  },
  {
    icon: 'Star',
    title: '案例教学法',
    content: '使用实际案例来解释抽象概念，让学习更加直观和有趣。'
  },
  {
    icon: 'Light',
    title: '课堂节奏把控',
    content: '合理安排教学节奏，注意劳逸结合，保持学生的注意力。'
  },
  {
    icon: 'Opportunity',
    title: '及时反馈',
    content: '通过随堂测试了解学生掌握情况，及时调整教学策略。'
  },
  {
    icon: 'Share',
    title: '资源推荐',
    content: '推荐优质教学资源和补充材料，帮助学生拓展知识面。'
  }
]
</script>
<template>
  <div class="lesson-preparation">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>{{ lessonPreparation.chapterName }}</h1>
          <div class="lesson-meta">
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              课时：{{ AiGenerateTeachingSign.numberOfLessons }} 课时
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              创建时间：2024-03-21
            </span>
          </div>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="openConfirm" :loading="fullscreenLoading">
            <el-icon><MagicStick /></el-icon>
            AI辅助备课
          </el-button>
          <el-button type="success">
            <el-icon @click="goRestore"><Check /></el-icon>
            保存备课
          </el-button>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="nav-section">
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          class="nav-menu"
        >
          <el-menu-item index="activities" @click="goToTeachingActivities">
            <el-icon><Document /></el-icon>
            教学活动安排
          </el-menu-item>
          <el-menu-item index="time" @click="goToTimeAllocation">
            <el-icon><Timer /></el-icon>
            时间分配
          </el-menu-item>
          <el-menu-item index="results" @click="goToExpectedResults">
            <el-icon><Aim /></el-icon>
            预期结果
          </el-menu-item>
          <el-menu-item index="content" @click="goToTeachingContent">
            <el-icon><Reading /></el-icon>
            教学内容
          </el-menu-item>
          <el-menu-item index="content" @click="goToMultimedia">
            <el-icon><Reading /></el-icon>
            多媒体资源
          </el-menu-item>
        </el-menu>
      </div>

      <div class="content-area">
        <div class="main-section">
          <div class="welcome-section">
            <el-empty description="开始您的备课">
              <template #description>
                <h3>欢迎使用智能课时备课系统</h3>
                <p>选择上方导航开始编辑，或使用AI辅助快速生成备课内容</p>
              </template>
              <div class="quick-actions">
                <el-button type="primary" plain @click="goToTeachingActivities">
                  <el-icon><Edit /></el-icon>
                  开始编辑
                </el-button>
                <el-button type="success" plain @click="openConfirm">
                  <el-icon><MagicStick /></el-icon>
                  AI生成
                </el-button>
              </div>
            </el-empty>
          </div>
        </div>

        <div class="side-section">
          <div class="tools-panel">
            <h3>教学工具</h3>
            <div class="tool-buttons">
              <el-button class="tool-btn" type="primary" plain style="margin-left: 10px;" @click="getMultimedia">
                <el-icon><VideoCamera /></el-icon>
                多媒体资源生成
              </el-button>
              <el-button class="tool-btn" type="primary" plain @click="goPracticeQuestionGeneration">
                <el-icon><EditPen /></el-icon>
                练习题生成
              </el-button>
              <el-button class="tool-btn" type="primary" plain @click="goPreFeedBack">
                <el-icon><Files /></el-icon>
                课程反馈
              </el-button>
            </div>
          </div>

          <!-- 新增教学贴士轮播组件 -->
          <div class="tips-carousel">
            <h3>教学小贴士</h3>
            <el-carousel
              height="180px"
              indicator-position="outside"
              :interval="5000"
              type="card"
            >
              <el-carousel-item v-for="(tip, index) in teachingTips" :key="index">
                <div class="tip-card">
                  <div class="tip-icon">
                    <el-icon :size="24" color="#409EFF">
                      <component :is="tip.icon" />
                    </el-icon>
                  </div>
                  <h4>{{ tip.title }}</h4>
                  <p>{{ tip.content }}</p>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>
      </div>
    </div>

    <!-- AI生成对话框 -->
    <el-dialog v-model="dialogFormVisible" title="AI生成备课" width="500">
      <el-form :model="teachingSignDto">
        <el-form-item>
          <el-input
            v-model="teachingSignDto.chapter"
            autocomplete="off"
            placeholder="请输入备课章节名称"
            style="width: 400px;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="goAiGenerate"
            v-loading.fullscreen.lock="fullscreenLoading"
            element-loading-text="正在生成中"
          >
            生成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.lesson-preparation {
  min-height: 100vh;
  background-color: #f0f2f5;

  .page-header {
    background: linear-gradient(135deg, #fff, #f6f9fc);
    padding: 28px 40px;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.02),
      0 4px 16px rgba(0, 0, 0, 0.03);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-section {
        h1 {
          margin: 0;
          font-size: 30px;
          background: linear-gradient(120deg, #2c3e50, #3498db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 600;
          letter-spacing: -0.5px;
        }

        .lesson-meta {
          margin-top: 12px;
          display: flex;
          gap: 32px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
            font-size: 14px;
            padding: 6px 12px;
            background: rgba(64, 158, 255, 0.05);
            border-radius: 6px;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(64, 158, 255, 0.1);
              transform: translateY(-1px);
            }

            .el-icon {
              font-size: 16px;
              color: #409EFF;
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 16px;

        .el-button {
          padding: 10px 24px;
          height: 42px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;

          &.el-button--primary {
            background: linear-gradient(135deg, #409EFF, #3a8ee6);
            border: none;
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
            }
          }

          &.el-button--success {
            background: linear-gradient(135deg, #67C23A, #5daf34);
            border: none;
            box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(103, 194, 58, 0.3);
            }
          }

          .el-icon {
            font-size: 18px;
            margin-right: 8px;
          }
        }
      }
    }
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 40px;

    .nav-section {
      margin-bottom: 32px;
      background: transparent !important;
      border-radius: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;

      .nav-menu {
        background: transparent;
        border: none;
        display: flex;
        justify-content: flex-start;
        gap: 12px;
        padding: 0;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
              90deg,
              rgba(64, 158, 255, 0.1) 0%,
              rgba(64, 158, 255, 0.2) 50%,
              rgba(64, 158, 255, 0.1) 100%
          );
        }

        .el-menu-item {
          height: 48px;
          line-height: 48px;
          padding: 0 24px;
          margin: 0;
          border-radius: 0;
          font-size: 15px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
          border: none;
          position: relative;

          .el-icon {
            margin-right: 8px;
            font-size: 18px;
            transition: all 0.3s ease;
            color: #94a3b8;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 3px;
            background: linear-gradient(90deg, #409EFF, #3a8ee6);
            transition: all 0.3s ease;
            transform: translateX(-50%);
            border-radius: 3px 3px 0 0;
          }

          &:hover {
            color: #409EFF;
            background: transparent;

            .el-icon {
              color: #409EFF;
              transform: translateY(-2px);
            }

            &::after {
              width: 20px;
            }
          }

          &.is-active {
            color: #409EFF;
            background: transparent;
            font-weight: 600;

            &::after {
              width: 100%;
            }

            .el-icon {
              color: #409EFF;
              transform: scale(1.1);
            }
          }
        }
      }
    }

    .content-area {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;

      .main-section {
        background: white;
        border-radius: 16px;
        padding: 32px;
        box-shadow:
          0 1px 3px rgba(0, 0, 0, 0.05),
          0 1px 2px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .welcome-section {
          text-align: center;
          padding: 80px 0;

          h3 {
            margin: 0 0 16px;
            font-size: 28px;
            background: linear-gradient(120deg, #2c3e50, #3498db);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 600;
          }

          p {
            color: #64748b;
            font-size: 16px;
            margin-bottom: 40px;
            line-height: 1.6;
          }

          .quick-actions {
            display: flex;
            justify-content: center;
            gap: 20px;

            .el-button {
              padding: 12px 28px;
              height: 46px;
              font-size: 15px;
              font-weight: 500;
              border-radius: 10px;
              transition: all 0.3s ease;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
              }
            }
          }
        }
      }

      .side-section {
        .tools-panel {
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border-radius: 20px;
          padding: 24px;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);

          h3 {
            margin: 0 0 24px;
            font-size: 18px;
            color: #2c3e50;
            font-weight: 600;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(64, 158, 255, 0.1);
            position: relative;

            &::after {
              content: '';
              position: absolute;
              bottom: -1px;
              left: 0;
              width: 60px;
              height: 2px;
              background: linear-gradient(90deg, #409EFF, transparent);
              border-radius: 2px;
            }
          }

          .tool-buttons {
            display: flex;
            flex-direction: column;
            gap: 16px;

            .tool-btn {
              width: 100%;
              justify-content: flex-start;
              padding: 16px;
              font-size: 15px;
              border-radius: 12px;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              background: white;
              border: 1px solid rgba(64, 158, 255, 0.1);
              color: #64748b;
              position: relative;
              overflow: hidden;

              &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(120deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0));
                opacity: 0;
                transition: opacity 0.3s ease;
              }

              .el-icon {
                margin-right: 12px;
                font-size: 20px;
                color: #409EFF;
                transition: all 0.3s ease;
                vertical-align: middle;
              }

              &:hover {
                color: #409EFF;
                border-color: rgba(64, 158, 255, 0.3);
                transform: translateY(-2px);
                box-shadow:
                  0 4px 12px rgba(64, 158, 255, 0.1),
                  0 2px 4px rgba(64, 158, 255, 0.05);

                &::before {
                  opacity: 1;
                }

                .el-icon {
                  transform: scale(1.1) rotate(-5deg);
                }
              }

              &:active {
                transform: translateY(0);
              }
            }
          }
        }

        // 新增教学贴士轮播组件
        .tips-carousel {
          margin-top: 24px;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border-radius: 20px;
          padding: 24px;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);

          h3 {
            margin: 0 0 20px;
            font-size: 18px;
            color: #2c3e50;
            font-weight: 600;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(64, 158, 255, 0.1);
            position: relative;

            &::after {
              content: '';
              position: absolute;
              bottom: -1px;
              left: 0;
              width: 60px;
              height: 2px;
              background: linear-gradient(90deg, #409EFF, transparent);
              border-radius: 2px;
            }
          }

          :deep(.el-carousel) {
            margin: 0 -12px;
          }

          :deep(.el-carousel__item) {
            padding: 0 12px;
          }

          .tip-card {
            height: 100%;
            background: white;
            border-radius: 16px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            border: 1px solid rgba(64, 158, 255, 0.1);
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow:
                0 4px 12px rgba(64, 158, 255, 0.1),
                0 2px 4px rgba(64, 158, 255, 0.05);
            }

            .tip-icon {
              width: 48px;
              height: 48px;
              background: rgba(64, 158, 255, 0.1);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 12px;
            }

            h4 {
              margin: 0 0 8px;
              font-size: 16px;
              color: #2c3e50;
              font-weight: 600;
            }

            p {
              margin: 0;
              font-size: 14px;
              color: #64748b;
              line-height: 1.5;
            }
          }

          :deep(.el-carousel__indicators) {
            margin-top: 12px;
          }

          :deep(.el-carousel__indicator) {
            .el-carousel__button {
              background: rgba(64, 158, 255, 0.2);
              border-radius: 4px;

              &:hover {
                background: rgba(64, 158, 255, 0.4);
              }
            }

            &.is-active {
              .el-carousel__button {
                background: #409EFF;
              }
            }
          }
        }
      }
    }
  }
}

// Dialog styles
:deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);

  .el-dialog__header {
    margin: 0;
    padding: 24px 32px;
    background: linear-gradient(to right, #f8fafc, #fff);
    border-bottom: 1px solid #edf2f7;

    .el-dialog__title {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
      letter-spacing: 0.5px;
    }
  }

  .el-dialog__body {
    padding: 32px;
  }

  .el-dialog__footer {
    padding: 24px 32px;
    background: #f8fafc;
    border-top: 1px solid #edf2f7;

    .el-button {
      padding: 10px 24px;
      font-size: 15px;
      font-weight: 500;
      border-radius: 10px;
      transition: all 0.3s ease;

      &--primary {
        background: linear-gradient(135deg, #409EFF, #3a8ee6);
        border: none;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
        }
      }
    }
  }
}
</style>
