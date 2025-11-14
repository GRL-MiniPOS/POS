export interface IProductSpec {
  id: string
  name: string
  quantity: string
}

export interface IProductFormData {
  productName: string
  selectedCategory: string
  price: number
  productSpecs: IProductSpec[]
  uploadFiles: File[]
}
