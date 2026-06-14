import { posterUrl } from "../../constants/assets"
import { highlights } from "../../data/highlights"

export default function About() {
  return (
    <section id="tentang" className="bg-exBlack px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">

          {/* IMAGE */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-white/15 via-transparent to-red-900/30 blur-2xl" />

            <img
              src={posterUrl}
              alt="Poster resmi EXMASI Vol. 3"
              className="relative w-full rounded-[2rem] border border-white/10 object-cover shadow-glow"
            />
          </div>

          {/* TEXT */}
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[.28em] text-red-500">
              Tentang Acara
            </p>

            <h2 className="text-4xl font-black uppercase tracking-[-.05em] md:text-6xl">
              Evolusi Kreasi Mahasiswa dalam Ekspresi Seni
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-zinc-300">
              <p>
                EXMASI merupakan wadah kreativitas mahasiswa yang menghadirkan beragam bentuk ekspresi seni dalam satu rangkaian acara.
              </p>
              <p>
                Acara ini memberikan ruang bagi mahasiswa untuk menyalurkan bakat, ide, dan kreativitas melalui seni, musik, dan pertunjukan.
              </p>
              <p>
                EXMASI menjadi sarana mempererat solidaritas dan kolaborasi antar mahasiswa.
              </p>
            </div>

            {/* HIGHLIGHTS */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/[.04] p-5"
                >
                  <item.icon className="mb-4 text-red-500" size={28} />
                  <h3 className="font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}