'use client'

import { useQuery } from '@tanstack/react-query'
import { productCategoryQueries } from '@/app/lib/api/product-categories/productCategories.queries'

// 跨路由用：取全部 active 分類（不帶 parent_id → 後端回全部，含子層），供篩選等共用情境。
export function useProductCategoriesQuery() {
  return useQuery({
    ...productCategoryQueries.list({}),
    select: (response) => response.data,
  })
}
