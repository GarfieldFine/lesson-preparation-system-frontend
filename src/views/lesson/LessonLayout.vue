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
          <el-menu-item index="/lesson/lessontable">我的课表</el-menu-item>
          <el-menu-item index="/lesson/lesson_hour/mylessonpreparation">课时备课本</el-menu-item>
          <el-menu-item index="/lesson/mylessonpreparation">章节备课本</el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="width: 100%;padding: 0;overflow-y: auto;">
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
    height: 100%;
    width: 100%;
  }

  .el-menu-vertical-demo {
    border-right: 0 solid var(--el-menu-border-color);
  }
}
</style>
