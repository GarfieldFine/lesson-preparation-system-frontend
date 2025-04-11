<script setup>
import { Calendar, Notebook } from '@element-plus/icons-vue'
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()
const handleOpen = () => {

}
const handleClose = () => {

}
</script>
<template>
  <el-card style="max-width: 100%">
    <el-container class="layout-containe">
      <el-aside width="220px" style="height: 800px;border-right: 1px solid #dcdfe6;">
        <el-menu
          default-active="2"
          class="el-menu-vertical-demo"
          :default-active="$route.path"
          @open="handleOpen"
          @close="handleClose"
          router
        >
          <el-sub-menu index="1">
            <template #title>
              <el-icon>
                <Notebook />
              </el-icon>
              <span>备课</span>
            </template>
            <el-menu-item index="/lesson/mylessonpreparation">我的备课本</el-menu-item>
            <el-menu-item index="/lesson/mylessonpreparation/practice">学生练习题</el-menu-item>
            <el-menu-item index="/lesson/student/practice">做题</el-menu-item>
            <el-menu-item index="/lesson/student-feedback">学生反馈</el-menu-item>
            <el-menu-item index="/lesson/teachingPlan">教案</el-menu-item>
            <el-menu-item index="/lesson/student/questionBank">学生题库</el-menu-item>
            <el-menu-item index="/lesson/lesson_hour/studentDetail">学生详情</el-menu-item>
            <el-menu-item index="/lesson/examGen">生成考试内容</el-menu-item>
            <el-menu-item index="/lesson/student/exam">考试</el-menu-item>

          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <el-icon>
                <Calendar />
              </el-icon>
              <span>课表</span>
            </template>
            <el-menu-item index="/lesson/lessontable">我的课表</el-menu-item>
            <el-menu-item index="/lesson/lesson_hour/mylessonpreparation">课时备课本</el-menu-item>
            <el-menu-item index="/lesson/mylessonpreparation">章节备课本</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <el-main style="width: 100%;padding: 0">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-card>
</template>

<style lang="scss" scoped>
.el-card {
  //height: 1000px;
  //height: 100%;
  border-radius: 10px;

  .el-card__body {
    //height: 1000px;
    //height: 100%;
    width: 100%;
  }

  .el-menu-vertical-demo {
    border-right: 0 solid var(--el-menu-border-color);
  }
}
</style>
