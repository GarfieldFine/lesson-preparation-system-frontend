import request from '@/utils/request.js'

export const AiGenerateExamQuestionService = (aiGenerateQuestionExamParams) => {
  return request.post('/examQuestion/ai/gen',{
    ...aiGenerateQuestionExamParams
  })
}
export const getQuestionsByExamQuestionGroupsIdControllerService = (examQuestionGroupId) => {
  return request.post(`/examQuestion/get/question/${examQuestionGroupId}`)
}

export const getCourseChaptersService = (lessonPreparationRecordId) => {
  return request.get(`/chapterInCourse/get/chapters/${lessonPreparationRecordId}`)
}
export const confirmAiGenerateExamQuestionService = (examQuestionGroupId) => {
  return request.get(`/examQuestion/confirm/${examQuestionGroupId}`)
}

export const lessonPreparationRecordGetByIdService = (studentExamRecordId) => {
  return request.post(`/examQuestion/getById/${studentExamRecordId}`)
}
