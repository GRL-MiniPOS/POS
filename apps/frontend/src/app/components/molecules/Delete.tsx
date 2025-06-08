import { Trash2 } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface IDeleteProps {
  className?: string
}

export function Delete({ className }: IDeleteProps) {
  return (
    <div
      className={cn(
        'w-8 h-8 flex items-center justify-center cursor-pointer rounded-full bg-[#505050] p-2',
        className
      )}
    >
      <Trash2 className="w-4 h-4 text-white" />
    </div>
  )
}
