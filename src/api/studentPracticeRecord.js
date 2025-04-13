import request from '@/utils/request.js'

export const submitPracticeAnswerService = (assessmentQuestionGroupsId,studentAnswer) => {
  return request.post('/studentPracticeRecord/submit/answer',{
    assessmentQuestionGroupsId,
    studentAnswer
  })
}

export const aiAnalysePreLessonPracticeService = (teacherScheduleId,preOrPost) => {
  return request.post('/studentPracticeRecord/ai/analyse',{
    teacherScheduleId,
    preOrPost
  })
}
export const getStudentPrePracticeDetailListService = (teacherScheduleId,preOrPost) => {
  return request.post('/studentPracticeRecord/get/studentDoPracticeRecords',{
    teacherScheduleId,
    preOrPost
  })
}


