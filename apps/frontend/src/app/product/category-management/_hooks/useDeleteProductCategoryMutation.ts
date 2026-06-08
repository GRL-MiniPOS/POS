'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProductCategory } from '@/app/lib/api/product-categories/productCategories.api'
import { productCategoryQueries } from '@/app/lib/api/product-categories/productCategories.queries'

export function useDeleteProductCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productCategoryQueries.lists(),
      })
    },
  })
}
