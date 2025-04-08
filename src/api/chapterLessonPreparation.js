import request from '@/utils/request.js'

export const chapterLessonPreparationAddService = ({lessonPreparationRecordId,chapterName}) => {
  return request.post('/chapterLessonPreparation/add',{
    lessonPreparationRecordId,
    chapterName
  })
}

export const chapterLessonPreparationGetListByLessonPreparationRecordIdService = (id) => {
  return request.post(`/chapterLessonPreparation/get/lessonPreparationId/${id}`)
}

export const chapterLessonPreparationGetListByIdService = (id) => {
  return request.post(`/chapterLessonPreparation/get/chapterLessonPreparation/${id}`)
}

export const chapterLessonPreparationAiGenerateTeachingSignService = (chapterLessonPreparationId) => {
  return request.get('/chapterLessonPreparation/ai/teachingdesign',{
    params: {
      chapterLessonPreparationId
    }
  })
}
//
export const chapterLessonPreparationUpdateService = (id,AiGenerateTeachingSign) => {
  return request.post('/chapterLessonPreparation/save/content',{
    id,
    ...AiGenerateTeachingSign
  })
}
// ai生成TeachingActivitiesArrangement
export const chapterLessonPreparationAiGenerateTeachingActivitiesArrangementService = (chapterLessonPreparationId) => {
  return request.get('/chapterLessonPreparation/ai/teachingActivitiesArrangement',{
    params: {
      chapterLessonPreparationId
    }
  })
}
// 根据章节备课id查询教学活动
export const chapterLessonPreparationGetTeachingActivitiesByIdService = (id) => {
  return request.get(`/chapterLessonPreparation/teachingActivitiesArrangement/${id}`)
}

// 保存教学活动
export const chapterLessonPreparationSaveTeachingActivitiesService = (teachingActivityList,chapterLessonPreparationId) => {
  return request.post('/chapterLessonPreparation/save/teachingActivitiesArrangement',{
    teachingActivityList,
    chapterLessonPreparationId
  })
}
// ai调整教学活动
export const chapterLessonPreparationAiReviseTeachingActivitiesService = (teachingActivityList,userRequest) => {
  return request.post('/chapterLessonPreparation/ai/adjustTeachingActivitiesArrangement',{
    teachingActivityList,
    userRequest
  })
}

// 根据章节备课id查询教学活动
export const chapterLessonPreparationGetTimeAllocationByIdService = (id) => {
  return request.get(`/chapterLessonPreparation/timeAllocation/${id}`)
}

// ai生成TimeAllocation
export const chapterLessonPreparationAiGenerateTimeAllocationArrangementService = (chapterLessonPreparationId) => {
  return request.get('/chapterLessonPreparation/ai/timeAllocation',{
    params: {
      chapterLessonPreparationId
    }
  })
}

// 保存教学活动
export const chapterLessonPreparationSaveTimeAllocationService = (timeAllocation,chapterLessonPreparationId) => {
  return request.post(`/chapterLessonPreparation/save/timeAllocation/${chapterLessonPreparationId}`, timeAllocation)
}

// ai调整教学活动
export const chapterLessonPreparationAiReviseTimeAllocationService = (aiGenerateTimeAllocationVo,userRequest) => {
  return request.post('/chapterLessonPreparation/ai/adjustTimeAllocationArrangement',{
    aiGenerateTimeAllocationVo,
    userRequest
  })
}

// ai生成TimeAllocation
export const chapterLessonPreparationAiGenerateExpectedResultArrangementService = (chapterLessonPreparationId) => {
  return request.get('/chapterLessonPreparation/ai/expectedResult',{
    params: {
      chapterLessonPreparationId
    }
  })
}

// 根据章节备课id查询预期结果
export const chapterLessonPreparationGetExpectedResultByIdService = (id) => {
  return request.get(`/chapterLessonPreparation/expectedResult/${id}`)
}

// 保存教学预期
export const chapterLessonPreparationSaveExpectedResultService = (chapterLessonPreparationId,ExpectedResult) => {
  return request.post(`/chapterLessonPreparation/save/ExpectedResult/${chapterLessonPreparationId}`, ExpectedResult)
}

// ai生成teachingContent
export const chapterLessonPreparationAiGenerateTeachingContentArrangementService = (chapterLessonPreparationId) => {
  return request.get(`/chapterLessonPreparation/ai/teachingContent/${chapterLessonPreparationId}`
    )
}

// 根据章节备课id查询教学内容
export const chapterLessonPreparationGetTeachingContentByIdService = (id) => {
  return request.get(`/chapterLessonPreparation/teachingContent/${id}`)
}

// 保存教学内容
export const chapterLessonPreparationSaveTeachingContentService = (chapterLessonPreparationId,teachingContent) => {
  return request.post(`/chapterLessonPreparation/save/teachingContent/${chapterLessonPreparationId}`, {
    teachingContent
  })
}

// ai调整教学内容
export const chapterLessonPreparationAiReviseTeachingContentService = (teachingContent,userRequest) => {
  return request.post('/chapterLessonPreparation/ai/adjustTeachingContent',{
    teachingContent,
    userRequest
  })
}


// ai生成教案
export const chapterLessonPreparationAiGenerateTeachingPlanService = (chapterLessonPreparationId) => {
  return request.post(`/chapterLessonPreparation/ai/generateTeachingPlan/${chapterLessonPreparationId}`)
}
