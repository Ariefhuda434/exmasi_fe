import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, X, Menu, ChevronDown, Eye, Trash2, ArrowRight, Download, LogOut, BarChart2, Send } from 'lucide-react'
import { getStats, getAllOrders, updateStatus, deleteOrder, exportCSV, resendTicket } from '../services/adminService'
import { ticketPackages } from '../data/ticketPackages'
import { formatCurrency } from '../utils/formatCurrency'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// proof_url bisa berupa full URL Cloudinary (https://...) atau path lama (/uploads/...)
const getProofUrl = (proofUrl) =>
  proofUrl?.startsWith('http') ? proofUrl : `${API_URL}${proofUrl}`

const STATUS_COLOR = {
  pending:   { bg: '#ff990018', color: '#ffaa00', border: '#ff990030' },
  uploaded:  { bg: '#0088ff18', color: '#4da6ff', border: '#0088ff30' },
  verified:  { bg: '#8800ff18', color: '#aa66ff', border: '#8800ff30' },
  confirmed: { bg: '#00cc6618', color: '#00ee77', border: '#00cc6630' },
}

const STATUS_NEXT = {
  pending: null,
  uploaded: 'verified',
  verified: 'confirmed',
  confirmed: null,
}

const REVENUE_KEY        = 'exmasi_locked_revenue'
const REVENUE_ORDERS_KEY = 'exmasi_locked_revenue_orders'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats,         setStats]         = useState(null)
  const [orders,        setOrders]        = useState([])
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('')
  const [loading,       setLoading]       = useState(true)
  const [previewUrl,    setPreviewUrl]    = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [activeTab,     setActiveTab]     = useState('progress')
  const [errorMsg,      setErrorMsg]      = useState(null)
  const [successMsg,    setSuccessMsg]    = useState(null)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [resendLoading, setResendLoading] = useState(null)

  const token = localStorage.getItem('exmasi_token')
  if (!token) navigate('/exmasi-secure-panel')

  const getPkgPrice = (packageId) => {
    const pkg = ticketPackages.find(p => p.id === packageId)
    return pkg ? pkg.price : 0
  }

  const syncLockedRevenue = (currentOrders) => {
    const lockedOrders = JSON.parse(localStorage.getItem(REVENUE_ORDERS_KEY) || '{}')
    let lockedTotal = parseFloat(localStorage.getItem(REVENUE_KEY) || '0')
    currentOrders.forEach(o => {
      if (o.status === 'confirmed' && !lockedOrders[o.order_id]) {
        lockedOrders[o.order_id] = getPkgPrice(o.package_id)
        lockedTotal += lockedOrders[o.order_id]
      }
    })
    localStorage.setItem(REVENUE_ORDERS_KEY, JSON.stringify(lockedOrders))
    localStorage.setItem(REVENUE_KEY, String(lockedTotal))
    return lockedTotal
  }

  const [revenue, setRevenue] = useState(() => parseFloat(localStorage.getItem(REVENUE_KEY) || '0'))

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, ordersRes] = await Promise.all([
        getStats(),
        getAllOrders({ search, status: filterStatus })
      ])
      setStats(statsRes.data)
      setOrders(ordersRes.data.orders)
      setRevenue(syncLockedRevenue(ordersRes.data.orders))
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear()
        navigate('/exmasi-secure-panel')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [search, filterStatus])

  // Auto-dismiss success message
  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(null), 3000)
    return () => clearTimeout(t)
  }, [successMsg])

  const askUpdateStatus = (id, status) => setConfirmAction({ type: 'update', orderId: id, status, message: `Update status order ${id} ke "${status}"?` })
  const askDelete = (id) => setConfirmAction({ type: 'delete', orderId: id, message: `Hapus order ${id}? Tindakan ini tidak bisa dibatalkan.` })

  const handleConfirm = async () => {
    if (!confirmAction) return
    const { type, orderId, status } = confirmAction
    if (type === 'update') await updateStatus(orderId, status)
    else if (type === 'delete') await deleteOrder(orderId)
    setConfirmAction(null)
    fetchData()
  }

  const handleResend = async (id, email) => {
    setResendLoading(id)
    try {
      await resendTicket(id)
      setSuccessMsg(`✅ Tiket berhasil dikirim ulang ke ${email}`)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal kirim ulang tiket')
    } finally {
      setResendLoading(null)
    }
  }

  const logout = () => { localStorage.clear(); navigate('/exmasi-secure-panel') }

  const handleExportCSV = async () => {
    try { await exportCSV() }
    catch (err) { setErrorMsg(err.response?.data?.message || err.message || 'Gagal export CSV') }
  }

  const isNoProofPending = (o) => o.status === 'pending' && !o.proof_url
  const noProofOrders   = orders.filter(isNoProofPending)
  const progressOrders  = orders.filter(o => !isNoProofPending(o))
  const visibleOrders   = activeTab === 'noproof' ? noProofOrders : progressOrders

  const groupedOrders = visibleOrders.reduce((acc, o) => {
    const key = o.package_id || 'lainnya'
    if (!acc[key]) acc[key] = []
    acc[key].push(o)
    return acc
  }, {})

  const packageGroupOrder = [...ticketPackages.map(p => p.id), 'lainnya'].filter(id => groupedOrders[id])

  let runningNo = 0

  const getCleanupCountdown = (createdAt) => {
    const diff = new Date(createdAt).getTime() + 86400000 - Date.now()
    if (diff <= 0) return 'Akan dihapus segera'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return `${h}j ${m}m`
  }

  const toggleExpand = (id) => setExpandedOrder(prev => prev === id ? null : id)

  const canResend = (status) => status === 'verified' || status === 'confirmed'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .dash-header { background: #111; border-bottom: 1px solid #1e1e1e; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
        .header-actions { display: flex; gap: 10px; align-items: center; }
        .btn-icon { background: none; border: 1px solid #222; border-radius: 8px; color: #666; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
        .btn-icon:hover { border-color: #333; color: #ccc; }
        .mobile-menu { position: absolute; top: 60px; right: 16px; background: #161616; border: 1px solid #222; border-radius: 12px; padding: 8px; min-width: 180px; z-index: 200; box-shadow: 0 8px 32px #00000088; }
        .mobile-menu button { width: 100%; background: none; border: none; color: #ccc; padding: 10px 14px; text-align: left; font-size: 14px; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 10px; transition: background .15s; }
        .mobile-menu button:hover { background: #1e1e1e; }
        .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .stat-card { background: #111; border: 1px solid #1e1e1e; border-radius: 10px; padding: 14px 16px; }
        .revenue-card { background: linear-gradient(135deg, #0d1f16, #0a0a0a); border: 1px solid #00ee7725; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid #1e1e1e; overflow-x: auto; }
        .tabs::-webkit-scrollbar { display: none; }
        .tab-btn { background: transparent; border: none; border-bottom: 2px solid transparent; color: #555; padding: 10px 4px; margin-right: 20px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: color .15s; }
        .tab-btn.active-progress { border-bottom-color: #00ee77; color: #fff; }
        .tab-btn.active-noproof  { border-bottom-color: #ffaa00; color: #fff; }
        .filter-row { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .filter-row input, .filter-row select { background: #111; border: 1px solid #1e1e1e; border-radius: 8px; padding: 9px 13px; color: #fff; font-size: 14px; outline: none; transition: border-color .15s; }
        .filter-row input { flex: 1; min-width: 160px; }
        .filter-row input:focus, .filter-row select:focus { border-color: #333; }
        .orders-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .orders-table th { padding: 11px 14px; text-align: left; color: #444; font-weight: 500; border-bottom: 1px solid #1e1e1e; white-space: nowrap; }
        .orders-table td { padding: 11px 14px; border-bottom: 1px solid #161616; vertical-align: middle; }
        .orders-table tr:last-child td { border-bottom: none; }
        @media (max-width: 900px) { .desktop-table { display: none; } .mobile-cards { display: block; } }
        @media (min-width: 901px) { .desktop-table { display: block; } .mobile-cards { display: none; } }
        .order-card-mobile { background: #111; border: 1px solid #1e1e1e; border-radius: 12px; overflow: hidden; margin-bottom: 8px; transition: border-color .15s; }
        .order-card-mobile:hover { border-color: #2a2a2a; }
        .order-card-header { display: flex; align-items: center; justify-content: space-between; padding: 13px 14px; cursor: pointer; gap: 10px; }
        .order-card-body { padding: 0 14px 14px; border-top: 1px solid #1a1a1a; display: flex; flex-direction: column; gap: 8px; }
        .order-field { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .order-field-label { color: #444; }
        .order-field-value { color: #ccc; text-align: right; max-width: 60%; word-break: break-all; }
        .action-row { display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
        .action-btn { flex: 1; min-width: 100px; border: none; border-radius: 8px; padding: 8px 12px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: opacity .15s; }
        .action-btn:hover { opacity: .8; }
        .action-btn:disabled { opacity: .4; cursor: not-allowed; }
        .badge { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .pkg-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .empty-state { background: #111; border: 1px solid #1e1e1e; border-radius: 10px; padding: 40px; text-align: center; color: #333; }
        @media (max-width: 600px) { .dash-content { padding: 16px; } }

        /* Success toast */
        .toast-success {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: #0d1f16; border: 1px solid #00ee7740; color: #00ee77;
          padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
          z-index: 2000; box-shadow: 0 8px 24px #00000066;
          animation: slideUp .2s ease;
          white-space: nowrap;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      {/* ── HEADER ── */}
      <div className="dash-header" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart2 size={18} color="#00ee77" />
          <span style={{ fontSize: 16, fontWeight: 700 }}>EXMASI</span>
          <span style={{ fontSize: 13, color: '#333', display: window.innerWidth < 480 ? 'none' : 'inline' }}>Dashboard</span>
        </div>
        <div className="header-actions" style={{ display: window.innerWidth <= 640 ? 'none' : 'flex' }}>
          <button onClick={handleExportCSV} style={{ background: '#0d1f16', color: '#00ee77', border: '1px solid #00ee7730', borderRadius: 7, padding: '7px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} /> Export CSV
          </button>
          <button onClick={logout} style={{ background: '#1f0d0d', color: '#ff6b6b', border: '1px solid #ff6b6b30', borderRadius: 7, padding: '7px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
        <button className="btn-icon" onClick={() => setMenuOpen(p => !p)} style={{ display: window.innerWidth > 640 ? 'none' : 'flex' }}>
          <Menu size={18} />
        </button>
        {menuOpen && (
          <div className="mobile-menu">
            <div style={{ padding: '6px 14px 8px', fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {localStorage.getItem('exmasi_admin')}
            </div>
            <button onClick={() => { handleExportCSV(); setMenuOpen(false) }}>
              <Download size={14} color="#00ee77" /> Export CSV
            </button>
            <button onClick={() => { logout(); setMenuOpen(false) }} style={{ color: '#ff6b6b' }}>
              <LogOut size={14} color="#ff6b6b" /> Logout
            </button>
          </div>
        )}
      </div>

      <div className="dash-content" style={{ padding: '20px 24px' }}>

        {/* ── STATS ── */}
        {stats && (
          <div className="stats-grid" style={{ marginBottom: 12 }}>
            {[
              { label: 'Total',     value: stats.total,     color: '#fff'    },
              { label: 'Pending',   value: stats.pending,   color: '#ffaa00' },
              { label: 'Uploaded',  value: stats.uploaded,  color: '#4da6ff' },
              { label: 'Verified',  value: stats.verified,  color: '#aa66ff' },
              { label: 'Confirmed', value: stats.confirmed, color: '#00ee77' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ color: '#444', fontSize: 11, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
                <div style={{ color: s.color, fontSize: 24, fontWeight: 700 }}>{s.value ?? 0}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── REVENUE ── */}
        <div className="revenue-card">
          <div>
            <div style={{ color: '#444', fontSize: 11, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }}>Total Pendapatan (Confirmed)</div>
            <div style={{ color: '#00ee77', fontSize: 28, fontWeight: 800 }}>{formatCurrency(revenue)}</div>
            <div style={{ color: '#333', fontSize: 11, marginTop: 5 }}>Terkunci permanen — order dihapus tidak mengurangi total</div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'progress' ? 'active-progress' : ''}`} onClick={() => setActiveTab('progress')}>
            Order Aktif
            <span style={{ marginLeft: 7, fontSize: 11, background: '#1e1e1e', color: '#666', borderRadius: 20, padding: '2px 8px' }}>{progressOrders.length}</span>
          </button>
          <button className={`tab-btn ${activeTab === 'noproof' ? 'active-noproof' : ''}`} onClick={() => setActiveTab('noproof')}>
            Belum Upload
            <span style={{ marginLeft: 7, fontSize: 11, background: '#1e1e1e', color: '#666', borderRadius: 20, padding: '2px 8px' }}>{noProofOrders.length}</span>
          </button>
        </div>

        {activeTab === 'noproof' && (
          <div style={{ background: '#161200', border: '1px solid #ffaa0025', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#ffaa00' }}>
            Order belum upload bukti transfer. Akan otomatis terhapus 24 jam setelah dibuat.
          </div>
        )}

        {/* ── FILTER ── */}
        <div className="filter-row">
          <input placeholder="Cari nama, email, order ID..." value={search} onChange={e => setSearch(e.target.value)} />
          {activeTab === 'progress' && (
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="uploaded">Uploaded</option>
              <option value="verified">Verified</option>
              <option value="confirmed">Confirmed</option>
            </select>
          )}
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : visibleOrders.length === 0 ? (
          <div className="empty-state">
            {activeTab === 'noproof' ? 'Tidak ada order yang belum upload' : 'Tidak ada order'}
          </div>
        ) : packageGroupOrder.map(pkgId => {
          const pkgInfo   = ticketPackages.find(p => p.id === pkgId)
          const pkgLabel  = pkgInfo ? pkgInfo.name : 'Lainnya'
          const pkgOrders = groupedOrders[pkgId]

          return (
            <div key={pkgId} style={{ marginBottom: 24 }}>
              <div className="pkg-header">
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{pkgLabel}</h3>
                <span style={{ fontSize: 12, color: '#444' }}>{pkgOrders.length} order</span>
                {pkgInfo && <span style={{ fontSize: 12, color: '#333' }}>· {formatCurrency(pkgInfo.price)}</span>}
              </div>

              {/* ── DESKTOP TABLE ── */}
              <div className="desktop-table" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, overflow: 'hidden' }}>
                <table className="orders-table">
                  <thead>
                    <tr>
                      {['No','Order ID','Nama','Email','WhatsApp','Status','Tanggal',
                        activeTab === 'noproof' ? 'Auto-hapus' : 'Bukti TF','Aksi'
                      ].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {pkgOrders.map(o => {
                      runningNo += 1
                      const sc = STATUS_COLOR[o.status] || STATUS_COLOR.pending
                      return (
                        <tr key={o.order_id}>
                          <td style={{ color: '#333' }}>{runningNo}</td>
                          <td style={{ fontFamily: 'monospace', color: '#666', fontSize: 12 }}>{o.order_id}</td>
                          <td style={{ color: '#ddd' }}>{o.name}</td>
                          <td style={{ color: '#555', fontSize: 12 }}>{o.email}</td>
                          <td>
                            <a href={`https://wa.me/${o.phone?.replace(/^0/, '62').replace(/\D/g, '')}`}
                              target="_blank" rel="noreferrer"
                              style={{ color: '#25d366', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                              📱 {o.phone}
                            </a>
                          </td>
                          <td>
                            <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ color: '#444', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                          <td>
                            {activeTab === 'noproof' ? (
                              <span style={{ color: '#ffaa00', fontSize: 12, fontWeight: 600 }}>{getCleanupCountdown(o.created_at)}</span>
                            ) : o.proof_url ? (
                              <button onClick={() => setPreviewUrl(getProofUrl(o.proof_url))}
                                style={{ background: '#0d1a2a', color: '#4da6ff', border: '1px solid #4da6ff30', borderRadius: 6, padding: '5px 11px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Eye size={12} /> Lihat
                              </button>
                            ) : (
                              <span style={{ color: '#333', fontSize: 12 }}>Belum upload</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {STATUS_NEXT[o.status] && (
                                <button onClick={() => askUpdateStatus(o.order_id, STATUS_NEXT[o.status])}
                                  style={{ background: '#0d1f16', color: '#00ee77', border: 'none', borderRadius: 6, padding: '5px 11px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <ArrowRight size={12} /> {STATUS_NEXT[o.status]}
                                </button>
                              )}
                              {canResend(o.status) && (
                                <button
                                  onClick={() => handleResend(o.order_id, o.email)}
                                  disabled={resendLoading === o.order_id}
                                  title={`Kirim ulang tiket ke ${o.email}`}
                                  style={{ background: '#1a1040', color: '#aa66ff', border: 'none', borderRadius: 6, padding: '5px 11px', fontSize: 12, cursor: resendLoading === o.order_id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: resendLoading === o.order_id ? 0.5 : 1 }}>
                                  {resendLoading === o.order_id ? '...' : <><Send size={11} /> Tiket</>}
                                </button>
                              )}
                              <button onClick={() => askDelete(o.order_id)}
                                style={{ background: '#1f0d0d', color: '#ff6b6b', border: 'none', borderRadius: 6, padding: '5px 11px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── MOBILE CARDS ── */}
              <div className="mobile-cards">
                {pkgOrders.map(o => {
                  const sc       = STATUS_COLOR[o.status] || STATUS_COLOR.pending
                  const expanded = expandedOrder === o.order_id
                  runningNo += 1
                  return (
                    <div key={o.order_id} className="order-card-mobile">
                      <div className="order-card-header" onClick={() => toggleExpand(o.order_id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span style={{ color: '#333', fontSize: 12, flexShrink: 0 }}>#{runningNo}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name}</div>
                            <div style={{ fontSize: 11, color: '#444', fontFamily: 'monospace', marginTop: 2 }}>{o.order_id}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{o.status}</span>
                          <ChevronDown size={14} color="#444" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                        </div>
                      </div>

                      {expanded && (
                        <div className="order-card-body">
                          <div className="order-field">
                            <span className="order-field-label">Email</span>
                            <span className="order-field-value">{o.email}</span>
                          </div>
                          <div className="order-field">
                            <span className="order-field-label">WhatsApp</span>
                            <a href={`https://wa.me/${o.phone?.replace(/^0/, '62').replace(/\D/g, '')}`}
                              target="_blank" rel="noreferrer"
                              style={{ color: '#25d366', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
                              📱 {o.phone}
                            </a>
                          </div>
                          <div className="order-field">
                            <span className="order-field-label">Paket</span>
                            <span className="order-field-value">{o.package_id}</span>
                          </div>
                          <div className="order-field">
                            <span className="order-field-label">Tanggal</span>
                            <span className="order-field-value">{new Date(o.created_at).toLocaleDateString('id-ID')}</span>
                          </div>
                          {activeTab === 'noproof' && (
                            <div className="order-field">
                              <span className="order-field-label">Auto-hapus</span>
                              <span style={{ color: '#ffaa00', fontSize: 13, fontWeight: 600 }}>{getCleanupCountdown(o.created_at)}</span>
                            </div>
                          )}
                          <div className="action-row">
                            {o.proof_url && activeTab !== 'noproof' && (
                              <button className="action-btn" onClick={() => setPreviewUrl(getProofUrl(o.proof_url))}
                                style={{ background: '#0d1a2a', color: '#4da6ff' }}>
                                <Eye size={13} /> Bukti TF
                              </button>
                            )}
                            {STATUS_NEXT[o.status] && (
                              <button className="action-btn" onClick={() => askUpdateStatus(o.order_id, STATUS_NEXT[o.status])}
                                style={{ background: '#0d1f16', color: '#00ee77' }}>
                                <ArrowRight size={13} /> {STATUS_NEXT[o.status]}
                              </button>
                            )}
                            {canResend(o.status) && (
                              <button className="action-btn"
                                onClick={() => handleResend(o.order_id, o.email)}
                                disabled={resendLoading === o.order_id}
                                style={{ background: '#1a1040', color: '#aa66ff', flex: 'none', minWidth: 'unset', padding: '8px 14px' }}>
                                {resendLoading === o.order_id ? '...' : <><Send size={13} /> Tiket</>}
                              </button>
                            )}
                            <button className="action-btn" onClick={() => askDelete(o.order_id)}
                              style={{ background: '#1f0d0d', color: '#ff6b6b', flex: 'none', minWidth: 'unset', padding: '8px 16px' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── PREVIEW POPUP ── */}
      {previewUrl && (
        <div onClick={() => setPreviewUrl(null)} style={{ position: 'fixed', inset: 0, background: '#000000cc', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#161616', borderRadius: 12, border: '1px solid #222', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222' }}>
              <span style={{ color: '#aaa', fontSize: 13 }}>Bukti Transfer</span>
              <button onClick={() => setPreviewUrl(null)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 16 }}>
              {previewUrl.endsWith('.pdf')
                ? <iframe src={previewUrl} style={{ width: 'min(75vw, 600px)', height: '70vh', border: 'none', borderRadius: 8 }} />
                : <img src={previewUrl} style={{ maxWidth: 'min(80vw, 600px)', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8, display: 'block' }} />
              }
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM POPUP ── */}
      {confirmAction && (
        <div onClick={() => setConfirmAction(null)} style={{ position: 'fixed', inset: 0, background: '#000000cc', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#161616', border: '1px solid #222', borderRadius: 14, maxWidth: 360, width: '100%', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: confirmAction.type === 'delete' ? '#ff6b6b' : '#00ee77', marginBottom: 8 }}>
                {confirmAction.type === 'delete' ? 'Konfirmasi Hapus' : 'Konfirmasi Update'}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#bbb', lineHeight: 1.6 }}>{confirmAction.message}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmAction(null)} style={{ background: '#1e1e1e', color: '#888', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleConfirm} style={{ background: confirmAction.type === 'delete' ? '#1f0d0d' : '#0d1f16', color: confirmAction.type === 'delete' ? '#ff6b6b' : '#00ee77', border: `1px solid ${confirmAction.type === 'delete' ? '#ff6b6b30' : '#00ee7730'}`, borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {confirmAction.type === 'delete' ? 'Hapus' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ERROR POPUP ── */}
      {errorMsg && (
        <div onClick={() => setErrorMsg(null)} style={{ position: 'fixed', inset: 0, background: '#000000cc', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#161616', border: '1px solid #222', borderRadius: 14, maxWidth: 360, width: '100%', padding: 22, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
            <button onClick={() => setErrorMsg(null)} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex' }}>
              <X size={15} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(220,38,38,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={16} color="#ff6b6b" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ff6b6b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Terjadi Kesalahan</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#bbb', lineHeight: 1.6 }}>{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} style={{ background: '#1f0d0d', color: '#ff6b6b', border: '1px solid #ff6b6b30', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-end' }}>Tutup</button>
          </div>
        </div>
      )}

      {/* ── SUCCESS TOAST ── */}
      {successMsg && (
        <div className="toast-success">{successMsg}</div>
      )}
    </div>
  )
}