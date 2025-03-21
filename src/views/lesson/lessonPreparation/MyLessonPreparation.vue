<script setup>

import { ref, computed,onMounted } from 'vue';
import { Search, Plus, Clock, Filter } from '@element-plus/icons-vue';
import { lessonPreparationRecordGetGetService } from '@/api/lessonPreparationRecord.js'
import PopWindow from '@/views/component/PopWindow.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const popWin = ref()
const lessonPreparationList = ref([]);
const isCreated = ref(false)
const goLessonPreparationRecordGetGetService = async () => {
  const res = await lessonPreparationRecordGetGetService(1)
  console.log(res)
  lessonPreparationList.value = res.data
}
onMounted(async () => {
  await goLessonPreparationRecordGetGetService()
})
const searchMessage = ref('')

const filterVisible = ref(false)
const filterYear = ref('')
const filterTerm = ref('')
const filterStatus = ref('')

const years = computed(() => {
  const uniqueYears = new Set(lessonPreparationList.value.map(lesson =>
    lesson.startLessonTime.split('-')[0]
  ))
  return Array.from(uniqueYears).sort((a, b) => b - a)
})

const filteredLessons = computed(() => {
  let filtered = lessonPreparationList.value;

  // Text search filter
  if (searchMessage.value) {
    filtered = filtered.filter(lesson =>
      lesson.startLessonTime?.includes(searchMessage.value) ||
      lesson.courseName?.includes(searchMessage.value) ||
      lesson.className?.includes(searchMessage.value)
    )
  }

  // Year filter
  if (filterYear.value) {
    filtered = filtered.filter(lesson =>
      lesson.startLessonTime.split('-')[0] === filterYear.value
    )
  }

  // Term filter
  if (filterTerm.value !== '') {
    filtered = filtered.filter(lesson =>
      lesson.term === +filterTerm.value
    )
  }

  // Status filter
  if (filterStatus.value !== '') {
    filtered = filtered.filter(lesson =>
      lesson.teachingState === +filterStatus.value
    )
  }

  return filtered
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

const resetFilters = () => {
  filterYear.value = ''
  filterTerm.value = ''
  filterStatus.value = ''
}
</script>

<template>
  <div class="page-container">
    <el-card class="lesson-card">
      <template #header>
        <div class="card-header">
          <div class="search-area">
            <el-input
              v-model="searchMessage"
              class="search-input"
              placeholder="快速搜索备课"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" :icon="Search" size="large" class="search-btn" @click="goSearch">
              搜索
            </el-button>

            <el-popover
              placement="bottom-start"
              :width="300"
              trigger="click"
              v-model:visible="filterVisible"
              popper-class="filter-popover"
            >
              <template #reference>
                <el-button
                  class="filter-btn"
                  :type="filterYear || filterTerm !== '' || filterStatus !== '' ? 'primary' : 'default'"
                  size="large"
                >
                  <el-icon><Filter /></el-icon>
                  筛选
                </el-button>
              </template>

              <div class="filter-container">
                <div class="filter-header">
                  <span>筛选条件</span>
                  <el-button type="text" @click="resetFilters">重置</el-button>
                </div>

                <div class="filter-section">
                  <div class="filter-label">学年</div>
                  <el-select v-model="filterYear" placeholder="选择年份" clearable>
                    <el-option
                      v-for="year in years"
                      :key="year"
                      :label="year + '年'"
                      :value="year"
                    />
                  </el-select>
                </div>

                <div class="filter-section">
                  <div class="filter-label">学期</div>
                  <el-select v-model="filterTerm" placeholder="选择学期" clearable>
                    <el-option label="上半年" value="0" />
                    <el-option label="下半年" value="1" />
                  </el-select>
                </div>

                <div class="filter-section">
                  <div class="filter-label">状态</div>
                  <el-select v-model="filterStatus" placeholder="选择状态" clearable>
                    <el-option label="进行中" value="1" />
                    <el-option label="已结束" value="0" />
                  </el-select>
                </div>
              </div>
            </el-popover>
          </div>

          <el-button type="primary" size="large" class="create-btn" @click="goCreateLessonPreparation">
            <el-icon><Plus /></el-icon>创建备课本
          </el-button>
        </div>
      </template>
      <div class="app-list-container">
        <div
          v-for="lessonPreparation in filteredLessons"
          :key="lessonPreparation.id"
          class="app"
          @click="goDetails(lessonPreparation.id)"
        >
          <div class="app-icon-wrapper">
            <div class="icon-background"></div>
            <img src="../../../assets/filelogo4.jpg" alt="App Icon" class="app-icon" />
          </div>
          <div class="app-content">
            <div class="app-header">
              <div class="header-info">
                <span class="app-year">{{ lessonPreparation.startLessonTime.split('-')[0] }}</span>
                <span class="app-term">{{ +lessonPreparation.term === 0 ? '上半年' : '下半年'}}</span>
              </div>
              <div class="status-badge" v-if="+lessonPreparation.teachingState === 1">进行中</div>
              <div class="status-badge1" v-else>已结束</div>
            </div>
            <div class="app-course">
              {{ lessonPreparation.courseName }}
            </div>
            <div class="app-footer">
              <el-icon><Clock /></el-icon>
              {{ new Date(lessonPreparation.createTime).toLocaleString() }}
            </div>
          </div>
        </div>
        <div v-if="filteredLessons.length === 0" class="empty-state">
          <el-empty description="没有发现备课记录" :image-size="200" />
        </div>
      </div>
    </el-card>
    <pop-window ref="popWin" :isCreated="isCreated" @changeCreated="changeCreated"></pop-window>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  height: 800px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding: 20px;
}

.lesson-card {
  height: 770px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  overflow: hidden;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 20px;

  .search-area {
    display: flex;
    gap: 12px;

    .search-input {
      width: 300px;
      :deep(.el-input__wrapper) {
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.8);
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          background: white;
        }
      }
    }

    .search-btn {
      border-radius: 10px;
      background: #409eff;
      border: none;
      transition: all 0.3s ease;
      padding: 0 20px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
    }
  }

  .create-btn {
    background: linear-gradient(45deg, #409eff, #36b4ff);
    border: none;
    padding: 0 24px;
    border-radius: 10px;
    transition: all 0.3s ease;

    .el-icon {
      margin-right: 6px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
}

.app-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 10px;
}

.app {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(235, 238, 245, 0.6);
  height: 300px;
  display: flex;
  flex-direction: column;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: linear-gradient(45deg, rgba(64, 158, 255, 0.1), transparent);
    opacity: 0;
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);

    &::after {
      opacity: 1;
    }

    .app-icon {
      transform: scale(1.05);
    }
  }

  .app-icon-wrapper {
    padding: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8fafc;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      width: 140%;
      height: 140%;
      background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, transparent 70%);
      top: -20%;
      left: -20%;
    }

    .app-icon {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }
  }

  .app-content {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .app-year {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .app-term {
      font-size: 13px;
      color: #606266;
      background: #f5f7fa;
      padding: 4px 12px;
      border-radius: 6px;
    }

    .status-badge {
      background: linear-gradient(45deg, #409eff, #36b4ff);
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-badge1 {
      //background: linear-gradient(45deg, #ff4d4f, #ff6b6b);
      background: linear-gradient(45deg, #ffe082, #ffb74d);
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
  }

  .app-course {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    flex: 1;
  }

  .app-footer {
    font-size: 13px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f2f5;

    .el-icon {
      font-size: 16px;
      color: #409eff;
      transition: all 0.3s ease;
    }

    &:hover .el-icon {
      transform: scale(1.1);
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #409eff, #36b4ff);
  border-radius: 4px;

  &:hover {
    background: linear-gradient(45deg, #36b4ff, #409eff);
  }
}

.filter-btn {
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }
}

:deep(.filter-popover) {
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: none;
}

.filter-container {
  padding: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;

  span {
    font-weight: 600;
    color: #303133;
  }
}

.filter-section {
  margin-bottom: 16px;

  .filter-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
  }

  :deep(.el-select) {
    width: 100%;

    .el-input__wrapper {
      border-radius: 8px;
      background: #f8fafc;
      box-shadow: none;
      border: 1px solid #e4e7eb;

      &:hover {
        border-color: #409eff;
      }
    }
  }
}
</style>
