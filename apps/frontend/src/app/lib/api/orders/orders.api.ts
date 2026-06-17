import { apiRequest } from '@/app/lib/api/client'
import {
  CreateBodySchema,
  CreateResponseSchema,
  type CreateBody,
} from '@/app/lib/schemas/orders.schema'

export function createOrder(body: CreateBody) {
  const parsedBody = CreateBodySchema.parse(body)

  return apiRequest('/orders', CreateResponseSchema, {
    method: 'POST',
    body: JSON.stringify(parsedBody),
  })
}
