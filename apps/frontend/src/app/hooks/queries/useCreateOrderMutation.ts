'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrder } from '@/app/lib/api/orders/orders.api'
import { productQueries } from '@/app/lib/api/products/products.queries'

export function useCreateOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      // 下單會扣庫存，商品列表需重抓。
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
    },
  })
}
