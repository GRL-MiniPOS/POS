'use client'

import { StatisticalChart } from '@/app/components/organisms'

export default function Report() {
  return (
    <div className="flex flex-col gap-2 items-start p-4">
      <h1 className="mb-4 text-2xl font-bold">營業報表</h1>
      <StatisticalChart />
    </div>
  )
}
