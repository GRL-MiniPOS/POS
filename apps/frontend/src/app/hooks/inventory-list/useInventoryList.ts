import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useInventorySelection } from './useInventorySelection'
import { useProductsQuery } from '@/app/hooks/queries/useProductsQuery'
import { useDeleteProductMutation } from '@/app/hooks/queries/useDeleteProductMutation'
import { useBatchDeleteProductsMutation } from '@/app/hooks/queries/useBatchDeleteProductsMutation'
import { productToInventoryRow } from '@/app/lib/inventoryUtils'
import { getApiErrorMessage } from '@/app/lib/api/getApiErrorMessage'
import type {
  IDeleteDialogState,
  IFilterState,
} from '@/app/types/inventoryList'
import type { Filters } from '@/app/lib/schemas/products.schema'

const initialFilterState: IFilterState = {
  categories: [],
  specifications: [],
  priceMin: null,
  priceMax: null,
  stockStatus: 'all',
  saleStatus: 'all',
}

export function useInventoryList() {
  const router = useRouter()

  // server-side 查詢條件（UI state）
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filterState, setFilterState] =
    useState<IFilterState>(initialFilterState)

  const productFilters: Filters = useMemo(
    () => ({
      page,
      limit,
      search: searchQuery.trim() || undefined,
      categories: filterState.categories.length
        ? filterState.categories
        : undefined,
      options: filterState.specifications.length
        ? filterState.specifications
        : undefined,
      priceMin: filterState.priceMin ?? undefined,
      priceMax: filterState.priceMax ?? undefined,
      stockStatus: filterState.stockStatus,
      saleStatus: filterState.saleStatus,
    }),
    [page, limit, searchQuery, filterState]
  )

  const query = useProductsQuery(productFilters)

  const rows = useMemo(
    () => (query.data?.data ?? []).map(productToInventoryRow),
    [query.data]
  )

  const apiPagination = query.data?.pagination
  const currentPage = apiPagination?.current_page ?? page
  const totalPages = apiPagination?.total_pages ?? 0
  const totalItems = apiPagination?.total_items ?? 0
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * limit
  const endIndex = startIndex + rows.length

  // current-page 選取（跨頁不保留）
  const selection = useInventorySelection(rows, rows, searchQuery)

  const deleteProduct = useDeleteProductMutation()
  const batchDeleteProducts = useBatchDeleteProductsMutation()
  const [deleteDialog, setDeleteDialog] = useState<IDeleteDialogState>({
    open: false,
    type: null,
  })

  const closeDeleteDialog = () => setDeleteDialog({ open: false, type: null })

  const handleDelete = (id: string) =>
    setDeleteDialog({ open: true, type: 'single', productId: id })

  const handleBulkDelete = () => {
    if (selection.selectedRows.size === 0) {
      toast.error('請先選擇要刪除的商品')
      return
    }
    setDeleteDialog({
      open: true,
      type: 'bulk',
      selectedCount: selection.selectedRows.size,
    })
  }

  const handleConfirmDelete = async () => {
    try {
      if (deleteDialog.type === 'single' && deleteDialog.productId) {
        await deleteProduct.mutateAsync(deleteDialog.productId)
        toast.success('已成功刪除商品')
      } else if (deleteDialog.type === 'bulk') {
        const ids = Array.from(selection.selectedRows)
        await batchDeleteProducts.mutateAsync(ids)
        selection.clearSelection()
        toast.success(`已成功刪除 ${ids.length} 個商品`)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      closeDeleteDialog()
    }
  }

  const handleSearch = (nextQuery: string) => {
    setSearchQuery(nextQuery)
    setPage(1)
  }

  const handleFiltersChange = (nextFilters: IFilterState) => {
    setFilterState(nextFilters)
    setPage(1)
  }

  const handleRowsPerPageChange = (nextLimit: number) => {
    setLimit(nextLimit)
    setPage(1)
  }

  return {
    tableData: {
      currentItems: rows,
      selectedRows: selection.selectedRows,
      selectAllState: selection.selectAllCheckboxState,
    },
    pagination: {
      currentPage,
      totalPages,
      rowsPerPage: limit,
      totalItems,
      startIndex,
      endIndex,
      onPageChange: setPage,
      onRowsPerPageChange: handleRowsPerPageChange,
    },
    filters: {
      state: filterState,
      onChange: handleFiltersChange,
    },
    dialogs: {
      delete: {
        state: deleteDialog,
        onOpenChange: (open: boolean) => !open && closeDeleteDialog(),
        onConfirm: handleConfirmDelete,
      },
    },
    actions: {
      onSearch: handleSearch,
      onAddProduct: () => router.push('/product/add-product'),
      onEdit: (id: string) => router.push(`/product/edit-product/${id}`),
      onDelete: handleDelete,
      onBulkDelete: handleBulkDelete,
      onSelectRow: selection.handleSelectRow,
      onSelectAll: selection.handlePageSelectAll,
    },
    status: {
      isLoading: query.isPending,
      isError: query.isError,
    },
  }
}
