import { Upload } from '@/app/components/atoms'
import { ProductSpecModal } from '@/app/components/molecules'
import { useState } from 'react'
import { IProductSpec } from '@/app/types/addProduct'
import { SpecPreview } from './specPreview'

export function AddProductSpec({ className }: { className?: string }) {
  const [isProductSpecModalOpen, setIsProductSpecModalOpen] = useState(false)
  const [productSpecs, setProductSpec] = useState<IProductSpec[]>([])
  const handleAddSpec = () => {
    setIsProductSpecModalOpen(true)
  }

  const handleRemoveSpec = (id: string) => {
    setProductSpec((prev) => prev.filter((spec) => spec.id !== id))
  }

  return (
    <div className={className}>
      <SpecPreview specs={productSpecs} onClose={handleRemoveSpec} />
      <Upload
        className="w-32 min-h-16 h-full"
        onClick={handleAddSpec}
        text="新增規格"
      />
      <ProductSpecModal
        open={isProductSpecModalOpen}
        onOpenChange={setIsProductSpecModalOpen}
        productSpecs={productSpecs}
        setProductSpec={setProductSpec}
      />
    </div>
  )
}
