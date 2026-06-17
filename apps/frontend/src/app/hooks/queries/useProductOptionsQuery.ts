'use client'

import { useQuery } from '@tanstack/react-query'
import { productOptionQueries } from '@/app/lib/api/product-options/productOptions.queries'

export function useProductOptionsQuery() {
  return useQuery({
    ...productOptionQueries.list(),
    select: (response) => response.data,
  })
}
