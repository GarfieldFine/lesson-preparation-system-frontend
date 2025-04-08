import request from '@/utils/request.js'

/**
 * 获取问题列表（教师端）
 * @param page
 * @param pageSize
 * @param teacherScheduleId
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getPageQuestions = (page,pageSize,teacherScheduleId) => {
  return request.post('/question/page/getQuestion', {
    page,
    pageSize,
    teacherScheduleId
  })
}

/**
 * ai生成题目
 * @param generationParams
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const goGenerateQuestions = (generationParams) => {
  return request.post('/question/ai/generateQuestion', {
    ...generationParams
  })
}
/**
 * 根据id获取题目
 * @param questionId
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getQuestionById = (questionId) => {
  return request.get(`/question/${questionId}`)
}
/**
 * 推荐题目
 * @param questionId
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const recommendQuestions = (questionId) => {
  return request.post(`/question/recommend/${questionId}`)
}
/**
 * 添加测试题目集
 * @param addAssessmentQuestionGroupsDto
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const  addAssessmentQuestionGroups = (addAssessmentQuestionGroupsDto) => {
  return request.post('/assessmentQuestionGroups/add',addAssessmentQuestionGroupsDto)
}
/**
 * 查看题目是否有上一题
 * @param questionId
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const  getPrevQuestion = (questionId) => {
  return request.post(`/question/havePre/${questionId}`)
}
/**
 * 查看题目是否有下一题
 * @param questionId
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const  getNextQuestion = (questionId) => {
  return request.post(`/question/havePost/${questionId}`)
}
/**
 * 获取学生题目列表
 * @param queryParams
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getStudentQuestionList = (queryParams) => {
  return request.post('/question/page/student/getQuestion', {
    ...queryParams
  })
}
/**
 * 获取学生题目列表
 * @param teacherScheduleId
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const statisticsQuestionSolvingSituations = (teacherScheduleId) => {
  return request.post(`/question/statistics/student/questionSolvingSituations/${teacherScheduleId}`)
}
