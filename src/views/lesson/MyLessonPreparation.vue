<script setup>

import { ref, computed,onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { lessonPreparationRecordGetGetService } from '@/api/lessonPreparationRecord.js'
import PopWindow from '@/views/component/PopWindow.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const popWin = ref()
const lessonPreparationList = ref([]);
const isCreated = ref(false)
const goLessonPreparationRecordGetGetService = async () => {
  const res = await lessonPreparationRecordGetGetService(1)
  lessonPreparationList.value = res.data
}
onMounted(async () => {
  await goLessonPreparationRecordGetGetService()
})
const searchMessage = ref('')

const filteredLessons = computed(() => {
  if (!searchMessage.value) return lessonPreparationList.value;
  return lessonPreparationList.value.filter(lesson =>
    lesson.startLessonTime.includes(searchMessage.value) ||
    lesson.courseName.includes(searchMessage.value) ||
    lesson.className.includes(searchMessage.value)
  )
})

const goSearch = () => {
  // 搜索功能已经通过 computed 属性 `filteredLessons` 实现
}

const goDetails = (id) => {
  // 在这里添加跳转到详情页面的逻辑
  router.push(`/lesson/mylessonpreparationbook/${id}`)
}

const goCreateLessonPreparation = () => {
  popWin.value.popWindowVisible()
}
const changeCreated = async () => {
  popWin.value.popWindowUnVisible()
  await goLessonPreparationRecordGetGetService()
}
</script>

<template>
  <div style="height: 800px">
    <el-card style="max-width: 100%;height: 770px;">
      <template #header>
        <div class="card-header">
          <el-input
            v-model="searchMessage"
            style="width: 300px"
            placeholder="快速搜索备课"
            size="large"
            clearable
          />
          <el-button type="primary" :icon="Search" size="large" @click="goSearch">搜索</el-button>
          <el-button type="primary" size="large" round style="transform: translateX(410px)" @click="goCreateLessonPreparation">创建备课本</el-button>
        </div>
      </template>
      <div class="app-list-container">
        <div
          v-for="lessonPreparation in filteredLessons"
          :key="lessonPreparation.id"
          class="app"
          @click="goDetails(lessonPreparation.id)"
        >
          <div style="width: 140px; height: 152px;transform: translateX(37px)" >
            <img src="../../assets/filelogo4.jpg" alt="App Icon" class="app-icon" />
          </div>
          <span class="app-name">{{ lessonPreparation.startLessonTime.split('-')[0] }}</span>
          <span class="app-name"> {{ +lessonPreparation.term === 0? '上半年': '下半年'}}</span>
          <div>
            <span class="app-desc" style="transform: translateY(6px)">{{ lessonPreparation.courseName }}</span>
            <span class="app-desc">{{ lessonPreparation.className }}</span>
          </div>
          <div class="app-footer">
            <span class="user-info">
              <span class="user-name">{{ new Date(lessonPreparation.createTime).toLocaleString() }}   创建</span>
            </span>
          </div>
        </div>
        <div v-if="filteredLessons.length === 0">
          <el-empty description="没有发现备课记录" :image-size="200" style="margin-top: 180px" />
        </div>
      </div>
    </el-card>
    <pop-window ref="popWin" :isCreated="isCreated" @changeCreated="changeCreated"></pop-window>
  </div>
</template>

<style lang="scss" scoped>
.card-header {
  position: relative;
  text-align: center;
  margin-bottom: 20px;
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
  width: 220px;
  height: 290px;
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
  font-size: 18px;
  margin: 15px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f7f7f7;
  border-top: 1px solid #eee;
  font-size: 14px;
}

</style>
