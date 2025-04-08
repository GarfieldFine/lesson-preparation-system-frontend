<template>
  <div class="teaching-calendar-container">
    <div class="header-section">
      <div class="header-content">
        <div class="title-area">
          <h2>教学日历</h2>
          <div class="tip-text">提示：双击任意单元格可以修改内容</div>
        </div>
        <div class="export-buttons">
          <el-button type="primary" @click="exportToPdf">
            <i class="el-icon-document"></i> 导出为PDF
          </el-button>
          <el-button type="success" @click="exportToWord">
            <i class="el-icon-document"></i> 导出为Word
          </el-button>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-container" ref="printTable">
        <div class="calendar-header">
          <div class="course-info" @dblclick="openCourseInfoDialog">
            <div class="course-info-item">
              <span class="course-label">课程名称：</span>
              <span class="editable-field">{{ courseInfo.name }}</span>
            </div>
            <div class="course-info-item">
              <span class="course-label">班级：</span>
              <span class="editable-field">{{ courseInfo.class.join(',') }}</span>
            </div>
            <div class="course-info-item">
              <span class="editable-field">{{ courseInfo.term }}</span>
            </div>
            <div class="edit-hint">(双击此处编辑课程信息)</div>
          </div>
        </div>
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          :cell-style="getCellStyle"
          :header-cell-style="{ backgroundColor: '#f0f5ff', color: '#3a5baa', fontWeight: '600' }"
        >
          <el-table-column prop="week" label="周次" width="100" align="center" />
          <el-table-column prop="content" label="教学内容提要" min-width="400" align="left" />
          <el-table-column prop="note" label="备注" width="200" align="left" />
        </el-table>

        <!-- 底部统计信息 -->
        <div class="footer-info">
          <div class="statistics-row">
            <div class="stat-item">
              <span class="stat-label">课程总学时数：</span>
              <span class="editable-field" @click="openStatisticsDialog('totalHours')">{{ statisticsInfo.totalHours }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">其中实践教学学时数：</span>
              <span class="editable-field" @click="openStatisticsDialog('practiceHours')">{{ statisticsInfo.practiceHours }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">实验教学学时数：</span>
              <span class="editable-field" @click="openStatisticsDialog('experimentHours')">{{ statisticsInfo.experimentHours }}</span>
            </div>
          </div>
          <div class="statistics-row">
            <div class="stat-item">
              <span class="stat-label">实习学时数：</span>
              <span class="editable-field" @click="openStatisticsDialog('internshipHours')">{{ statisticsInfo.internshipHours }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总课时数：</span>
              <span class="editable-field" @click="openStatisticsDialog('totalClassHours')">{{ statisticsInfo.totalClassHours }}</span>
            </div>
          </div>
          <div class="signature-row">
            <div class="signature-item">
              <span class="stat-label">任课教师：</span>
              <span class="editable-field" @click="openStatisticsDialog('teacherName')">{{ statisticsInfo.teacherName }}</span>
            </div>
            <div class="signature-item">
              <span class="stat-label">教研室主任签名：</span>
              <span class="editable-field" @click="openStatisticsDialog('directorName')">{{ statisticsInfo.directorName }}</span>
            </div>
          </div>
          <div class="date-row">
            <div class="date-item">
              <span>{{ currentDate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑内容对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑内容" width="50%">
      <el-form :model="currentEditItem">
        <el-form-item label="周次">
          <el-input v-model="currentEditItem.week" />
        </el-form-item>
        <el-form-item label="教学内容提要">
          <el-input
            v-model="currentEditItem.content"
            type="textarea"
            :rows="5"
            :autosize="{ minRows: 5, maxRows: 10 }"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="currentEditItem.note"
            type="textarea"
            :rows="3"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 课程信息编辑对话框 -->
    <el-dialog v-model="courseInfoDialogVisible" title="编辑课程信息" width="50%">
      <el-form :model="editableCourseInfo">
        <el-form-item label="课程名称">
          <el-input v-model="editableCourseInfo.name" />
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="editableCourseInfo.class" />
        </el-form-item>
        <el-form-item label="学期">
          <el-input v-model="editableCourseInfo.term" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="courseInfoDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCourseInfo">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 统计信息编辑对话框 -->
    <el-dialog v-model="statisticsDialogVisible" title="编辑统计信息" width="50%">
      <el-form :model="editableStatisticsInfo">
        <el-form-item :label="statisticsDialogLabel">
          <el-input v-model="editableStatisticsInfo.value" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statisticsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveStatisticsInfo">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import html2pdf from 'html2pdf.js'
import { saveAs } from 'file-saver'
import { getTeachingCalendarContentByLessonPreparationRecordIdService } from '@/api/teachingCalendar.js'
import { useRoute } from 'vue-router'
// 课程信息
const courseInfo = reactive({
  name: 'Java_EE应用与开发',
  class: [],
  term: '25年春学期'
})

// 统计信息
const statisticsInfo = reactive({
  totalHours: '32',
  practiceHours: '16',
  experimentHours: '48',
  internshipHours: '4+2',
  totalClassHours: '',
  teacherName: '',
  directorName: ''
})

// 当前日期
const currentDate = ref('2025 年 2 月 15 日')

const lessonPreparationRecordId = useRoute().params.lessonPreparationRecId

// 表格数据
const tableData = ref([
  { id: 1, week: '1-1', content: '第一章 Java web开发环境配置', note: '§1.1 - §1.6' },
  { id: 2, week: '1-2', content: '', note: '' },
  { id: 3, week: '2-1', content: '', note: '' },
  { id: 4, week: '2-2', content: '', note: '' },
  { id: 5, week: '3-1', content: '', note: '' },
  { id: 6, week: '3-2', content: '', note: '' },
  { id: 7, week: '4-1', content: '', note: '' },
  { id: 8, week: '4-2', content: '', note: '' },
  { id: 9, week: '5-1', content: '', note: '' },
  { id: 10, week: '5-2', content: '', note: '' },
  { id: 11, week: '6-1', content: '', note: '' },
  { id: 12, week: '6-2', content: '', note: '' },
  { id: 13, week: '7-1', content: '', note: '' },
  { id: 14, week: '7-2', content: '', note: '' },
  { id: 15, week: '8-1', content: '', note: '' },
  { id: 16, week: '8-2', content: '', note: '' },
  { id: 17, week: '9-1', content: '', note: '' },
  { id: 18, week: '9-2', content: '', note: '' },
  { id: 19, week: '10-1', content: '', note: '' },
  { id: 20, week: '10-2', content: '', note: '' },
])

// 获取单元格样式
const getCellStyle = ({ row, column }) => {
  const style = {
    padding: '12px',
    textAlign: column.property === 'week' ? 'center' : 'left',
    verticalAlign: 'middle'
  }

  return style
}

// 编辑相关状态
const dialogVisible = ref(false)
const currentEditItem = ref({})
const currentEditIndex = ref(null)

// 课程信息编辑相关状态
const courseInfoDialogVisible = ref(false)
const editableCourseInfo = ref({})

// 统计信息编辑相关状态
const statisticsDialogVisible = ref(false)
const editableStatisticsInfo = ref({ value: '' })
const statisticsDialogLabel = ref('')
const currentStatisticsField = ref('')

// 打开编辑对话框
const openEditDialog = (row, index) => {
  currentEditItem.value = { ...row }
  currentEditIndex.value = index
  dialogVisible.value = true
}

// 打开课程信息编辑对话框
const openCourseInfoDialog = () => {
  editableCourseInfo.value = { ...courseInfo }
  courseInfoDialogVisible.value = true
}

// 保存编辑内容
const saveEdit = () => {
  if (currentEditIndex.value !== null) {
    // 更新表格数据
    const updatedData = { ...tableData.value[currentEditIndex.value] }
    updatedData.week = currentEditItem.value.week
    updatedData.content = currentEditItem.value.content
    updatedData.note = currentEditItem.value.note

    // 应用更新
    Object.assign(tableData.value[currentEditIndex.value], updatedData)
    dialogVisible.value = false
    ElMessage.success('内容已更新')
  }
}

// 保存课程信息
const saveCourseInfo = () => {
  Object.assign(courseInfo, editableCourseInfo.value)
  courseInfoDialogVisible.value = false
  ElMessage.success('课程信息已更新')
}

// 打开统计信息编辑对话框
const openStatisticsDialog = (field) => {
  currentStatisticsField.value = field

  // 设置对话框标题和当前值
  switch (field) {
    case 'totalHours':
      statisticsDialogLabel.value = '课程总学时数'
      break
    case 'practiceHours':
      statisticsDialogLabel.value = '实践教学学时数'
      break
    case 'experimentHours':
      statisticsDialogLabel.value = '实验教学学时数'
      break
    case 'internshipHours':
      statisticsDialogLabel.value = '实习学时数'
      break
    case 'totalClassHours':
      statisticsDialogLabel.value = '总课时数'
      break
    case 'teacherName':
      statisticsDialogLabel.value = '任课教师'
      break
    case 'directorName':
      statisticsDialogLabel.value = '教研室主任签名'
      break
  }

  editableStatisticsInfo.value.value = statisticsInfo[field]
  statisticsDialogVisible.value = true
}

// 保存统计信息
const saveStatisticsInfo = () => {
  statisticsInfo[currentStatisticsField.value] = editableStatisticsInfo.value.value
  statisticsDialogVisible.value = false
  ElMessage.success('统计信息已更新')
}

// 导出为PDF
const printTable = ref(null)
const exportToPdf = () => {
  nextTick(() => {
    const element = printTable.value
    const opt = {
      margin: 10,
      filename: '教学日历.pdf',
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
  // 添加Word专用的样式和元数据
  const header = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
    + '<head>'
    + '<meta charset="utf-8">'
    + '<title>教学日历</title>'
    + '<style>'
    + '<!--'
    + '@page Section1 {size:595.3pt 841.9pt; margin:1.0in 1.0in 1.0in 1.0in; mso-header-margin:.5in; mso-footer-margin:.5in; mso-paper-source:0;}'
    + 'div.Section1 {page:Section1;}'
    + 'table {border-collapse:collapse; border:1px solid #000; mso-border-alt:solid windowtext .5pt; mso-padding-alt:0in 5.4pt 0in 5.4pt;}'
    + 'th {border:1px solid #000; background-color:#f0f5ff; color:#3a5baa; font-weight:bold; padding:6pt; text-align:center; vertical-align:middle; mso-border-alt:solid windowtext .5pt;}'
    + 'td {border:1px solid #000; padding:6pt; mso-border-alt:solid windowtext .5pt;}'
    + '.course-info {margin-bottom:15pt; font-size:12pt; font-family:"Microsoft YaHei", sans-serif;}'
    + '.course-info span {margin-right:20pt;}'
    + 'body {font-family:"Microsoft YaHei", sans-serif;}'
    + '.footer-info {margin-top:20pt; font-size:11pt;}'
    + '.statistics-row {margin-bottom:10pt;}'
    + '.stat-item {margin-right:15pt; display:inline-block;}'
    + '.stat-label {font-weight:bold;}'
    + '.editable-field {border-bottom:1px solid #000; padding:0 5pt;}'
    + '.signature-row {margin-top:20pt; margin-bottom:15pt;}'
    + '.signature-item {display:inline-block; margin-right:50pt;}'
    + '.date-row {text-align:right; margin-top:15pt; font-style:italic;}'
    + '-->'
    + '</style>'
    + '</head>'
    + '<body>'
    + '<div class="Section1">'

  const footer = '</div></body></html>'

  // 创建一个临时元素来处理HTML内容
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = printTable.value.innerHTML

  // 确保表格有正确的Word样式
  const tables = tempDiv.querySelectorAll('table')
  tables.forEach(table => {
    table.setAttribute('border', '1')
    table.setAttribute('cellspacing', '0')
    table.setAttribute('cellpadding', '5')
    table.setAttribute('style', 'width:100%; border-collapse:collapse; mso-table-layout-alt:fixed; mso-padding-alt:5pt 5pt 5pt 5pt;')
  })

  // 处理表头和单元格
  const ths = tempDiv.querySelectorAll('th')
  ths.forEach(th => {
    th.setAttribute('style', 'border:solid windowtext 1.0pt; background:#f0f5ff; color:#3a5baa; font-weight:bold; padding:6pt; text-align:center; vertical-align:middle;')
  })

  const tds = tempDiv.querySelectorAll('td')
  tds.forEach(td => {
    td.setAttribute('style', 'border:solid windowtext 1.0pt; padding:6pt; text-align:' + (td.textContent.includes('周次') ? 'center' : 'left') + '; vertical-align:middle;')
  })

  const sourceHTML = header + tempDiv.innerHTML + footer

  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  })

  saveAs(blob, '教学日历.doc')
  ElMessage.success('Word导出成功')
}

// 为表格添加双击事件
onMounted(async () => {
  const res = await getTeachingCalendarContentByLessonPreparationRecordIdService(lessonPreparationRecordId)
  tableData.value = res.data.teachingCalendarVos
  courseInfo.class = res.data.className
  courseInfo.name = res.data.course
  courseInfo.term = res.data.semester

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
.teaching-calendar-container {
  padding: 30px;
  background-color: #f8f9fc;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 顶部样式 */
.header-section {
  margin-bottom: 30px;
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  border-radius: 10px;
  padding: 20px 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area h2 {
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.tip-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-top: 5px;
}

/* 表格容器样式 */
.table-wrapper {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.table-container {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
}

.calendar-header {
  margin-bottom: 20px;
  text-align: center;
}

.calendar-header h3 {
  font-size: 22px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.course-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
  position: relative;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.course-info-item {
  display: flex;
  align-items: center;
}

.course-label {
  font-weight: 500;
  color: #333;
  margin-right: 5px;
}

.course-info:hover {
  background-color: #f0f5ff;
}

.edit-hint {
  position: absolute;
  bottom: -15px;
  right: 0;
  font-size: 12px;
  color: #909399;
  font-style: italic;
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

/* 按钮样式 */
.export-buttons .el-button {
  margin-left: 10px;
  border-radius: 6px;
}

.export-buttons .el-button:first-child {
  margin-left: 0;
}

/* 底部统计信息样式 */
.footer-info {
  margin-top: 30px;
  padding: 20px;
  border-top: 1px solid #eaeef3;
  font-size: 14px;
}

.statistics-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
  align-items: center;
}

.stat-item {
  margin-right: 30px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.stat-label {
  font-weight: 500;
  color: #333;
  margin-right: 5px;
}

.editable-field {
  min-width: 50px;
  display: inline-block;
  border-bottom: 1px solid #3a5baa;
  padding: 2px 5px;
  color: #3a5baa;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.editable-field:hover {
  background-color: #f0f5ff;
  border-bottom: 1px solid #4b6cb7;
}

.signature-row {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  margin-bottom: 20px;
}

.signature-item {
  display: flex;
  align-items: center;
}

.date-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  font-style: italic;
  color: #606266;
}
</style>
