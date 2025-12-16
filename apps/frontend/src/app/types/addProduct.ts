/**
 * 統一的規格類型定義
 * 用於新增商品和庫存管理
 */
export interface IProductSpec {
  id: string
  name: string
  quantity: number
}

export interface IProductFormData {
  productName: string
  selectedCategory: string
  price: number
  productSpecs: IProductSpec[]
  uploadFiles: File[]
}
