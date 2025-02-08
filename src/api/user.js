import request from '@/utils/request.js'

export const userRegisterService = ({ account, password, checkPassword }) => {
  return request.post('/user/register', {
    account,
    password,
    checkPassword,
  })
}

export const userLoginService = ({ account, password }) => {
  return request.post('/user/login', {
    account,
    password,
  })
}

export const userQueryService = ({ page, pageSize, gender, userName, tag }) => {
  console.log('userName:'+userName)
  return request.post('/user/search/page', {
    page,
    pageSize,
    gender,
    userName,
    tag,
  })
}
export const userDelService = (id) => {
  return request.delete(`/user/${id}`)
}

export const userGetByIdService = (id) => {
  return request.get(`/user/${id}`)
}

export const userQuerySelfService = () => {
  return request.get('/user/current')
}

export const userAvatar = (data) => {
  return request.post('/user/uploadAvatar',data)
}

export const userPasswordUpdateService = ({ password, newPassword, reNewPassword }) => {
  return request.post('/user/updatePassword',{
    password,
    newPassword,
    reNewPassword
  })
}

export const userEditService = (obj) => {
  return request.post('/user/edit',obj)
}

export const userCurrentService = (obj) => {
  return request.get('/user/current',obj)
}
