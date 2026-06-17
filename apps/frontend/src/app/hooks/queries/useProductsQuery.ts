'use client'

import { useQuery } from '@tanstack/react-query'
import { productQueries } from '@/app/lib/api/products/products.queries'
import type { Filters } from '@/app/lib/schemas/products.schema'

export function useProductsQuery(
  filters: Filters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    ...productQueries.list(filters),
    enabled: options?.enabled,
  })
}
