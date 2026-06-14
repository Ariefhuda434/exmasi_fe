export default function Gallery() {
  const items = [
    { title: 'Art Exhibition Night', img: '/images/Art.jpg' },
    { title: 'Stand Up Comedy Show', img: '/images/standup.jpg' },
    { title: 'Live Mural Session', img: '/images/live.jpg' },
    { title: 'Vocal Performance', img: '/images/vocal.jpg' },
    { title: 'Stand Up Comedy Show', img: '/images/comedy.jpg' },
    { title: 'After Party Closing', img: '/images/party.jpg' },
    { title: 'Crowd Moment', img: '/images/silat.jpg' },
    { title: 'Behind The Stage', img: '/images/fotobackstage.jpg' },
    { title: 'Audience Interaction', img: '/images/fotorame.jpg' }
  ]

  return (
    <section className="relative bg-[#080808] px-5 py-28 md:px-8 overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-red-600/10 blur-[160px]" />
      </div>

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-black uppercase tracking-[.35em] text-red-500">
            Dokumentasi Event
          </p>

          <h2 className="text-4xl font-black uppercase tracking-[-.05em] md:text-6xl text-white">
            Momen tahun lalu
          </h2>

          <p className="mt-5 text-zinc-400 md:text-lg">
            Cuplikan perjalanan EXMASI dari panggung, penonton, hingga behind the scene.
          </p>
        </div>

        {/* MAGAZINE STYLE GRID */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px]">

          {items.map((item, i) => {
            const span =
              i === 0 ? 'col-span-2 row-span-2' :
              i === 3 ? 'col-span-2' :
              i === 5 ? 'row-span-2' :
              ''

            return (
              <div
                key={i}
                className={`
                  relative overflow-hidden rounded-[2rem]
                  border border-white/10
                  group
                  ${span}
                `}
              >
                {/* IMAGE */}
                <img
                  src={item.img}
                  className="
                    h-full w-full object-cover
                    transition duration-700
                    group-hover:scale-110
                  "
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* TITLE */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-sm md:text-lg font-black uppercase text-white">
                    {item.title}
                  </h3>

                  <div className="mt-2 h-[2px] w-10 bg-red-500/60" />
                </div>

              </div>
            )
          })}

        </div>
      </div>
    </section>
  )
}