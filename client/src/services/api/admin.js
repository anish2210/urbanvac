import api from './config';

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};
