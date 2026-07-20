'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reorderProductCategories } from '@/app/lib/api/product-categories/productCategories.api'
import { productCategoryQueries } from '@/app/lib/api/product-categories/productCategories.queries'

export function useReorderProductCategoriesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reorderProductCategories,
    // 成功：cache 更新為新順序；失敗：重抓後端舊順序，配合元件 useEffect 回滾本地拖曳結果。
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: productCategoryQueries.lists(),
      })
    },
  })
}
