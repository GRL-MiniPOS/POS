import type { Product } from '@/app/lib/schemas/products.schema'

// 商品的單一變體（從 Product.variants 取元素型別，避免另外匯出 schema 型別）
export type ProductVariant = Product['variants'][number]

// 購物車單一品項（前端下單暫存用；送出時映射成 OrderItem）
export interface IOrderCartLine {
  key: string // `${productId}::${productVariantId ?? ''}`
  productId: string
  productVariantId?: string
  name: string
  variantLabel?: string
  unitPrice: number
  quantity: number
}

export interface IOptionPair {
  value: string // 送給後端的字串
  label: string // 顯示文字
}

// payment / source 後端為自由字串，前端提供一組常見預設選項。
export const PAYMENT_OPTIONS: IOptionPair[] = [
  { value: 'cash', label: '現金' },
  { value: 'bank_transfer', label: '銀行轉帳' },
  { value: 'credit_card', label: '信用卡' },
  { value: 'linepay', label: 'LINE Pay' },
]

export const SOURCE_OPTIONS: IOptionPair[] = [
  { value: 'physical_store', label: '實體店面' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'shopee', label: '蝦皮' },
]

export interface ProductPickerProps {
  products: Product[]
  isLoading: boolean
  isError: boolean
  search: string
  onSearch: (value: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onAdd: (product: Product, variant?: ProductVariant) => void
}

export interface VariantSelectDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (product: Product, variant: ProductVariant) => void
}

export interface OrderCartProps {
  lines: IOrderCartLine[]
  total: number
  onQuantityChange: (key: string, quantity: number) => void
  onRemove: (key: string) => void
  payment: string
  source: string
  onPaymentChange: (value: string) => void
  onSourceChange: (value: string) => void
  paymentOptions: IOptionPair[]
  sourceOptions: IOptionPair[]
  isSubmitting: boolean
  onSubmit: () => void
}
