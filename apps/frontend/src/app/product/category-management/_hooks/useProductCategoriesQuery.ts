'use client'

import { useQuery } from '@tanstack/react-query'
import { productCategoryQueries } from '@/app/lib/api/product-categories/productCategories.queries'
import type { Filters } from '@/app/lib/schemas/productCategories.schema'

export function useProductCategoriesQuery(
  filters: Filters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    ...productCategoryQueries.list(filters),
    select: (response) => response.data,
    enabled: options?.enabled,
  })
}
