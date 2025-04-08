<template>
  <div class="teaching-plan-container">
    <div class="header-section">
      <div class="header-content">
        <div class="title-area">
          <h2>课程教案</h2>
          <div class="tip-text">提示：双击任意单元格可以修改内容</div>
        </div>
        <div class="export-buttons">
          <el-button type="primary" @click="exportToPdf">
            <i class="el-icon-document"></i> 导出为PDF
          </el-button>
          <el-button type="success" @click="exportToWord">
            <i class="el-icon-document"></i> 导出为Word
          </el-button>
          <el-button type="warning" @click="generateAITeachingPlan">
            <i class="el-icon-magic-stick"></i> 使用AI生成教案
          </el-button>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-container" ref="printTable">
        <!-- 表格内容保持不变 -->
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          :span-method="objectSpanMethod"
          :cell-style="getCellStyle"
          :header-cell-style="{ backgroundColor: '#f0f5ff', color: '#3a5baa', fontWeight: '600' }"
        >
          <!-- 表格列保持不变 -->
          <el-table-column prop="type" label="" width="150" />
          <el-table-column prop="title" label="" width="200" />
          <el-table-column prop="content" label="">
            <template #default="scope">
              <!-- 表格内容渲染保持不变 -->
              <div v-if="scope.row.isMultimedia">
                <div>{{ scope.row.content }}</div>
                <div>{{ scope.row.multimedia }}</div>
                <div>{{ scope.row.hours }}</div>
              </div>
              <div v-else-if="scope.row.isSchoolHeader" class="school-header">
                {{ scope.row.content }}
              </div>
              <div v-else-if="scope.row.isDepartmentInfo" class="department-info">
                {{ scope.row.content }}
              </div>
              <div v-else class="content-cell">{{ scope.row.content }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Edit Dialog 保持不变 -->
    <el-dialog v-model="dialogVisible" title="编辑内容" width="50%">
      <!-- 对话框内容保持不变 -->
      <el-form :model="currentEditItem">
        <el-form-item label="类型" v-if="!currentEditItem.isTimeAllocation && !currentEditItem.isSchoolHeader && !currentEditItem.isDepartmentInfo">
          <el-input v-model="currentEditItem.type" />
        </el-form-item>

        <template v-if="currentEditItem.isMultimedia">
          <el-form-item label="标题" v-if="currentEditItem.title">
            <el-input v-model="currentEditItem.title" />
          </el-form-item>
          <el-form-item label="课件来源">
            <el-input v-model="currentEditItem.content" />
          </el-form-item>
          <el-form-item label="使用章节">
            <el-input v-model="currentEditItem.multimedia" />
          </el-form-item>
          <el-form-item label="学时">
            <el-input v-model="currentEditItem.hours" />
          </el-form-item>
        </template>

        <template v-else-if="currentEditItem.isSchoolHeader || currentEditItem.isDepartmentInfo">
          <el-form-item label="内容">
            <el-input v-model="currentEditItem.content" />
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="标题" v-if="!currentEditItem.span">
            <el-input v-model="currentEditItem.title" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="currentEditItem.content"
              type="textarea"
              :rows="8"
              :autosize="{ minRows: 8, maxRows: 15 }"
            />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import html2pdf from 'html2pdf.js'
import { saveAs } from 'file-saver'
import mammoth from 'mammoth'
import { chapterLessonPreparationAiGenerateTeachingPlanService } from '@/api/chapterLessonPreparation.js'
import { useRoute } from 'vue-router'
const chapterLessonPreparationId = useRoute().params.chapterLessonPreparationId
// 简化后的表格数据，更易于后端返回
const rawTableData = ref([
  { id: 0, type: '', title: '', content: '****大学' },
  { id: -1, type: '', title: '', content: '教研室：****     教师姓名：****' },
  { id: 1, type: '授课专业年级班级', title: '', content: '' },
  { id: 2, type: '课程名称', title: '', content: 'JavaEE 应用与开发' },
  { id: 3, type: '授课内容', title: '章节（单元、专题）', content: '' },
  { id: 4, type: '授课内容', title: '内容', content: '' },
  { id: 5, type: '授课学时', title: '', content: '理论学时    ' },
  { id: 6, type: '教学目的与要求', title: '', content: '' },
  { id: 7, type: '教学重点与难点', title: '', content: '' },
  { id: 8, type: '教学方法与手段', title: '1、以讲授、演示为主', content: '' },
  { id: 9, type: '教学方法与手段', title: '2、教具：无', content: '' },
  { id: 10, type: '教学方法与手段', title: '3、多媒体', content: '课件来源：', multimedia: '使用章节：', hours: '学时：' },
  { id: 11, type: '教学内容', title: '', content: '' },
  { id: 17, type: '作业安排', title: '', content: '习题：' },
  { id: 18, type: '讲课提纲与板书设计（或电子教案）', title: '', content: '' }
])
// 配置映射函数，根据行的特征添加配置项
const processTableData = (data) => {
  return data.map(row => {
    const processedRow = { ...row, editable: true };

    // 学校标题行
    if (row.id === 0) {
      processedRow.isSchoolHeader = true;
      processedRow.span = true;
    }

    // 部门信息行
    else if (row.id === -1) {
      processedRow.isDepartmentInfo = true;
      processedRow.span = true;
    }

    // 多媒体行
    else if (row.id === 10) {
      processedRow.isMultimedia = true;
    }

    // 需要跨列的行
    else if ([1, 2, 5, 6, 7, 11, 17, 18].includes(row.id)) {
      processedRow.span = true;
    }

    // 需要更大高度的单元格
    if ([4, 6, 7, 11].includes(row.id)) {
      processedRow.heightClass = 'larger-cell';
    }

    return processedRow;
  });
};

// 处理后的表格数据，用于实际渲染
const tableData = computed(() => processTableData(rawTableData.value));

// 控制表格单元格合并
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // 学校头部和部门信息的特殊处理
  if (row.isSchoolHeader || row.isDepartmentInfo) {
    if (columnIndex === 0 || columnIndex === 1) {
      return { rowspan: 1, colspan: 0 };
    }
    if (columnIndex === 2) {
      return { rowspan: 1, colspan: 3 };
    }
  }

  // 第一列（类型）的合并逻辑
  if (columnIndex === 0) {
    if (rowIndex > 0 && row.type === tableData.value[rowIndex - 1].type) {
      return { rowspan: 0, colspan: 0 };
    }

    // 计算当前类型的连续行数
    let count = 1;
    for (let i = rowIndex + 1; i < tableData.value.length; i++) {
      if (tableData.value[i].type === row.type) {
        count++;
      } else {
        break;
      }
    }
    return { rowspan: count, colspan: 1 };
  }

  // 对于需要跨列的行处理
  if (column.property === 'title' && row.span) {
    return { rowspan: 1, colspan: 0 };
  }

  if (column.property === 'content' && row.span) {
    return { rowspan: 1, colspan: 2 };
  }

  // 多媒体行特殊处理
  if (row.isMultimedia && column.property === 'content') {
    return { rowspan: 1, colspan: 1 };
  }

  return { rowspan: 1, colspan: 1 };
}

