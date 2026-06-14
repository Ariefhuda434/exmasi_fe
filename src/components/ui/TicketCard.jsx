  import { formatCurrency } from "../../utils/formatCurrency"
  export default function TicketCard({ pkg, index,onSelect }) {
    const pricePerPerson = Math.round(pkg.price / pkg.qty)
    const handlePesan = () => {
      onSelect?.(pkg.id)
      document.getElementById('beli')?.scrollIntoView({ behavior: 'smooth' })
    }
      return (
        <article
          className="
            group relative
            w-[260px] sm:w-[280px] md:w-[300px]
            flex flex-col justify-between
            rounded-3xl border border-white/10
            bg-zinc-950
            p-6
            mt-4
            transition-all duration-500 ease-out
            hover:-translate-y-3 hover:scale-[1.03]
            hover:border-white/30
          "
        >

          {/* NUMBER */}
          <span className="absolute right-4 bottom-30 text-[80px] font-black text-white/5">
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* TITLE */}
          <div>
            <h3 className="text-3xl font-black text-white uppercase">
              {pkg.name}
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              {pkg.note}
            </p>

            {/* VISUAL BARS */}
            <div className="mt-6 flex gap-1.5">
              {Array.from({ length: Math.min(pkg.qty, 8) }).map((_, i) => (
                <div
                  key={i}
                  className="
                    h-1 flex-1 rounded-full
                    bg-white/10
                    group-hover:bg-white/30
                    transition-all duration-300
                  "
                />
              ))}
            </div>
          </div>

          {/* BOTTOM */}
          <div className="mt-8">
            <div className="h-px bg-white/10 mb-5" />

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xl font-black text-white">
                  {formatCurrency(pkg.price)}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {formatCurrency(pricePerPerson)} / orang
                </p>
              </div>

              <button
          onClick={handlePesan}
          className="
            rounded-full px-4 py-2
            text-[10px] font-black uppercase
            border border-white/10
            text-white/70
            hover:bg-white/10 hover:text-white
            transition
          "
        >
          Pesan
        </button>
            </div>
          </div>
        </article>
      )
    }
