'use client'

import { Badge } from '@/app/components/atoms'
import { CircleX } from 'lucide-react'
import { IProductSpec } from '@/app/types/addProduct'

interface ISpecPreviewProps {
  specs: IProductSpec[]
  onClose: (id: string) => void
}

export function SpecPreview({ specs, onClose }: ISpecPreviewProps) {
  return (
    <>
      {specs.map((spec, index) => (
        <div key={`${spec.name}-${index}`} className="relative">
          <Badge
            variant="outline"
            className="w-32 min-h-16 h-full p-3 flex-col items-start gap-1"
          >
            <div className="font-medium text-sm">名稱：{spec.name}</div>
            <div className="text-xs text-muted-foreground">
              數量：{spec.quantity}
            </div>
          </Badge>
          <CircleX
            className="w-5 h-5 absolute top-1 right-1 rounded-full cursor-pointer bg-white"
            onClick={() => onClose(spec.id)}
          />
        </div>
      ))}
    </>
  )
}
