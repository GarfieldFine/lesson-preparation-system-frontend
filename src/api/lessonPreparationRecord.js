import request from '@/utils/request.js'

export const lessonPreparationRecordAddGetService = ({courseId,classId,startLessonTime,term}) => {
  startLessonTime = startLessonTime.toLocaleString()
  console.log(startLessonTime)
  return request.post('/lessonPreparationRecord/add', {
    courseId,classId,startLessonTime,term
  })
}

export const lessonPreparationRecordGetGetService = (teacherId) => {
  return request.get(`/lessonPreparationRecord/getByTeacherId/${teacherId}`)
}

export const lessonPreparationRecordGetClassNameService = (id) => {
  return request.get(`/lessonPreparationRecord/get/class/${id}`)
}

export const getLessonPreparationRecordByIdService = (id) => {
  return request.get(`/lessonPreparationRecord/get/${id}`)
}

export const lessonPreparationRecordAddClassService = (id,classId) => {
  return request.post('/lessonPreparationRecord/add/class',{
    id,
    classId
  })
}

export const lessonPreparationRecordUpdateClassService = (lessonPreparationRecordId,classIds) => {
  return request.post('/lessonPreparationRecord/update/class',{
    lessonPreparationRecordId,
    classIds
  })
}
export const lessonPreparationRecordUpdateTeachingStateService = (lessonPreparationRecordId,teachingState) => {
  return request.post('/lessonPreparationRecord/update/teachingState',{
    lessonPreparationRecordId,
    teachingState
  })
}


export const lessonPreparationRecordUpdateTeachingPlanningService = (lessonPreparationRecordId,teachingPlanning) => {
  return request.get('/lessonPreparationRecord/update/teachingPlanning',{
    params: {
      lessonPreparationRecordId,
      teachingPlanning
    }
  })
}

