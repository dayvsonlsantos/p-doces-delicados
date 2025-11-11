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
    rounded-2xl px-4 md:px-6 py-2 md:py-3 font-semibold transition-all duration-300
    flex items-center justify-center gap-2 text-sm md:text-base
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
    btn-mobile
  `
  
  const variants = {
    primary: `
      text-white dynamic-gradient
      ${!disabled && 'hover:brightness-110'}
    `,
    secondary: 'text-white bg-white/20 hover:bg-white/30',
    danger: 'text-white bg-red-500/80 hover:bg-red-600/80'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={variant === 'primary' && !disabled ? {
        background: `linear-gradient(135deg, 
          hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness)) 0%,
          hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) * 1.2)) 100%
        )`
      } : {}}
    >
      {children}
    </button>
  )
}