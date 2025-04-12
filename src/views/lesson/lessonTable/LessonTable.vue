<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  ImportClassScheduleService,
  teacherScheduleGetService,
  teacherScheduleReassignmentService
} from '@/api/teacherSchedule.js'
import { classRoomGetAllService } from '@/api/classRoom.js'
import { ElMessage } from 'element-plus'

const importLessonTableVisable = ref(false)
const dialogFormVisible = ref(false)
const classRoomList = ref()
const reassignmentForm = ref({
  classTimeStart: '',
  dayOfWeek: '',
  weekNumber: '',
  classroom: ''
})
const uploadedFiles = ref([]);
const times = ref(['8:00-9:40', '10:00-11:40', '14:00-15:40', '16:00-17:40', '19:00-20:40'])
const colorList = ['#e6f7ff','#ffebd7','#d1f7e6','#ffe6d7','#e6f7d7','#f7e6ff','#d7e6ff','#e6d7ff','#d7ffe6']
const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colorList.length);
  // 返回随机索引对应的颜色
  return colorList[randomIndex];
}

// 文件处理方法
const handleFileChange = (file) => {
  uploadedFiles.value.push(file.raw);
};

const handleFileRemove = (file, fileList) => {
  const index = uploadedFiles.value.findIndex(f => f.name === file.name);
  if (index !== -1) {
    uploadedFiles.value.splice(index, 1);
  }
};
const queryTeacherScheduleForm = ref({
  year: '2024',
  weekNumber: 6,
  term: 0
})

// 动态生成 1 到 18 的选项
const weeks = computed(() => {
  return Array.from({ length: 18 }, (_, index) => (
    `第${index + 1}周` // 显示文本
  ))
})
// 动态生成 1 到 18 的选项
const dayOfWeeks = computed(() => {
  return Array.from({ length: 7 }, (_, index) => (
    `星期${index + 1}` // 显示文本
  ))
})
//动态生成 1 到 18 的选项
const timeList = [
  "08:00:00",
  "10:00:00",
  "14:00:00",
  "16:00:00",
  "19:00:00"
]
// const courses = ref([
//   [
//     { name: '高等数学', teacher: '张老师', classroom: '博文楼 101', color: '#e6f7ff' },
//     null,
//     { name: '大学英语', teacher: '李老师', classroom: '202教室', color: '#ffebd7' },
//     null,
//     { name: '计算机基础', teacher: '王老师', classroom: '303教室', color: '#d1f7e6' },
//     null,
//     null
//   ],
//   [
//     null,
//     { name: '线性代数', teacher: '赵老师', classroom: '101教室', color: '#ffe6d7' },
//     null,
//     { name: '数据结构', teacher: '刘老师', classroom: '202教室', color: '#e6f7d7' },
//     null,
//     null,
//     null
//   ],
//   [
//     { name: '大学物理', teacher: '陈老师', classroom: '101教室', color: '#f7e6ff' },
//     null,
//     { name: '概率论', teacher: '周老师', classroom: '202教室', color: '#d7e6ff' },
//     null,
//     { name: '算法设计', teacher: '吴老师', classroom: '303教室', color: '#e6d7ff' },
//     null,
//     null
//   ],
//   [
//     null,
//     { name: '操作系统', teacher: '郑老师', classroom: '101教室', color: '#d7ffe6' },
//     null,
//     { name: '软件工程', teacher: '孙老师', classroom: '202教室', color: '#e6d7ff' },
//     null,
//     null,
//     null
//   ],
//   [
//     { name: '数据库原理', teacher: '钱老师', classroom: '101教室', color: '#e6d7ff' },
//     null,
//     { name: '计算机网络', teacher: '孔老师', classroom: '202教室', color: '#d7e6ff' },
//     null,
//     { name: '人工智能', teacher: '冯老师', classroom: '303教室', color: '#ffe6d7' },
//     null,
//     null
//   ],
// ])
const courses = ref([])
const goTeacherScheduleGetService = async  () => {
  const res = await teacherScheduleGetService(queryTeacherScheduleForm.value.year,queryTeacherScheduleForm.value.term,queryTeacherScheduleForm.value.weekNumber)
  console.log(res)
  courses.value = res.data.map(day => {
    return day.map(course => {
      // 如果课程对象存在，则只返回需要的字段
      if (course) {
        return {
          id: course.id,
          name: course.courseName,
          teacher: course.teacherId,
          classroom: course.classroom,
          color: getRandomColor()
        };
      }
      // 如果课程对象为null，则返回null（或者你可以根据需要返回其他值）
      return null;
    })
  })
}
onMounted(async () => {
  await goTeacherScheduleGetService();
  const res = await classRoomGetAllService()
  classRoomList.value = res.data.map(item => item.name)
})

