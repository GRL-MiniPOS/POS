'use client'

import { useParams } from 'next/navigation'
import { ProductForm } from '@/app/components/organisms'
import { useProductQuery } from '@/app/hooks/queries/useProductQuery'

export default function EditProduct() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const { data: product, isPending, isError } = useProductQuery(id)

  if (isPending) {
    return (
      <div className="container max-w-4xl p-6">
        <p className="text-sm text-muted-foreground">載入商品中...</p>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container max-w-4xl p-6">
        <p className="text-sm text-destructive">商品載入失敗，請稍後再試</p>
      </div>
    )
  }

  return <ProductForm mode="edit" productId={id} initialProduct={product} />
}
