'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/atoms'
import { ChevronsRight } from 'lucide-react'
import { toast } from 'sonner'
import { GenericConfirmDialog } from '@/app/components/molecules'
import {
  DraggableCategoryManager, // 使用通用組件
} from '@/app/components/organisms'
import { MainCategoryStrategy, SubCategoryStrategy } from '@/app/lib/strategies'
import type { IDndItem } from '@/app/types/dragAndDrop'

export default function CategoryManagement() {
  useEffect(() => {
    setSelectedMainCategory('1')
  }, [])

  // 主分類數據
  const [mainCategories, setMainCategories] = useState<IDndItem[]>([
    { id: '1', name: '電子產品' },
    { id: '2', name: '服裝' },
    { id: '3', name: '食品' },
  ])

  // 當前選中的主分類
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    string | null
  >(null)

  // 子分類數據
  const [subCategories, setSubCategories] = useState<
    Record<string, IDndItem[]>
  >({
    '1': [
      { id: '1-1', name: '手機' },
      { id: '1-2', name: '電腦' },
    ],
    '2': [{ id: '2-1', name: '上衣' }],
    '3': [{ id: '3-1', name: '零食' }],
  })

  // 刪除確認對話框狀態
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    categoryId: string | null
    categoryName: string | null
    type: 'main' | 'sub' | null
    resolve?: (value: boolean) => void // 用於保存 Promise 的 resolver 函數
  }>({
    open: false,
    categoryId: null,
    categoryName: null,
    type: null,
    resolve: undefined,
  })

  const handleDeleteErrorMessage = (message: string) => {
    toast.error(message)
  }

  const handleBeforeDelete = (
    type: 'main' | 'sub',
    id: string,
    name: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setDeleteDialog({
        open: true,
        categoryId: id,
        categoryName: name,
        type,
        resolve,
      })
    })
  }

  const handleConfirmDelete = (confirmed: boolean) => {
    if (deleteDialog.resolve) {
      deleteDialog.resolve(confirmed)
    }
    setDeleteDialog({
      open: false,
      categoryId: null,
      categoryName: null,
      type: null,
      resolve: undefined,
    })
  }

  // 創建主分類策略
  const mainStrategy = new MainCategoryStrategy(
    mainCategories,
    setMainCategories,
    {
      onClick: (id: string) => {
        if (selectedMainCategory === id) return
        setSelectedMainCategory(id)
      },
      onBeforeDelete: (id, name) => handleBeforeDelete('main', id, name),
      onError: handleDeleteErrorMessage,
    }
  )

  // 創建子分類策略
  const subStrategy = selectedMainCategory
    ? new SubCategoryStrategy(
        selectedMainCategory,
        subCategories[selectedMainCategory] || [],
        setSubCategories,
        {
          onClick: (id) => console.log('點擊子分類:', id),
          onBeforeDelete: (id, name) => handleBeforeDelete('sub', id, name),
          onError: handleDeleteErrorMessage,
        }
      )
    : null

  return (
    <div className="flex flex-col gap-2 items-start p-4">
      <h1 className="mb-4 text-2xl font-bold">分類管理</h1>
      <div className="w-[960px] flex items-center gap-6 mb-6">
        {/* 主分類管理器 */}
        <DraggableCategoryManager strategy={mainStrategy} />
        <ChevronsRight className="w-20 h-20 text-brand" />
        {/* 子分類管理器 */}
        {subStrategy && <DraggableCategoryManager strategy={subStrategy} />}
      </div>
      <Button className="w-40 py-5 rounded-none bg-brand text-white hover:bg-brand-600">
        儲存
      </Button>
      {/* 刪除確認對話框 */}
      <GenericConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) handleConfirmDelete(false)
        }}
        onConfirm={() => handleConfirmDelete(true)}
        title="刪除分類"
        description={
          deleteDialog.type === 'main'
            ? `確定要刪除「${deleteDialog.categoryName}」主分類嗎？該分類下的所有子分類也會一併刪除。此操作無法復原。`
            : `確定要刪除「${deleteDialog.categoryName}」子分類嗎？此操作無法復原。`
        }
        variant="destructive"
        buttonText={{ confirm: '刪除', cancel: '取消' }}
      />
    </div>
  )
}
