import axios from "axios"
import config from "../../config"

const api = axios.create({
  baseURL: config.API_URL,
  headers: { "Content-Type": "application/json" },
})

// Inject stored JWT on every request
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

// Unwrap response.data automatically to match the service return types
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
)

export default api
