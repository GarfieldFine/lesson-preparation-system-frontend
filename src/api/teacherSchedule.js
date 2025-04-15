import request from '@/utils/request.js'

export const teacherScheduleGetService = ( year, term, weekNumber) => {
  year = year.toLocaleString().split('/')[0]
  console.log(year)
  return request.post('/TeacherSchedule/get', {
    year,
    term,
    weekNumber
  })
}

export const teacherScheduleGetListByLessonPreparationRecIdService = ( id) => {
  return request.get(`/TeacherSchedule/list/${id}`)
}

export const teacherScheduleReassignmentService = (id, {classTimeStart, classroom, weekNumber, dayOfWeek}) => {
  const startIndex = weekNumber.indexOf('第') + 1; // 找到“第”字后面的位置
  const endIndex = weekNumber.indexOf('周'); // 找到“周”字的位置
  const weekNumberString = weekNumber.substring(startIndex, endIndex); // 提取中间的数字字符串
  weekNumber = parseInt(weekNumberString, 10); // 转换为整数
  dayOfWeek = parseInt(dayOfWeek.substring(dayOfWeek.indexOf('星期') + 2), 10);
  return request.post('/TeacherSchedule/reassignment',{
    id,
    classTimeStart,
    weekNumber,
    dayOfWeek,
    classroom
  })
}

export const ImportClassScheduleService = (fd) => {
  return request.post(`/TeacherSchedule/import/classSchedule`, fd)
}

export const getScheduleServiceById = (id) => {
  return request.get(`/TeacherSchedule/${id}`)
}











