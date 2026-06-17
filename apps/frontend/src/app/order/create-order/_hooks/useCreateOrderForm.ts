'use client'

import { useMemo, useState } from 'react'
import { toast } from '@/app/components/atoms'
import { useProductsQuery } from '@/app/hooks/queries/useProductsQuery'
import { useCreateOrderMutation } from '@/app/hooks/queries/useCreateOrderMutation'
import { getApiErrorMessage } from '@/app/lib/api/getApiErrorMessage'
import type { CreateBody } from '@/app/lib/schemas/orders.schema'
import type { Product } from '@/app/lib/schemas/products.schema'
import {
  PAYMENT_OPTIONS,
  SOURCE_OPTIONS,
  type IOrderCartLine,
  type ProductVariant,
} from '@/app/types/createOrder'

const PAGE_SIZE = 10

function makeLineKey(productId: string, variantId?: string): string {
  return `${productId}::${variantId ?? ''}`
}

export function useCreateOrderForm() {
  // 商品挑選（server-side 搜尋 + 分頁，只取上架商品）
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const productsQuery = useProductsQuery({
    search: search.trim() || undefined,
    page,
    limit: PAGE_SIZE,
    saleStatus: 'active',
  })

  const products = productsQuery.data?.data ?? []
  const pagination = productsQuery.data?.pagination

  // 購物車
  const [lines, setLines] = useState<IOrderCartLine[]>([])
  const [payment, setPayment] = useState('')
  const [source, setSource] = useState('')

  const createOrderMutation = useCreateOrderMutation()

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const addLine = (product: Product, variant?: ProductVariant) => {
    const key = makeLineKey(product.id, variant?.id)
    setLines((previous) => {
      const existing = previous.find((line) => line.key === key)
      if (existing) {
        return previous.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + 1 } : line
        )
      }
      return [
        ...previous,
        {
          key,
          productId: product.id,
          productVariantId: variant?.id,
          name: product.name,
          variantLabel: variant
            ? Object.values(variant.option_values).join(' / ')
            : undefined,
          unitPrice: product.price,
          quantity: 1,
        },
      ]
    })
  }

  const setQuantity = (key: string, quantity: number) => {
    const safeQuantity = Number.isFinite(quantity)
      ? Math.max(1, Math.floor(quantity))
      : 1
    setLines((previous) =>
      previous.map((line) =>
        line.key === key ? { ...line, quantity: safeQuantity } : line
      )
    )
  }

  const removeLine = (key: string) => {
    setLines((previous) => previous.filter((line) => line.key !== key))
  }

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines]
  )

  const submit = async () => {
    if (lines.length === 0) {
      toast.error('請先加入商品')
      return
    }

    const body: CreateBody = {
      items: lines.map((line) => ({
        product_id: line.productId,
        ...(line.productVariantId
          ? { product_variant_id: line.productVariantId }
          : {}),
        quantity: line.quantity,
      })),
      ...(payment ? { payment } : {}),
      ...(source ? { source } : {}),
    }

    try {
      const response = await createOrderMutation.mutateAsync(body)
      toast.success(
        `訂單建立成功，總金額 NT$ ${response.data.total_price.toLocaleString()}`
      )
      setLines([])
      setPayment('')
      setSource('')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return {
    picker: {
      products,
      isLoading: productsQuery.isPending,
      isError: productsQuery.isError,
      search,
      onSearch: handleSearch,
      currentPage: pagination?.current_page ?? page,
      totalPages: pagination?.total_pages ?? 0,
      onPageChange: setPage,
      onAdd: addLine,
    },
    cart: {
      lines,
      total,
      onQuantityChange: setQuantity,
      onRemove: removeLine,
      payment,
      source,
      onPaymentChange: setPayment,
      onSourceChange: setSource,
      paymentOptions: PAYMENT_OPTIONS,
      sourceOptions: SOURCE_OPTIONS,
      isSubmitting: createOrderMutation.isPending,
      onSubmit: submit,
    },
  }
}
