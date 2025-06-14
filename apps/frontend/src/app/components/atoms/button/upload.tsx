import { CirclePlus } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface IUploadProps {
  className?: string
  onClick?: () => void
}

export function Upload({ className, onClick }: IUploadProps) {
  return (
    <div
      className={cn(
        'px-6 py-3 cursor-pointer border-2 rounded-sm border-solid border-[#505050]',
        className
      )}
      onClick={onClick}
    >
      <CirclePlus />
    </div>
  )
}
