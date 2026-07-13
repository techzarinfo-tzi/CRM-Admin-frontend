import api from './axios'

export const listPublicBlogs = (params) => api.get('/blogs', { params })
export const getPublicBlogBySlug = (slug) => api.get(`/blogs/${slug}`)

export const listAdminBlogs = (params) => api.get('/blogs/admin/all', { params })
export const getAdminBlogById = (id) => api.get(`/blogs/admin/${id}`)

export const uploadBlogImage = (file) => {
  const formData = new FormData()
  formData.append('featuredImage', file)
  return api.post('/blogs/admin/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const createBlog = (payload) => api.post('/blogs/admin', payload)
export const updateBlog = (id, payload) => api.put(`/blogs/admin/${id}`, payload)

export const deleteBlog = (id) => api.delete(`/blogs/admin/${id}`)
export const toggleBlogStatus = (id) => api.patch(`/blogs/admin/${id}/status`)
