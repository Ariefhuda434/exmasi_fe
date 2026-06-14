import axios from 'axios'

const API = `${import.meta.env.VITE_API_URL}/api/admin`
const getToken = () => localStorage.getItem('exmasi_token')
const headers = () => ({ Authorization: `Bearer ${getToken()}` })

export const adminLogin    = (data)       => axios.post(`${API}/login`, data)
export const getStats      = ()           => axios.get(`${API}/stats`, { headers: headers() })
export const getAllOrders   = (params)     => axios.get(`${API}/orders`, { headers: headers(), params })
export const updateStatus  = (id, status) => axios.patch(`${API}/orders/${id}/status`, { status }, { headers: headers() })
export const deleteOrder   = (id)         => axios.delete(`${API}/orders/${id}`, { headers: headers() })
export const exportCSV     = ()           => window.open(`${import.meta.env.VITE_API_URL}/api/admin/export?token=${getToken()}`)
export const resendTicket  = (id)         => axios.post(`${API}/orders/${id}/resend-ticket`, {}, { headers: headers() })
