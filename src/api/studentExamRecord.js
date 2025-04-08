import request from '@/utils/request.js'

export const submitExamAnswerService = (examQuestionGroupsId,studentAnswer) => {
  return request.post('/studentExamRecord/submit/answer',{
    examQuestionGroupsId,
    studentAnswer
  })
}

export const aiAnalysePreLessonPracticeService = (teacherScheduleId,preOrPost) => {
  return request.post('/studentPracticeRecord/ai/analyse',{
    teacherScheduleId,
    preOrPost
  })
}
