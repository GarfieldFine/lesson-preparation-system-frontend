import request from '@/utils/request.js'

export const getPageQuestions = (page,pageSize,teacherScheduleId) => {
  return request.post('/question/page/getQuestion', {
    page,
    pageSize,
    teacherScheduleId
  })
}


export const goGenerateQuestions = (generationParams) => {
  return request.post('/question/ai/generateQuestion', {
    ...generationParams
  })
}

export const getQuestionById = (questionId) => {
  return request.get(`/question/${questionId}`)
}

export const recommendQuestions = (questionId) => {
  return request.post(`/question/recommend/${questionId}`)
}

export const  addAssessmentQuestionGroups = (addAssessmentQuestionGroupsDto) => {
  return request.post('/assessmentQuestionGroups/add',addAssessmentQuestionGroupsDto)
}

