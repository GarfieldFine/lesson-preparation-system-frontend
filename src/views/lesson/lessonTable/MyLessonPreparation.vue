<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Plus, Clock, Filter, Calendar, Document, Check, Close } from '@element-plus/icons-vue';
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

const goDetails = (id) => {
  router.push(`/lesson/lesson_hour/mylessonpreparationbook/${id}`)
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
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-title">
        <span class="title-icon"><el-icon><Document /></el-icon></span>
        <h1>我的课时备课列表</h1>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <el-input
            v-model="searchMessage"
            placeholder="搜索课程名称、班级或时间"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-dropdown trigger="click" class="filter-dropdown">
          <el-button
            :type="filterYear || filterTerm !== '' || filterStatus !== '' ? 'primary' : 'default'"
            class="filter-button"
          >
            <el-icon><Filter /></el-icon>
            筛选
            <el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon>
          </el-button>

          <template #dropdown>
            <el-dropdown-menu class="custom-dropdown">
              <div class="filter-panel">
                <div class="filter-header">
                  <span>筛选条件</span>
                  <el-button type="text" @click="resetFilters">重置</el-button>
                </div>

                <div class="filter-group">
                  <div class="filter-label">学年</div>
                  <el-select v-model="filterYear" placeholder="选择年份" clearable size="small">
                    <el-option
                      v-for="year in years"
                      :key="year"
                      :label="year + '年'"
                      :value="year"
                    />
                  </el-select>
                </div>

                <div class="filter-group">
                  <div class="filter-label">学期</div>
                  <el-select v-model="filterTerm" placeholder="选择学期" clearable size="small">
                    <el-option label="上半年" value="0" />
                    <el-option label="下半年" value="1" />
                  </el-select>
                </div>

                <div class="filter-group">
                  <div class="filter-label">状态</div>
                  <el-select v-model="filterStatus" placeholder="选择状态" clearable size="small">
                    <el-option label="进行中" value="1" />
                    <el-option label="已结束" value="0" />
                  </el-select>
                </div>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button type="primary" class="create-button" @click="goCreateLessonPreparation">
          <el-icon><Plus /></el-icon>
          创建备课本
        </el-button>
      </div>
    </div>

    <div class="lesson-list">
      <div v-if="filteredLessons.length === 0" class="empty-state">
        <el-empty description="没有找到备课记录" :image-size="150">
          <template #description>
            <p>暂无备课记录，点击"创建备课本"开始准备课程</p>
          </template>
          <el-button type="primary" @click="goCreateLessonPreparation">
            <el-icon><Plus /></el-icon> 创建备课本
          </el-button>
        </el-empty>
      </div>

      <div v-else class="lesson-cards">
        <div
          v-for="lesson in filteredLessons"
          :key="lesson.id"
          class="lesson-card"
          @click="goDetails(lesson.id)"
        >
          <div class="lesson-status">
            <div
              :class="['status-indicator', +lesson.teachingState === 1 ? 'active' : 'completed']"
            >
              <el-icon v-if="+lesson.teachingState === 1"><Clock /></el-icon>
              <el-icon v-else><Check /></el-icon>
              <span>{{ +lesson.teachingState === 1 ? '进行中' : '已结束' }}</span>
            </div>
          </div>

          <div class="lesson-content">
            <div class="lesson-title">{{ lesson.courseName }}</div>
            <div class="lesson-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ lesson.startLessonTime.split('-')[0] }}年 {{ +lesson.term === 0 ? '上半年' : '下半年' }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ new Date(lesson.createTime).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>

          <div class="lesson-action">
            <el-icon class="action-icon"><el-icon-arrow-right /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <pop-window ref="popWin" :isCreated="isCreated" @changeCreated="changeCreated"></pop-window>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #f0f7fa 0%, #e1f5fe 100%);
}

.lesson-list {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.lesson-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 10px;
  background: #fafcfa;
  transition: all 0.3s;
  cursor: pointer;
  border-left: 4px solid transparent;

  &:hover {
    background: #f5f9ff;
    transform: translateX(4px);
    border-left-color: #1976d2;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.08);
  }
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;

    .title-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #1976d2;
      border-radius: 8px;
      color: white;
      font-size: 20px;
    }

    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    .search-box {
      width: 280px;

      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s;

        &:hover, &:focus {
          box-shadow: 0 2px 12px rgba(33, 150, 243, 0.2);
        }
      }

      :deep(.el-input__prefix) {
        color: #1976d2;
      }
    }

    .filter-button {
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
      }
    }

    .create-button {
      background: #1976d2;
      border: none;
      border-radius: 8px;
      padding: 0 20px;
      height: 40px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        background: #1565c0;
      }
    }
  }
}

.custom-dropdown {
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  min-width: 280px;
}

.filter-panel {
  padding: 16px;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;

    span {
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .filter-group {
    margin-bottom: 12px;

    .filter-label {
      font-size: 13px;
      color: #616161;
      margin-bottom: 6px;
    }

    :deep(.el-select) {
      width: 100%;
    }
  }
}

.empty-state {
  padding: 40px 0;
  text-align: center;

  p {
    color: #757575;
    margin-bottom: 16px;
  }
}

.lesson-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lesson-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 10px;
  background: #f9f9f9;
  transition: all 0.3s;
  cursor: pointer;
  border-left: 4px solid transparent;

  &:hover {
    background: #e3f2fd;
    transform: translateX(4px);
    border-left-color: #1976d2;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
  }

  .lesson-status {
    margin-right: 20px;

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;

      &.active {
        background: #e3f2fd;
        color: #1976d2;
      }

      &.completed {
        background: #fffbf0;
        color: #ffa000;
      }
    }
  }

  .lesson-content {
    flex: 1;

    .lesson-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .lesson-meta {
      display: flex;
      gap: 24px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #757575;
        font-size: 13px;

        .el-icon {
          font-size: 16px;
          color: #1976d2;
        }
      }
    }
  }

  .lesson-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e3f2fd;
    color: #1976d2;
    transition: all 0.3s;

    .action-icon {
      font-size: 16px;
    }

    &:hover {
      background: #1976d2;
      color: white;
      transform: scale(1.1);
    }
  }
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #2196f3, #64b5f6);
  border-radius: 4px;

  &:hover {
    background: linear-gradient(45deg, #1976d2, #42a5f5);
  }
}

.create-button {
  background: #2196f3;
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  height: 40px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
    background: #1976d2;
  }
}
</style>
