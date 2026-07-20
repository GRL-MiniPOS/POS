import { z } from 'zod'

export const IdSchema = z.uuid()
export const CreateParentIdSchema = z.uuidv4()

export const CategorySchema = z.object({
  id: IdSchema,
  name: z.string(),
  parent_id: IdSchema.nullable(),
  order: z.number().int(),
  active: z.boolean(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export const ListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(CategorySchema),
  total: z.number().int(),
})

export const CreateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    parent_id: CreateParentIdSchema.nullable().optional(),
    order: z.number().int().optional(),
  })
  .strict()

export const CreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: IdSchema,
    message: z.string(),
  }),
})

export const DeleteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string(),
  }),
})

// PATCH /product-categories/{id}
export const UpdateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    order: z.number().int().optional(),
    active: z.boolean().optional(),
  })
  .strict()

// 更新回傳完整分類物件（與 updateProduct 的 { id, message } 不同）
export const UpdateResponseSchema = z.object({
  success: z.literal(true),
  data: CategorySchema,
})

// PATCH /product-categories/reorder
export const ReorderBodySchema = z
  .object({
    ordered_ids: z.array(IdSchema).min(1),
    parent_id: CreateParentIdSchema.nullable().optional(),
  })
  .strict()

// 回傳 { message }，與 DeleteResponse 同形狀，仍給獨立命名以保留契約語意
export const ReorderResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string(),
  }),
})

export const FiltersSchema = z
  .object({
    active: z.boolean().default(true),
    parentId: IdSchema.nullable().optional(),
  })
  .strict()

export type Filters = z.input<typeof FiltersSchema>
export type NormalizedFilters = z.output<typeof FiltersSchema>

export type Category = z.infer<typeof CategorySchema>
export type ListResponse = z.infer<typeof ListResponseSchema>
export type CreateBody = z.infer<typeof CreateBodySchema>
export type UpdateBody = z.infer<typeof UpdateBodySchema>
export type ReorderBody = z.infer<typeof ReorderBodySchema>
