import { http } from '../lib/http'
import type { Hospital } from '../types/api'

export const hospitalsApi = {
  /**
   * Only used right after `auth/register`: a brand-new self-service tenant
   * has zero hospitals, and a `patients` row needs a valid hospital_id. See
   * README "Known backend gaps" for why the frontend has to do this instead
   * of the backend doing it during provisioning.
   */
  create: (payload: { name: string; code: string }) => http.post<Hospital>('/hospitals', payload),
}
