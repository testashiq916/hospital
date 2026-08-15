import type { ReactNode } from 'react'

export interface SelectOption {
  value: string | number
  label: string
}

export interface ReferenceConfig {
  /** API endpoint to fetch options from, e.g. '/hospitals'. */
  endpoint: string
  label: (item: any) => string
  /** Extra static query params sent with the reference fetch. */
  params?: Record<string, string | number>
}

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'email'

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: SelectOption[]
  reference?: ReferenceConfig
  placeholder?: string
  fullWidth?: boolean
  defaultValue?: string | number | boolean
  hint?: string
  /** Show this field only in the create form, not edit (e.g. immutable keys). */
  createOnly?: boolean
  step?: string
}

export interface ColumnConfig<T = any> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  className?: string
}

export interface FilterConfig extends FieldConfig {}

export interface ResourceConfig<T = any> {
  key: string
  title: string
  singular: string
  endpoint: string
  columns: ColumnConfig<T>[]
  fields: FieldConfig[]
  searchable?: boolean
  filters?: FilterConfig[]
  canDelete?: boolean
  canCreate?: boolean
  canEdit?: boolean
  description?: string
  /** Params always sent with the list query (e.g. a fixed hospital scope). */
  fixedParams?: Record<string, string | number>
  rowActions?: (row: T) => ReactNode
}
