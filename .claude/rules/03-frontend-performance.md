---
paths: ['**/*.tsx', '**/*.ts', '**/next.config.ts', '**/package.json']
---

# 前端效能 / Frontend Performance (準則 14-20)

本文檔涵蓋 Next.js / React 前端的效能準則。內容聚焦可長期維護的通用做法，不以特定頁面或尚未定案的資料流程作為規則來源。

This document covers frontend performance guidelines for Next.js / React applications. It focuses on maintainable general practices, not page-specific or still-unsettled data flows.

---

## 準則 14: 控制 Client Boundary 與 Lazy Loading / Guideline 14: Control Client Boundaries and Lazy Loading

### 說明 / Description

Next.js App Router 已自動按 route segment 拆分程式碼。此專案不以 SSR 作為主要效能策略；效能重點是控制 client runtime 邊界，並把瀏覽器專用或大型互動模組用 `next/dynamic` 做 lazy loading。

Next.js App Router already code-splits by route segment. This project is not SSR-first; the key is to keep client runtime boundaries clear and load browser-only or heavy interactive modules with `next/dynamic` only when needed.

### 為什麼重要 / Why This Matters

- **初始載入更小**：瀏覽器只載入目前流程真正需要的互動程式碼。
- **Hydration 成本更低**：只有真正需要互動的元件才進入 client bundle。
- **錯誤邊界更清楚**：瀏覽器 API、拖曳、圖表、圖片預覽等行為集中在小元件中。
- **審查更容易**：看到 `'use client'` 就能追問是否真的需要。

### Linus 哲學 / Linus Philosophy

> Solve a real problem. Keep the core simple.

Do not use SSR, dynamic import, or page-wide client boundaries to hide a design problem. Keep interaction boundaries explicit; that is smaller, more direct, and easier to review.

### 檢查清單 / Checklist

- [ ] `page.tsx`、`layout.tsx` 是否避免把 SSR/RSC 當成預設資料策略？
- [ ] `'use client'` 是否用在需要 hooks、事件或瀏覽器 API 的明確邊界？
- [ ] 大型圖表、拖曳、檔案預覽、瀏覽器 API 是否被包在小型 client component？
- [ ] 瀏覽器專用元件是否使用 `dynamic(..., { ssr: false })`，並有清楚原因？
- [ ] `next/dynamic` 是否只用在有實際收益的重元件，而不是把簡單元件複雜化？
- [ ] Loading / skeleton 是否在慢路徑上存在，避免空白畫面？

### 範例 / Examples

**不推薦 ❌ - 整頁 client 化並同步載入重元件**:

```tsx
'use client'

import { HeavyChart } from './heavyChart'
import { DragAndDropManager } from './dragAndDropManager'

export default function ReportPage() {
  return (
    <>
      <HeavyChart data={data} />
      <DragAndDropManager items={items} onChange={setItems} />
    </>
  )
}
```

**推薦 ✅ - 頁面入口保持薄，互動區塊清楚隔離**:

```tsx
import { ReportContent } from './reportContent'

export default function ReportPage() {
  return <ReportContent />
}
```

```tsx
'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from './skeleton'

const HeavyChart = dynamic(
  () =>
    import('./heavyChart').then((mod) => ({
      default: mod.HeavyChart,
    })),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
  }
)

export function ReportContent() {
  return <HeavyChart />
}
```

**推薦 ✅ - 瀏覽器 API 用 `ssr: false` 隔離**:

```tsx
import dynamic from 'next/dynamic'

const ClientOnlyPreview = dynamic(
  () =>
    import('./clientOnlyPreview').then((mod) => ({
      default: mod.ClientOnlyPreview,
    })),
  {
    ssr: false,
  }
)
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 為了使用一個 hook，把整個 route 都加上 `'use client'`**

```tsx
// ❌ 整頁都變成 client bundle
'use client'

export default function ExamplePage() {
  const [open, setOpen] = useState(false)
  return <ExampleLayout open={open} onOpenChange={setOpen} />
}

