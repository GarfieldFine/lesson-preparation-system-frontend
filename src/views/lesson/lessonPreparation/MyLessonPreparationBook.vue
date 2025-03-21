<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  lessonPreparationRecordGetClassNameService,
  lessonPreparationRecordAddClassService,
  lessonPreparationRecordUpdateClassService,
  lessonPreparationRecordUpdateTeachingStateService
} from '@/api/lessonPreparationRecord.js'
import { chapterLessonPreparationGetListByLessonPreparationRecordIdService, chapterLessonPreparationAddService} from '@/api/chapterLessonPreparation.js'
import { classGetAllNameService } from '@/api/class.js'
import { useRoute, useRouter } from 'vue-router'
import { Close, Plus, DocumentAdd, Edit } from '@element-plus/icons-vue'

const router = useRouter()
const LessonPreparationRecId = useRoute().params.lessonPreparationBookId
const classNameList = ref([])
const classList = ref([])
const isHovering = ref(-1)
const lessonPreparationList = ref([])
const lessonPreparationForm = ref({
  lessonPreparationRecordId: LessonPreparationRecId,
  chapterName: ''
})
const addClassDialogFormVisible = ref(false)
const addLessonPreparationDialogFormVisible = ref(false)
const classId = ref('')
const editClassDialogVisible = ref(false)
const selectedClasses = ref([])
const allClassList = ref([])
const popoverVisible = ref(false)
const options = [
  {
    value: '1',
    label: '进行中',
  },
  {
    value: '0',
    label: '已结束',
  }
]
const teachingState = ref('')
onMounted(async () => {
  const res = await chapterLessonPreparationGetListByLessonPreparationRecordIdService(LessonPreparationRecId)
  // console.log(res)
  lessonPreparationList.value = res.data
  const res1 = await lessonPreparationRecordGetClassNameService(LessonPreparationRecId)
  classNameList.value = res1.data
  const res2 = await classGetAllNameService()
  classList.value = res2.data
  // console.log(res1)
  allClassList.value = classList.value.map(item => ({
    key: item.id,
    label: item.className,
    disabled: false
  }))
  selectedClasses.value = classList.value
    .filter(cl => classNameList.value.includes(cl.className))
    .map(cl => cl.id)
})

// 使用计算属性将数组转换成字符串
const classesString = computed(() => {
  return classNameList.value.join(',')
})

const goDetails = (chapterLessonPreparationId) => {
  router.push(`/lesson/mylessonpreparation/${chapterLessonPreparationId}`)
}

const goAddClass = async () => {
  addClassDialogFormVisible.value = false
  await lessonPreparationRecordAddClassService(LessonPreparationRecId, classId.value)
  ElMessage.success("添加成功")
  classId.value = ''
  const res1 = await lessonPreparationRecordGetClassNameService(LessonPreparationRecId)
  classNameList.value = res1.data
}

const goAddChapterLessonPreparation = async () => {
  addLessonPreparationDialogFormVisible.value = false
  await chapterLessonPreparationAddService(lessonPreparationForm.value)
  ElMessage.success("添加成功")
  const res = await chapterLessonPreparationGetListByLessonPreparationRecordIdService(LessonPreparationRecId)
  lessonPreparationList.value = res.data
}

const handleUpdateClasses = async () => {
  try {
    await lessonPreparationRecordUpdateClassService(LessonPreparationRecId, selectedClasses.value)
    ElMessage.success("修改成功")
    // 刷新班级列表
    const res = await lessonPreparationRecordGetClassNameService(LessonPreparationRecId)
    classNameList.value = res.data
    editClassDialogVisible.value = false
  } catch (error) {
    console.error('更新班级失败:', error)
    ElMessage.error("修改失败")
  }
}

// 添加过滤方法
const filterMethod = (query, item) => {
  return item.label.toLowerCase().includes(query.toLowerCase())
}

