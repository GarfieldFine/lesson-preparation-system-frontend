import request from '@/utils/request.js'

export const addStudentDoPracticeDetailService = (questionId,isCorrect) => {
  return request.post('/studentDoPractice/record',{
    questionId,
    isCorrect
  })
}
