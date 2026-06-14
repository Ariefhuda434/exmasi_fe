export default function ContactLine({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] p-3 text-sm text-white">
      {Icon && <Icon size={16} className="text-red-500" />}
      <span>{text}</span>
    </div>
  )
}