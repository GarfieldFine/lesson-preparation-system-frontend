import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/index.js'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: () => import('@/views/login/LoginPage.vue') },
    {
      path: '/',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      redirect: '/app/index',
      children: [
        {
          path: '/app/index',
          component: () => import('@/views/app/index.vue')
        },
        {
          path: '/lesson',
          component: () => import('@/views/lesson/LessonLayout.vue'),
          redirect: '/lesson/lessontable',
          children: [
            {
              path: '/lesson/lessontable',
              component: () => import('@/views/lesson/LessonTable.vue')
            },
            {
              path: '/lesson/mylessonpreparation',
              component: () => import('@/views/lesson/MyLessonPreparation.vue')
            },
            {
              path: '/lesson/mylessonpreparationbook/:lessonPreparationBookId',
              component: () => import('@/views/lesson/MyLessonPreparationBook.vue')
            },
            {
              path: '/lesson/mylessonpreparation/:teacherScheduleId',
              component: () => import('@/views/lesson/LessonPreparationDetails.vue')
            },
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
