import { Upload, Badge } from '@/app/components/atoms'
import { ProductSpecModal } from '@/app/components/molecules'
import { useState } from 'react'
import { IProductSpec } from '@/app/types/addProduct'

export function AddProductSpec({ className }: { className?: string }) {
  const [isProductSpecModalOpen, setIsProductSpecModalOpen] = useState(false)
  const [productSpecs, setProductSpec] = useState<IProductSpec[]>([
    {
      id: '1',
      name: 'T-Shirt',
      quantity: '5',
    },
    {
      id: '2',
      name: '牛仔褲',
      quantity: '10',
    },
    {
      id: '3',
      name: '襯衫',
      quantity: '6',
    },
    {
      id: '4',
      name: 'T-Shirt',
      quantity: '5',
    },
    {
      id: '5',
      name: '牛仔褲',
      quantity: '10',
    },
    {
      id: '6',
      name: '襯衫',
      quantity: '6',
    },
    {
      id: '7',
      name: 'T-Shirt',
      quantity: '5',
    },
  ])
  const handleAddSpec = () => {
    setIsProductSpecModalOpen(true)
  }

  return (
    <div className={className}>
      {productSpecs.map((spec, index) => (
        <Badge
          key={`${spec.name}-${index}`}
          variant="outline"
          className="w-28 h-16 p-3 flex-col items-start gap-1"
        >
          <div className="font-medium text-sm">名稱：{spec.name}</div>
          <div className="text-xs text-muted-foreground">
            數量：{spec.quantity}
          </div>
        </Badge>
      ))}
      <Upload className="w-28 h-16" onClick={handleAddSpec} text="新增規格" />
      <ProductSpecModal
        open={isProductSpecModalOpen}
        onOpenChange={setIsProductSpecModalOpen}
        productSpecs={productSpecs}
        setProductSpec={setProductSpec}
      />
    </div>
  )
}
