<script setup>
import { RouterView } from 'vue-router'
import { ArrowDown, User, EditPen, SwitchButton, } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/index.js'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { userCurrentService } from '@/api/user.js'

const router = useRouter()
const userStore = useUserStore()
onMounted(async () => {
  // const res = await userCurrentService()
  // userStore.setUserOjb(res.data)
})
const handleCommand = async (command) => {
  if(command === 'logout') {
    await ElMessageBox.confirm(
      '你确认要进行退出么?',
      '温馨提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        ElMessage({
          type: 'success',
          message: '退出成功',
        })
      })
    userStore.setToken('')
    userStore.setUsername('')
    userStore.setUserId('')
    router.push('/login')
  } else {
    router.push(`/user/${command}`)
  }
}

const goOj = () => {
  window.location.href = 'http://localhost:5174';
}
const goTeacherPort = () => {
  window.location.href = 'http://localhost:4000/home';
}

</script>
<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-menu
          :default-active="$route.path"
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect"
          :ellipsis="false"
          router
        >
          <!-- 放在 <el-menu> 内部的合适位置即可，不再使用 el-menu-item -->
          <div style="display: flex; align-items: center; margin-right: 40px; margin-left: 30px;cursor: pointer;">
            <router-link to="/index" style="display: flex; align-items: center; text-decoration: none;">
              <img
                src="@/assets/logo.png"
                alt="logo"
                style="height: 42px; width: 42px; margin-right: 24px"
              />
              <span style="color: #696969">智能备课</span>
            </router-link>
          </div>
<!--          <el-menu-item index="/app/index">首页</el-menu-item>-->
          <el-menu-item index="/lesson">备课</el-menu-item>
          <el-menu-item @click="goOj">在线OJ</el-menu-item>
          <el-menu-item @click="goTeacherPort">教师端入口</el-menu-item>

          <el-menu-item class="selfInfo">
            <el-dropdown placement="bottom-end" @command="handleCommand">
              <!-- 展示给用户，默认看到的 -->
              <span class="el-dropdown__box">
                <el-text class="mx-1" size="small">用户名:{{ userStore.username }}</el-text>
                <el-avatar
                  :src=" userStore.userOjb.avatarUrl || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"
                />
                <el-icon :size="14">
                  <ArrowDown />
                </el-icon>
              </span>

              <!-- 折叠的下拉部分 -->
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile" :icon="User">基本资料 </el-dropdown-item>
                  <el-dropdown-item command="password" :icon="EditPen">重置密码 </el-dropdown-item>
                  <el-dropdown-item command="logout" :icon="SwitchButton"
                    >退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.el-header {
  padding: 0;
}

.el-menu-demo {
  position: relative;
  .el-menu-item {
    min-width: 124px; /* 根据需要调整宽度 */
    text-align: center; /* 可选，使文本居中 */

    .el-dropdown__box {
      display: flex;
      align-items: center;
      //transform: translateX(15px);

      .el-avatar {
        margin-right: 8px;
      }

      &:focus {
        outline: none;
      }

      .mx-1 {
        margin-right: 10px;
      }
    }
  }
  .selfInfo {
    position: absolute;
    right: 0;
  }
}

.el-main {
  height: 860px;
}
</style>
