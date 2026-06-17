'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProduct } from '@/app/lib/api/products/products.api'
import { productQueries } from '@/app/lib/api/products/products.queries'
import type { UpdateBody } from '@/app/lib/schemas/products.schema'

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBody }) =>
      updateProduct(id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
      queryClient.invalidateQueries({
        queryKey: productQueries.detail(id).queryKey,
      })
    },
  })
}
