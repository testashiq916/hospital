import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseInputClasses =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-slate-100 disabled:text-slate-500'

interface FieldWrapperProps {
  label?: string
  error?: string
  required?: boolean
  hint?: string
  children: ReactNode
}

export function FieldWrapper({ label, error, required, hint, children }: FieldWrapperProps) {
  return (
    <label className="block text-left">
      {label && (
        <span className="mb-1 block text-xs font-medium text-slate-600">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, required, className = '', ...rest }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} required={required} hint={hint}>
      <input className={`${baseInputClasses} ${className}`} required={required} {...rest} />
    </FieldWrapper>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, required, className = '', ...rest }: TextareaProps) {
  return (
    <FieldWrapper label={label} error={error} required={required} hint={hint}>
      <textarea
        className={`${baseInputClasses} min-h-[80px] resize-y ${className}`}
        required={required}
        {...rest}
      />
    </FieldWrapper>
  )
}

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({
  label,
  error,
  hint,
  required,
  options,
  placeholder = 'Select…',
  className = '',
  ...rest
}: SelectProps) {
  return (
    <FieldWrapper label={label} error={error} required={required} hint={hint}>
      <select className={`${baseInputClasses} ${className}`} required={required} {...rest}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Checkbox({ label, className = '', ...rest }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" className={`h-4 w-4 rounded border-slate-300 ${className}`} {...rest} />
      {label}
    </label>
  )
}
