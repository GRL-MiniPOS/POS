import { queryOptions } from '@tanstack/react-query'
import { getProductOptions } from './productOptions.api'

export const productOptionQueries = {
  all: ['product-options'] as const,
  list: () =>
    queryOptions({
      queryKey: [...productOptionQueries.all, 'list'] as const,
      queryFn: ({ signal }) => getProductOptions(signal),
    }),
}
