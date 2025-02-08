<script setup>
import { ref, onMounted, computed } from 'vue'
import { teacherScheduleGetService, teacherScheduleReassignmentService } from '@/api/teacherSchedule.js'
import { classRoomGetAllService } from '@/api/classRoom.js'

const dialogFormVisible = ref(false)
const classRoomList = ref()
const reassignmentForm = ref({
  classTimeStart: '',
  dayOfWeek: '',
  weekNumber: '',
  classroom: ''
})
const times = ref(['8:00-9:40', '10:00-11:40', '14:00-15:40', '16:00-17:40', '19:00-20:40'])
const colorList = ['#e6f7ff','#ffebd7','#d1f7e6','#ffe6d7','#e6f7d7','#f7e6ff','#d7e6ff','#e6d7ff','#d7ffe6']
const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colorList.length);
  // 返回随机索引对应的颜色
  return colorList[randomIndex];
}
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

      <el-form-item size="large">
        <el-button type="primary" @click="goQuery">查询</el-button>
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
        <p>教师：{{ selectedCourse.teacher }}</p>
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
  margin: 0 auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 4px;
  text-align: center;
  //height: 140px; /* 设置格子高度为50px */
  //width: 139px;
  height: 135px; /* 设置格子高度为50px */
  width: 137px;
}

th {
  background-color: #f2f2f2;
  height: 50px;
}

.course-cell {
  padding: 4px;
  border-radius: 4px;
  background-color: var(--bg-color);
  transition: background-color 0.3s; /* 平滑过渡背景颜色变化 */
  cursor: pointer;
}

.course-cell:hover {
  //background-color: darken(var(--bg-color), 10%); /* 鼠标悬停时加深背景颜色 */
  @each $name, $color in $colors {
    &[style*="--bg-color: #{$color}"] {
      //background-color: darken($color, 10%); /* 鼠标悬停时加深背景颜色 */
      background-color: color.adjust($color, $lightness: -10%); /* 鼠标悬停时加深背景颜色 */
    }
  }
}

//td div.has-course:hover {
//  cursor: pointer;
//}


.course-details-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.dialog-content button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-content button:hover {
  background-color: #0056b3;
}
</style>
