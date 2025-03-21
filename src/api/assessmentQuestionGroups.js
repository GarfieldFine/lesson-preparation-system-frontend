import request from '@/utils/request.js'

export const getQuestionsByAssessmentQuestionGroupsId = (assessmentQuestionGroupsId) => {
  return request.post(`/assessmentQuestionGroups/get/question/${assessmentQuestionGroupsId}`)
}
