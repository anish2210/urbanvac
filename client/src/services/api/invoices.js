import api from './config';

export const invoiceAPI = {
  getNextNumber: () => api.get('/invoices/next-number'),
  create: (data) => api.post('/invoices', data),
  getAll: (params) => api.get('/invoices', { params }),
  getOne: (id) => api.get(`/invoices/${id}`),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  send: (id) => api.post(`/invoices/${id}/send`),
  download: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
};
