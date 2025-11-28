import { useState, useEffect } from 'react'
import type { IInventoryItem } from '@/app/types/inventoryList'

interface FormErrors {
  name?: string
  category?: string
  specifications?: string
  price?: string
  stock?: string
}

export function useEditProductForm(product: IInventoryItem) {
  const [formData, setFormData] = useState<Partial<IInventoryItem>>({
    name: '',
    category: '',
    specifications: [],
    price: 0,
    stock: 0,
    image: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // 當 product 改變時同步到 formData
  useEffect(() => {
    setFormData(product)
    setErrors({})
  }, [product])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name?.trim()) {
      newErrors.name = '商品名稱不可為空'
    }

    if (!formData.category?.trim()) {
      newErrors.category = '請選擇商品分類'
    }

    if (!formData.specifications || formData.specifications.length === 0) {
      newErrors.specifications = '至少需要 1 個規格'
    }

    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = '價格必須大於或等於 0'
    }

    if (formData.stock === undefined || formData.stock < 0) {
      newErrors.stock = '庫存數量必須大於或等於 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateField = (field: keyof IInventoryItem, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // 清除此欄位的錯誤
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const resetForm = () => {
    setFormData(product)
    setErrors({})
  }

  return {
    formData,
    errors,
    validateForm,
    updateField,
    resetForm,
  }
}
