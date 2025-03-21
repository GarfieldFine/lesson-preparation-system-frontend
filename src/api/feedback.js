import request from '@/utils/request.js'

export const addStudentPostLessonFeedbackService = ({ teacherScheduleId,satisfaction,ratings, comment }) => {
  return request.post('/postLessonFeedback/add',{
    teacherScheduleId,
    satisfaction,
    ...ratings,
    appraise: comment
  })
}

export const analysisStudentPostLessonFeedback = (teacherScheduleId) => {
  return request.post(`/postLessonFeedback/analysis/${teacherScheduleId}`)
}
