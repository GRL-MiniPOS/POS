import { z } from 'zod'
import {
  IdSchema,
  Uuid4Schema,
  SaleStatusSchema,
  StockStatusSchema,
} from './common.schema'

// ---- 共用子結構 ----

// option_groups 是規格類型（如「顏色」「尺寸」）；variants 是實際可販售組合。
export const OptionGroupSchema = z.object({
  id: IdSchema,
  name: z.string(),
  position: z.number().int(),
  values: z.array(z.string()),
})

export const VariantSchema = z.object({
  id: IdSchema,
  option_values: z.record(z.string(), z.string()),
  quantity: z.number().int(),
  sale_status: SaleStatusSchema,
  stock_status: StockStatusSchema,
  can_order: z.boolean(),
})

export const CategoryInfoSchema = z.object({
  id: IdSchema,
  name: z.string(),
})

// ---- Response（不加 .strict()，容忍後端新增欄位）----

// dto.ProductResponse 與 dto.ProductDetailResponse 欄位相同，共用一個 schema。
export const ProductSchema = z.object({
  id: IdSchema,
  name: z.string(),
  category: CategoryInfoSchema.nullable(), // 商品分類被刪除後 category_id 會是 null
  price: z.number().int(),
  quantity: z.number().int(),
  stock: z.number().int(),
  image: z.string(),
  sale_status: SaleStatusSchema,
  stock_status: StockStatusSchema,
  can_order: z.boolean(),
  has_variants: z.boolean(),
  option_groups: z.array(OptionGroupSchema),
  variants: z.array(VariantSchema),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export const PaginationSchema = z.object({
  current_page: z.number().int(),
  per_page: z.number().int(),
  total_items: z.number().int(),
  total_pages: z.number().int(),
})

export const ListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(ProductSchema),
  pagination: PaginationSchema,
})

export const DetailResponseSchema = z.object({
  success: z.literal(true),
  data: ProductSchema,
})

export const CreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: IdSchema,
    message: z.string(),
  }),
})

export const UpdateResponseSchema = CreateResponseSchema

export const DeleteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string(),
  }),
})

export const BatchDeleteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    deleted_count: z.number().int(),
    message: z.string(),
  }),
})

// ---- Request body（.strict()，拼錯或多傳欄位早點被擋）----

export const OptionGroupBodySchema = z
  .object({
    name: z.string().trim().min(1).max(30),
    values: z.array(z.string().trim().min(1)).min(1).max(50),
  })
  .strict()

export const VariantBodySchema = z
  .object({
    id: IdSchema.optional(),
    option_values: z.record(z.string(), z.string()),
    quantity: z.number().int().min(0).optional(),
    sale_status: SaleStatusSchema.optional(),
  })
  .strict()

export const CreateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    category_id: Uuid4Schema,
    price: z.string().min(1),
    quantity: z.number().int().min(0).optional(),
    sale_status: SaleStatusSchema.optional(),
    image_ids: z.array(Uuid4Schema).optional(),
    option_groups: z.array(OptionGroupBodySchema).max(2).optional(),
    variants: z.array(VariantBodySchema).optional(),
  })
  .strict()

// PATCH /products/{id}：部分更新，全部欄位 optional。
export const UpdateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    category_id: Uuid4Schema.optional(),
    price: z.string().min(1).optional(),
    quantity: z.number().int().min(0).optional(),
    sale_status: SaleStatusSchema.optional(),
    image_ids: z.array(Uuid4Schema).optional(),
    option_groups: z.array(OptionGroupBodySchema).max(2).optional(),
    variants: z.array(VariantBodySchema).optional(),
  })
  .strict()

export const BatchDeleteBodySchema = z
  .object({
    ids: z.array(IdSchema).min(1),
  })
  .strict()

// ---- Query filters（.strict()）----

export const FiltersSchema = z
  .object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).default(10),
    search: z.string().optional(),
    categories: z.array(IdSchema).optional(),
    options: z.array(z.string()).optional(),
    priceMin: z.number().int().min(0).optional(),
    priceMax: z.number().int().min(0).optional(),
    stockStatus: z.enum(['all', 'in-stock', 'out-of-stock']).default('all'),
    saleStatus: z.enum(['all', 'active', 'inactive']).default('all'),
  })
  .strict()

// ---- Types ----

export type Product = z.infer<typeof ProductSchema>
export type ProductListResponse = z.infer<typeof ListResponseSchema>
export type Filters = z.input<typeof FiltersSchema>
export type NormalizedFilters = z.output<typeof FiltersSchema>
export type CreateBody = z.infer<typeof CreateBodySchema>
export type UpdateBody = z.infer<typeof UpdateBodySchema>
