import type { IInventoryItem, IFilterState } from '@/app/types/inventoryList'
import { calculateTotalStock } from '@/app/types/inventoryList'

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

    // 2. 規格篩選（OR 邏輯：商品規格名稱包含任一選中規格即可）
    if (filters.specifications.length > 0) {
      // 提取規格名稱，支援部分匹配（例如篩選 "黑色" 可匹配 "黑色 M"）
      const hasMatchingSpec = filters.specifications.some((filterSpec) =>
        item.specifications.some((itemSpec) =>
          itemSpec.name.includes(filterSpec)
        )
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

    // 4. 庫存狀態篩選（基於總庫存量）
    const totalStock = calculateTotalStock(item)
    if (filters.stockStatus === 'in-stock' && totalStock === 0) {
      return false
    }
    if (filters.stockStatus === 'out-of-stock' && totalStock > 0) {
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
