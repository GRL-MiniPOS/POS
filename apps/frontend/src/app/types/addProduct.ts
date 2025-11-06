export interface IProductSpec {
  id: string
  name: string
  quantity: string
}

export interface IProductFormData {
  productName: string
  selectedCategory: string
  price: string
  productSpecs: IProductSpec[]
  uploadFiles: File[]
}