// 获取单元格样式
const getCellStyle = ({ row, column }) => {
  const style = {
    padding: '12px',
    textAlign: 'left',
    verticalAlign: 'top'
  }

  if (row.heightClass === 'larger-cell') {
    style.minHeight = '150px'
  }

  return style
}

// 编辑相关状态
const dialogVisible = ref(false)
const currentEditItem = ref({})
const currentEditIndex = ref(null)

// 打开编辑对话框
const openEditDialog = (row, index) => {
  currentEditItem.value = { ...row }
  currentEditIndex.value = index
  dialogVisible.value = true
}

// 保存编辑内容
const saveEdit = () => {
  if (currentEditIndex.value !== null) {
    // 只更新原始数据中的内容字段
    const updatedData = { ...rawTableData.value[currentEditIndex.value] };

    // 更新基本字段
    updatedData.type = currentEditItem.value.type;
    updatedData.title = currentEditItem.value.title;
    updatedData.content = currentEditItem.value.content;

    // 更新多媒体特有字段
    if (currentEditItem.value.isMultimedia) {
      updatedData.multimedia = currentEditItem.value.multimedia;
      updatedData.hours = currentEditItem.value.hours;
    }

    // 应用更新
    Object.assign(rawTableData.value[currentEditIndex.value], updatedData);
    dialogVisible.value = false;
    ElMessage.success('内容已更新');
  }
}

// 导出为PDF
const printTable = ref(null)
const exportToPdf = () => {
  nextTick(() => {
    const element = printTable.value
    const opt = {
      margin: 10,
      filename: '教学计划表.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    html2pdf().from(element).set(opt).save()
    ElMessage.success('PDF导出成功')
  })
}

// 导出为Word
const exportToWord = () => {
  const header = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
    + '<head><meta charset="utf-8"><title>教学计划表</title></head><body>'
  const footer = '</body></html>'
  const sourceHTML = header + printTable.value.innerHTML + footer

  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  })

  saveAs(blob, '教学计划表.doc')
  ElMessage.success('Word导出成功')
}

