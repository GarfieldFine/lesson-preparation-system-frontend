import request from '@/utils/request.js'

export const getTeachingCalendarContentByLessonPreparationRecordIdService = (lessonPreparationRecordId) => {
  return request.post(`/teachingCalendar/get/${lessonPreparationRecordId}`)
}
