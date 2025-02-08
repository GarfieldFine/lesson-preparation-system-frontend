<script setup>
import { Calendar,  Notebook } from '@element-plus/icons-vue'
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
      <el-aside width="220px" style="height: 765px;border-right: 1px solid #dcdfe6;">
        <h5 class="mb-2">Default colors</h5>
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
              <el-icon><Notebook /></el-icon>
              <span>备课</span>
            </template>
            <el-menu-item-group title="Group One">
              <el-menu-item index="/lesson/mylessonpreparation">我的备课本</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="Group Two">
              <el-menu-item index="1-3">item three</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-menu-item index="/lesson/lessontable">
            <el-icon><Calendar /></el-icon>
            <span>我的课表</span>
          </el-menu-item>
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