// ✅ 只有真正互動的區塊是 client component
export default function ExamplePage() {
  return <ExampleShell actions={<ExampleActions />} />
}
```

**陷阱 2: 不分大小全部 dynamic import**

```tsx
// ❌ 簡單按鈕不需要 dynamic，反而增加理解成本
const Button = dynamic(() => import('./button'))

// ✅ dynamic 留給重元件、瀏覽器 API 或首屏非必要內容
const DragAndDropManager = dynamic(() => import('./dragAndDropManager'))
```

### 維護備註 / Maintainer Notes

不要把尚未定案的頁面或示範資料流程當成標準實作。審查時請找符合下列特徵的穩定範例：

- 頁面入口保持薄，互動邏輯與瀏覽器 API 放在明確的小型 client component。
- 需要 `window`、`document`、`URL.createObjectURL` 等瀏覽器 API 的元件有明確 client-only 邊界。
- `next/dynamic` 只用於大型或瀏覽器專用模組，並提供 loading fallback。

### 自動化 / Automation

- **ESLint**: `next/core-web-vitals`、`next/typescript`
- **Build Check**: `pnpm --filter frontend run build`
- **Git Hook**: `lint-staged` 會處理 lint/format，但不取代 bundle 審查
- **Manual Review**: 檢查 `'use client'` 邊界是否維持最小範圍

---

## 準則 15: 避免不必要的 Client State 與 Effect / Guideline 15: Avoid Unnecessary Client State and Effects

### 說明 / Description

React state 只用來保存會被使用者互動或非同步流程改變的資料。可以由 props、URL、remote/API data 或其他 state 推導出的值，不要再存一份 state。副作用集中在 `useEffect`，並且必須清理 timers、listeners、subscriptions、object URLs。

Use React state only for data that changes through interaction or async flow. Do not duplicate values that can be derived from props, URL, remote/API data, or existing state. Keep side effects in `useEffect` and clean up timers, listeners, subscriptions, and object URLs.

### 為什麼重要 / Why This Matters

- **狀態越少，bug 越少**：重複 state 容易不同步。
- **渲染次數更可控**：少一個 state update，就少一個可能的 render。
- **記憶體更穩定**：object URL、listener、timer 沒清掉會累積。
- **維護成本更低**：資料流明確，工程師不用猜哪份資料才是真的。

### Linus 哲學 / Linus Philosophy

> Good structure makes the code smaller, easier to test, and less fragile.

Performance is not propped up by adding memo everywhere — it comes from a simple data model. Eliminate unnecessary state first, then talk about optimization.

### 檢查清單 / Checklist

- [ ] 是否有 state 可以直接由其他 state 或 props 推導？
- [ ] `useEffect` 是否只處理副作用，而不是同步可推導資料？
- [ ] timers、listeners、subscriptions、object URLs 是否都有 cleanup？
- [ ] async effect 是否避免在 unmount 後更新 state？
- [ ] `useEffect` dependency 是否完整，沒有靠忽略 lint 過關？

### 範例 / Examples

**不推薦 ❌ - 把可推導資料也存成 state**:

```tsx
const [items, setItems] = useState<Item[]>([])
const [filteredItems, setFilteredItems] = useState<Item[]>([])
const [totalCount, setTotalCount] = useState(0)

useEffect(() => {
  const nextItems = items.filter((item) => item.isVisible)
  setFilteredItems(nextItems)
  setTotalCount(nextItems.length)
}, [items])
```

**推薦 ✅ - 直接推導，必要時才 memoize**:

```tsx
const [items, setItems] = useState<Item[]>([])

const filteredItems = items.filter((item) => item.isVisible)
const totalCount = filteredItems.length
```

**推薦 ✅ - 計算成本高或資料量大時才 `useMemo`**:

```tsx
const visibleItems = useMemo(
  () => items.filter((item) => matchesSearch(item, searchQuery)),
  [items, searchQuery]
)
```

**推薦 ✅ - object URL 必須釋放**:

```tsx
useEffect(() => {
  const urls = files.map((file) => URL.createObjectURL(file))
  setImageUrls(urls)

  return () => {
    urls.forEach((url) => URL.revokeObjectURL(url))
  }
}, [files])
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 用 effect 修補資料流**

