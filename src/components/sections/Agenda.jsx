export default function Agenda() {
  const agenda = [
    { title: 'Art Exhibition', img: '/images/FotoHero.jpg' },
    { title: 'Band Performance', img: '/images/fotoband.jpg' },
    { title: 'Live Mural', img: '/images/mural.jpg' },
    { title: 'Vocal Solo', img: '/images/vocal.jpg' },
    { title: 'Stand Up Comedy', img: '/images/standup.jpeg' },
    { title: 'After Party', img: '/images/party.jpg' }
  ]

  return (
    <section className="relative bg-[#080808] px-5 py-20 md:py-28 md:px-8 overflow-hidden">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-red-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="max-w-3xl">
          <p className="mb-3 text-xs md:text-sm font-black uppercase tracking-[.35em] text-red-500">
            Rangkaian Seni
          </p>

          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-[-.06em] text-white">
            Satu panggung,<br />
            banyak ekspresi
          </h2>
        </div>

        {/* FLOW */}
        <div className="mt-14 md:mt-20 space-y-16 md:space-y-28">

          {agenda.map((item, i) => {
            const left = i % 2 === 0

            return (
              <div
                key={i}
                className={`
                  flex flex-col md:flex-row
                  gap-6 md:gap-12
                  items-start md:items-center
                  ${left ? 'md:justify-start' : 'md:flex-row-reverse md:justify-start'}
                `}
              >

                {/* IMAGE */}
                <div
                  className="
                    relative w-full md:w-[58%]
                    h-[220px] sm:h-[260px] md:h-[380px]
                    overflow-hidden rounded-2xl md:rounded-3xl
                    border border-white/10 group
                    bg-black
                  "
                >
                  <img
                    src={item.img}
                    className="
                      h-full w-full object-cover
                      transition duration-700 ease-out
                      group-hover:scale-105
                    "
                    alt={item.title}
                  />

                  {/* overlay gradient cinematic */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-transparent" />
                </div>

                {/* TEXT */}
                <div className="w-full md:w-[38%]">
                  <h3 className="text-2xl md:text-4xl font-black uppercase text-white leading-tight">
                    {item.title}
                  </h3>

                  <p className="mt-3 md:mt-4 text-sm text-zinc-500 leading-6 md:leading-7">
                    Experience segment {i + 1} dari EXMASI. Menggabungkan seni visual, musik, dan performa dalam satu ruang ekspresi.
                  </p>

                  {/* LINE */}
                  <div className="mt-5 md:mt-7 h-[2px] w-16 md:w-24 bg-gradient-to-r from-red-500/60 to-transparent" />
                </div>

              </div>
            )
          })}

        </div>
      </div>
    </section>
  )
}