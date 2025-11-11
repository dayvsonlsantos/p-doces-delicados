// components/UI/GlassButton.js
export default function GlassButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  type = 'button',
  disabled = false
}) {
  const baseClasses = `
    rounded-2xl px-6 py-3 font-semibold transition-all duration-300
    flex items-center justify-center gap-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
  `
  
  const variants = {
    primary: 'text-white bg-gradient-to-r from-primary-500 to-primary-600',
    secondary: 'text-white bg-white/20 hover:bg-white/30',
    danger: 'text-white bg-red-500/80 hover:bg-red-600/80'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}