'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { batchDeleteProducts } from '@/app/lib/api/products/products.api'
import { productQueries } from '@/app/lib/api/products/products.queries'

export function useBatchDeleteProductsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchDeleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
    },
  })
}
