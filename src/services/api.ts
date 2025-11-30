import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // if using cookies
});
// ✅ Add interceptor to attach JWT token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // get saved JWT
  if (token) {
    config.headers!['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Events API
export const eventsApi = {
  getAll: (params?: any) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getRecommendations: () => api.get('/recommendations'),
};

// Registrations API
export const registrationsApi = {
  register: (eventId: string) => api.post('/registrations', { eventId }),
  getUserRegistrations: () => api.get('/registrations/user'),
  rate: (eventId: string, rating: number) => api.post('/registrations/rate', { eventId, rating }),
};