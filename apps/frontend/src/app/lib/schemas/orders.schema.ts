import { z } from 'zod'
import { IdSchema, Uuid4Schema } from './common.schema'
import { VariantSchema } from './products.schema'

// ---- Request body（.strict()）----

// 有變體商品 items[].product_variant_id 必填；無變體商品不可提供。後端 binding 為 uuid4。
export const OrderItemBodySchema = z
  .object({
    product_id: Uuid4Schema,
    product_variant_id: Uuid4Schema.optional(),
    quantity: z.number().int().min(1),
  })
  .strict()

export const CreateBodySchema = z
  .object({
    items: z.array(OrderItemBodySchema).min(1),
    customer_id: Uuid4Schema.optional(),
    payment: z.string().optional(),
    source: z.string().optional(),
  })
  .strict()

// ---- Response（不加 .strict()）----
// nullability 對照 dto.OrderResponse / dto.OrderItemResponse 的指標欄位。

export const OrderItemResponseSchema = z.object({
  id: IdSchema,
  product_id: IdSchema.nullable(),
  product_name: z.string(),
  product_variant_id: IdSchema.nullable().optional(),
  variant: VariantSchema.nullable().optional(),
  quantity: z.number().int(),
  unit_price: z.number().int(),
  subtotal: z.number().int(),
})

export const OrderSchema = z.object({
  id: IdSchema,
  customer_id: IdSchema.nullable().optional(),
  payment: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  total_price: z.number().int(),
  original_price: z.number().int(),
  status: z.enum([
    'pending',
    'processing',
    'shipped',
    'completed',
    'cancelled',
  ]),
  items: z.array(OrderItemResponseSchema),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export const CreateResponseSchema = z.object({
  success: z.literal(true),
  data: OrderSchema,
})

export type Order = z.infer<typeof OrderSchema>
export type CreateBody = z.infer<typeof CreateBodySchema>
export type OrderCreateResponse = z.infer<typeof CreateResponseSchema>
