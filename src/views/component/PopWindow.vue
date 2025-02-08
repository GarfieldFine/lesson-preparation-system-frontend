<script setup>
import { ref,defineProps,defineEmits } from 'vue'
import { classGetAllNameService } from '@/api/class.js'
import { courseGetAllNameService } from '@/api/course.js'
import { lessonPreparationRecordAddGetService } from '@/api/lessonPreparationRecord.js'
const dialogTableVisible = ref(false)
const courseList = ref([])
const classList = ref([])
const form = ref({
  courseId: '',
  classId: '',
  startLessonTime: '',
  term: 0
})
const emit = defineEmits(['changeCreated'])
const popWindowVisible = async () => {
  dialogTableVisible.value = true
  const res1 = await classGetAllNameService()
  classList.value = res1.data
  console.log(res1)
  const res2 = await courseGetAllNameService()
  console.log(res2)
  courseList.value = res2.data
}
const popWindowUnVisible = () => {
  dialogTableVisible.value = false
  classList.value = []
  courseList.value = []
}

const onSubmit = async () => {
  if (!form.value.courseId) {
    ElMessage.error('课程不能为空')
    return
  }

  // 检查 classId 是否为空
  if (!form.value.classId) {
    ElMessage.error('班级不能为空')
    return
  }

  // 检查 startLessonTime 是否为空
  if (!form.value.startLessonTime) {
    ElMessage.error('开课时间不能为空')
    return
  }
  console.log(form.value.startLessonTime)
  await lessonPreparationRecordAddGetService(form.value)
  ElMessage.success('创建成功')
  emit('changeCreated')
}
defineExpose({
  popWindowVisible,
  popWindowUnVisible,
})
</script>
<template>
  <div>
    <el-dialog v-model="dialogTableVisible" width="450" style="height: 420px;" center>
      <el-form :model="form" label-width="auto" style="max-width: 350px">
        <el-form-item label="课程">
          <el-select size="large" v-model="form.courseId" placeholder="请选择课程">
            <el-option v-for="course in courseList" :key="course.id" :label="course.courseName" :value="course.id" />
          </el-select>
        </el-form-item>

          <el-form-item label="班级">
            <el-select size="large" v-model="form.classId" placeholder="请选择班级">
              <el-option v-for="cl in classList" :key="cl.id" :label="cl.className" :value="cl.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="开课时间">
            <el-date-picker
              v-model="form.startLessonTime"
              type="date"
              placeholder="请选择开课时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              size="large"
            />
          </el-form-item>

          <el-form-item label="学期">
            <el-select v-model="form.term" size="large">
              <el-option label="上学期" :value="0" />
              <el-option label="下学期" :value="1" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button @click="popWindowUnVisible" style="transform: translate(40px,20px)">取消</el-button>
            <el-button type="primary" @click="onSubmit" style="transform: translate(60px,20px)">创建</el-button>
          </el-form-item>

      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>

</style>
