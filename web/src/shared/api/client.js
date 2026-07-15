import axios from 'axios'

const STORAGE_KEY = 'paylink.session'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
client.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (raw) {
    const session = JSON.parse(raw)
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`
    }
  }
  return config
})

// Normalize error messages from the ApiError response body
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Something went wrong.'
    return Promise.reject(new Error(msg))
  }
)

export default client
