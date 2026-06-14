import axios from 'axios'

const API = 'http://localhost:5000/api/admin'

const getToken = () => localStorage.getItem('exmasi_token')

const headers = () => ({
  Authorization: `Bearer ${getToken()}`
})
export const resendTicket  = (id)          => axios.post(`${API}/orders/${id}/resend-ticket`, {}, { headers: headers() })
export const adminLogin = (data) =>
  axios.post(`${API}/login`, data)

export const getStats = () =>
  axios.get(`${API}/stats`, { headers: headers() })

export const getAllOrders = (params) =>
  axios.get(`${API}/orders`, { headers: headers(), params })

export const updateStatus = (id, status) =>
  axios.patch(`${API}/orders/${id}/status`, { status }, { headers: headers() })

export const deleteOrder = (id) =>
  axios.delete(`${API}/orders/${id}`, { headers: headers() })

export const exportCSV = async () => {
  const res = await axios.get(`${API}/export-csv`, {
    headers: headers(),
    responseType: 'blob'
  })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = url
  link.download = 'orders-exmasi.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}