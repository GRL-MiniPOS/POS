import { queryOptions } from '@tanstack/react-query'
import { getProduct, getProducts } from './products.api'
import { normalizeFilters } from './products.filters'
import type { Filters } from '@/app/lib/schemas/products.schema'

export const productQueries = {
  all: ['products'] as const,
  lists: () => [...productQueries.all, 'list'] as const,
  list: (filters: Filters = {}) => {
    const normalizedFilters = normalizeFilters(filters)

    return queryOptions({
      queryKey: [...productQueries.lists(), normalizedFilters] as const,
      queryFn: ({ signal }) => getProducts(normalizedFilters, signal),
    })
  },
  details: () => [...productQueries.all, 'detail'] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...productQueries.details(), id] as const,
      queryFn: ({ signal }) => getProduct(id, signal),
    }),
}
