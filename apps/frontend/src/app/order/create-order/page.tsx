'use client'

import { useCreateOrderForm } from './_hooks/useCreateOrderForm'
import { ProductPicker } from './_components/productPicker'
import { OrderCart } from './_components/orderCart'

export default function CreateOrder() {
  const { picker, cart } = useCreateOrderForm()

  return (
    <div className="container max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">建立訂單</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
        <ProductPicker
          products={picker.products}
          isLoading={picker.isLoading}
          isError={picker.isError}
          search={picker.search}
          onSearch={picker.onSearch}
          currentPage={picker.currentPage}
          totalPages={picker.totalPages}
          onPageChange={picker.onPageChange}
          onAdd={picker.onAdd}
        />
        <OrderCart
          lines={cart.lines}
          total={cart.total}
          onQuantityChange={cart.onQuantityChange}
          onRemove={cart.onRemove}
          payment={cart.payment}
          source={cart.source}
          onPaymentChange={cart.onPaymentChange}
          onSourceChange={cart.onSourceChange}
          paymentOptions={cart.paymentOptions}
          sourceOptions={cart.sourceOptions}
          isSubmitting={cart.isSubmitting}
          onSubmit={cart.onSubmit}
        />
      </div>
    </div>
  )
}
