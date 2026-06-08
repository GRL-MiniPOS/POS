'use client'

import { useEffect, useState } from 'react'
import { ChevronsRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/atoms'
import { GenericConfirmDialog } from '@/app/components/molecules'
import { DraggableCategoryManager } from '@/app/components/organisms'
import { MainCategoryStrategy, SubCategoryStrategy } from '@/app/lib/strategies'
import { getApiErrorMessage } from '@/app/lib/api/getApiErrorMessage'
import type { Category } from '@/app/lib/schemas/productCategories.schema'
import type { IDndItem } from '@/app/types/dragAndDrop'
import { useProductCategoriesQuery } from '../_hooks/useProductCategoriesQuery'
import { useCreateProductCategoryMutation } from '../_hooks/useCreateProductCategoryMutation'
import { useDeleteProductCategoryMutation } from '../_hooks/useDeleteProductCategoryMutation'

// 資料邊界轉換：API Category → 拖曳 UI 需要的 IDndItem，依後端 order 排序。
function toDndItems(categories: Category[] | undefined): IDndItem[] {
  if (!categories) return []

  return [...categories]
    .sort((a, b) => a.order - b.order)
    .map((category) => ({ id: category.id, name: category.name }))
}

interface DeleteDialogState {
  open: boolean
  categoryName: string | null
  resolve?: (confirmed: boolean) => void
}

export function ProductCategoryManagementClient() {
  const mainQuery = useProductCategoriesQuery({ parentId: null })
  const createCategory = useCreateProductCategoryMutation()
  const deleteCategory = useDeleteProductCategoryMutation()

  const [selectedMainCategory, setSelectedMainCategory] = useState<
    string | null
  >(null)

  // 本地拖曳工作副本：以 query 結果為唯一來源，資料變動時重置。
  // 後端目前沒有排序 endpoint，拖曳排序僅為本地視覺、不持久化（取捨見準則 16/26）。
  const [mainItems, setMainItems] = useState<IDndItem[]>([])
  const [subItems, setSubItems] = useState<IDndItem[]>([])

  useEffect(() => {
    setMainItems(toDndItems(mainQuery.data))
  }, [mainQuery.data])

  // 未手動選取時，預設選第一個主分類（用推導，不另存 state）。
  const activeMainId = selectedMainCategory ?? mainItems[0]?.id ?? null

  const subQuery = useProductCategoriesQuery(
    { parentId: activeMainId ?? undefined },
    { enabled: Boolean(activeMainId) }
  )

  useEffect(() => {
    setSubItems(toDndItems(subQuery.data))
  }, [subQuery.data])

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    categoryName: null,
    resolve: undefined,
  })

  // 沿用既有確認對話框流程：回傳 Promise，待使用者確認/取消後 resolve。
  const confirmDelete = (name: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setDeleteDialog({ open: true, categoryName: name, resolve })
    })
  }

  const handleConfirmDelete = (confirmed: boolean) => {
    deleteDialog.resolve?.(confirmed)
    setDeleteDialog({ open: false, categoryName: null, resolve: undefined })
  }

  // onAdd / onDelete 自行處理錯誤並 toast，永遠 resolve，避免 strategy 端未捕捉的 rejection。
  const createCategoryHandler =
    (parentId: string | null, label: string) => async (name: string) => {
      try {
        await createCategory.mutateAsync({ name, parent_id: parentId })
        toast.success(`${label}新增成功`)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      }
    }

  const deleteCategoryHandler = (label: string) => async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id)
      toast.success(`${label}刪除成功`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const mainStrategy = new MainCategoryStrategy(mainItems, {
    onClick: (id) => setSelectedMainCategory(id),
    onAdd: createCategoryHandler(null, '主分類'),
    onDelete: deleteCategoryHandler('主分類'),
    onReorder: setMainItems,
    onBeforeDelete: (_id, name) => confirmDelete(name),
    onError: (message) => toast.error(message),
  })

  const subStrategy = activeMainId
    ? new SubCategoryStrategy(subItems, {
        onClick: () => {},
        onAdd: createCategoryHandler(activeMainId, '子分類'),
        onDelete: deleteCategoryHandler('子分類'),
        onReorder: setSubItems,
        onBeforeDelete: (_id, name) => confirmDelete(name),
        onError: (message) => toast.error(message),
      })
    : null

  return (
    <div className="flex flex-col gap-2 items-start p-4">
      <h1 className="mb-4 text-2xl font-bold">分類管理</h1>

      {mainQuery.isPending ? (
        <p className="text-sm text-muted-foreground">載入分類中...</p>
      ) : mainQuery.isError ? (
        <p className="text-sm text-destructive">分類載入失敗，請稍後再試</p>
      ) : (
        <>
          <div className="w-[960px] flex items-center gap-6 mb-6">
            <DraggableCategoryManager strategy={mainStrategy} />
            <ChevronsRight className="w-20 h-20 text-brand" />
            {subStrategy && <DraggableCategoryManager strategy={subStrategy} />}
          </div>
          <Button className="w-40 py-5 rounded-none bg-brand text-white hover:bg-brand-600">
            儲存
          </Button>
        </>
      )}

      <GenericConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) handleConfirmDelete(false)
        }}
        onConfirm={() => handleConfirmDelete(true)}
        title="刪除分類"
        description={`確定要刪除「${deleteDialog.categoryName}」嗎？此操作無法復原。`}
        variant="destructive"
        buttonText={{ confirm: '刪除', cancel: '取消' }}
      />
    </div>
  )
}
