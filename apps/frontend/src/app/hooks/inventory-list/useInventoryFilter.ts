import type { IInventoryItem, IFilterState } from '@/app/types/inventoryList'

export function useInventoryFilter(
  items: IInventoryItem[],
  filters: IFilterState
): IInventoryItem[] {
  return items.filter((item) => {
    // 1. 分類篩選（OR 邏輯）
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(item.category)) {
        return false
      }
    }

    // 2. 規格篩選（OR 邏輯：商品規格包含任一選中規格即可）
    if (filters.specifications.length > 0) {
      const hasMatchingSpec = filters.specifications.some((filterSpec) =>
        item.specifications.includes(filterSpec)
      )
      if (!hasMatchingSpec) {
        return false
      }
    }

    // 3. 價格範圍篩選（AND 邏輯）
    if (filters.priceMin !== null && item.price < filters.priceMin) {
      return false
    }
    if (filters.priceMax !== null && item.price > filters.priceMax) {
      return false
    }

    // 4. 庫存狀態篩選
    if (filters.stockStatus === 'in-stock' && item.stock === 0) {
      return false
    }
    if (filters.stockStatus === 'out-of-stock' && item.stock > 0) {
      return false
    }

    // 5. 日期範圍篩選（未來功能）
    // if (filters.dateFrom && item.createdAt < filters.dateFrom) {
    //   return false
    // }
    // if (filters.dateTo && item.createdAt > filters.dateTo) {
    //   return false
    // }

    return true
  })
}
