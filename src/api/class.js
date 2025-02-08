import request from '@/utils/request.js'

export const classGetAllNameService = ( ) => {
  return request.get('/class/allname')
}
