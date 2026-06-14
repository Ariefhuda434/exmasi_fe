export default function InfoPill({ icon: Icon, label, value }) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[.06] p-4 backdrop-blur-xl">
        <Icon className="mb-3 text-red-500" size={24} />
        <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">{label}</p>
        <p className="mt-1 font-black text-white">{value}</p>
      </div>
    )
  }