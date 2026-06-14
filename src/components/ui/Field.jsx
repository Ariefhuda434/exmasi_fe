export default function Field({ icon: Icon, label, type = 'text', ...props }) {
    return (
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-black text-zinc-700"><Icon size={17} /> {label}</label>
        <input type={type} {...props} className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none ring-red-700 transition focus:ring-2" />
      </div>
    )
  }