```tsx
// ❌ searchQuery 改變後再同步另一份 state
useEffect(() => {
  setVisibleItems(items.filter((item) => item.name.includes(searchQuery)))
}, [items, searchQuery])

// ✅ render 時直接得到唯一真相
const visibleItems = useMemo(
  () => items.filter((item) => item.name.includes(searchQuery)),
  [items, searchQuery]
)
```

**陷阱 2: effect 沒清理**

```tsx
// ❌ listener 會殘留
useEffect(() => {
  window.addEventListener('resize', handleResize)
}, [])

// ✅ mount/unmount 對稱
useEffect(() => {
  window.addEventListener('resize', handleResize)

  return () => {
    window.removeEventListener('resize', handleResize)
  }
}, [handleResize])
```

### 維護備註 / Maintainer Notes

不要引用仍在調整中的頁面或示範資料流程作為規則依據。審查時請找符合下列特徵的穩定範例：

- State 只保存使用者互動或非同步流程會改變的資料。
- 可由 props、URL、remote/API data 或既有 state 推導的資料直接計算，必要時才用 `useMemo`。
- 瀏覽器資源、timer、listener、subscription 都有對稱 cleanup。

### 自動化 / Automation

- **ESLint**: `react-hooks/exhaustive-deps`
- **Type Check**: `pnpm --filter frontend run type-check`
- **Git Hook**: `lint-staged` 會執行 ESLint fix 與 Prettier
- **Manual Review**: 檢查是否有可推導 state、缺少 cleanup 或不完整 dependency

---

## 準則 16: 先測量，再優化 / Guideline 16: Measure Before Optimizing

### 說明 / Description

效能優化必須從可觀察問題開始：頁面慢、互動卡、bundle 變大、API 請求過多、LCP/INP/CLS 退步。沒有測量，就不要用複雜 cache、全域 memo、virtualization 或重構來「感覺」會更快。

Performance work must start from an observable problem: slow page load, janky interaction, bigger bundle, too many requests, or worse LCP/INP/CLS. Without measurement, do not add complex caches, global memoization, virtualization, or refactors just because they feel faster.

### 為什麼重要 / Why This Matters

- **避免錯修問題**：猜測通常會優化錯地方。
- **保留可讀性**：不必要的優化會讓簡單邏輯變難懂。
- **讓 Review 有證據**：before/after 數據比主觀感覺可靠。
- **維持小變更**：測到瓶頸後才能做最小、可驗證的改動。

### Linus 哲學 / Linus Philosophy

> Theory and practice sometimes clash. Practice wins.

Performance discussions are settled by measurement. A beautiful theory that does not improve what the user sees is not a good change.

### 檢查清單 / Checklist

- [ ] 是否能描述具體問題與使用者影響？
- [ ] 優化前是否有 baseline：Chrome Performance、React Profiler、Lighthouse、Network 或 `next build`？
- [ ] 優化後是否用同一方法重測？
- [ ] PR / MR 是否寫清楚 before、after、取捨與剩餘風險？
- [ ] 是否移除臨時 profiling code 與 `console.*`？

### 範例 / Examples

**不推薦 ❌ - 沒測量就加複雜 cache**:

```tsx
const recordCache = new Map<string, RecordItem[]>()
const cacheStats = new Map<string, number>()

export async function getRecords(groupId: string) {
  if (recordCache.has(groupId)) {
    cacheStats.set(groupId, (cacheStats.get(groupId) ?? 0) + 1)
    return recordCache.get(groupId)
  }

  const records = await fetchRecords(groupId)
  recordCache.set(groupId, records)
  return records
}
```

**推薦 ✅ - 先用最簡單的資料流，再測量瓶頸**:

