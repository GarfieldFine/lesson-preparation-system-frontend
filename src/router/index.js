import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/index.js'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: () => import('@/views/login/LoginPage.vue') },
    { path: '/index', component: () => import('@/views/index.vue') },
    {
      path: '/lesson/student/exam/:examQuestionGroupId',
      component: () => import('@/views/lesson/lessonPreparation/StudentExamination.vue')
    },
    {
      path: '/lesson/student/practice/:practiceGroupId',
      component: () => import('@/views/lesson/practice/StudentPractice.vue')
    },
    {
      path: '/lesson/student-feedback/:teacherScheduleId',
      component: () => import('@/views/lesson/lessonPreparation/StudentFeedback.vue')
    },
    {
      path: '/lesson/student/questionBank',
      component: () => import('@/views/lesson/lessonPreparation/StudentQuestionBank.vue')
    },
    {
      path: '/lesson/student/doPractice/:questionId',
      component: () => import('@/views/lesson/lessonPreparation/StudentDoPractice.vue')
    },
    {
      path: '/',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      redirect: '/index',
      children: [
        {
          path: '/app/index',
          component: () => import('@/views/app/index.vue')
        },
        {
          path: '/lesson',
          component: () => import('@/views/lesson/LessonLayout.vue'),
          redirect: '/lesson/lesson_hour/mylessonpreparation',
          children: [
            {
              path: '/lesson/lessontable',
              component: () => import('@/views/lesson/lessonTable/LessonTable.vue')
            },
            {
              path: '/lesson/mylessonpreparation',
              component: () => import('@/views/lesson/lessonPreparation/MyLessonPreparation.vue')
            },
            {
              path: '/lesson/mylessonpreparationbook/:lessonPreparationBookId',
              component: () => import('@/views/lesson/lessonPreparation/MyLessonPreparationBook.vue')
            },
            {
              path: '/lesson/mylessonpreparation/:chapterLessonPreparationId',
              component: () => import('@/views/lesson/lessonPreparation/LessonPreparationDetails.vue')
            },
            {
              path: '/lesson/mylessonpreparation/TeachingActivitiesArrangement/:chapterLessonPreparationId',
              component: () => import('@/views/lesson/lessonPreparation/TeachingActivitiesArrangement.vue')
            },
            {
              path: '/lesson/mylessonpreparation/TimeAllocation/:chapterLessonPreparationId',
              component: () => import('@/views/lesson/lessonPreparation/TimeAllocation.vue')
            },
            {
              path: '/lesson/mylessonpreparation/practice',
              component: () => import('@/views/lesson/practiceQuestion.vue')
            },
            {
              path: '/lesson/mylessonpreparation/ExpectedResult/:chapterLessonPreparationId',
              component: () => import('@/views/lesson/lessonPreparation/ExpectedResult.vue')
            },
            {
              path: '/lesson/mylessonpreparation/TeachingContent/:chapterLessonPreparationId',
              component: () => import('@/views/lesson/lessonPreparation/TeachingContent.vue')
            },
            {
              path: '/lesson/pre-feedback/:teacherScheduleId',
              component: () => import('@/views/lesson/lessonPreparation/PreFeedback.vue')
            },
            {
              path: '/lesson/post-feedback/:teacherScheduleId',
              component: () => import('@/views/lesson/lessonPreparation/PostFeedback.vue')
            },

            {
              path: '/lesson/teachingPlan/:chapterLessonPreparationId',
              component: () => import('@/views/lesson/lessonPreparation/TeachingPlan.vue')
            },
            {
              path: '/lesson/student/questionBank',
              component: () => import('@/views/lesson/lessonPreparation/StudentQuestionBank.vue')
            },

            {
              path: '/lesson/examGen',
              component: () => import('@/views/lesson/lessonPreparation/ExamGen.vue')
            },
            {
              path: '/lesson/teachingCalendar/:lessonPreparationRecId',
              component: () => import('@/views/lesson/lessonPreparation/teachingCalendar.vue')
            },
            {
              path: '/lesson/lesson_hour/mylessonpreparation',
              component: () => import('@/views/lesson/lessonTable/MyLessonPreparation.vue')
            },
            {
              path: '/lesson/lesson_hour/mylessonpreparationbook/:lessonPreparationBookId',
              component: () => import('@/views/lesson/lessonTable/MyLessonPreparationBook.vue')
            },
            {
              path: '/lesson/lesson_hour/mylessonpreparation/:teacherScheduleId',
              component: () => import('@/views/lesson/lessonTable/LessonPreparationDetails.vue')
            },
            {
              path: '/lesson/lesson_hour/mylessonpreparation/TeachingActivitiesArrangement/:teacherScheduleId',
              component: () => import('@/views/lesson/lessonTable/TeachingActivitiesArrangement.vue')
            },
            {
              path: '/lesson/lesson_hour/mylessonpreparation/TimeAllocation/:teacherScheduleId',
              component: () => import('@/views/lesson/lessonTable/TimeAllocation.vue')
            },
            {
              path: '/lesson/lesson_hour/mylessonpreparation/ExpectedResult/:teacherScheduleId',
              component: () => import('@/views/lesson/lessonTable/ExpectedResult.vue')
            },
            {
              path: '/lesson/lesson_hour/mylessonpreparation/TeachingContent/:teacherScheduleId',
              component: () => import('@/views/lesson/lessonTable/TeachingContent.vue')
            },
            {
              path: '/lesson/lesson_hour/studentDetail',
              component: () => import('@/views/lesson/lessonTable/StudentDetail.vue')
            },
            {
              path: '/lesson/overAllGeneration/:teacherScheduleId',
              component: () => import('@/views/lesson/lessonTable/OverallAIGeneration.vue')
            },
            {
              path: '/lesson/practice',
              component: () => import('@/views/lesson/createQuestion1.vue'),
              redirect: '/lesson/practice/generate',
              children: [
                {
                  path: '/lesson/practice/generate/:teacherScheduleId',
                  component: () => import('@/views/lesson/practice/IntelligentQuestionGeneration.vue')
                },
                {
                  path: '/lesson/practice/stats/:teacherScheduleId',
                  component: () => import('@/views/lesson/practice/StatisticalAnalysis.vue')
                },
                {
                  path: '/lesson/practice/question-bank/:teacherScheduleId',
                  component: () => import('@/views/lesson/practice/QuestionBankManagement.vue')
                },
                {
                  path: '/lesson/practice/question-detail/:questionId',
                  component: () => import('@/views/lesson/practice/QuestionDetail.vue')
                },
                {
                  path: '/lesson/practice/ai-assistant',
                  component: () => import('@/views/lesson/practice/AiAssistant.vue')
                }
              ]
            }
          ]
        }
      ]
    }
  ]
})
router.beforeEach((to) => {
  const userStore = useUserStore()
  // if (!userStore.token && to.path !== '/login') {
  //   ElMessage.error('用户未登录')
  //   return '/login'
  // }
  return true
})

export default router
