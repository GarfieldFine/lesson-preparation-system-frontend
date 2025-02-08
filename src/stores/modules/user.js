import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'big-user',
  () => {
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    }
    const userId = ref('')
    const setUserId = (newUserId) => {
      userId.value = newUserId
    }
    const removeUserId = () => {
      userId.value = ''
    }
    const username = ref('')
    const setUsername = (newUsername) => {
      username.value = newUsername
    }
    const removeUsername = () => {
      username.value = ''
    }
    const role = ref('')
    const setRole = (userRole) => {
      role.value = userRole
    }
    const avatarUrl = ref('')
    const setAvatarUrl = (url) => {
      avatarUrl.value = url
    }
    const userOjb = ref({})
    const setUserOjb = (obj) => {
      userOjb.value = obj
    }
    return {
      token,
      setToken,
      removeToken,
      userId,
      setUserId,
      removeUserId,
      username,
      setUsername,
      removeUsername,
      userOjb,
      setUserOjb,
      avatarUrl,
      setAvatarUrl,
      role,
      setRole
    }
  },
  {
    persist: true,
  },
)
