const DEFAULT_API_BASE_URL =
  'https://pos-backend-production-2ccc.up.railway.app/api'

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/+$/, '')

export function createApiUrl(path: string) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}
