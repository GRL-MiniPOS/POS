'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProduct } from '@/app/lib/api/products/products.api'
import { productQueries } from '@/app/lib/api/products/products.queries'

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
      queryClient.invalidateQueries({
        queryKey: productQueries.detail(id).queryKey,
      })
    },
  })
}
