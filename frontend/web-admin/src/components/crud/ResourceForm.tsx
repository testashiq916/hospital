import { useEffect, useState } from 'react'
import type { FieldConfig } from './types'
import { Input, Select, Textarea, Checkbox } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/Misc'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'

type FormValues = Record<string, any>

function buildInitialValues(fields: FieldConfig[], initial?: FormValues): FormValues {
  const values: FormValues = {}
  for (const field of fields) {
    if (initial && field.name in initial && initial[field.name] !== null && initial[field.name] !== undefined) {
      values[field.name] = initial[field.name]
    } else if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue
    } else if (field.type === 'checkbox') {
      values[field.name] = false
    } else {
      values[field.name] = ''
    }
  }
  return values
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig
  value: any
  onChange: (v: any) => void
}) {
  const referenceOptions = useReferenceOptions(field.reference)
  const options = field.options ?? referenceOptions

  if (field.type === 'select') {
    return (
      <Select
        label={field.label}
        required={field.required}
        options={options}
        value={value ?? ''}
        hint={field.hint}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field.type === 'textarea') {
    return (
      <Textarea
        label={field.label}
        required={field.required}
        value={value ?? ''}
        placeholder={field.placeholder}
        hint={field.hint}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field.type === 'checkbox') {
    return (
      <div className="flex h-full items-center pt-5">
        <Checkbox label={field.label} checked={!!value} onChange={(e) => onChange(e.target.checked)} />
      </div>
    )
  }

  return (
    <Input
      label={field.label}
      type={field.type}
      required={field.required}
      value={value ?? ''}
      placeholder={field.placeholder}
      hint={field.hint}
      step={field.step}
      onChange={(e) => onChange(field.type === 'number' ? e.target.value : e.target.value)}
    />
  )
}

export function ResourceForm({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isEdit = false,
  serverError,
  busy = false,
}: {
  fields: FieldConfig[]
  initialValues?: FormValues
  onSubmit: (values: FormValues) => void
  onCancel: () => void
  submitLabel?: string
  isEdit?: boolean
  serverError?: string | null
  busy?: boolean
}) {
  const [values, setValues] = useState<FormValues>(() => buildInitialValues(fields, initialValues))

  useEffect(() => {
    setValues(buildInitialValues(fields, initialValues))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.id])

  const visibleFields = fields.filter((f) => !(isEdit && f.createOnly))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: FormValues = {}
    for (const field of visibleFields) {
      let v = values[field.name]
      if (field.type === 'number' && v !== '' && v !== null && v !== undefined) {
        v = Number(v)
      }
      if (v === '') v = null
      payload[field.name] = v
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {serverError && <ErrorBanner message={serverError} />}
      <div className="grid grid-cols-2 gap-4">
        {visibleFields.map((field) => (
          <div key={field.name} className={field.fullWidth ? 'col-span-2' : 'col-span-1'}>
            <FieldInput
              field={field}
              value={values[field.name]}
              onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
