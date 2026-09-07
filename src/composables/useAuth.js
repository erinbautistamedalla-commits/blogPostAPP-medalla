import { ref, computed } from 'vue'

// Decode utility to safely extract payload properties out of your backend JWT strings
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

const token = ref(localStorage.getItem('token'))
const userPayload = ref(token.value ? parseJwt(token.value) : null)

export const useAuth = () => {
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => userPayload.value?.isAdmin === true)
  const currentUserId = computed(() => userPayload.value?.id || null)

  const login = (accessToken) => {
    token.value = accessToken
    localStorage.setItem('token', accessToken)
    userPayload.value = parseJwt(accessToken)
  }

  const logout = () => {
    token.value = null
    userPayload.value = null
    localStorage.removeItem('token')
    window.location.href = '/auth' // Instant route bounce safety trigger
  }

  const authHeaders = () => ({
    'Authorization': `Bearer ${token.value}`,
    'Content-Type': 'application/json'
  })

  return { token, isAuthenticated, isAdmin, currentUserId, login, logout, authHeaders }
}
