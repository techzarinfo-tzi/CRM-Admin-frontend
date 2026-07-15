import api from './axios'

export const listAdminLeads = (params) => api.get('/leads/admin/all', { params })
export const toggleLeadStatus = (id) => api.patch(`/leads/admin/${id}/status`)
export const deleteLead = (id) => api.delete(`/leads/admin/${id}`)
