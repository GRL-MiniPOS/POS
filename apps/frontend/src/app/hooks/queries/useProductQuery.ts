'use client'

import { useQuery } from '@tanstack/react-query'
import { productQueries } from '@/app/lib/api/products/products.queries'

export function useProductQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...productQueries.detail(id),
    select: (response) => response.data,
    enabled: options?.enabled,
  })
}