const updateTeachingState = async (teachingState) => {
   await lessonPreparationRecordUpdateTeachingStateService(LessonPreparationRecId, teachingState)
  ElMessage.success("修改成功")
}
</script>
<!--第几课时，上课时间，章节标题标题-->
<template>
  <div class="page-container">
    <el-card class="lesson-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h3 class="header-title">备课本</h3>
            <el-tag
              size="small"
              effect="plain"
              class="class-tag"
              @click="editClassDialogVisible = true"
            >
              {{ classesString || '暂无班级' }}
              <el-icon class="edit-icon"><Edit /></el-icon>
            </el-tag>
          </div>
          <div class="header-buttons">
            <el-popover
              placement="bottom"
              width="220px"
              trigger="click"
              popper-style="height: 60px"
            >
              <el-select v-model="teachingState" placeholder="请选择" style="width: 170px;border: none">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  @click="updateTeachingState(item.value)"
                />
              </el-select>
              <template #reference>
                <el-button type="primary" plain @click="popoverVisible = true">
                  <el-icon><Edit /></el-icon> 修改进行状态
                </el-button>
              </template>
            </el-popover>
            <el-button type="success" @click="addLessonPreparationDialogFormVisible = true">
              <el-icon><DocumentAdd /></el-icon> 新建备课
            </el-button>
          </div>
        </div>
      </template>
      <div class="app-list-container">
        <div
          v-for="(lessonPreparation,index) in lessonPreparationList"
          :key="lessonPreparation.id"
          class="app"
          @click="goDetails(lessonPreparation.id)"
          @mouseenter="isHovering = index"
          @mouseleave="isHovering = -1"
        >
          <div class="app-content">
            <div class="app-icon-wrapper">
              <img src="../../../assets/filelogo6.jpg" alt="App Icon" class="app-icon" />
            </div>
            <div class="app-info">
              <div class="app-name" :title="lessonPreparation.chapterName">
                {{lessonPreparation.chapterName}}
              </div>
              <div class="app-meta">章节备课</div>
            </div>
          </div>
          <el-button
            v-show="isHovering === index"
            :icon="Close"
            circle
            class="delete-button"
            @click.stop
          />
        </div>
        <div v-if="lessonPreparationList.length === 0" class="empty-state">
          <el-empty description="暂无备课内容" />
          <el-button type="primary" plain class="create-btn" @click="addLessonPreparationDialogFormVisible = true">
            <el-icon><Plus /></el-icon> 创建备课
          </el-button>
        </div>
      </div>
    </el-card>
    <el-dialog v-model="addClassDialogFormVisible" title="添加班级" width="500">
      <el-select size="large" v-model="classId" placeholder="请选择班级" style="width: 100%">>
        <el-option v-for="cl in classList" :key="cl.id" :label="cl.className" :value="cl.id" />
      </el-select>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addClassDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="goAddClass">
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="addLessonPreparationDialogFormVisible" title="增加备课" width="500">
      <el-form :model="lessonPreparationForm">
        <el-form-item>
          <el-input v-model="lessonPreparationForm.chapterName" autocomplete="off" placeholder="请输入备课章节名称" style="width: 400px;"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addLessonPreparationDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="goAddChapterLessonPreparation">
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editClassDialogVisible"
      title="修改授课班级"
      width="700"
      class="edit-class-dialog"
    >
      <div class="dialog-content">
        <div class="dialog-description">
          <el-alert
            title="班级管理"
            type="info"
            :closable="false"
            show-icon
          >
            <p>从左侧选择要添加的班级，或从右侧移除不需要的班级</p>
            <p>当前已选择 {{ selectedClasses.length }} 个班级</p>
          </el-alert>
        </div>
        <el-transfer
          v-model="selectedClasses"
          :data="allClassList"
          :titles="['可选班级', '已选班级']"
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入班级名称"
          class="custom-transfer"
        >
          <template #default="{ option }">
            <div class="transfer-item">
              <span>{{ option.label }}</span>
            </div>
          </template>
        </el-transfer>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editClassDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleUpdateClasses">
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.lesson-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 80px);

  :deep(.el-card__header) {
    border-bottom: 1px solid #ebeef5;
    padding: 16px 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }

    .class-tag {
      font-size: 13px;
    }
  }

  .header-buttons {
    display: flex;
    gap: 12px;
  }
}

.app-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 20px;
}

.app {
  background-color: #fff;
  border-radius: 10px;
  padding: 16px;
  height: auto;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  border: 1px solid #e4e7ed;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #409EFF;
  }

  .app-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .app-icon-wrapper {
    width: 48px;
    height: 48px;
    flex-shrink: 0;

    .app-icon {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  .app-info {
    flex-grow: 1;
    min-width: 0;
  }

  .app-name {
    font-size: 15px;
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-meta {
    font-size: 12px;
    color: #909399;
  }

  .delete-button {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 6px;
    font-size: 12px;
    color: #909399;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    backdrop-filter: blur(4px);

    &:hover {
      color: #f56c6c;
      background-color: rgba(245, 108, 108, 0.1);
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 20px;

  .create-btn {
    margin-top: 16px;
  }
}

// Dialog styles
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ebeef5;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #ebeef5;
    background-color: #f8f9fa;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.class-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding-right: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ecf5ff;
    color: #409EFF;

    .edit-icon {
      opacity: 1;
    }
  }

  .edit-icon {
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}

:deep(.el-transfer) {
  display: flex;
  justify-content: center;
  padding: 20px 0;

  .el-transfer-panel {
    width: 220px;

    &__header {
      background-color: #f8f9fa;
    }
  }
}

.edit-class-dialog {
  :deep(.el-dialog) {
    --el-dialog-padding-primary: 0;

    .el-dialog__header {
      padding: 20px 24px;
      margin: 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .el-dialog__title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .el-dialog__body {
      padding: 0;
    }

    .el-dialog__footer {
      padding: 16px 24px;
      border-top: 1px solid var(--el-border-color-lighter);
      background-color: var(--el-bg-color-page);
    }
  }
}

.dialog-content {
  padding: 20px 24px;

  .dialog-description {
    margin-bottom: 24px;

    :deep(.el-alert) {
      background-color: var(--el-color-info-light-9);
      padding: 16px;

      .el-alert__title {
        font-size: 15px;
        font-weight: 500;
      }

      p {
        margin: 8px 0 0;
        color: var(--el-text-color-secondary);
        font-size: 13px;
        line-height: 1.4;

        &:first-child {
          margin-top: 12px;
        }
      }
    }
  }
}

:deep(.custom-transfer) {
  display: flex;
  justify-content: center;
  gap: 12px;

  .el-transfer-panel {
    width: 300px;
    border-radius: 8px;

    &__header {
      background-color: var(--el-bg-color-page);
      padding: 12px 16px;

      .el-input__wrapper {
        border-radius: 6px;
      }
    }

    &__body {
      height: 300px;

      .el-checkbox {
        margin-right: 0;
        padding: 8px 16px;
        width: 100%;

        &:hover {
          background-color: var(--el-color-primary-light-9);
        }
      }
    }
  }

  .el-transfer__buttons {
    display: flex;
    align-items: center;
    padding: 0 16px;

    .el-button {
      border-radius: 6px;
      margin: 0 6px;

      :deep(.el-icon) {
        transform: rotate(90deg);
      }

      &:first-child {
        :deep(.el-icon) {
          transform: rotate(-90deg);
        }
      }
    }
  }
}

.transfer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    padding: 8px 20px;
    font-size: 14px;
  }
}
</style>
