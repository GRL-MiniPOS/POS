'use client'

import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/app/lib/api/getApiErrorMessage'
import { useReorderProductCategoriesMutation } from './useReorderProductCategoriesMutation'

// 停手後才送出排序，合併短時間內同一層的連續拖曳成單一 PATCH。
const REORDER_DEBOUNCE_MS = 500
const ROOT_KEY = '__root__'

type PendingReorder = { parentId: string | null; orderedIds: string[] }

function levelKey(parentId: string | null) {
  return parentId ?? ROOT_KEY
}

// 對外提供 scheduleReorder（延遲合併送出）與 isReordering（該層是否尚有排序未落地）。
// 呼叫端負責樂觀更新本地順序；isReordering 為 true 期間，元件應避免用 refetch 覆蓋本地順序。
export function useDebouncedCategoryReorder() {
  const reorderCategories = useReorderProductCategoriesMutation()
  // per-level pending：key = parentId ?? ROOT_KEY，同層只保留最後一次順序，主/子分類互不覆蓋。
  const pendingRef = useRef<Map<string, PendingReorder>>(new Map())
  // per-level 進行中的請求數，用來判斷該層排序是否仍未落地。
  const inFlightRef = useRef<Map<string, number>>(new Map())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const pending = pendingRef.current
    pendingRef.current = new Map()

    pending.forEach(({ parentId, orderedIds }) => {
      const key = levelKey(parentId)
      inFlightRef.current.set(key, (inFlightRef.current.get(key) ?? 0) + 1)

      reorderCategories.mutate(
        { ordered_ids: orderedIds, parent_id: parentId },
        {
          onError: (error) => toast.error(getApiErrorMessage(error)),
          onSettled: () => {
            const next = (inFlightRef.current.get(key) ?? 1) - 1
            if (next <= 0) {
              inFlightRef.current.delete(key)
            } else {
              inFlightRef.current.set(key, next)
            }
          },
        }
      )
    })
  }, [reorderCategories])

  const scheduleReorder = useCallback(
    (parentId: string | null, orderedIds: string[]) => {
      pendingRef.current.set(levelKey(parentId), { parentId, orderedIds })

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(flush, REORDER_DEBOUNCE_MS)
    },
    [flush]
  )

  // 該層是否有排序尚未落地（debounce 等待中或請求進行中）。讀 ref 保持即時、引用穩定。
  const isReordering = useCallback((parentId: string | null) => {
    const key = levelKey(parentId)
    return (
      pendingRef.current.has(key) || (inFlightRef.current.get(key) ?? 0) > 0
    )
  }, [])

  // 卸載時 flush 尚未送出的最後一次拖曳並清除 timer，避免遺失。
  useEffect(() => () => flush(), [flush])

  return { scheduleReorder, isReordering }
}
