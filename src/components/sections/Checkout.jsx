import { useState, useMemo, useEffect } from "react"
import { FaInstagram } from "react-icons/fa"
import Field from "../ui/Field"
import { User, Mail, MessageCircle, Phone, Loader2, AlertCircle, X } from "lucide-react"

import { posterUrl } from "../../constants/assets"
import { ticketPackages } from "../../data/ticketPackages"
import { formatCurrency } from "../../utils/formatCurrency"

import ContactLine from "../ui/ContactLine"

export default function Checkout({ selectedPackage }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    packageId: '',
    note: ''
  })

  const [loading,  setLoading]  = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    if (selectedPackage) {
      setForm((c) => ({ ...c, packageId: selectedPackage }))
    }
  }, [selectedPackage])

  const selected = useMemo(
    () => ticketPackages.find((pkg) => pkg.id === form.packageId),
    [form.packageId]
  )

  const update = (field) => (event) => {
    setForm((c) => ({ ...c, [field]: event.target.value }))
  }

  // ── Validasi ──────────────────────────────────────────────────
  const validateForm = () => {
    const { name, email, phone, packageId } = form

    if (!name.trim())              return 'Nama wajib diisi'
    if (/\d/.test(name))           return 'Nama tidak boleh mengandung angka'
    if (name.trim().length < 2)    return 'Nama terlalu pendek'

    if (!email.trim())             return 'Email wajib diisi'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Format email tidak valid'

    if (!phone.trim())             return 'Nomor WhatsApp wajib diisi'
    const cleaned = phone.trim().replace(/[\s\-().]/g, '')
    if (!/^(\+62|62|0)[0-9]{8,13}$/.test(cleaned)) return 'Format nomor tidak valid (contoh: 08xxxxxxxxxx)'

    if (!packageId)                return 'Pilih paket tiket terlebih dahulu'

    return null
  }

  // ── Submit ────────────────────────────────────────────────────
  const handleCheckout = async () => {
    const error = validateForm()
    if (error) {
      setErrorMsg(error)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data?.message || "Gagal membuat order")
        setLoading(false)
        return
      }

      const orderId = data?.order?.order_id || data?.order?.orderId || data?.order
      if (!orderId) {
        setErrorMsg("Order ID tidak ditemukan")
        setLoading(false)
        return
      }

      window.location.href = `/order/${orderId}`

    } catch (err) {
      setErrorMsg("Server error / koneksi gagal, coba lagi")
      setLoading(false)
    }
  }

  return (
    <section
      id="beli"
      className="relative overflow-hidden bg-[#080808] px-4 py-16 md:px-8 md:py-24"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 opacity-20">
        <img src={posterUrl} className="h-full w-full object-cover blur-sm" />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-zinc-950 px-10 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
            <p className="text-sm font-bold text-white">Memproses pesanan...</p>
            <p className="text-xs text-zinc-500">Mengirim invoice ke email kamu, tunggu sebentar</p>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {errorMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-red-500/20 bg-zinc-950 p-6 text-center">
            <button
              onClick={() => setErrorMsg(null)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-sm font-bold text-white">Tidak bisa lanjut</p>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg(null)}
              className="mt-5 w-full rounded-full bg-red-700 py-2.5 text-xs font-black text-white transition hover:bg-red-600 active:scale-95"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-12">

        {/* LEFT INFO */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[.3em] text-red-500">
            Ticket Checkout
          </p>
          <h2 className="mt-2 text-3xl md:text-5xl font-black uppercase leading-tight">
            Amankan tiket sekarang
          </h2>
          <p className="mt-4 text-sm text-zinc-400 leading-6">
            Sistem akan mengarahkan ke halaman konfirmasi setelah data dikirim.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <ContactLine icon={Phone} text="Nopal: 085664144001" />
            <ContactLine icon={Phone} text="Fadil: 081266893508" />
            <ContactLine icon={FaInstagram} text="@exmasi.event" />
          </div>
        </div>

        {/* RIGHT FORM */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-2xl border border-white/10 bg-white p-5 md:p-8 text-black shadow-xl"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field icon={User}          label="Nama"      value={form.name}   onChange={update('name')}  />
            <Field icon={Mail}          label="Email"     value={form.email}  onChange={update('email')} />
            <Field icon={MessageCircle} label="WhatsApp"  value={form.phone}  onChange={update('phone')} />

            <div>
              <label className="mb-2 block text-xs font-black text-zinc-700">Paket Tiket</label>
              <select
                value={form.packageId}
                onChange={update('packageId')}
                className="w-full rounded-2xl mt-1 border border-zinc-200 bg-zinc-50 px-4 py-[13.8px] outline-none ring-red-700 transition focus:ring-2"
              >
                <option value="" disabled>Pilih paket tiket</option>
                {ticketPackages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatCurrency(p.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-black text-zinc-700">Catatan</label>
              <textarea
                rows="3"
                value={form.note}
                onChange={update('note')}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 outline-none ring-red-700 transition focus:ring-2"
              />
            </div>
          </div>

          {/* SUMMARY */}
          {selected && (
            <div className="mt-6 rounded-2xl bg-zinc-950 p-5 text-white">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Ringkasan Pesanan</p>
              <div className="mt-3 flex justify-between">
                <div>
                  <p className="text-lg font-black">{selected.name}</p>
                  <p className="text-xs text-zinc-400">{selected.qty} tiket</p>
                </div>
                <p className="text-xl font-black">{formatCurrency(selected.price)}</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-red-700 py-3 text-sm font-black text-white transition hover:bg-red-600 active:scale-95 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Lanjutkan Pembayaran"}
          </button>

          <p className="mt-3 text-center text-[10px] text-zinc-500">
            Pastikan data sudah benar sebelum melanjutkan
          </p>
        </form>
      </div>
    </section>
  )
}