```tsx
export async function getRecords(groupId: string) {
  return fetchRecords(groupId)
}
```

**推薦 ✅ - PR 中保留測量證據**:

```markdown
Problem:
A list page takes 1.9s scripting time when rendering 1,500 rows.

Change:
Move initial render to paginated 50-row chunks.

Verification:
Chrome Performance, same dataset:

- Before: 1.9s scripting, 1,508 DOM rows
- After: 220ms scripting, 50 DOM rows
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 把所有 handler 都包 `useCallback`**

```tsx
// ❌ 沒有 memo child，也沒有 effect dependency，沒有收益
const handleClick = useCallback(() => {
  setOpen(true)
}, [])

// ✅ 簡單函數直接寫
const handleClick = () => {
  setOpen(true)
}
```

**陷阱 2: 優化後沒有重測**

```markdown
// ❌ PR description
Improve chart performance.

// ✅ PR description
Chart filter interaction:

- Before: React Profiler commit 180ms
- After: React Profiler commit 42ms
- Trade-off: chart data is memoized by range; memory increases by about 1 MB
```

### 維護備註 / Maintainer Notes

不要把特定頁面目前的效能狀態當成通用標準。審查時請保存可重現的測量證據：

- `next build` route size 或 bundle analyzer 結果。
- Chrome Performance / React Profiler / Lighthouse 的 before/after。
- PR / MR 說明中的問題、改動、驗證方式與取捨。

### 自動化 / Automation

- **Build**: `pnpm --filter frontend run build`
- **Lint**: `pnpm --filter frontend run lint`
- **Type Check**: `pnpm --filter frontend run type-check`
- **Manual Profiling**: Chrome DevTools Performance、React DevTools Profiler、Lighthouse
- **Manual Review**: PR / MR 需保留效能問題、before/after、取捨與剩餘風險

---

## 準則 17: 避免 N+1 請求與 Waterfall / Guideline 17: Avoid N+1 Requests and Data Waterfalls

### 說明 / Description

批次資料應該用單次 API 或可並行的查詢取得，不要在 loop、`useEffect` 或 component tree 中逐層發 request。此專案不以 SSR 資料組裝作為預設策略；若真的需要 server runtime，仍必須避免序列化等待造成 waterfall。

Batch data should be fetched with one API or parallel queries. Do not issue one request per item inside loops, `useEffect`, or nested component trees. This project is not SSR-first; if server runtime is used, sequential awaits can still create waterfalls.

### 為什麼重要 / Why This Matters

- **速度**：N+1 在資料量上來後會直接放大延遲。
- **API 壓力**：多餘 request 會浪費連線與處理成本。
- **使用者體驗**：waterfall 會讓 loading 一段接一段出現。
- **資料模型更清楚**：批次 API 迫使呼叫端與 API provider 定義真正需要的資料形狀。

### Linus 哲學 / Linus Philosophy

> Design the data model and boundaries first.

If the screen needs primary data, related state, and display config, define an interface that fetches them in one call or in parallel. Do not push gaps in the API contract onto the UI to fill with N separate requests.

### 檢查清單 / Checklist

- [ ] 是否在 `map`、`for`、`forEach` 中呼叫 API？
- [ ] 是否能用 batch endpoint，例如 `/api/items?ids=...`？
- [ ] 多個互不依賴的 request 是否用 `Promise.all` 並行？
- [ ] Client component 是否把初始資料抓取放進 `useEffect`，導致首屏空白？
- [ ] loading、error、empty state 是否由同一層資料邊界管理？

### 範例 / Examples

**不推薦 ❌ - loop 中逐筆請求**:

```tsx
const items = await itemApi.getAll()

for (const item of items) {
  item.status = await statusApi.getByItemId(item.id)
}
```

**推薦 ✅ - batch API 回傳畫面需要的資料**:

```tsx
const items = await itemApi.getAll()
const itemIds = items.map((item) => item.id)
const statuses = await statusApi.getBatchByItemIds(itemIds)

