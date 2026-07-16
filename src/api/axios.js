import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
})

// Origin the API (and its /uploads static files) are served from, e.g.
// "https://api.techzarinfo.com" from "https://api.techzarinfo.com/api".
// Falls back to "" when the API is same-origin (relative baseURL), so
// asset URLs stay relative and resolve against the current page as before.
export const API_ORIGIN = /^https?:\/\//i.test(API_URL) ? new URL(API_URL).origin : ''

// Resolves a stored asset path (e.g. "/uploads/blogs/xxx.jpg") to an absolute
// URL against the API's origin. In production the frontend and backend are
// served from different domains, so a relative path resolves against the
// frontend's own origin and 404s. URLs that already carry a scheme (http:,
// https:, //, blob:, data:) are left untouched.
export const resolveAssetUrl = (assetPath) => {
  if (!assetPath) return ''
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(assetPath)) return assetPath
  return `${API_ORIGIN}${assetPath}`
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
