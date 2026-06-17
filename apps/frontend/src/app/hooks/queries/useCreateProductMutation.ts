'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct } from '@/app/lib/api/products/products.api'
import { productQueries } from '@/app/lib/api/products/products.queries'

export function useCreateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
    },
  })
}
