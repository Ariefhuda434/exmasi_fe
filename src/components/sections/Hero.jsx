import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { heroUrl, bannerUrl } from "../../constants/assets"

import InfoPill from "../ui/InfoPill"
export default function Hero() {
    return (
      <section id="home" className="noise relative isolate min-h-screen overflow-hidden bg-exBlack bg-ornament pt-28">
        <div className="absolute inset-0 -z-10">
          <img src={heroUrl} alt="Hero EXMASI Vol. 3" className="h-full w-full object-cover opacity-30 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-exBlack" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-exBlack to-transparent" />
        </div>

        <div className="mx-auto grid max-w-7xl items-end gap-10 px-5 pb-20 pt-20 md:grid-cols-[1.05fr_.95fr] md:px-8 lg:pb-28 lg:pt-28">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.25em] text-zinc-200 backdrop-blur-xl">
              <Sparkles size={15} /> Vol. 3 Exhibition Project
            </div>
            <h1 className="max-w-5xl text-6xl font-black uppercase leading-[.85] tracking-[-.08em] text-white md:text-8xl lg:text-[128px]">
              EXMASI <span className="text-stroke block">VOL. 3</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Ekspresi Mahasiswa Melalui Seni. Wadah kreativitas mahasiswa dalam pameran, pertunjukan, musik, teater, komedi, mural, visual mapping, hingga after party.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#beli" className="group inline-flex items-center gap-2 rounded-full bg-red-700 px-6 py-3 font-black text-white shadow-redGlow transition hover:bg-red-600">
                Pesan Tiket <ArrowRight className="transition group-hover:translate-x-1" size={18} />
              </a>
              <a href="#tentang" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-xl transition hover:bg-white/15">
                Lihat Detail Acara
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              <InfoPill icon={CalendarDays} label="Tanggal" value="27 Juni 2026" />
              <InfoPill icon={Clock} label="Waktu" value="15.00 WIB" />
              <InfoPill icon={MapPin} label="Lokasi" value="Taman Budaya Sumut" />
            </div>
          </div>

          {/* <div className="glass rounded-[2rem] p-4 shadow-glow">
            <img src={bannerUrl} alt="Banner EXMASI" className="h-28 w-full rounded-3xl object-cover  object-[45%_50%] md:h-36" />
            <div className="mt-4 grid gap-4 rounded-3xl border border-white/10 bg-black/55 p-5">
              <p className="text-sm font-semibold uppercase tracking-[.22em] text-zinc-400">Kuota tersedia</p>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <strong className="text-5xl font-black tracking-tight">1000</strong>
                  <span className="ml-2 text-zinc-400">tiket</span>
                </div>
                <Ticket className="text-red-500" size={44} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[32%] rounded-full bg-gradient-to-r from-red-800 via-red-500 to-white" />
              </div>
              <p className="text-sm leading-6 text-zinc-400">Segera amankan tiket sebelum kuota habis.</p>
            </div>
          </div> */}
        </div>
      </section>
    )
  }