const statusByItemId = new Map(
  statuses.map((status) => [status.itemId, status])
)

return items.map((item) => ({
  ...item,
  status: statusByItemId.get(item.id) ?? null,
}))
```

**推薦 ✅ - 互不依賴的資料並行取得**:

```tsx
export default async function DashboardPage() {
  const [items, groups, summary] = await Promise.all([
    itemApi.getAll(),
    groupApi.getAll(),
    reportApi.getSummary(),
  ])

  return <Dashboard items={items} groups={groups} summary={summary} />
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: Client component mount 後才抓首屏資料**

```tsx
// ❌ 首屏先空白，再由瀏覽器發 request
'use client'

export function ItemTable() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    itemApi.getAll().then(setItems)
  }, [])

  return <Table items={items} />
}

// ✅ 將遠端資料生命週期集中在 adapter 或 query hook
export function ItemTable() {
  const { data: items = [], isLoading } = useItemsQuery()

  if (isLoading) {
    return <TableSkeleton />
  }

  return <Table items={items} />
}
```

**陷阱 2: 非必要的序列等待**

```tsx
// ❌ 第二個 request 不依賴第一個，卻被迫等待
const items = await itemApi.getAll()
const groups = await groupApi.getAll()

// ✅ 並行
const [items, groups] = await Promise.all([itemApi.getAll(), groupApi.getAll()])
```

### 維護備註 / Maintainer Notes

不要以尚未接 API 的頁面或示範資料流程作為資料存取標準。審查時請確認資料邊界具備下列特徵：

- 初始頁面資料策略要明確；預設不要為了避免 client fetch 就引入 SSR/RSC。
- API contract 支援批次查詢或並行查詢，不要求 component tree 自行補 N 次 request。
- 資料轉換集中在 adapter、loader 或 hook，避免散落在多個 UI component。

### 自動化 / Automation

- **Network Tab**: 檢查同一互動是否產生大量相似 request。
- **Code Review**: 搜尋 `await` inside loop、`fetch` inside `map`、mount-only `useEffect` fetch。
- **Manual Review**: loop 內 API 呼叫必須改成 batch API 或並行查詢。

---

## 準則 18: Memoization 服務資料流，不服務焦慮 / Guideline 18: Memoization Serves Data Flow, Not Anxiety

### 說明 / Description

`useMemo`、`useCallback`、`React.memo` 是工具，不是預設樣板。只有在計算昂貴、引用穩定性真的影響 memo child、或 profiling 顯示 render 成本過高時才使用。依賴陣列必須完整，memoized function 不應隱藏副作用。

`useMemo`, `useCallback`, and `React.memo` are tools, not default boilerplate. Use them only for expensive computation, stable references required by memoized children, or measured render cost. Dependency arrays must be complete, and memoized functions must not hide side effects.

### 為什麼重要 / Why This Matters

- **可讀性**：過量 memo 讓簡單邏輯變難讀。
- **正確性**：錯誤 dependency 會產生 stale closure。
- **實際成本**：memo 本身也有成本，不是免費。
- **Review 更快**：只有有理由的 memo 才需要被審查。

### Linus 哲學 / Linus Philosophy

> Maintainability beats cleverness.

Adding memo everywhere is overengineering. Good taste is understanding the data flow and reserving necessary optimization for genuinely expensive places.

### 檢查清單 / Checklist

- [ ] 使用 `useMemo` 前是否能說明計算成本或引用穩定需求？
- [ ] 使用 `useCallback` 前，是否傳給 `React.memo` child 或被 effect dependency 使用？
- [ ] `React.memo` 的 component 是否 render 成本高、props 穩定、且有測量證據？
- [ ] dependency array 是否完整，沒有 stale closure？
- [ ] 是否能用拆分 component 或簡化 state 取代 memo？

### 範例 / Examples

**不推薦 ❌ - 無理由 memoization**:

```tsx
const total = useMemo(() => price * quantity, [price, quantity])

const handleOpen = useCallback(() => {
  setOpen(true)
}, [])
```

**推薦 ✅ - 簡單計算直接寫**:

```tsx
const total = price * quantity

const handleOpen = () => {
  setOpen(true)
}
```

**推薦 ✅ - 大量資料過濾才 memoize**:

```tsx
const visibleItems = useMemo(
  () =>
    items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  [items, searchQuery]
)
```

**推薦 ✅ - memo child 需要穩定 callback**:

```tsx
const ExpensiveListItem = memo(function ExpensiveListItem({
  item,
  onSelect,
}: ExpensiveListItemProps) {
  return <button onClick={() => onSelect(item.id)}>{item.name}</button>
})

function ItemList({ items }: ItemListProps) {
  const handleSelect = useCallback((itemId: string) => {
    setSelectedItemId(itemId)
  }, [])

  return items.map((item) => (
    <ExpensiveListItem key={item.id} item={item} onSelect={handleSelect} />
  ))
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: dependency 不完整**

```tsx
// ❌ searchQuery 變了，結果不會更新
const visibleItems = useMemo(
  () => items.filter((item) => item.name.includes(searchQuery)),
  [items]
)

// ✅ dependency 完整
const visibleItems = useMemo(
  () => items.filter((item) => item.name.includes(searchQuery)),
  [items, searchQuery]
)
```

**陷阱 2: `React.memo` 包住總是變動的 props**

```tsx
// ❌ 每次 render 都產生新物件，memo child 仍會重 render
<Chart options={{ height: 300, color: 'brand' }} />

// ✅ options 是穩定常數，或直接拆成 primitive props
const chartOptions = { height: 300, color: 'brand' } as const

<Chart options={chartOptions} />
```

### 維護備註 / Maintainer Notes

不要用特定頁面目前是否有 `memo` 作為通用依據。審查時請確認 memoization 符合下列條件：

- render 成本已被 React Profiler 或可重現操作證明。
- props 引用穩定，`React.memo` 不是包住每次都變的新物件。
- dependency array 完整，沒有為了「少 render」犧牲正確性。

### 自動化 / Automation

- **ESLint**: `react-hooks/exhaustive-deps`
- **Profiler**: React DevTools Profiler 確認 render 成本。
- **Code Review**: 看到 memo/useMemo/useCallback 必須能回答「瓶頸在哪」。

---

## 準則 19: 大列表先分頁，再考慮虛擬捲動 / Guideline 19: Paginate Large Lists Before Virtualizing

### 說明 / Description

一般列表先使用分頁、搜尋與篩選縮小 render 範圍；當單頁仍需呈現大量列、拖曳排序或複雜 cell 時，才引入 virtualization。遠端資料量大時，優先要求 API 支援分頁，不要一次把全部資料丟給瀏覽器。

Use pagination, search, and filters first to reduce render scope. Add virtualization only when a page still renders many rows, drag-and-drop items, or complex cells. For large remote datasets, prefer API pagination over sending everything to the browser.

### 為什麼重要 / Why This Matters

- **DOM 節點可控**：畫面只渲染使用者需要看的資料。
- **互動更穩定**：大量列會放大 checkbox、popover、dialog、drag sensor 的成本。
- **實作更簡單**：分頁比 virtualization 更容易測試與維護。
- **API 契約清楚**：真正大資料要在 API 層支援 page、limit、sort、filter。

### Linus 哲學 / Linus Philosophy

> Prefer clear invariants over clever control flow.

"At most N items per page" is a clear invariant; virtual scrolling is a more complex UI technique. Solve the problem with data boundaries first, and only upgrade when that is not enough.

### 檢查清單 / Checklist

- [ ] 列表是否有明確的 `page`、`pageSize`、`totalCount`？
- [ ] key 是否使用穩定 ID，而不是 array index？
- [ ] 篩選、搜尋、排序是否在資料量大時能交給 API？
- [ ] 單頁渲染是否超過 100-200 筆複雜列？若是，是否有測量證據？
- [ ] 若引入 virtualization，是否處理好 row height、focus、keyboard navigation、empty/loading state？

### 範例 / Examples

**不推薦 ❌ - 一次渲染所有資料**:

```tsx
export function DataTable({ items }: DataTableProps) {
  return (
    <tbody>
      {items.map((item) => (
        <DataRow key={item.id} item={item} />
      ))}
    </tbody>
  )
}
```

**推薦 ✅ - 先分頁再渲染**:

```tsx
export function DataTable({ currentItems }: DataTableProps) {
  return (
    <tbody>
      {currentItems.map((item) => (
        <DataRow key={item.id} item={item} />
      ))}
    </tbody>
  )
}
```

**推薦 ✅ - API 分頁契約**:

```tsx
interface ListQuery {
  page: number
  pageSize: number
  searchQuery?: string
  groupIds?: string[]
}

interface ListResult<TItem> {
  items: TItem[]
  totalCount: number
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 用 index 當 key**

```tsx
// ❌ 搜尋、排序、刪除後容易造成錯誤重用
items.map((item, index) => <DataRow key={index} item={item} />)

// ✅ 穩定 ID
items.map((item) => <DataRow key={item.id} item={item} />)
```

**陷阱 2: 太早導入 virtualization**

```tsx
// ❌ 只有 20 筆資料也引入 virtualization，增加測試與可及性成本
<VirtualizedTable items={items.slice(0, 20)} />

// ✅ 小列表直接渲染，維持簡單
<DataTable currentItems={currentItems} />
```

### 維護備註 / Maintainer Notes

不要因為目前某個頁面有前端分頁，就把它視為所有資料量情境的標準答案。審查時請確認：

- 小資料量直接渲染，維持簡單。
- 中等資料量先使用前端或 API 分頁，明確限制每次 render 的項目數。
- 大資料量或複雜 row 需要測量證據，再引入 virtualization。

### 自動化 / Automation

- **Code Review**: 搜尋 `.map(` 渲染大型資料、`key={index}`、未分頁 table。
- **Performance Monitor**: 觀察 DOM nodes、scripting time、interaction latency。
- **Manual Review**: 大量 list render 先確認 pagination / API pagination，再討論 virtualization。

---

## 準則 20: Bundle 與資產大小要可見 / Guideline 20: Keep Bundle and Assets Visible

### 說明 / Description

Bundle 檢查以 `next build` 輸出的 route size、Chrome Coverage、Network、Lighthouse 或需要時加入 `@next/bundle-analyzer` 為準。圖片使用 `next/image`，字體使用 `next/font`，第三方大型套件要 lazy load 或拆到 client boundary。

Use `next build` route size output, Chrome Coverage, Network, Lighthouse, or `@next/bundle-analyzer` when needed. Use `next/image` for images, `next/font` for fonts, and lazy-load large third-party packages or isolate them behind client boundaries.

### 為什麼重要 / Why This Matters

- **載入速度**：bundle 與圖片越大，首屏越慢。
- **行動網路成本**：使用者可能在不同設備與網路環境使用。
- **快取效率**：穩定拆分讓瀏覽器更容易重用資源。
- **可維護性**：明確知道大型依賴在哪裡進入 bundle。

### Linus 哲學 / Linus Philosophy

> Make the code reviewable.

When adding a large dependency or asset, reviewers should be able to see the reason, size impact, and alternatives. Do not let bundle growth hide inside "just changing one import line".

### 檢查清單 / Checklist

- [ ] 是否跑過 `pnpm --filter frontend run build` 並檢查 route size？
- [ ] 新增依賴是否有必要，是否已有現成專案工具可用？
- [ ] 大型套件是否可 lazy load，例如圖表、拖曳、日期處理？
- [ ] 圖片是否使用 `next/image`，並提供 `width`、`height`、`alt`？
- [ ] LCP 圖片是否使用 `priority`，非首屏圖片是否避免 priority？
- [ ] 遠端圖片來源是否在 `next.config.ts` 的 `images.remotePatterns` 中明確配置？
- [ ] 字體是否透過 `next/font` 或 local font 載入，避免 layout shift？

### 範例 / Examples

**不推薦 ❌ - 原生 `<img>` 與未定尺寸圖片**:

```tsx
export function OptimizedImage({ src, label }: OptimizedImageProps) {
  return <img src={src} alt={label} />
}
```

**推薦 ✅ - 使用 `next/image`**:

```tsx
import Image from 'next/image'

export function OptimizedImage({ src, label }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      width={100}
      height={100}
      className="h-24 w-24 rounded-md object-cover"
      alt={label}
    />
  )
}
```

**推薦 ✅ - 字體使用 `next/font/local`**:

```tsx
import localFont from 'next/font/local'

const appSans = localFont({
  src: './fonts/AppSans.woff2',
  variable: '--font-app-sans',
  weight: '100 900',
})
```

**推薦 ✅ - 檢查 Next build 輸出**:

```bash
pnpm --filter frontend run build
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 使用不符合專案建置工具的 analyzer**

效能檢查應使用專案實際建置工具提供的輸出與 analyzer。

```bash
# ✅ 先看 Next build route size；需要深入再加 bundle analyzer
pnpm --filter frontend run build
```

**陷阱 2: 圖片來源沒配置**

```tsx
// ❌ 遠端圖片沒有 remotePatterns 時，next/image 會失敗
;<Image
  src="https://cdn.example.com/product.png"
  width={100}
  height={100}
  alt="product"
/>

// ✅ 在 next.config.ts 明確允許來源
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
  },
}
```

### 維護備註 / Maintainer Notes

不要把某個頁面的圖片、字體或圖表實作當成通用規則。審查時請確認：

- 遠端圖片來源在 `next.config.ts` 中明確允許，且範圍不過寬。
- 字體透過 `next/font` 管理，避免額外 layout shift。
- 大型第三方 UI / chart / editor / drag-and-drop 套件有 route size 或 analyzer 證據。

### 自動化 / Automation

- **Build**: `pnpm --filter frontend run build`
- **Coverage**: Chrome DevTools Coverage 檢查 unused JavaScript。
- **Lighthouse**: 檢查 LCP、INP、CLS、image sizing。
- **Bundle Analyzer**: 只有在 bundle 成長或審查需要時加入 `@next/bundle-analyzer`。
- **Manual Review**: 新增大型依賴、原生 `<img>` 或 analyzer 設定時，需說明原因與大小影響。

---

## 總結 / Summary

前端效能的 7 條準則核心思想：

1. **準則 14**: 控制 client boundary，重元件與瀏覽器 API 才 lazy load。
2. **準則 15**: 減少不必要 state/effect，讓資料流維持單一真相。
3. **準則 16**: 先測量再優化，PR 必須能說清 before/after。
4. **準則 17**: 批次請求與並行資料取得，避免 N+1 和 waterfall。
5. **準則 18**: Memoization 要有理由，服務資料流而不是焦慮。
6. **準則 19**: 大列表先分頁與 API 分頁，再考慮虛擬捲動。
7. **準則 20**: Bundle、圖片、字體、第三方依賴都要可見、可審查。

**Linus 哲學 / Linus Philosophy in Frontend Performance**:

- **Solve a Real Problem** → 準則 16（沒有測量就不要優化）
- **Keep the Core Simple** → 準則 14、15、18（縮小 client boundary、減少 state、避免無理由 memo）
- **Design the Data Model First** → 準則 17、19（批次資料、分頁契約）
- **Make the Code Reviewable** → 準則 20（bundle 與資產變化要有證據）

---

## 相關文檔 / Related Documents

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Image Optimization](https://nextjs.org/docs/app/getting-started/images)
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [React Performance](https://react.dev/reference/react/useMemo)
- [README.md](README.md) - 準則總覽
- [AGENTS.md](../../AGENTS.md) - 專案工程原則

---

**最後更新 / Last Updated**: 2026-05-16  
**維護者 / Maintainer**: Frontend Team
