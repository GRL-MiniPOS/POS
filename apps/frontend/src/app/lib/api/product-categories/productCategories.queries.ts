import { queryOptions } from '@tanstack/react-query'
import { getProductCategories } from './productCategories.api'
import { normalizeFilters } from './productCategories.filters'
import type { Filters } from '@/app/lib/schemas/productCategories.schema'

export const productCategoryQueries = {
  all: ['product-categories'] as const,
  lists: () => [...productCategoryQueries.all, 'list'] as const,
  list: (filters: Filters = {}) => {
    const normalizedFilters = normalizeFilters(filters)

    return queryOptions({
      queryKey: [...productCategoryQueries.lists(), normalizedFilters] as const,
      queryFn: ({ signal }) => getProductCategories(normalizedFilters, signal),
    })
  },
}
