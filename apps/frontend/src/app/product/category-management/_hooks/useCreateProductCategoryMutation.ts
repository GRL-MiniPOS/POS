'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProductCategory } from '@/app/lib/api/product-categories/productCategories.api'
import { productCategoryQueries } from '@/app/lib/api/product-categories/productCategories.queries'

export function useCreateProductCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productCategoryQueries.lists(),
      })
    },
  })
}
