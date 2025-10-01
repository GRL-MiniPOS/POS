'use client'

import { CirclePlus } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface IUploadProps {
  className?: string
  onClick?: () => void
  text?: string
}

export function Upload({ className, onClick, text }: IUploadProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center cursor-pointer border-2 border-dashed rounded-lg bg-muted/50 border-muted-foreground/25 hover:bg-muted/80 hover:border-muted-foreground/50 transition-colors duration-200',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-1">
        <CirclePlus className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-medium">
          {text}
        </span>
      </div>
    </div>
  )
}
