import {
  IProduct,
  IInventoryItem,
  calculateTotalStock,
} from '@/app/types/inventoryList'

/**
 * 將 IInventoryItem 轉換為 IProduct 格式
 * - 保留 specifications 結構化數據用於 Popover 顯示
 * - 保留 specification 字符串用於搜索和篩選
 * - 計算 totalStock 用於數量顯示和判斷
 */
export const convertToProduct = (item: IInventoryItem): IProduct => {
  // 計算總庫存（各規格數量加總）
  const totalStock = calculateTotalStock(item)
  // 提取規格名稱用於顯示和搜索
  const specNames = item.specifications.map((spec) => spec.name).join(', ')

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    specification: specNames,
    specifications: item.specifications, // 保留結構化數據用於 Popover
    price: `NT$ ${item.price.toLocaleString()}`,
    inventory: totalStock === 0 ? '缺貨' : `${totalStock} 件`,
    totalStock, // 總庫存數量
    image: item.image,
  }
}
