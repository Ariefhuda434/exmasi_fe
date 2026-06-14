import { useEffect, useRef } from "react"
import TicketCard from "../ui/TicketCard"
import { ticketPackages } from "../../data/ticketPackages"

export default function Tickets({ onSelectPackage }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let animationId
    let paused = false

    const scroll = () => {
      if (!el || paused) return

      el.scrollLeft += 0.6

      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        el.scrollLeft = 0
      }

      animationId = requestAnimationFrame(scroll)
    }

    const start = () => {
      paused = false
      animationId = requestAnimationFrame(scroll)
    }

    const stop = () => {
      paused = true
      cancelAnimationFrame(animationId)
    }

    el.addEventListener("mouseenter", stop)
    el.addEventListener("mouseleave", start)

    start()

    return () => {
      stop()
      el.removeEventListener("mouseenter", stop)
      el.removeEventListener("mouseleave", start)
    }
  }, [])

  return (
    <section id="tiket" className="bg-black py-20">

      {/* HEADER */}
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase">
          Pilih Paket<br />
          <span className="text-white/30">Tiket</span>
        </h2>

        <p className="mt-3 text-sm text-zinc-500">
          Paket tiket tersedia
        </p>

        <div className="mt-6 h-px bg-white/10" />
      </div>

      {/* SCROLL */}
      <div
        ref={scrollRef}
        className="
          mt-10 flex gap-5 overflow-x-auto px-5 md:px-8
          scroll-smooth no-scrollbar
        "
      >
        {ticketPackages.map((pkg, index) => (
          <TicketCard
            key={pkg.id}
            pkg={pkg}
            index={index}
            onSelect={onSelectPackage}
          />
        ))}
      </div>

    </section>
  )
}