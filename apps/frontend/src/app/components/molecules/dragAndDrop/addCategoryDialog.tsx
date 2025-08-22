import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  Label,
  Input,
  Button,
} from '@/app/components/atoms'

export function AddCategoryDialog({
  onAdd,
}: {
  onAdd: (name: string) => void
}) {
  const [categoryName, setCategoryName] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    if (categoryName.trim() === '') return

    onAdd(categoryName.trim())
    setCategoryName('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full rounded-none bg-brand hover:bg-brand/80 text-white font-medium py-4">
        新增分類
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">建立分類</DialogTitle>
          <DialogDescription className="sr-only">
            請輸入新的分類名稱，建立後可以拖曳調整順序。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Label htmlFor="category-name">分類名稱</Label>
          <Input
            id="category-name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="請輸入分類名稱"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSubmit()
              }
            }}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setCategoryName('')}>
              取消
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-brand"
            disabled={!categoryName.trim()}
          >
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
