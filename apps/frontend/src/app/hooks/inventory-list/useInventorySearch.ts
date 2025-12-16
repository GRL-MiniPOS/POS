import { useMemo } from 'react'
import type { IProduct } from '@/app/types/inventoryList'

export function useInventorySearch(products: IProduct[], query: string) {
  const filteredProducts = useMemo(() => {
    if (!query.trim()) {
      return products
    }

    const searchQuery = query.toLowerCase().trim()

    return products.filter((product) => {
      // 搜尋商品名稱
      const matchName = product.name.toLowerCase().includes(searchQuery)

      // 搜尋分類
      const matchCategory = product.category.toLowerCase().includes(searchQuery)

      // 搜尋規格
      const matchSpecification = product.specification
        .toLowerCase()
        .includes(searchQuery)

      // 搜尋價格（移除 "NT$ " 和逗號後比對）
      const priceNumber = product.price.replace(/NT\$\s|,/g, '')
      const matchPrice = priceNumber.includes(searchQuery)

      // 搜尋庫存狀態
      const matchInventory = product.inventory
        .toLowerCase()
        .includes(searchQuery)

      return (
        matchName ||
        matchCategory ||
        matchSpecification ||
        matchPrice ||
        matchInventory
      )
    })
  }, [products, query])

  return filteredProducts
}
