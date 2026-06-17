import { z } from 'zod'
import { ApiErrorResponseSchema } from '@/app/lib/schemas/apiError.schema'
import { createApiUrl } from './config'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options?: RequestInit
): Promise<z.infer<TSchema>> {
  const hasBody = options?.body !== undefined && options?.body !== null
  const isFormData = options?.body instanceof FormData
  const headers = new Headers(options?.headers)

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(createApiUrl(path), {
    ...options,
    headers,
  })

  // 空 body 不要當成「payload = null」吞掉，而是明確報錯，避免 schema.parse 出意義不明的訊息。
  const rawBody = await response.text()
  let payload: unknown = null

  if (rawBody.length > 0) {
    try {
      payload = JSON.parse(rawBody)
    } catch {
      throw new ApiError('API response is not JSON', response.status, rawBody)
    }
  }

  if (!response.ok) {
    throw new ApiError('API request failed', response.status, payload)
  }

  if (payload === null) {
    throw new ApiError('Empty response body', response.status, null)
  }

  if (ApiErrorResponseSchema.safeParse(payload).success) {
    throw new ApiError('API request failed', response.status, payload)
  }

  return schema.parse(payload)
}
