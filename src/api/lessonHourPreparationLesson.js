import request from '@/utils/request.js'

// ai生成TeachingActivitiesArrangement
export const lessonHourAiGenerateTeachingActivitiesArrangementService = (teacherScheduleId) => {
  return request.get('/LessonHourPreparation/ai/teachingActivitiesArrangement',{
    params: {
      teacherScheduleId
    }
  })
}

// 查询教学活动安排
export const lessonHourGetTeachingActivitiesByTeacherScheduleIdService = (TeacherScheduleId) => {
  return request.get(`/LessonHourPreparation/teachingActivitiesArrangement/${TeacherScheduleId}`)
}

// 保存教学活动安排
export const lessonHourSaveTeachingActivitiesService = (teachingActivityList,chapterLessonPreparationId) => {
  return request.post('/LessonHourPreparation/save/teachingActivitiesArrangement',{
    teachingActivityList,
    chapterLessonPreparationId
  })
}
// ai调整TeachingActivitiesArrangement
export const lessonHourAiReviseTeachingActivitiesService = (teachingActivityList,userRequest) => {
  return request.post('/LessonHourPreparation/ai/adjustTeachingActivitiesArrangement',{
    teachingActivityList,
    userRequest
  })
}

// ai生成TimeAllocation
export const lessonHourPreparationAiGenerateTimeAllocationArrangementService = (teacherScheduleId) => {
  return request.get('/LessonHourPreparation/ai/timeAllocation',{
    params: {
      teacherScheduleId
    }
  })
}

// 查询教学活动安排
export const lessonHourPreparationGetTimeAllocationByIdService = (TeacherScheduleId) => {
  return request.get(`/LessonHourPreparation/timeAllocation/${TeacherScheduleId}`)
}

// 保存教学活动安排
export const lessonHourPreparationSaveTimeAllocationService = (timeAllocation,teacherScheduleId) => {
  return request.post(`/LessonHourPreparation/save/timeAllocation/${teacherScheduleId}`, timeAllocation)
}


// ai调整教学活动
export const lessonHourPreparationAiReviseTimeAllocationService = (aiGenerateTimeAllocationVo,userRequest) => {
  return request.post('/LessonHourPreparation/ai/adjustTimeAllocationArrangement',{
    aiGenerateTimeAllocationVo,
    userRequest
  })
}


// ai生成TimeAllocation
export const lessonHourPreparationAiGenerateExpectedResultArrangementService = (teacherScheduleId) => {
  return request.get('/LessonHourPreparation/ai/expectedResult',{
    params: {
      teacherScheduleId
    }
  })
}

// 根据章节备课id查询预期结果
export const lessonHourPreparationGetExpectedResultByIdService = (id) => {
  return request.get(`/LessonHourPreparation/expectedResult/${id}`)
}

// 保存教学预期
export const lessonHourPreparationSaveExpectedResultService = (teacherScheduleId,ExpectedResult) => {
  return request.post(`/LessonHourPreparation/save/ExpectedResult/${teacherScheduleId}`, ExpectedResult)
}

// ai生成teachingContent
export const lessonHourPreparationAiGenerateTeachingContentArrangementService = (teacherScheduleId) => {
  return request.get(`/LessonHourPreparation/ai/teachingContent/${teacherScheduleId}`
  )
}

// 根据章节备课id查询教学内容
export const lessonHourPreparationGetTeachingContentByIdService = (id) => {
  return request.get(`/LessonHourPreparation/teachingContent/${id}`)
}

// 保存教学内容
export const lessonHourPreparationSaveTeachingContentService = (teacherScheduleId,teachingContent) => {
  return request.post(`/LessonHourPreparation/save/teachingContent/${teacherScheduleId}`, {
    teachingContent
  })
}

// ai调整教学内容
export const lessonHourPreparationAiReviseTeachingContentService = (teachingContent,userRequest) => {
  return request.post('/LessonHourPreparation/ai/adjustTeachingContent',{
    teachingContent,
    userRequest
  })
}

// ai调整教学内容
export const aiGenerateInteractionMethodsService = (teacherScheduleId) => {
  return request.post(`/LessonHourPreparation/ai/generate/interactionMethods/${teacherScheduleId}`)
}

// ai生成全部大致内容
export const OverallAiGenerationService = (overallAiGenerationDto) => {
  return request.post('/LessonHourPreparation/ai/overall/generate',overallAiGenerationDto)
}


// ai生成全部大致内容
export const aiGenerationApproximateTeachingContentService = (teacherScheduleId) => {
  return request.post(`/LessonHourPreparation/ai/approximate/teachingContent/${teacherScheduleId}`)
}

// ai生成全部大致内容
export const aiGenerationApproximateExpectedResultService = (teacherScheduleId) => {
  return request.post(`/LessonHourPreparation/ai/approximate/expectedResult/${teacherScheduleId}`)
}
// ai生成全部大致内容
export const getByTeacherScheduleIdService = (teacherScheduleId) => {
  return request.post(`/LessonHourPreparation/getByTeacherScheduleId/${teacherScheduleId}`)
}

// 判断教学内容是否存在
export const isExist = (teacherScheduleId) => {
  return request.get(`/LessonHourPreparation/isexist/${teacherScheduleId}`)
}

//获取多媒体资源
export const getMultimedia = (teacherScheduleId) => {
  return request.get(`/LessonHourPreparation/get/multimedia/${teacherScheduleId}`)
}

//生成ppt资源
export const createPPT = (teachingContent) => {
  return request.post('/multimedia/ppt',{
    teachingContent
  })
}

//推荐视频资源

//生成图片资源


//保存多媒体资源
export const saveMultimedia = (teacherScheduleId,multimedia) => {
  console.log(multimedia);
  return request.post(`/LessonHourPreparation/save/multimedia/${teacherScheduleId}`,multimedia)
}
