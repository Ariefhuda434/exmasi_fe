import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_URL}/api`
})

const getToken = () => localStorage.getItem('exmasi_token')

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ─── Login Admin ────────────────────────────────────────────────
// Dipakai oleh AdminLogin.jsx
export const adminLogin = (data) => {
  return api.post('/admin/login', data)
}

// Alias, biar aman kalau ada file lain yang import loginAdmin
export const loginAdmin = adminLogin

// ─── Stats Dashboard ────────────────────────────────────────────
export const getStats = () => {
  return api.get('/admin/stats')
}

// ─── Get All Orders ─────────────────────────────────────────────
export const getAllOrders = ({ search = '', status = '' } = {}) => {
  return api.get('/admin/orders', {
    params: { search, status }
  })
}

// ─── Update Status Order ────────────────────────────────────────
export const updateStatus = (id, status) => {
  return api.patch(`/admin/orders/${id}/status`, { status })
}

// ─── Delete Order ───────────────────────────────────────────────
export const deleteOrder = (id) => {
  return api.delete(`/admin/orders/${id}`)
}

// ─── Resend Ticket Email ────────────────────────────────────────
export const resendTicket = (id) => {
  return api.post(`/admin/orders/${id}/resend-ticket`)
}

// ─── Export CSV ─────────────────────────────────────────────────
export const exportCSV = async () => {
  const token = getToken()

  if (!token) {
    throw new Error('Token admin tidak ditemukan. Login ulang dulu.')
  }

  const res = await api.get('/admin/export', {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const blob = new Blob([res.data], {
    type: 'text/csv;charset=utf-8;'
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = `exmasi-orders-${new Date().toISOString().slice(0, 10)}.csv`

  document.body.appendChild(a)
  a.click()

  a.remove()
  window.URL.revokeObjectURL(url)
}

export default api