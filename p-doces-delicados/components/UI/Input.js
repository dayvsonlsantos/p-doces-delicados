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
        <label className="block text-sm font-medium text-primary">
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
        className={`glass-input w-full px-4 py-3 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      />
    </div>
  )
}