// AI生成教案
const generateAITeachingPlan = async () => {
  // 这里可以添加调用AI接口生成教案的逻辑
  ElMessage({
    type: 'info',
    message: 'AI正在生成教案，请稍候...',
    duration: 2000,
  })
  const loading = ElLoading.service({
    lock: true,
    text: '正在进行教案生成...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  const res = await chapterLessonPreparationAiGenerateTeachingPlanService(chapterLessonPreparationId)
  rawTableData.value = res.data
  loading.close()
  ElMessage.success('教案生成成功！')
  // 更新教案内容的逻辑可以在这里实现
}

// 为表格添加点击事件
onMounted(() => {
  setTimeout(() => {
    const tableRows = document.querySelectorAll('.el-table__row')
    tableRows.forEach((row, index) => {
      row.addEventListener('dblclick', () => {
        openEditDialog(tableData.value[index], index)
      })
    })
  }, 500)
})
</script>

<style scoped>
.teaching-plan-container {
  padding: 30px;
  background-color: #f8f9fc;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 顶部样式调整 */
.header-section {
  margin-bottom: 30px;
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  border-radius: 10px;
  padding: 20px 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 表格容器样式 */
.table-container {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 5px;
}

/* 表格样式 */
:deep(.el-table) {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

:deep(.el-table--border) {
  border: 1px solid #eaeef3;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
  color: #606266 !important;
  font-weight: 600;
}

:deep(.el-table td, .el-table th.is-leaf) {
  border-bottom: 1px solid #eaeef3;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #f7faff;
}

/* 学校标题和部门信息居中样式 */
.school-header, .department-info {
  text-align: center;
  width: 100%;
  font-weight: 600;
}

.school-header {
  font-size: 18px;
}

.department-info {
  font-size: 14px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.title-area {
  display: flex;
  flex-direction: column;
}

.title-area h2 {
  font-size: 24px;
  color: #ffffff;
  margin: 0 0 8px 0;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.tip-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 5px 10px;
  border-radius: 4px;
}

.export-buttons {
  display: flex;
  gap: 16px;
}

.export-buttons .el-button {
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

/* 添加AI生成按钮样式 */
:deep(.el-button--warning) {
  background-color: #e6a23c;
  border-color: #e6a23c;
  color: #ffffff;
}

:deep(.el-button--warning:hover) {
  background-color: #ebb563;
  border-color: #ebb563;
}

/* 表格容器样式 */
.table-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 表格容器样式 */
.table-container {
  background-color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(59, 89, 152, 0.15);
  padding: 15px;
  border: 1px solid #e6eef7;
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fafbfd;
}

:deep(.el-table--border) {
  border: 1px solid #d9e3f7;
}

:deep(.el-table th) {
  font-weight: 600;
  background-color: #e8f0ff !important;
  color: #3a5998 !important;
  border-bottom: 2px solid #d1ddf7 !important;
  padding: 16px 12px;
}

:deep(.el-table td, .el-table th.is-leaf) {
  border-bottom: 1px solid #e6eef7;
}

:deep(.el-table__row td:first-child) {
  vertical-align: middle !important;
  font-weight: 500;
  color: #3a5998;
  background-color: #f0f5ff;
  border-right: 2px solid #e6eef7;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #edf2ff;
}

/* 学校标题和部门信息样式优化 */
.school-header {
  font-size: 20px;
  color: #3a5998;
  letter-spacing: 1px;
  padding: 15px 0;
  font-weight: 600;
  background-color: #f8faff;
}

.department-info {
  font-size: 15px;
  color: #5b7bbd;
  padding: 12px 0;
  background-color: #f8faff;
  border-bottom: 1px solid #e6eef7;
}

/* 增加某些单元格高度和换行显示 */
:deep(.larger-cell) {
  min-height: 150px !important;
}

:deep(.el-table__row td) {
  white-space: pre-wrap !important;
  min-height: 60px;
}

.content-cell {
  white-space: pre-wrap;
  line-height: 1.8;
}

/* 让教学内容和教学方法的标题垂直居中 */
:deep(.el-table__row td:first-child) {
  vertical-align: middle !important;
  font-weight: 500;
  color: #3a5998;
  background-color: #f8fafd;
}

/* 对话框样式 */
:deep(.el-dialog__body) {
  padding: 20px 30px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-button--primary) {
  background-color: #3a5998;
  border-color: #3a5998;
}

:deep(.el-button--success) {
  background-color: #42b983;
  border-color: #42b983;
}

:deep(.el-textarea__inner) {
  font-family: 'Microsoft YaHei', sans-serif;
  line-height: 1.8;
}
</style>
