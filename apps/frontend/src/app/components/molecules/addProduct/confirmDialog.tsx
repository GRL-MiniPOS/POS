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
export function ConfirmDialog({
  open,
  onOpenChange,
  handleAddProduct,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  handleAddProduct: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確定要新增商品嗎？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作將創建新的商品資料，請確認所有資訊正確。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleAddProduct()
              onOpenChange(false)
            }}
          >
            確定
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
