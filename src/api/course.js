import request from '@/utils/request.js'

export const courseGetAllNameService = ( ) => {
  return request.get('/course/allname')
}
