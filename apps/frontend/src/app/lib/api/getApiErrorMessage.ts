import { ApiError } from './client'
import { ApiErrorResponseSchema } from '@/app/lib/schemas/apiError.schema'

// API response 是 runtime 資料；錯誤 payload 先用共用 schema 安全解析，再決定顯示文字。
export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return '操作失敗，請稍後再試'
  }

  const parsed = ApiErrorResponseSchema.safeParse(error.payload)
  return parsed.success ? parsed.data.error.message : error.message
}
