import request from '@/utils/request.js'

export const lessonPreparationRecordAddGetService = ({courseId,classId,startLessonTime,term}) => {
  startLessonTime = startLessonTime.toLocaleString()
  console.log(startLessonTime)
  return request.post('/lessonPreparationRecord/add', {
    courseId,classId,startLessonTime,term
  })
}

export const lessonPreparationRecordGetGetService = (teacherId) => {
  return request.get(`/lessonPreparationRecord/get/${teacherId}`)
}
