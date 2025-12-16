import { useState, useMemo, useEffect } from 'react'

export function useInventoryPagination<T>(
  items: T[],
  initialRowsPerPage: number = 5
) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)

  const { totalPages, startIndex, endIndex, currentItems } = useMemo(() => {
    const total = Math.ceil(items.length / rowsPerPage)
    const start = (currentPage - 1) * rowsPerPage
    const end = start + rowsPerPage
    const current = items.slice(start, end)

    return {
      totalPages: total,
      startIndex: start,
      endIndex: end,
      currentItems: current,
    }
  }, [items, currentPage, rowsPerPage])

  // Gmail 風格自動頁碼調整
  useEffect(() => {
    if (totalPages === 0) {
      // 沒有項目時，重置到第 1 頁
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
    } else if (currentPage > totalPages) {
      // 當前頁超出範圍，跳到最後一頁
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  return {
    currentPage,
    rowsPerPage,
    totalPages,
    startIndex,
    endIndex,
    currentItems,
    setCurrentPage,
    setRowsPerPage,
  }
}
