import request from '@/utils/request.js'

export const lessonPreparationGetByTeacherScheduleIdService = (teacherScheduleId) => {
  return request.get(`/LessonPreparation/get/teacherScheduleId/${teacherScheduleId}`)
}

export const lessonPreparationAiGenerateTeachingSignService = ({teacherScheduleId, chapter}) => {
  return request.get('/LessonPreparation/teachingdesign',{
    params: {
      teacherScheduleId,
      chapter
    }
  })
}
