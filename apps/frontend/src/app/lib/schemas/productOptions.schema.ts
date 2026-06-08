import { z } from 'zod'
import { OptionGroupSchema } from './products.schema'

// GET /product-options：所有商品使用過的 option_groups 與 values（去重）。
export const ListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(OptionGroupSchema),
  total: z.number().int(),
})

export type ProductOptionGroup = z.infer<typeof OptionGroupSchema>
export type ProductOptionListResponse = z.infer<typeof ListResponseSchema>
