import type { IProduct } from '@/app/types/inventoryList'
import type { IProductSpec } from '@/app/types/addProduct'
import type { Product } from '@/app/lib/schemas/products.schema'

/**
 * 將 API 的 Product 轉換為列表顯示用的 IProduct
 * - 庫存直接用後端回的 stock（不再靠規格數量加總）
 * - 有變體商品把 variants 展開成規格列；無變體商品規格為空
 */
export const productToInventoryRow = (product: Product): IProduct => {
  const specifications: IProductSpec[] = product.has_variants
    ? product.variants.map((variant) => ({
        id: variant.id,
        name: Object.values(variant.option_values).join(' / '),
        quantity: variant.quantity,
      }))
    : []

  return {
    id: product.id,
    name: product.name,
    category: product.category?.name ?? '未分類',
    specification: specifications.map((spec) => spec.name).join(', '),
    specifications,
    price: `NT$ ${product.price.toLocaleString()}`,
    inventory: product.stock === 0 ? '缺貨' : `${product.stock} 件`,
    totalStock: product.stock,
    image: product.image,
  }
}
