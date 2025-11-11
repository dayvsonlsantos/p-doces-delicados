// components/UI/GlassCard.js
export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`glass rounded-3xl p-6 ${className}`}>
      {children}
    </div>
  )
}