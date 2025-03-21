import request from '@/utils/request.js'

export const uploadImgService = (dataForm) => {
  return request.post('/upload/img', dataForm)
}
