<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Plus, Clock, Filter, Document, Calendar, Check } from '@element-plus/icons-vue';
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
    <div class="header-section">
      <div class="header-title">
        <div class="title-icon">
          <el-icon><Document /></el-icon>
        </div>
        <h1>我的章节备课本</h1>
      </div>

      <div class="header-actions">
        <div class="search-wrapper">
          <el-input
            v-model="searchMessage"
            class="search-input"
            placeholder="搜索课程名称、班级或时间"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

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
              :type="filterYear || filterTerm !== '' || filterStatus !== '' ? 'warning' : 'default'"
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

        <el-button type="primary" class="create-btn" @click="goCreateLessonPreparation">
          <el-icon><Plus /></el-icon>
          创建备课本
        </el-button>
      </div>
    </div>

    <div class="content-section">
      <div v-if="filteredLessons.length === 0" class="empty-state">
        <el-empty description="没有发现备课记录" :image-size="180">
          <template #description>
            <p>暂无备课记录，点击"创建备课本"开始准备课程</p>
          </template>
          <el-button type="primary" @click="goCreateLessonPreparation">
            <el-icon><Plus /></el-icon> 创建备课本
          </el-button>
        </el-empty>
      </div>

      <div v-else class="lesson-grid">
        <div
          v-for="lesson in filteredLessons"
          :key="lesson.id"
          class="lesson-card"
          @click="goDetails(lesson.id)"
        >
          <div class="card-header">
            <div class="term-info">
              <span class="year">{{ lesson.startLessonTime.split('-')[0] }}</span>
              <span class="term">{{ +lesson.term === 0 ? '上半年' : '下半年'}}</span>
            </div>
            <div :class="['status-tag', +lesson.teachingState === 1 ? 'active' : 'completed']">
              <el-icon v-if="+lesson.teachingState === 1"><Clock /></el-icon>
              <el-icon v-else><Check /></el-icon>
              {{ +lesson.teachingState === 1 ? '进行中' : '已结束' }}
            </div>
          </div>

          <div class="card-body">
            <div class="course-info">
              <div class="course-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="course-details">
                <div class="course-name">{{ lesson.courseName }}</div>
                <div class="class-name" v-if="lesson.className">
                  {{JSON.parse(lesson.className).join(',')}}
                </div>
              </div>
            </div>
            <div class="lesson-stats">
              <div class="stat-item">
                <div class="stat-label">创建时间</div>
                <div class="stat-value">{{ new Date(lesson.createTime).toLocaleDateString() }}</div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="class-count" v-if="lesson.classCount">
              <el-icon><Calendar /></el-icon>
              <span>{{ lesson.classCount || 0 }}个班级</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <pop-window ref="popWin" :isCreated="isCreated" @changeCreated="changeCreated"></pop-window>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f0fd 100%);
  padding: 24px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;

    .title-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #1e88e5, #42a5f5);
      border-radius: 10px;
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

    .search-wrapper {
      width: 280px;

      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s;

        &:hover, &:focus {
          box-shadow: 0 2px 12px rgba(30, 136, 229, 0.2);
        }
      }

      :deep(.el-input__prefix) {
        color: #1e88e5;
      }
    }

    .filter-btn {
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
      }
    }

    .create-btn {
      background: linear-gradient(45deg, #1e88e5, #42a5f5);
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
        box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
        background: linear-gradient(45deg, #1976d2, #1e88e5);
      }
    }
  }
}

.content-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.lesson-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  height: 240px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #bbdefb;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f5f9ff;
    border-bottom: 1px solid #e3f2fd;

    .term-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .year {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
      }

      .term {
        font-size: 13px;
        color: #546e7a;
        background: #e3f2fd;
        padding: 4px 10px;
        border-radius: 6px;
      }
    }

    .status-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;

      &.active {
        background: #e3f2fd;
        color: #1976d2;
      }

      &.completed {
        background: #fff3e0;
        color: #f57c00;
      }
    }
  }

  .card-body {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .course-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;

      .course-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #1e88e5, #42a5f5);
        border-radius: 8px;
        color: white;
        font-size: 18px;
      }

      .course-details {
        flex: 1;
      }

      .course-name {
        font-size: 16px;
        font-weight: 600;
        color: #37474f;
        line-height: 1.4;
        margin-bottom: 4px;
      }

      .class-name {
        font-size: 14px;
        color: #546e7a;
        line-height: 1.4;
      }
    }

    .lesson-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .stat-item {
        background: #f5f9ff;
        border-radius: 6px;
        padding: 8px 12px;
        flex: 1;
        min-width: 120px;

        .stat-label {
          font-size: 12px;
          color: #78909c;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 13px;
          font-weight: 500;
          color: #455a64;
        }
      }
    }
  }

  .card-footer {
    padding: 12px 16px;
    border-top: 1px solid #e3f2fd;
    background: #fafafa;

    .time-info, .class-count {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #78909c;
      font-size: 13px;

      .el-icon {
        color: #1e88e5;
      }
    }
  }
}

.empty-state {
  padding: 60px 0;
  text-align: center;

  p {
    color: #78909c;
    margin-bottom: 16px;
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
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;

  span {
    font-weight: 600;
    color: #37474f;
  }
}

.filter-section {
  margin-bottom: 16px;

  .filter-label {
    font-size: 14px;
    color: #546e7a;
    margin-bottom: 8px;
  }

  :deep(.el-select) {
    width: 100%;

    .el-input__wrapper {
      border-radius: 8px;
      background: #f5f5f5;
      box-shadow: none;
      border: 1px solid #e0e0e0;

      &:hover {
        border-color: #1e88e5;
      }
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
  background: linear-gradient(45deg, #1e88e5, #42a5f5);
  border-radius: 4px;

  &:hover {
    background: linear-gradient(45deg, #1976d2, #1e88e5);
  }
}
</style>
