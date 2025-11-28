import { useState, useMemo, useCallback, useEffect } from 'react'

interface SelectableItem {
  id: string
}

export function useInventorySelection<T extends SelectableItem>(
  currentItems: T[],
  filteredItems: T[],
  searchQuery: string
) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Gmail 風格三態 checkbox
  const selectAllCheckboxState = useMemo<boolean | 'indeterminate'>(() => {
    if (currentItems.length === 0) return false

    const selectedInCurrentPage = currentItems.filter((item) =>
      selectedRows.has(item.id)
    ).length

    if (selectedInCurrentPage === 0) return false // 未選
    if (selectedInCurrentPage === currentItems.length) return true // 全選
    return 'indeterminate' // 部分選中
  }, [currentItems, selectedRows])

  // 選擇單個項目
  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  // 選取當前頁（Gmail 風格三態切換）
  const handlePageSelectAll = useCallback(
    (checked: boolean | 'indeterminate') => {
      const currentIds = currentItems.map((item) => item.id)

      if (checked === true) {
        // 累加當前頁項目
        setSelectedRows((prev) => {
          const next = new Set(prev)
          currentIds.forEach((id) => next.add(id))
          return next
        })
      } else {
        // 移除當前頁項目
        setSelectedRows((prev) => {
          const next = new Set(prev)
          currentIds.forEach((id) => next.delete(id))
          return next
        })
      }
    },
    [currentItems]
  )

  // 清除選擇
  const clearSelection = useCallback(() => {
    setSelectedRows(new Set())
  }, [])

  // 副作用：搜尋改變時清除選擇
  useEffect(() => {
    clearSelection()
  }, [searchQuery, clearSelection])

  // 副作用：移除無效的選擇
  useEffect(() => {
    const validIds = new Set(filteredItems.map((item) => item.id))
    setSelectedRows((prev) => {
      const next = new Set<string>()
      prev.forEach((id) => {
        if (validIds.has(id)) next.add(id)
      })
      return next.size === prev.size ? prev : next
    })
  }, [filteredItems])

  return {
    selectedRows,
    selectAllCheckboxState,
    handleSelectRow,
    handlePageSelectAll,
    clearSelection,
  }
}
