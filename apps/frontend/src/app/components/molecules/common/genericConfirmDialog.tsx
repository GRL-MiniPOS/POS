import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/atoms'
import { cn } from '@/app/lib/utils'

interface GenericConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  buttonText?: {
    confirm?: string
    cancel?: string
  }
}

export function GenericConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  variant = 'default',
  buttonText,
}: GenericConfirmDialogProps) {
  const confirmText = buttonText?.confirm || '確定'
  const cancelText = buttonText?.cancel || '取消'

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn(
              variant === 'destructive' &&
                'bg-red-600 hover:bg-red-700 focus:ring-red-600'
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
