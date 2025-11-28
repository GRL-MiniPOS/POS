'use client'

import {
  InventoryTableHeader,
  InventoryPagination,
  InventoryTableContent,
  GenericConfirmDialog,
  EditProductDialog,
} from '@/app/components/molecules'
import { useInventoryList } from '@/app/hooks'

export default function InventoryList() {
  const { tableData, pagination, filters, dialogs, actions } =
    useInventoryList()

  return (
    <div className="container max-w-7xl p-6">
      <InventoryTableHeader
        className="mb-6"
        onAddProduct={actions.onAddProduct}
        onSearch={actions.onSearch}
        filters={filters.state}
        onFiltersChange={filters.onChange}
      />
      <div className="overflow-x-auto pb-4 border border-border rounded-lg">
        <InventoryTableContent
          products={tableData.currentItems}
          selectedRows={tableData.selectedRows}
          selectAll={tableData.selectAllState}
          onSelectRow={actions.onSelectRow}
          onSelectAll={actions.onSelectAll}
          onBulkDelete={actions.onBulkDelete}
          onEdit={actions.onEdit}
          onDelete={actions.onDelete}
        />
        <InventoryPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          rowsPerPage={pagination.rowsPerPage}
          totalItems={tableData.products.length}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.onPageChange}
          onRowsPerPageChange={pagination.onRowsPerPageChange}
        />
      </div>
      <GenericConfirmDialog
        open={dialogs.delete.state.open}
        onOpenChange={dialogs.delete.onOpenChange}
        onConfirm={dialogs.delete.onConfirm}
        title={
          dialogs.delete.state.type === 'bulk' ? '批量刪除商品' : '刪除商品'
        }
        description={
          dialogs.delete.state.type === 'bulk'
            ? `確定要刪除所選的 ${dialogs.delete.state.selectedCount} 個商品嗎？此操作無法復原。`
            : '你確定要刪除該商品嗎？此操作無法復原。'
        }
        variant="destructive"
        buttonText={{ confirm: '刪除', cancel: '取消' }}
      />
      {dialogs.edit.state.product && (
        <EditProductDialog
          open={dialogs.edit.state.open}
          onOpenChange={dialogs.edit.onOpenChange}
          product={dialogs.edit.state.product}
          onSave={dialogs.edit.onSave}
        />
      )}
    </div>
  )
}
