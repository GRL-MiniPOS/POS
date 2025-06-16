import { Pencil } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface IEditProps {
  className?: string
  onClick?: () => void
}

export function Edit({ className, onClick }: IEditProps) {
  return (
    <div
      className={cn(
        'w-8 h-8 flex items-center justify-center cursor-pointer rounded-full bg-[#505050] p-2',
        className
      )}
      onClick={onClick}
    >
      <Pencil className="w-4 h-4 text-white" />
    </div>
  )
}
