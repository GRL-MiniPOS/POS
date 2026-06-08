import { z } from 'zod'
import { IdSchema } from './common.schema'

// POST /upload 回傳的單一圖片資產。
export const AssetSchema = z.object({
  id: IdSchema,
  name: z.string(),
  url: z.string(),
  thumb_url: z.string().nullable(),
  mime: z.string(),
  size: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  created_at: z.iso.datetime(),
})

export const UploadResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(AssetSchema),
  total: z.number().int(),
})

export type Asset = z.infer<typeof AssetSchema>
export type UploadResponse = z.infer<typeof UploadResponseSchema>
