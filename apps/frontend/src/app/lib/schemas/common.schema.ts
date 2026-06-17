import { z } from 'zod'

// response / path / query 的識別碼：後端 handler 用 uuid.Parse()，不限定版本，故用一般 UUID。
export const IdSchema = z.uuid()

// request body 的識別碼：後端 DTO binding 標明 uuid4（如 category_id、image_ids），先在前端擋掉非 v4。
export const Uuid4Schema = z.uuidv4()

export const SaleStatusSchema = z.enum(['active', 'inactive'])
export const StockStatusSchema = z.enum(['in-stock', 'out-of-stock'])
