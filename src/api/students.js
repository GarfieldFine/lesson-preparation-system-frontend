import request from '@/utils/request.js'

export const getStudentDetailService = (getStudentDetailDto) => {
  return request.post('/students/get/details', getStudentDetailDto)
}
