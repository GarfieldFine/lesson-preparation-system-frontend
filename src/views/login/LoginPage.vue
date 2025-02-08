<script setup>
import { ref, watch } from 'vue'
import { User,Lock,Right,Back } from '@element-plus/icons-vue'
import { userRegisterService, userLoginService } from '@/api/user.js'
import { useUserStore } from '@/stores/index.js'
import {useRouter} from 'vue-router'

const router = useRouter()
const  userStore = useUserStore()
const isRegister = ref(false)
//表单组件本身
const form = ref()
//表单内容对应的对象
const UserInfo = ref({
  account: '',
  password: '',
  checkPassword: ''
})
//表单校验规则
const rules = {
  account: [
    { required: true, message: '用户名不能为空', trigger: 'blur'},
    { min: 5,max: 15,message: '用户名长度不符', trigger: 'blur'}
  ],
  password: [
    { required: true, message: '用户名不能为空', trigger: 'blur'},
    { pattern: /^\S{6,15}$/,message: '密码不符合要求',trigger: 'blur'}
  ],
  checkPassword: [
    { required: true, message: '用户名不能为空', trigger: 'blur'},
    { pattern: /\S{6,15}$/,message: '密码不符合要求',trigger: 'blur'},
    { validator: ( rule, value, callback ) => {
      if( value !== UserInfo.value.password ) {
        callback(Error('两次输入不一致'))
      } else {
        callback()
      }
      },
      trigger: 'blur'
    }
  ]
}
//点击注册的事件
const register = async () => {
  await form.value.validate()
  await userRegisterService(UserInfo.value)
  form.value.resetFields()
  isRegister.value = false
  ElMessage.success('注册成功')
}
//点击登录的事件
const goLogin = async () => {
  await form.value.validate()
  const res = await userLoginService(UserInfo.value)
  userStore.setToken(res.data.token)
  userStore.setUserId(res.data.id.toString())
  userStore.setUsername(res.data.username)
  userStore.setRole(res.data.role)
  userStore.setAvatarUrl(res.data.avatarUrl)
  console.log(res)
  router.push('/')
  ElMessage.success('登录成功')
}
//切换登录注册
// const swap = () => {
//   form.value.resetFields()
//   isRegister.value = !isRegister.value
// }
watch(isRegister,()=>{
  form.value.resetFields()
})
</script>

<template>
  <div>
    <el-row>
      <el-col :span="12" :offset="6">
        <div class="headLogo">
<!--          <img src="@/assets/headlogo.png" alt="" />-->
          <img src="@/assets/AIquestionLogo.jpg" alt="" />
          <h3>AI应用问答中心</h3>
          <div class="lab">
            <p>致力于网站开发</p>
          </div>
        </div>
      </el-col>
      <el-col :span="5" :offset="10" class="login" v-if="!isRegister">
        <h3 class="title">登录</h3>
        <div class="form">
          <el-form :model="UserInfo" :rules="rules" label-width="auto" style="max-width: 600px" ref="form">
            <el-form-item label-position="left" prop="account">
              <el-input :prefix-icon="User" v-model="UserInfo.account" placeholder="请输入用户名" size="large" />
            </el-form-item>
            <el-form-item label-position="left" prop="password">
              <el-input :prefix-icon="Lock" v-model="UserInfo.password" type="password" placeholder="请输入密码" size="large" show-password/>
            </el-form-item>
            <el-form-item>
              <div class="loginFooter">
                <el-checkbox>记住我</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码？</el-link>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button @click="goLogin" type="primary" class="btn">登录</el-button>
            </el-form-item>
            <el-form-item>
              <el-button
                :type="'info'"
                text
                @click="isRegister = true"
              >
                去注册
                <el-icon :size="16">
                  <Right />
                </el-icon>
              </el-button>

            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="5" :offset="10" class="login" v-else>
        <h3 class="title">注册</h3>
        <div class="form">
          <el-form :model="UserInfo" :rules="rules" label-width="auto" style="max-width: 600px" ref="form">
            <el-form-item label-position="left" prop="account">
              <el-input :prefix-icon="User" v-model="UserInfo.account" placeholder="请输入用户名" size="large" />
            </el-form-item>
            <el-form-item label-position="left" prop="password">
              <el-input :prefix-icon="Lock" v-model="UserInfo.password" placeholder="请输入密码" size="large" show-password />
            </el-form-item>
            <el-form-item label-position="left" prop="checkPassword">
              <el-input :prefix-icon="Lock" v-model="UserInfo.checkPassword" placeholder="请再次输入密码" size="large" show-password />
            </el-form-item>
            <el-form-item>
              <el-button @click="register" type="primary" class="btn">注册</el-button>
            </el-form-item>
            <el-form-item>
              <el-button
                :type="'info'"
                text
                @click="isRegister = false"
              >
                <el-icon :size="16">
                  <Back />
                </el-icon>
                去登录
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col :span="20" :offset="2" class="login">
        <div class="splitLine">
          <hr>
        </div>
      </el-col>
    </el-row>
  </div>

</template>

<style lang="scss" scoped>
.headLogo {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;

  img {
    height: 80px;
    width: 80px;
    border-radius: 8px;
  }

  h3 {
    margin-left: 40px;
    font-size: 28px;
    transform: translateY(-10px);
  }

  .lab {
    position: absolute;
    transform: translate(5px,25px);
    p {
      font-size: 14px;
      font-weight: 300;
      color: #00C5CD;
    }
  }
}
.login {
  transform: translateX(-20px);

  .title {
    margin-bottom: 40px;
    font-size: 28px;
  }
  .loginFooter {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}
.btn {
  width: 100%;
  height: 40px;
}

.splitLine {
  margin-top: 80px;
}
</style>
