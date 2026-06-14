import { logoUrl } from "../../constants/assets"
function Navbar() {
    return (
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/65 px-4 py-3 shadow-glow backdrop-blur-xl md:px-6">
          <a href="#home" className="flex items-center gap-3 font-black tracking-tight">
            <img src={logoUrl} alt="Logo EXMASI" className="h-8 w-auto object-contain shadow-glow" />
            <span className="leading-none">
              EXMASI
              <span className="block text-xs font-semibold tracking-[.24em] text-zinc-400">SAPMA PP UMSU</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-zinc-300 lg:flex">
            <a className="transition hover:text-white" href="#tentang">Tentang</a>
            <a className="transition hover:text-white" href="#agenda">Agenda</a>
            <a className="transition hover:text-white" href="#tiket">Tiket</a>
            <a className="transition hover:text-white" href="#kontak">Kontak</a>
          </nav>
          <a href="#beli" className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-black transition hover:bg-zinc-200">
            Beli Tiket
          </a>
        </div>
      </header>
    )
  }
export default Navbar