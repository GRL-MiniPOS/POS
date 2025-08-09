// app/ui_demo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Delete, Edit, Upload } from '@/app/components/atoms'
import {
  OrderSummaryCard,
  PendingOrderCard,
  OrderListItem,
  StockManageListItem,
  OrderListManageItem,
} from '@/app/components/molecules'
import {
  StatisticalChart,
  DraggableCategoryManager, // 使用通用組件
} from '@/app/components/organisms'
import {
  MainCategoryStrategy,
  SubCategoryStrategy,
} from '@/app/lib/strategries'
import type { IDndItem } from '@/app/types/dragAndDrop'

export default function UiDemo() {
  const [checked, setChecked] = useState(false)
  const [checked2, setChecked2] = useState(false)

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

  // 創建主分類策略
  const mainStrategy = new MainCategoryStrategy(
    mainCategories,
    setMainCategories,
    {
      onClick: (id: string) => {
        if (selectedMainCategory === id) return
        setSelectedMainCategory(id)
      },
    }
  )

  // 創建子分類策略
  const subStrategy = selectedMainCategory
    ? new SubCategoryStrategy(
        selectedMainCategory,
        subCategories[selectedMainCategory] || [],
        setSubCategories,
        { onClick: (id) => console.log('點擊子分類:', id) }
      )
    : null

  return (
    <div className="flex flex-col gap-2 items-start p-4">
      <Upload />
      <Edit />
      <Delete />
      <OrderSummaryCard title="今日訂單" amount={1000} count={10} />
      <PendingOrderCard
        orderId={1}
        customer="John Doe"
        products={[
          { name: 'Product 1', price: 100, status: '無庫存' },
          { name: 'Product 2', price: 200 },
        ]}
        total={100}
      />
      <OrderListItem
        imageUrl="https://github.com/shadcn.png"
        name="Product 1"
        price={100}
      />
      <StockManageListItem
        checked={checked}
        imageUrl="https://github.com/shadcn.png"
        name="Product 1"
        category="Category 1"
        spec="Spec 1"
        price={100}
        stock={100}
        onCheck={setChecked}
        onEdit={() => {
          console.log('edit')
        }}
        onDelete={function (): void {
          console.log('delete')
        }}
      />
      <OrderListManageItem
        checked={checked2}
        imageUrl="https://github.com/shadcn.png"
        orderId={1222}
        date="2021-01-01"
        source="source"
        paymentStatus="paymentStatus"
        paymentMethod="paymentMethod"
        shippingStatus="shippingStatus"
        customerName="customerName"
        note="note"
        onCheck={setChecked2}
        onEdit={() => {
          console.log('edit')
        }}
      />
      <StatisticalChart />
      <div className="w-[960px] flex gap-4">
        {/* 主分類和子分類管理器 */}
        {/* 主分類管理器 */}
        <DraggableCategoryManager strategy={mainStrategy} />

        {/* 子分類管理器 */}
        {subStrategy && <DraggableCategoryManager strategy={subStrategy} />}
      </div>
      <br />
      <br />
    </div>
  )
}
