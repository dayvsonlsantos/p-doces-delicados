// components/UI/Input.js
export default function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  className = '',
  required = false,
  disabled = false
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary flex">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          glass-input w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${type === 'date' ? 'min-h-[44px]' : ''} /* Altura mínima para touch */
        `}
        style={
          type === 'date' ? {
            WebkitAppearance: 'none',
            minHeight: '44px',
            fontSize: '16px' // Previne zoom no iOS
          } : {}
        }
      />
    </div>
  )
}