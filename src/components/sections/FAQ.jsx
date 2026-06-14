export default function FAQ() {
 const faqs = [
  [
    'Kapan EXMASI Vol. 3 dilaksanakan?',
    'EXMASI Vol. 3 dilaksanakan pada Sabtu, 27 Juni 2026 mulai pukul 15.00 WIB.'
  ],
  [
    'Di mana lokasi acaranya?',
    'Lokasi acara berada di Taman Budaya Sumut. Detail titik lokasi akan diumumkan melalui kanal resmi event.'
  ],
  [
    'Bagaimana cara membeli tiket?',
    'Pilih paket tiket, isi data pembelian, lalu lakukan konfirmasi sesuai instruksi panitia. Tiket akan dikirim setelah verifikasi.'
  ],
  [
    'Bagaimana tiket digunakan saat acara?',
    'Setiap tiket memiliki kode unik yang digunakan untuk validasi masuk di pintu acara.'
  ],
  [
    'Bagaimana sistem pembayaran acara ini?',
    'Pembayaran dilakukan melalui metode yang telah disediakan panitia dan akan diverifikasi sebelum tiket diterbitkan.'
  ]
]

  return (
    <section className="bg-[#080808] px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[.28em] text-red-500">
            FAQ
          </p>
          <h2 className="text-4xl font-black uppercase tracking-[-.05em] md:text-6xl">
            Pertanyaan umum
          </h2>
        </div>

        <div className="divide-y divide-white/10 rounded-[2rem] border border-white/10 bg-white/[.04] px-6">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-black text-white">
                {question}
                <span className="text-2xl text-red-500 group-open:rotate-45 transition-transform ease-out">
                  +
                </span>
              </summary>

              <p className="mt-4 leading-7 text-zinc-400">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}