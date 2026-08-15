import type { User } from '@/api/types'

export function hasModule(user: User | null, module?: string): boolean {
  if (!module) return true
  if (!user) return false
  if (user.is_super_admin) return true
  return !!user.role?.permissions?.some((p) => p.module === module)
}

export function hasPermission(user: User | null, slug: string): boolean {
  if (!user) return false
  if (user.is_super_admin) return true
  return !!user.role?.permissions?.some((p) => p.slug === slug)
}
