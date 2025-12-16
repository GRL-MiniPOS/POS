import { useState } from 'react'
import { toast } from '@/app/components/atoms'
import { IProductSpec } from '@/app/types/addProduct'

// 內部使用的類型（quantity 為字串以便於輸入）
export interface ILocalProductSpec {
  id: string
  name: string
  quantity: string
}

interface UseProductSpecFormProps {
  productSpecs: IProductSpec[]
  setProductSpec: (specs: IProductSpec[]) => void
  onOpenChange: (open: boolean) => void
}

export function useProductSpecForm({
  productSpecs,
  setProductSpec,
  onOpenChange,
}: UseProductSpecFormProps) {
  const [localProductSpecs, setLocalProductSpecs] = useState<
    ILocalProductSpec[]
  >([{ id: Date.now().toString(), name: '', quantity: '' }])

  const addNewLocalProductSpec = () => {
    const newLocalProductSpec: ILocalProductSpec = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
    }
    setLocalProductSpecs((prev) => [...prev, newLocalProductSpec])
  }

  const removeLocalProductSpec = (id: string) => {
    if (localProductSpecs.length > 1) {
      setLocalProductSpecs((prev) =>
        prev.filter((localProductSpec) => localProductSpec.id !== id)
      )
    }
  }

  const updateLocalProductSpec = (
    id: string,
    field: keyof Omit<ILocalProductSpec, 'id'>,
    value: string
  ) => {
    setLocalProductSpecs((prev) =>
      prev.map((localProductSpec) =>
        localProductSpec.id === id
          ? { ...localProductSpec, [field]: value }
          : localProductSpec
      )
    )
  }

  // 關閉 dialog (save、cancel、點擊 close 等關閉操作) 都會重置規格欄位
  const resetLocalProductSpecs = () => {
    setLocalProductSpecs([
      { id: Date.now().toString(), name: '', quantity: '' },
    ])
  }

  const handleSave = () => {
    const isFieldEmpty = localProductSpecs.some(
      (localProductSpec) =>
        localProductSpec.name.trim() === '' ||
        localProductSpec.quantity.trim() === ''
    )
    if (isFieldEmpty) {
      toast('輸入欄位不得為空')
      return
    }

    // 檢查數量是否為有效數字
    const hasInvalidQuantity = localProductSpecs.some((localProductSpec) => {
      const qty = parseInt(localProductSpec.quantity, 10)
      return isNaN(qty) || qty < 0
    })
    if (hasInvalidQuantity) {
      toast('數量必須為有效的非負整數')
      return
    }

    const existingSpec = new Set(productSpecs.map((spec) => spec.name))
    const isDuplicate = localProductSpecs.some((localProductSpec) => {
      return existingSpec.has(localProductSpec.name)
    })
    if (isDuplicate) {
      toast('規格不得重複')
      return
    }

    // 轉換為正確的類型（quantity 從 string 轉為 number）
    const specsToAdd: IProductSpec[] = localProductSpecs.map(
      (localProductSpec) => ({
        id: localProductSpec.id,
        name: localProductSpec.name,
        quantity: parseInt(localProductSpec.quantity, 10),
      })
    )

    setProductSpec([...productSpecs, ...specsToAdd])
    resetLocalProductSpecs()
    onOpenChange(false)
  }

  const handleCancel = () => {
    resetLocalProductSpecs()
    onOpenChange(false)
  }

  return {
    localProductSpecs,
    addNewLocalProductSpec,
    removeLocalProductSpec,
    updateLocalProductSpec,
    resetLocalProductSpecs,
    handleSave,
    handleCancel,
  }
}
