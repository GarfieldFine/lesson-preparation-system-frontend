<script setup>
import { ref, onMounted } from 'vue'
import { teacherScheduleGetListByLessonPreparationRecIdService } from '@/api/teacherSchedule.js'
import { useRoute,useRouter } from 'vue-router'
const router = useRouter()
const LessonPreparationRecId = useRoute().params.lessonPreparationBookId
const lessonPreparationList = ref([])
onMounted(async () => {
  const res = await teacherScheduleGetListByLessonPreparationRecIdService(LessonPreparationRecId)
  console.log(res)
  lessonPreparationList.value = res.data
})
const goDetails = (teacherScheduleId) => {
  router.push(`/lesson/mylessonpreparation/${teacherScheduleId}`)
}
</script>
<!--第几课时，上课时间，章节标题标题-->
<template>
  <div>
    <el-card style="max-width: 100%;">
      <template #header>
        <div class="card-header">
          <span>授课班级：{{}}</span>
        </div>
      </template>
      <div class="app-list-container">
        <div
          v-for="(lessonPreparation,index) in lessonPreparationList"
          :key="lessonPreparation.id"
          class="app"
          @click="goDetails(lessonPreparation.id)"
        >
          <div style="width: 80px; height: 92px;transform: translateX(37px)" >
            <img src="../../assets/filelogo6.jpg" alt="App Icon" class="app-icon" />
          </div>
          <span class="app-name">第 {{index + 1}} 课时</span>
          <div class="app-footer">

              <p style="margin: 5px 0">上课时间 {{new Date(lessonPreparation.fullClassTime) < new Date() ? '(已上)' : '(未上)'}}</p>
              <span style="padding-top: 10px">{{lessonPreparation.month+'月'+lessonPreparation.day+'日'+(new Date(lessonPreparation.classTimeStart).toLocaleString().split(' ')[1]) }}</span>

          </div>
        </div>
        <div v-if="lessonPreparationList.length === 0">
          <el-empty description="该备课本为空" :image-size="200" style="margin-top: 180px" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.card-header {
  color: #dddddd;
}

.app-list-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.app {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 15px;
  overflow: hidden;
  width: 150px;
  height: 180px;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.app:hover {
  transform: translateY(-10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.app-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.app-name {
  display: inline-block;
  text-align: center;
  margin-left: 35px;
  margin-bottom: 10px;
  font-size: 15px;
  color: #333;
}

.app-desc {
  font-size: 14px;
  color: #666;
  margin: 12px 15px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.app-footer {
  padding: 6px 10px;
  background-color: #f7f7f7;
  border-top: 1px solid #eee;
  font-size: 14px;
}

</style>
