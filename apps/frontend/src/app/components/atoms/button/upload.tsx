import { CirclePlus } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface IUploadProps {
  className?: string
}

export function Upload({ className }: IUploadProps) {
  return (
    <div
      className={cn(
        'px-6 py-3 cursor-pointer border-2 rounded-sm border-solid border-[#505050]',
        className
      )}
    >
      <CirclePlus />
    </div>
  )
}
