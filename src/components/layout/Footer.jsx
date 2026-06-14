import { logoUrl } from "../../constants/assets"
import { ArrowRight, Phone } from "lucide-react"
import { FaInstagram } from "react-icons/fa"

function Footer() {
  return (
    <footer id="kontak" className="border-t border-white/10 bg-black px-5 py-14 md:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-950/70 via-zinc-950 to-black p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.3em] text-red-500">
                EXMASI VOL. 3
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black uppercase leading-tight tracking-[-.04em] text-white md:text-5xl">
                Rayakan seni, karya, dan ekspresi mahasiswa.
              </h2>
            </div>

            <a
              href="#beli"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
            >
              Beli Tiket <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[1.4fr_.8fr_.8fr]">

          <div>
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Logo EXMASI" className="h-14 w-auto object-contain md:h-16" />
              <div>
                <p className="text-2xl font-black text-white">EXMASI</p>
                <p className="text-xs font-bold uppercase tracking-[.25em] text-zinc-500">
                  SAPMA PP UMSU
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-500">
              Website resmi pemesanan tiket EXMASI Vol. 3.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[.25em] text-red-500">
              Media Sosial
            </h3>

            <div className="mt-5 space-y-3 text-sm text-zinc-400">
              <a href="https://www.instagram.com/sapmappumsu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <FaInstagram size={16} className="text-red-500" /> @sapmappumsu
              </a>
              <a href="https://www.instagram.com/exmasi.event" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <FaInstagram size={16} className="text-red-500" /> @exmasi.event
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[.25em] text-red-500">
              Kontak
            </h3>

            <div className="mt-5 space-y-3 text-sm text-zinc-400">
              <a href="https://wa.me/085664144001" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Phone size={16} className="text-red-500" /> Nopal: 085664144001
              </a>
              <a href="https://wa.me/081266893508" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Phone size={16} className="text-red-500" /> Fadil: 081266893508
              </a>
            </div>
          </div>

        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-600 md:flex-row">
          <p>© 2026 EXMASI SAPMA PP UMSU.</p>
          <p>All rights reserved.</p>
        </div>

      </div>
    </footer>
  )
}

export default Footer