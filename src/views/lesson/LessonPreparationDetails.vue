<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { onMounted,ref} from 'vue'
import { useRoute } from 'vue-router'
import { lessonPreparationGetByTeacherScheduleIdService, lessonPreparationAiGenerateTeachingSignService } from '@/api/lessonPreparation.js'
import { ArrowRight } from '@element-plus/icons-vue'
const teacherScheduleId = useRoute().params.teacherScheduleId
//时间安排
const timeArrangeList = ref([])
//备课
const lessonPreparation = ref({

})
//弹窗控制变量
const dialogFormVisible = ref(false)
//加载控制变量
const fullscreenLoading = ref(false)
const teachingSignDto = ref({
  teacherScheduleId: teacherScheduleId,
  chapter: ''
})
onMounted(async () => {
  const res = await lessonPreparationGetByTeacherScheduleIdService(teacherScheduleId)
  lessonPreparation.value = res.data
})

const addOption = () => {
  timeArrangeList.value.push({ startTime: '', endTime: '', task: '' })
}

const removeOption = (optionIndex) => {
  timeArrangeList.value.splice(optionIndex, 1)
}
const DialogVisible = () => {
  dialogFormVisible.value = true
}

const goAiGenerate = async () => {
  if(teachingSignDto.value.chapter === ''){
    ElMessage.error('请输入课程章节')
    return
  }
  fullscreenLoading.value = true;
  const res = await lessonPreparationAiGenerateTeachingSignService(teachingSignDto)
  console.log(res)
  fullscreenLoading.value = false
  ElMessage.success('生成成功')
}
</script>
<template>
  <div>
    <el-card style="max-width: 100%">
        <div v-if="true">
          <el-row>
            <el-col :span="20" style="border-right: 1px dashed #d9d9d9;padding-right: 16px">
              <div style="display: flex;justify-content: space-between">
                <h3>教学活动安排</h3>
                <el-button type="primary" plain style="transform: translate(410px,20px)" @click="DialogVisible">使用ai生成</el-button>
                <el-button type="primary" plain style="transform: translateY(20px)">保存</el-button>
              </div>
              <QuillEditor theme="snow" content-type="text" style="height: 500px;"/>
              <h3>时间分配</h3>
              <div class="time-arrange-options">
                <div
                  v-for="(timeArrange, optionIndex) in timeArrangeList"
                  :key="optionIndex"
                  class="el-form-item"
                >
                  <el-input v-model="timeArrange.startTime" placeholder="开始时间" class="el-input" />
                  <el-input v-model="timeArrange.endTime" placeholder="结束时间" class="el-input" />
                  <el-divider direction="vertical" />
                  <el-input
                    v-model="timeArrange.task"
                    placeholder="任务安排"
                    class="el-input"
                    style="width: 420px"
                  />
                  <div class="option-buttons">
                    <el-button
                      type="text"
                      size="small"
                      @click.prevent="removeOption(optionIndex)"
                      class="el-button is-text"
                    >删除选项
                    </el-button>
                  </div>
                </div>
                <div class="option-buttons">
                  <el-button
                    type="text"
                    size="small"
                    @click.prevent="addOption()"
                    class="el-button is-text"
                  >
                    增加安排
                  </el-button>
                </div>
              </div>
              <h3>预期结果</h3>
              <el-input
                v-model="textarea"
                style="width: 1100px;"
                :rows="18"
                type="textarea"
                resize="none"
              />
            </el-col>
            <el-col :span="4">
              <div class="grid-content ep-bg-purple-light">
                <el-button type="primary" plain style="margin-bottom: 10px;margin-left: 30px">多媒体教学资源生成<el-icon><ArrowRight /></el-icon></el-button>
                <el-button type="primary" plain style="margin-left: 30px">练习题生成<el-icon><ArrowRight /></el-icon></el-button>
              </div>
            </el-col>
          </el-row>

        </div>
        <div v-else>
          <el-empty description="该节暂未备课" :image-size="200" style="margin-top: 180px" />
        </div>
    </el-card>
  </div>

  <el-dialog v-model="dialogFormVisible" title="AI生成备课" width="500">
    <el-form :model="teachingSignDto">
      <el-form-item>
        <el-input v-model="teachingSignDto.chapter" autocomplete="off" placeholder="请输入备课章节名称" style="width: 400px;"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="goAiGenerate" v-loading.fullscreen.lock="fullscreenLoading">
          生成
        </el-button>
      </div>
    </template>
  </el-dialog>

</template>
<style lang="scss" scoped>

.time-arrange-options {
  margin-top: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  background-color: #fafafa;

  .el-form-item {
    margin-bottom: 10px;
  }

  .el-input {
    width: 150px; // Adjust width for inline layout
    margin-right: 50px;
  }

  .option-buttons {
    //display: flex;
    display: inline-block;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;

    .el-button.is-text {
      margin-left: 0;
      background-color: #e0f7fa; /* 浅蓝色背景 */
      color: #0288d1; /* 深蓝色文本 */
      border: 1px solid #b3e5fc; /* 浅蓝色边框 */
      padding: 8px 15px; /* 内边距 */
      border-radius: 4px; /* 边框圆角 */
      transition:
        background-color 0.3s ease,
        color 0.3s ease; /* 过渡效果 */

      &:hover {
        background-color: #b3e5fc; /* 悬停时的背景颜色 */
        color: #01579b; /* 悬停时的文本颜色 */
      }

      &:focus {
        outline: none; /* 移除焦点时的轮廓 */
      }
    }
  }
}
</style>
