import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8007'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Chat API
export const chatAPI = {
  getHistory: () => api.get('/api/chat/'),
  sendMessage: (role: string, content: string) => 
    api.post('/api/chat/', { role, content }),
}

// Monitor API
export const monitorAPI = {
  getStats: () => api.get('/api/monitor/stats'),
}

// Settings API
export const settingsAPI = {
  getAll: () => api.get('/api/settings/'),
  update: (key: string, value: string) => 
    api.post('/api/settings/', { key, value }),
}