const selectedCourse = ref(null)

const showCourseDetails = (course) => {
  if (course) {
    selectedCourse.value = course
  }
}

const closeCourseDetails = () => {
  selectedCourse.value = null
}

const goQuery = async () => {
  await goTeacherScheduleGetService();
  ElMessage.success('查询成功')
}
const currTeacherScheduleId = ref()
const reassignment = (id) => {
  dialogFormVisible.value = true
  selectedCourse.value = null
  currTeacherScheduleId.value = id
}

const goReassignment = async () => {
  const res = await teacherScheduleReassignmentService(currTeacherScheduleId.value,reassignmentForm.value)
  ElMessage.success('调课成功')
  dialogFormVisible.value = false
  await goTeacherScheduleGetService()
}
const importTeacherSchedule = async () => {
  const fd = new FormData();
  fd.append('file', uploadedFiles.value[0]);
  await ImportClassScheduleService(fd)
  ElMessage.success('导入成功')
  importLessonTableVisable.value = false
  uploadedFiles.value = [];
}


</script>
<template>
  <div class="course-table">
    <el-form :inline="true" :model="queryTeacherScheduleForm" class="demo-form-inline">
      <el-form-item label="年份">
        <el-date-picker
          v-model="queryTeacherScheduleForm.year"
          type="year"
          placeholder="Pick a year"
        />
      </el-form-item>
      <el-form-item label="周次">
        <el-input-number v-model="queryTeacherScheduleForm.weekNumber" :min="1" :max="20">
          <template #suffix>
            <span>周</span>
          </template>
        </el-input-number>
      </el-form-item>
      <el-form-item label="学期" style="width: 190px" size="large">
        <el-select v-model="queryTeacherScheduleForm.term">
          <el-option label="上学期" :value="0" />
          <el-option label="下学期" :value="1" />
        </el-select>
      </el-form-item>

      <el-form-item size="large" style="margin-right: 150px">
        <el-button type="primary" @click="goQuery">查询</el-button>
      </el-form-item>

      <el-form-item size="large">
        <el-button @click="importLessonTableVisable = true"><i class="fas fa-download"></i> 导入</el-button>
      </el-form-item>
    </el-form>

    <table>
      <thead>
      <tr>
        <th>时间/星期</th>
        <th>星期一</th>
        <th>星期二</th>
        <th>星期三</th>
        <th>星期四</th>
        <th>星期五</th>
        <th>星期六</th>
        <th>星期天</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(time, index) in times" :key="index">
        <th>{{ time }}</th>
        <td v-for="(course, dayIndex) in courses[index]" :key="dayIndex"
            @click="showCourseDetails(course)">
          <div v-if="course" class="course-cell has-course" :style="{'--bg-color': course.color}">
            <p>{{ course.name }}</p>
            <p>{{ course.teacher }}</p>
            <p>{{ course.classroom }}</p>
          </div>
        </td>
      </tr>
      </tbody>
    </table>

    <div v-if="selectedCourse" class="course-details-dialog">
      <div class="dialog-content">
        <h3>{{ selectedCourse.name }}</h3>
<!--        <p>教师：{{ selectedCourse.teacher }}</p>-->
        <p>教室：{{ selectedCourse.classroom }}</p>
        <div>
          <button @click="closeCourseDetails" style="margin-right: 50px;margin-left: 30px">关闭</button>
          <button @click="reassignment(selectedCourse.id)">我要调课</button>
        </div>
      </div>
    </div>
  </div>


  <el-dialog v-model="dialogFormVisible" title="调课" width="500">
    <el-form :model="reassignmentForm">
      <el-form-item label="周次">
        <el-select
          v-model="reassignmentForm.weekNumber"
          placeholder="请选择"
          style="width: 240px"
        >
          <el-option
            v-for="item in weeks"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="星期">
        <el-select
          v-model="reassignmentForm.dayOfWeek"
          placeholder="请选择"
          style="width: 240px"
        >
          <el-option
            v-for="item in dayOfWeeks"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间">
        <el-select
          v-model="reassignmentForm.classTimeStart"
          placeholder="请选择"
          style="width: 240px"
        >
          <el-option
            v-for="item in timeList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="调课教室">
        <el-select v-model="reassignmentForm.classroom" placeholder="请选择" style="width: 240px">
          <el-option v-for="(item,index) in classRoomList" :key="index" :label="item" :value="item" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="goReassignment">
          确认调课
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="importLessonTableVisable" title="课表导入" width="800">
    <el-upload
      class="upload-area custom-upload"
      style="width: 730px;"
      drag
      multiple
      :auto-upload="false"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      accept=".doc,.docx,.pdf,.xlsx,.xls">
      <el-icon class="el-icon--upload"><i class="fas fa-cloud-upload-alt"></i></el-icon>
      <div class="el-upload__text">
        拖放文件到此处或<em>浏览文件</em>
      </div>
      <template #tip>
        <div class="file-hint">支持的格式: excel</div>
      </template>
    </el-upload>
    <el-button type="primary" style="margin-top: 15px;transform: translateX(670px)" @click="importTeacherSchedule">导入</el-button>
  </el-dialog>

