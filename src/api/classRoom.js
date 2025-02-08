import request from '@/utils/request.js'

export const classRoomGetAllService = ( ) => {
  return request.get('/classroom/get/all')
}
