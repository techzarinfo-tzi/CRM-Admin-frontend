import api from './axios'

export const loginUser = (data) => api.post('/auth/login', data)
export const getCurrentUser = () => api.get('/auth/me')
export const forgotPassword = (data) => api.post('/auth/forgot-password', data)
export const resetPassword = (data) => api.post('/auth/reset-password', data)
