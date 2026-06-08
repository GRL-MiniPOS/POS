import { z } from 'zod'

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z
      .array(
        z.object({
          field: z.string(),
          message: z.string(),
        })
      )
      .optional(),
    failed_ids: z.array(z.string()).optional(),
  }),
})

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>