</template>

<style lang="scss" scoped>
$colors: (
  'math': #e6f7ff,
  'english': #ffebd7,
  'cs': #d1f7e6,
  'algebra': #ffe6d7,
  'ds': #e6f7d7,
  'physics': #f7e6ff,
  'probability': #d7e6ff,
  'algo': #e6d7ff,
  'os': #d7ffe6,
  'se': #e6d7ff,
  'db': #e6d7ff,
  'cn': #d7e6ff,
  'ai': #ffe6d7
);
@use "sass:color";

.course-table {
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  margin-top: 2rem;
}

th, td {
  border: none;
  padding: 0;
  text-align: center;
  height: 140px;
  width: 137px;
  position: relative;
  overflow: hidden;
}

th {
  background-color: #f8f9fa;
  height: 50px;
  font-weight: 500;
  color: #495057;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

td {
  border-right: 1px solid rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

td:last-child {
  border-right: none;
}

tr:last-child td {
  border-bottom: none;
}

.course-cell {
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  padding: 12px 10px;
  border-radius: 8px;
  background-color: var(--bg-color);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.course-cell::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: rgba(0, 0, 0, 0.1);
}

.course-cell:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  @each $name, $color in $colors {
    &[style*="--bg-color: #{$color}"] {
      background-color: color.adjust($color, $lightness: -2%, $saturation: 3%);
    }
  }
}

.course-cell p {
  margin: 0;
  padding: 3px 0;
  font-size: 0.9rem;
  line-height: 1.4;
  transition: all 0.2s;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-cell p:first-child {
  font-weight: 600;
  font-size: 1.05rem;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.8);
  letter-spacing: 0.02em;
  position: relative;
}

.course-cell p:first-child::after {
  content: '';
  display: block;
  width: 30px;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  margin-top: 6px;
}

.course-cell p:nth-child(2) {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.65);
  font-weight: 500;
}

.course-cell p:nth-child(3) {
  font-size: 0.82rem;
  color: rgba(0, 0, 0, 0.55);
  margin-top: auto;
}

// 查询表单美化
.demo-form-inline {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

// 课程详情弹窗
.course-details-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.dialog-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.dialog-content p {
  margin: 0.6rem 0;
  color: #666;
  font-size: 1rem;
}

.dialog-content button {
  margin-top: 1.5rem;
  padding: 0.7rem 1.2rem;
  border: none;
  background-color: #2563eb;
  color: #fff;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.dialog-content button:first-of-type {
  background-color: #f3f4f6;
  color: #4b5563;
}

.dialog-content button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

// 上传区域美化
.custom-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  background-color: #f8fafc;
}

.upload-area:hover {
  border-color: #2563eb;
  background-color: #f0f7ff;
}

.el-icon--upload {
  font-size: 36px !important;
  color: #3b82f6 !important;
  margin-bottom: 16px;
}

.file-hint {
  margin-top: 12px;
  color: #64748b;
  font-size: 0.85rem;
}

.el-upload__text {
  color: #475569;

  em {
    color: #2563eb;
    font-style: normal;
    text-decoration: none;
    font-weight: 500;
  }
}

// 按钮美化
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 16px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  }

  &.el-button--primary {
    background-color: #2563eb;
    border-color: #2563eb;

    &:hover {
      background-color: #1d4ed8;
      border-color: #1d4ed8;
    }
  }
}

// 输入控件美化
:deep(.el-select),
:deep(.el-date-editor),
:deep(.el-input-number) {
  .el-input__wrapper {
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  &:hover .el-input__wrapper {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px #d1d5db;
  }

  &.is-focus .el-input__wrapper {
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

// 弹窗美化
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;

    .el-dialog__title {
      font-weight: 600;
      font-size: 1.25rem;
      color: #1e293b;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #f1f5f9;
  }
}
</style>
