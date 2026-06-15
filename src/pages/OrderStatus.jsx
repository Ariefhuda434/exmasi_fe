import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft, CheckCircle2, Clock, Upload,
  Ticket, Mail, Wallet,
  AlertCircle, X, FileText
} from "lucide-react"
import { ticketPackages } from "../data/ticketPackages"
import { formatCurrency } from "../utils/formatCurrency"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const STEPS = [
  { label: "Order dibuat",      desc: "Data berhasil disimpan", icon: Clock,        status: "pending"   },
  { label: "Upload pembayaran", desc: "Kirim bukti transfer",   icon: Upload,       status: "uploaded"  },
  { label: "Verifikasi admin",  desc: "Menunggu konfirmasi",    icon: CheckCircle2, status: "verified"  },
  { label: "Ticket dikirim",    desc: "Dikirim via email",      icon: Mail,         status: "confirmed" },
]

const STATUS_ORDER = ["pending", "uploaded", "verified", "confirmed"]

function getActiveStep(orderStatus) {
  const idx = STATUS_ORDER.indexOf(orderStatus)
  return idx === -1 ? 0 : idx
}

const statusConfig = {
  confirmed: { label: "Ticket Dikirim",      color: "#22c55e", bg: "rgba(34,197,94,0.08)"  },
  verified:  { label: "Terverifikasi",       color: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  uploaded:  { label: "Menunggu Verifikasi", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  pending:   { label: "Menunggu Pembayaran", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
}

function getPackageInfo(packageId) {
  if (!packageId) return null

  const cleanId = String(packageId).trim().toLowerCase()

  return ticketPackages.find((p) => {
    const id = String(p.id || "").trim().toLowerCase()
    const name = String(p.name || "").trim().toLowerCase()

    return id === cleanId || name === cleanId
  })
}

function isPdf(file) {
  return file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf")
}

export default function OrderStatus() {
  const params = useParams()
  const id = params.id || params.orderId

  const navigate = useNavigate()

  const [order,         setOrder]         = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [showPopup,     setShowPopup]     = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [proof,         setProof]         = useState(null)
  const [preview,       setPreview]       = useState(null)
  const [uploading,     setUploading]     = useState(false)
  const [uploaded,      setUploaded]      = useState(false)
  const [errorMsg,      setErrorMsg]      = useState(null)

  useEffect(() => {
    let alive = true

    const fetchOrder = async () => {
      if (!id) {
        if (!alive) return
        setOrder(null)
        setLoading(false)
        setErrorMsg("Order ID tidak valid dari link email")
        return
      }

      try {
        setLoading(true)

        const res = await fetch(`${API_URL}/api/orders/${encodeURIComponent(id)}`)
        const data = await res.json().catch(() => null)

        if (!res.ok) {
          throw new Error(data?.message || "Order tidak ditemukan")
        }

        const orderData = data?.order || data

        if (!orderData?.order_id) {
          throw new Error("Data order dari server tidak valid")
        }

        if (!alive) return

        setOrder(orderData)
        setUploaded(Boolean(orderData.proof_url))

        if (orderData.status === "pending" && !orderData.proof_url) {
          setShowPopup(true)
        }
      } catch (err) {
        console.error("FETCH ORDER ERROR:", err)
        if (!alive) return
        setOrder(null)
        setErrorMsg(err.message || "Gagal memuat order")
      } finally {
        if (alive) setLoading(false)
      }
    }

    fetchOrder()

    return () => {
      alive = false
    }
  }, [id])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]

    setProof(file || null)

    if (preview) {
      URL.revokeObjectURL(preview)
    }

    if (file) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }
  }

  const handleUpload = async () => {
    if (!proof) {
      setErrorMsg("Pilih bukti transfer dulu sebelum mengirim")
      return
    }

    if (!id) {
      setErrorMsg("Order ID tidak valid")
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append("proof", proof)

    try {
      const res = await fetch(`${API_URL}/api/orders/${encodeURIComponent(id)}/upload-proof`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || "Upload gagal")
      }

      setUploaded(true)
      setUploadSuccess(true)

      setOrder((prev) => ({
        ...prev,
        status: "uploaded",
        proof_url: data?.proof_url || prev?.proof_url
      }))
    } catch (err) {
      setErrorMsg(err.message || "Upload gagal, coba lagi")
    } finally {
      setUploading(false)
    }
  }

  if (loading) return (
    <div style={s.fullCenter}>
      <div style={s.spinner} />
      <p style={{ color: "#555", marginTop: 16, fontSize: 13 }}>Memuat order…</p>
    </div>
  )

  if (!order) return (
    <>
      <style>{css}</style>
      <div style={s.fullCenter}>
        <Ticket size={40} color="#333" />
        <p style={{ color: "#777", marginTop: 14, fontSize: 14, fontWeight: 700 }}>
          Order tidak ditemukan
        </p>
        <p style={{ color: "#444", marginTop: 6, fontSize: 12, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          Link order mungkin salah, order sudah dihapus, atau data belum tersedia di server.
        </p>
        <button onClick={() => navigate("/")} style={s.backBtnAlt}>Kembali ke Beranda</button>
      </div>
    </>
  )

  const st = statusConfig[order.status] || statusConfig.pending
  const activeStep = getActiveStep(order.status)
  const pkg = getPackageInfo(order.package_id)
  const price = pkg?.price || Number(order.total || order.price || 0)

  return (
    <>
      <style>{css}</style>

      {showPopup && (
        <div style={s.overlay}>
          <div style={s.popup}>
            <div style={s.popupIcon}>
              <Clock size={26} color="#f59e0b" />
            </div>
            <h2 style={s.popupTitle}>Pesanan Diterima!</h2>
            <p style={s.popupDesc}>
              Invoice sudah dikirim ke email kamu. Lakukan pembayaran lalu upload bukti transfer.
            </p>
            <button className="cta-btn" onClick={() => setShowPopup(false)} style={{ marginTop: 20 }}>
              Mengerti
            </button>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div style={s.overlay}>
          <div style={s.popup}>
            <div style={{ ...s.popupIcon, background: "rgba(34,197,94,.08)" }}>
              <CheckCircle2 size={26} color="#22c55e" />
            </div>
            <h2 style={s.popupTitle}>Berhasil Dikirim!</h2>
            <p style={s.popupDesc}>
              Bukti transfer kamu sudah diterima. Tunggu verifikasi dari admin dalam 1×24 jam.
            </p>
            <button className="cta-btn" onClick={() => setUploadSuccess(false)} style={{ marginTop: 20 }}>
              Oke
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div style={s.overlay}>
          <div style={s.popup}>
            <button onClick={() => setErrorMsg(null)} style={s.popupClose}>
              <X size={16} />
            </button>
            <div style={{ ...s.popupIcon, background: "rgba(220,38,38,.08)" }}>
              <AlertCircle size={26} color="#dc2626" />
            </div>
            <h2 style={s.popupTitle}>Tidak bisa lanjut</h2>
            <p style={s.popupDesc}>{errorMsg}</p>
            <button className="cta-btn" onClick={() => setErrorMsg(null)} style={{ marginTop: 20 }}>
              Mengerti
            </button>
          </div>
        </div>
      )}

      <div style={s.page}>
        <div style={s.container}>

          <div style={{ marginBottom: 28, animation: "fadeUp .4s ease both" }}>
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={13} /> Kembali
            </button>
            <div style={{ marginTop: 22 }}>
              <p style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 5 }}>
                EXMASI EVENT
              </p>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                Detail Order
              </h1>
            </div>
          </div>

          <div className="ocard" style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
                Status
              </p>
              <span style={{ fontSize: 14, fontWeight: 700, color: st.color }}>{st.label}</span>
            </div>
            <div style={{ background: st.bg, border: `1px solid ${st.color}30`, borderRadius: 10, padding: "5px 13px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: st.color, letterSpacing: ".04em" }}>
                {order.order_id}
              </span>
            </div>
          </div>

          <div className="ocard" style={{ marginBottom: 12 }}>
            <p style={s.cardTitle}>Progress</p>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              {STEPS.map((step, i) => {
                const done = i < activeStep
                const current = i === activeStep
                const Icon = step.icon
                const clr = done || current ? "#dc2626" : "#2a2a2a"
                const txtClr = done || current ? "#fff" : "#444"

                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                    {i < STEPS.length - 1 && (
                      <div style={{
                        position: "absolute", top: 15, left: "50%", width: "100%",
                        height: 2, background: i < activeStep ? "#dc2626" : "#1a1a1a",
                        transition: "background .4s", zIndex: 0,
                      }} />
                    )}
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", zIndex: 1,
                      background: done ? "#dc2626" : current ? "rgba(220,38,38,.15)" : "#111",
                      border: `2px solid ${clr}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .3s",
                    }}>
                      {done
                        ? <CheckCircle2 size={14} color="#fff" />
                        : <Icon size={13} color={current ? "#dc2626" : "#333"} />
                      }
                    </div>
                    <p style={{ fontSize: 10, fontWeight: current ? 700 : 500, color: txtClr, marginTop: 7, textAlign: "center", lineHeight: 1.3 }}>
                      {step.label}
                    </p>
                    <p style={{ fontSize: 9, color: "#3a3a3a", textAlign: "center", marginTop: 2, lineHeight: 1.3 }}>
                      {step.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="ocard" style={{ marginBottom: 12 }}>
            <p style={s.cardTitle}>Informasi Pemesan</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
              {[
                { label: "Nama",     val: order.name || "-" },
                { label: "Paket",    val: pkg?.name || order.package_id || "-" },
                { label: "Email",    val: order.email || "-" },
                { label: "WhatsApp", val: order.phone || "-" },
              ].map(({ label, val }, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.03)", borderRadius: 10, padding: "10px 12px" }}>
                  <div className="row-label">{label}</div>
                  <div className="row-value" style={{ marginTop: 3, wordBreak: "break-all" }}>{val}</div>
                </div>
              ))}
            </div>

            {order.note && (
              <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 10, padding: "10px 12px", marginTop: 10 }}>
                <div className="row-label">Catatan</div>
                <div className="row-value" style={{ marginTop: 3 }}>{order.note}</div>
              </div>
            )}
          </div>

          <div className="ocard" style={{ marginBottom: 12 }}>
            <p style={s.cardTitle}>Total Pembayaran</p>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(220,38,38,.06)", border: "1px solid rgba(220,38,38,.15)",
              borderRadius: 12, padding: "14px 16px", marginBottom: 14
            }}>
              <div>
                <p style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>
                  {pkg?.name || order.package_id || "Paket"}
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
                  {formatCurrency(price)}
                </p>
              </div>
              <Wallet size={28} color="#dc2626" />
            </div>

            <p style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
              Transfer ke salah satu rekening
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { bank: "Bank Mandiri", no: "1070022849147 (NOVAL JAMIL LUBIS)" },
                { bank: "DANA",         no: "082168214521 (Alya Shila Arrahmi)"  },
                { bank: "SeaBank",      no: "901548843973 (NOVAL JAMIL LUBIS)"  },
                { bank: "Gopay",      no: "082168214521 (Alya Shila Arrahmi)"  },
              ].map(({ bank, no }, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,.03)", borderRadius: 10, padding: "10px 12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <div className="row-label">{bank}</div>
                    <div className="row-value" style={{ marginTop: 3 }}>{no}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
              <div className="row-label">Atas Nama</div>
              <div className="row-value" style={{ marginTop: 3 }}>NOVAL JAMIL LUBIS</div>
            </div> */}
          </div>

          {!uploaded ? (
            <div className="ocard" style={{ marginBottom: 12 }}>
              <p style={s.cardTitle}>Upload Bukti Pembayaran</p>
              <p style={{ fontSize: 13, color: "#444", marginBottom: 14, lineHeight: 1.6 }}>
                Upload screenshot atau foto bukti transfer kamu.
              </p>

              <input
                type="file"
                accept="image/*,application/pdf"
                id="proof-input"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {!preview ? (
                <label htmlFor="proof-input" className="upload-label">
                  <Upload size={22} color="#3a3a3a" />
                  <span>Klik untuk pilih file</span>
                  <span style={{ fontSize: 11, color: "#3a3a3a" }}>JPG, PNG, PDF — maks 5MB</span>
                </label>
              ) : isPdf(proof) ? (
                <div style={{
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <FileText size={22} color="#dc2626" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#ccc", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {proof.name}
                      </div>
                      <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>PDF siap diupload</div>
                    </div>
                  </div>
                  <label htmlFor="proof-input" style={{
                    background: "rgba(255,255,255,.06)",
                    border: "1px solid rgba(255,255,255,.1)",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: 100,
                    fontSize: 11,
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}>
                    Ganti
                  </label>
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      maxHeight: 200,
                      objectFit: "cover",
                      border: "1px solid rgba(255,255,255,.07)"
                    }}
                  />
                  <label htmlFor="proof-input" style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(0,0,0,.75)",
                    border: "1px solid rgba(255,255,255,.1)",
                    color: "#fff", padding: "5px 12px", borderRadius: 100,
                    fontSize: 11, cursor: "pointer"
                  }}>
                    Ganti
                  </label>
                </div>
              )}

              <button className="cta-btn" onClick={handleUpload} disabled={!proof || uploading} style={{ marginTop: 12 }}>
                {uploading ? "Mengupload…" : "Kirim Bukti Transfer"}
              </button>
            </div>
          ) : (
            <div className="ocard" style={{ marginBottom: 12, borderColor: "rgba(34,197,94,.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: "rgba(34,197,94,.08)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <CheckCircle2 size={20} color="#22c55e" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "#22c55e", fontSize: 14 }}>Bukti Transfer Terkirim</p>
                  <p style={{ color: "#444", fontSize: 12, marginTop: 2 }}>Sedang diverifikasi oleh admin</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

const s = {
  page:       { minHeight: "100vh", background: "#080808", paddingTop: 40, paddingBottom: 60 },
  container:  { maxWidth: 560, margin: "0 auto", padding: "0 20px" },
  cardTitle:  { fontWeight: 800, fontSize: 13, color: "#fff", marginBottom: 14, letterSpacing: ".02em" },
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 999, padding: 20, backdropFilter: "blur(6px)" },
  popup:      { background: "#0e0e0e", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 24, padding: 32, maxWidth: 340, width: "100%",
                display: "flex", flexDirection: "column", alignItems: "center",
                animation: "popIn .3s ease both", position: "relative" },
  popupClose: { position: "absolute", top: 16, right: 16, background: "none", border: "none",
                color: "#555", cursor: "pointer", lineHeight: 1, padding: 4 },
  popupIcon:  { width: 56, height: 56, borderRadius: 14, background: "rgba(245,158,11,.08)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  popupTitle: { fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 8, textAlign: "center" },
  popupDesc:  { color: "#666", fontSize: 13, lineHeight: 1.7, textAlign: "center" },
  fullCenter: { minHeight: "100vh", background: "#080808",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 20 },
  spinner:    { width: 30, height: 30, border: "2px solid rgba(255,255,255,.08)",
                borderTop: "2px solid #dc2626", borderRadius: "50%", animation: "spin .8s linear infinite" },
  backBtnAlt: { marginTop: 18, padding: "7px 18px", background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)", color: "#666", borderRadius: 100,
                fontSize: 12, cursor: "pointer" },
}

const css = `
  * { box-sizing: border-box; }

  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn  { 0% { opacity:0; transform:scale(.92); } 100% { opacity:1; transform:scale(1); } }

  .ocard {
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 18px;
    padding: 18px;
    animation: fadeUp .45s ease both;
  }

  .ocard:nth-child(2) { animation-delay:.07s }
  .ocard:nth-child(3) { animation-delay:.13s }
  .ocard:nth-child(4) { animation-delay:.19s }
  .ocard:nth-child(5) { animation-delay:.25s }

  .upload-label {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:8px; padding:28px;
    border:2px dashed rgba(255,255,255,.09); border-radius:14px; cursor:pointer;
    transition:border-color .2s, background .2s;
    color:#444; font-size:13px;
  }

  .upload-label:hover { border-color:rgba(220,38,38,.4); background:rgba(220,38,38,.03); color:#888; }

  .cta-btn {
    width:100%; padding:13px; border:none; border-radius:100px;
    font-weight:700; font-size:13px; letter-spacing:.03em; cursor:pointer;
    background:linear-gradient(135deg,#dc2626,#b91c1c);
    color:#fff; transition:opacity .2s, transform .1s;
  }

  .cta-btn:hover:not(:disabled) { opacity:.88; }
  .cta-btn:active:not(:disabled) { transform:scale(.98); }
  .cta-btn:disabled { opacity:.35; cursor:not-allowed; }

  .back-btn {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07);
    color:#666; padding:7px 14px; border-radius:100px;
    font-size:12px; font-weight:500; cursor:pointer;
    transition:background .2s, color .2s;
  }

  .back-btn:hover { background:rgba(255,255,255,.09); color:#ccc; }

  .row-label { font-size:10px; color:#444; text-transform:uppercase; letter-spacing:.07em; margin-bottom:2px; }
  .row-value { font-size:13px; color:#ccc; font-weight:500; }
`