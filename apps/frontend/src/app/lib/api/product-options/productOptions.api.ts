import { apiRequest } from '@/app/lib/api/client'
import { ListResponseSchema } from '@/app/lib/schemas/productOptions.schema'

export function getProductOptions(signal?: AbortSignal) {
  return apiRequest('/product-options', ListResponseSchema, { signal })
}
