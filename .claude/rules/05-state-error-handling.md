---
paths:
  [
    'apps/frontend/src/**/*.tsx',
    'apps/frontend/src/**/*.ts',
    'apps/frontend/package.json',
    'apps/frontend/next.config.ts',
  ]
---

# 狀態與錯誤處理 / State & Error Handling (準則 26-28)

本文檔涵蓋 Next.js / React / TypeScript 前端的狀態與錯誤處理準則。重點是讓資料來源、錯誤邊界、使用者訊息與非同步 UI 狀態清楚可審查。

This document covers state and error handling guidelines for Next.js / React / TypeScript frontends. The focus is to make state sources, error boundaries, user-facing messages, and async UI states clear and reviewable.

---

## 準則 26: 狀態來源與錯誤邊界 / Guideline 26: State Sources and Error Boundaries

### 說明 / Description

每個畫面都要能說清楚資料的唯一來源：remote/API data、URL、props、local component state，或是明確的 client-side store。可以推導出的資料不要重複存成 state。互動狀態留在最小 client component，跨頁或跨功能狀態才考慮集中管理。

Remote/API state 不等於 client interaction state。來自 API、會被快取、會被背景重新抓取、或會被 mutation 影響的資料，導入後優先交給 TanStack Query 管理；表單輸入、dialog 開關、目前選取列、暫存篩選條件等互動狀態仍留在 React state 或 URL。

錯誤也要分邊界。可預期錯誤，例如表單驗證失敗、API 回傳 400、查無資料，應該用 return value 或 component state 呈現。未捕捉例外才交給 Next.js `error.tsx` 或 `global-error.tsx` 形成 Error Boundary（錯誤邊界）。

Every screen must have a clear source of truth: remote/API data, URL, props, local component state, or an explicit client-side store. Do not duplicate data that can be derived. Keep interaction state in the smallest client component, and only centralize state when it crosses page or feature boundaries.

Remote/API state is not client interaction state. Data that comes from APIs, needs caching, may refetch in the background, or changes after mutations should use TanStack Query after it is introduced. Form input, dialog open state, selected rows, and temporary filters should remain in React state or the URL.

Errors also need boundaries. Expected errors, such as form validation failures, API 400 responses, or empty data, should be represented as return values or component state. Uncaught exceptions belong in Next.js `error.tsx` or `global-error.tsx` Error Boundaries.

### 為什麼重要 / Why This Matters

- **資料流可審查**：reviewer 能看懂哪份資料是真的，不需要追多份 state。
- **Remote/API state 有一致生命週期**：快取、重新抓取、失效與 mutation 不散落在 component。
- **錯誤隔離清楚**：局部 render crash 不會讓整個 app 白畫面。
- **使用者體驗穩定**：可預期錯誤用明確訊息處理，不把使用者丟進系統錯誤頁。
- **維護成本更低**：狀態與錯誤邊界固定，後續工程師不用猜特殊情況。

### Linus 哲學 / Linus Philosophy

> "Design the data model and boundaries first."

The core of state and error handling is not adding another tool — it is drawing the boundaries correctly. The simpler the data sources, the more errors can be isolated, and the fewer special branches the code needs.

### 檢查清單 / Checklist

- [ ] 這個畫面的資料來源是否明確，沒有把可推導資料重複存成 state？
- [ ] Remote/API state 是否使用 TanStack Query（導入後），而不是手寫分散的 `useEffect` fetch？
- [ ] `'use client'` 是否只放在需要 hooks、事件或瀏覽器 API 的最小邊界？
- [ ] 可預期錯誤是否用 return value、state 或 inline message 表示，而不是丟給 Error Boundary？
- [ ] route segment 是否在有實際風險時提供 `error.tsx`，root layout 風險才使用 `global-error.tsx`？
- [ ] 對使用者顯示的錯誤訊息是否避免 stack trace、內部代碼與敏感資訊？
- [ ] 錯誤紀錄是否集中在可替換的 adapter 或服務邊界，而不是散落 `console.error`？

### 範例 / Examples

**不推薦 ❌ - 重複保存可推導狀態，讓資料來源變多**:

```tsx
'use client'

function RecordList({ records }: { records: RecordItem[] }) {
  const [query, setQuery] = useState('')
  const [filteredRecords, setFilteredRecords] = useState(records)
  const [totalCount, setTotalCount] = useState(records.length)

  useEffect(() => {
    const nextRecords = records.filter((record) => record.name.includes(query))
    setFilteredRecords(nextRecords)
    setTotalCount(nextRecords.length)
  }, [records, query])

  return <RecordTable records={filteredRecords} totalCount={totalCount} />
}
```

**推薦 ✅ - 保留單一來源，可推導資料直接推導**:

```tsx
'use client'

function RecordList({ records }: { records: RecordItem[] }) {
  const [query, setQuery] = useState('')

  const filteredRecords = records.filter((record) =>
    record.name.includes(query)
  )

  return (
    <>
      <SearchInput value={query} onValueChange={setQuery} />
      <RecordTable
        records={filteredRecords}
        totalCount={filteredRecords.length}
      />
    </>
  )
}
```

**推薦 ✅ - route segment 用 Error Boundary 隔離未捕捉例外**:

```tsx
// app/(dashboard)/records/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <section className="space-y-3 p-6">
      <h2 className="text-lg font-semibold">資料暫時無法顯示</h2>
      <p className="text-sm text-muted-foreground">請重新整理，或稍後再試。</p>
      <button type="button" onClick={reset}>
        重試
      </button>
    </section>
  )
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 以為 Error Boundary 會處理所有錯誤**

```tsx
// ❌ event handler 的錯誤不會自動被 error.tsx 接住
function SaveButton() {
  const handleClick = async () => {
    await saveRecord()
    throw new Error('Save failed')
  }

  return <button onClick={handleClick}>儲存</button>
}

// ✅ 可預期的互動錯誤要在 handler 中轉成 UI state
function SaveButton() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleClick = async () => {
    setErrorMessage(null)
    const result = await saveRecord()

    if (!result.ok) {
      setErrorMessage('儲存失敗，請稍後再試')
    }
  }

  return (
    <>
      <button onClick={handleClick}>儲存</button>
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </>
  )
}
```

**陷阱 2: 用全域 handler 掩蓋局部資料問題**

```typescript
// ❌ 所有 API 失敗都丟同一個 toast，使用者不知道哪裡壞了
async function loadRecords() {
  try {
    return await fetchRecords()
  } catch {
    toast.error('系統發生錯誤')
    return []
  }
}

// ✅ 在資料邊界保留可診斷狀態
async function loadRecords(): Promise<RecordLoadResult> {
  const response = await fetch('/api/records')

  if (response.status === 404) {
    return { status: 'empty' }
  }

  if (!response.ok) {
    return { status: 'error', message: '資料讀取失敗，請稍後再試' }
  }

  return { status: 'success', records: await response.json() }
}
```

### 參考現有實作 / Reference Implementation

通用檢查位置：

- `apps/frontend/src/app/**/*.tsx` - route、page、client component 的 state 邊界。
- `apps/frontend/src/app/layout.tsx` - 全域 layout 與 toast provider 的放置位置。
- `apps/frontend/src/app/components/atoms/sonner.tsx` - toast 呈現層；不應承擔資料分類責任。

目前沒有確認存在的 `error.tsx`、`global-error.tsx` 或集中 API client。新增前應先說清楚真實錯誤路徑與最小範圍，不要為了「看起來完整」先加空架構。

TanStack Query 導入後，應能找到單一 `QueryClientProvider` 設定、穩定的 query key 命名方式，以及靠近資料邊界的 query / mutation hook。不要在多個 component 各自建立 `QueryClient`。

### 自動化 / Automation

- **ESLint**: `next/core-web-vitals`、`next/typescript` 可檢查部分 React / Next.js 問題。
- **Type Check**: `pnpm --filter frontend run type-check`
- **Git Hook**: `.husky/pre-commit` 會執行 type-check 與 staged lint/format。
- **Manual Review**: 檢查 state source、`'use client'` 邊界、Error Boundary 粒度與錯誤訊息內容。
- **Claude Hook**: `check-guidelines.sh` 是提醒腳本，不是完整 blocking check。

---

## 準則 27: 可預期錯誤與使用者訊息 / Guideline 27: Expected Errors and User-Facing Messages

### 說明 / Description

可預期錯誤是正常流程的一部分，例如欄位格式錯誤、權限不足、請求失敗、資料不存在。這些錯誤不要用未捕捉例外處理；要用 typed result、form state、inline error、toast 或空狀態清楚呈現。

錯誤訊息要站在使用者視角：發生什麼事、能不能重試、需要修正哪個欄位。技術細節、stack trace、內部錯誤碼與敏感資料只應進入紀錄或監控。若 API 有穩定 error code，請在 API adapter 或 helper 集中轉成可顯示訊息；若專案沒有多語系基礎建設，不要把不存在的 locale 目錄或檢查腳本寫成強制規則。

Expected errors are part of normal flow, such as invalid fields, insufficient permissions, failed requests, or missing data. Do not handle these as uncaught exceptions. Represent them with typed results, form state, inline errors, toasts, or empty states.

User-facing messages should explain what happened, whether retry is possible, and which field needs attention. Technical details, stack traces, internal error codes, and sensitive data belong in logs or monitoring only. If the API has stable error codes, map them to displayable messages in one API adapter or helper. If the project has no localization infrastructure, do not document non-existent locale folders or scripts as mandatory.

### 為什麼重要 / Why This Matters

- **使用者能修正問題**：欄位錯誤要出現在欄位附近，不只是一個泛用 toast。
- **錯誤分類穩定**：可預期錯誤不污染系統錯誤監控。
- **安全性較好**：不把內部錯誤、stack trace 或敏感資訊顯示到瀏覽器。
- **維護更便宜**：錯誤訊息集中映射，新增錯誤碼時 reviewer 有地方檢查。

### Linus 哲學 / Linus Philosophy

> "Solve a real problem."

Error messages are not a translation exercise. The real problem to solve is letting users know their next step, letting engineers know what went wrong, and making sure neither leaks information the other should not see.

### 檢查清單 / Checklist

- [ ] 可預期錯誤是否以 typed result、state 或 form action result 表示？
- [ ] 欄位錯誤是否顯示在欄位附近，並可被輔助科技讀到？
- [ ] 全頁或全區塊錯誤是否提供可行下一步，例如重試、返回或重新輸入？
- [ ] 使用者訊息是否避免 `error.message`、stack trace、SQL/API 內部細節與敏感資料？
- [ ] API error code 是否在單一 helper 或 adapter 轉成穩定訊息？
- [ ] 文件是否沒有要求目前專案不存在的語系目錄、監控服務設定或檢查腳本？

### 範例 / Examples

**不推薦 ❌ - 將表單驗證丟成系統錯誤**:

```tsx
async function handleSubmit(formData: FormData) {
  try {
    await submitForm(formData)
    toast.success('已儲存')
  } catch (error) {
    toast.error(String(error))
  }
}
```

**推薦 ✅ - 可預期錯誤回傳成表單狀態**:

```tsx
type FormState = {
  message?: string
  fieldErrors?: {
    name?: string
    email?: string
  }
}

async function submitForm(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const fieldErrors: FormState['fieldErrors'] = {}

  if (!name) fieldErrors.name = '請輸入名稱'
  if (!email.includes('@')) fieldErrors.email = '請輸入有效的電子郵件'

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const result = await saveForm({ name, email })

  if (!result.ok) {
    return { message: '儲存失敗，請稍後再試' }
  }

  return {}
}
```

```tsx
'use client'

import { useActionState } from 'react'

const initialState: FormState = {}

function ContactForm() {
  const [state, formAction, pending] = useActionState(submitForm, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <Field name="name" label="名稱" errorMessage={state.fieldErrors?.name} />
      <Field
        name="email"
        label="電子郵件"
        errorMessage={state.fieldErrors?.email}
      />
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending}>
        {pending ? '送出中' : '送出'}
      </button>
    </form>
  )
}
```

**推薦 ✅ - 集中轉換 API error code，不硬綁不存在的語系目錄**:

```typescript
const ERROR_MESSAGE_BY_CODE: Record<string, string> = {
  VALIDATION_FAILED: '資料格式不正確，請檢查後再送出',
  PERMISSION_DENIED: '您沒有權限執行此操作',
  RATE_LIMITED: '操作太頻繁，請稍後再試',
}

export function getUserMessageFromApiError(error: ApiError): string {
  return ERROR_MESSAGE_BY_CODE[error.code] ?? '操作失敗，請稍後再試'
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 直接顯示 API 原始錯誤**

```typescript
// ❌ 可能洩漏技術細節，也可能不是使用者語言
toast.error(error.message)

// ✅ 先分類，再顯示穩定訊息
toast.error(getUserMessage(error))
```

**陷阱 2: 空 catch 讓錯誤消失**

```typescript
// ❌ 使用者沒有回饋，工程師也沒有診斷線索
try {
  await saveChanges()
} catch {
  // ignored
}

// ✅ 至少轉成 UI state 或重新拋給上層邊界
try {
  await saveChanges()
} catch (error) {
  setErrorMessage('儲存失敗，請稍後再試')
  reportError(error)
}
```

**陷阱 3: 把不存在的語系機制寫成標準**

```markdown
<!-- ❌ 專案沒有語系檔，文件卻要求 pre-commit 必跑 -->

- Git Hook 必須檢查所有錯誤訊息翻譯

<!-- ✅ 先描述穩定問題，再依實際工具落地 -->

- 若導入多語系，error code 對應表必須和語系檔一起 review。
```

### 參考現有實作 / Reference Implementation

通用檢查位置：

- `apps/frontend/src/app/components/atoms/sonner.tsx` - toast 視覺呈現層。
- `apps/frontend/src/app/**/*.tsx` - 表單、button handler、dialog 與 route-level error UI。
- `apps/frontend/package.json` - 目前未列出語系、監控、集中 API client 或資料 fetching 工具；文件不得把未啟用工具描述成既有強制標準。

### 自動化 / Automation

- **ESLint**: `no-empty` 可避免空區塊，但無法判斷錯誤訊息是否友善。
- **Type Check**: typed result 與 `unknown` error narrowing 可由 TypeScript 協助。
- **Git Hook**: 目前沒有錯誤訊息翻譯專用 blocking check。
- **Manual Review**: 檢查可預期錯誤是否回到 UI state，錯誤訊息是否安全、可理解、可操作。

---

## 準則 28: Loading、Empty 和 Error State / Guideline 28: Loading, Empty, and Error State

### 說明 / Description

每個非同步流程都應該明確處理 loading、success、empty、error 狀態。route segment 的慢路徑可用 Next.js `loading.tsx`；元件內局部慢路徑可用 React `<Suspense>`；表單提交可用 `useActionState` 或 `useFormStatus` 的 `pending`；一般 client-side async handler 可用 `useState` 管理。

TanStack Query 導入後，API 查詢優先使用 `useQuery` 的 `isPending`、`isError`、`isSuccess` 與 `isFetching` 表達狀態；寫入操作使用 `useMutation`，並在成功後 invalidate 相關 query。`queryKey` 必須穩定、可序列化，且包含會影響資料內容的參數。

Every async flow should explicitly handle loading, success, empty, and error states. Slow route segments can use Next.js `loading.tsx`; local slow subtrees can use React `<Suspense>`; form submissions can use `useActionState` or `useFormStatus` `pending`; general client-side async handlers can use `useState`.

After TanStack Query is introduced, API reads should use `useQuery` states such as `isPending`, `isError`, `isSuccess`, and `isFetching`. Writes should use `useMutation` and invalidate related queries on success. `queryKey` values must be stable, serializable, and include parameters that affect the data.

### 為什麼重要 / Why This Matters

- **避免白畫面**：使用者能看出系統正在處理，而不是以為壞掉。
- **避免重複操作**：送出中要 disable 相關操作，減少重複請求。
- **空狀態清楚**：沒有資料不是錯誤，應該用 empty state 表示。
- **併發更安全**：慢請求、重試與切換條件時，UI 不會被舊結果覆蓋。

### Linus 哲學 / Linus Philosophy

> "Fast feedback is a feature."

Loading, empty, and error states are fast feedback for the user. The good approach is usually small: an explicit state model, an appropriate fallback UI, and a verifiable retry or disable behavior.

### 檢查清單 / Checklist

- [ ] 非同步流程是否有 loading、success、empty、error 狀態？
- [ ] TanStack Query 的 `queryKey` 是否穩定、可序列化，並包含必要參數？
- [ ] `queryFn` 使用 `fetch` 時，是否在 `response.ok === false` 時 throw，讓 query 進入 error state？
- [ ] mutation 成功後是否 invalidate 或更新相關 query，避免畫面停在舊資料？
- [ ] `staleTime`、retry、background refetch 是否依資料新鮮度需求明確設定或接受預設？
- [ ] route-level 慢頁面是否需要 `loading.tsx` 或 `<Suspense>` fallback？
- [ ] 表單或按鈕送出中是否 disable 相關操作，並顯示 pending 狀態？
- [ ] empty state 是否和 error state 分開，不把「沒有資料」當成失敗？
- [ ] 錯誤狀態是否提供可行動作，例如重試、返回、重新輸入？
- [ ] 多個並行請求是否避免共用單一 boolean 造成狀態互相覆蓋？

### 範例 / Examples

**不推薦 ❌ - 非同步操作沒有任何回饋**:

```tsx
function SaveButton() {
  const handleClick = async () => {
    await saveChanges()
    toast.success('已儲存')
  }

  return <button onClick={handleClick}>儲存</button>
}
```

**推薦 ✅ - client-side async handler 有 pending 與 error state**:

```tsx
'use client'

function SaveButton() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'error'>('idle')

  const handleClick = async () => {
    setStatus('pending')

    try {
      const result = await saveChanges()

      if (!result.ok) {
        setStatus('error')
        return
      }

      setStatus('idle')
      toast.success('已儲存')
    } catch (error) {
      reportError(error)
      setStatus('error')
    }
  }

  return (
    <>
      <button onClick={handleClick} disabled={status === 'pending'}>
        {status === 'pending' ? '儲存中' : '儲存'}
      </button>
      {status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          儲存失敗，請稍後再試。
        </p>
      )}
    </>
  )
}
```

**推薦 ✅ - route-level loading 用 `loading.tsx` 或 Skeleton**:

```tsx
// app/(dashboard)/records/loading.tsx
import { Skeleton } from '@/app/components/atoms'

export default function Loading() {
  return (
    <section className="space-y-3 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </section>
  )
}
```

**推薦 ✅ - 明確分開 loading、empty、error、success**:

```tsx
type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }

function RecordPanel({ state }: { state: AsyncState<RecordItem[]> }) {
  switch (state.status) {
    case 'loading':
      return <RecordSkeleton />
    case 'empty':
      return <EmptyState title="目前沒有資料" />
    case 'error':
      return <ErrorState message={state.message} />
    case 'success':
      return <RecordTable records={state.data} />
  }
}
```

**推薦 ✅ - TanStack Query 管理 remote/API state**:

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'

const recordKeys = {
  all: ['records'] as const,
  list: (filters: RecordFilters) =>
    [...recordKeys.all, 'list', filters] as const,
}

async function fetchRecords(
  filters: RecordFilters,
  signal: AbortSignal
): Promise<RecordItem[]> {
  const searchParams = new URLSearchParams({
    keyword: filters.keyword,
    status: filters.status,
  })
  const response = await fetch(`/api/records?${searchParams}`, { signal })

  if (!response.ok) {
    throw new Error('Failed to fetch records')
  }

  return response.json()
}

function RecordQueryPanel({ filters }: { filters: RecordFilters }) {
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: recordKeys.list(filters),
    queryFn: ({ signal }) => fetchRecords(filters, signal),
    staleTime: 60 * 1000,
  })

  if (isPending) return <RecordSkeleton />

  if (isError) {
    return <ErrorState message={getUserMessage(error)} />
  }

  if (data.length === 0) {
    return <EmptyState title="目前沒有資料" />
  }

  return <RecordTable records={data} isRefreshing={isFetching} />
}
```

**推薦 ✅ - mutation 成功後 invalidate 相關 query**:

```tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

function UpdateRecordButton({ record }: { record: RecordItem }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: updateRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: recordKeys.all })
    },
  })

  return (
    <button
      type="button"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate(record)}
    >
      {mutation.isPending ? '更新中' : '更新'}
    </button>
  )
}
```

**推薦 ✅ - form submit 使用 `useFormStatus` 的 pending**:

```tsx
'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? '送出中' : '送出'}
    </button>
  )
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 忘記在失敗路徑重置 loading**

```typescript
// ❌ saveChanges 失敗後可能永遠停在 loading
setIsLoading(true)
await saveChanges()
setIsLoading(false)

// ✅ finally 保證重置
setIsLoading(true)
try {
  await saveChanges()
} finally {
  setIsLoading(false)
}
```

**陷阱 2: 多個請求共用一個 loading boolean**

```typescript
// ❌ A 完成時會把 B 的 loading 也關掉
const [isLoading, setIsLoading] = useState(false)

async function loadA() {
  setIsLoading(true)
  await fetchA()
  setIsLoading(false)
}

async function loadB() {
  setIsLoading(true)
  await fetchB()
  setIsLoading(false)
}

// ✅ 分開狀態，或用明確的 request key / async state
const [loadingByKey, setLoadingByKey] = useState<Record<string, boolean>>({})
```

**陷阱 3: 只有 spinner，沒有內容結構**

```tsx
// ❌ 大區塊只顯示 spinner，使用者不知道什麼正在載入
return <Spinner />

// ✅ 大區塊用 Skeleton 或保留已知 layout
return <RecordSkeleton />
```

**陷阱 4: query key 沒有包含影響資料的參數**

```tsx
// ❌ filters 改變時仍共用同一份 cache
useQuery({
  queryKey: ['records'],
  queryFn: () => fetchRecords(filters),
})

// ✅ query key 描述資料本身
useQuery({
  queryKey: ['records', 'list', filters],
  queryFn: () => fetchRecords(filters),
})
```

**陷阱 5: fetch 失敗但沒有 throw**

```typescript
// ❌ fetch 不會因 HTTP 400/500 自動 throw
async function fetchRecords() {
  const response = await fetch('/api/records')
  return response.json()
}

// ✅ 明確丟出錯誤，TanStack Query 才會進入 isError
async function fetchRecords() {
  const response = await fetch('/api/records')

  if (!response.ok) {
    throw new Error('Failed to fetch records')
  }

  return response.json()
}
```

### 參考現有實作 / Reference Implementation

通用檢查位置：

- `apps/frontend/src/app/components/atoms/skeleton.tsx` - Skeleton 基礎元件。
- `apps/frontend/src/app/components/atoms/sonner.tsx` - 操作結果或非欄位錯誤的 toast 呈現。
- `apps/frontend/src/app/**/*.tsx` - page、form、dialog、table、chart 等非同步或互動入口。
- TanStack Query 導入後，檢查 `QueryClientProvider`、query key factory、query hook 與 mutation hook 是否集中在清楚資料邊界。

### 自動化 / Automation

- **ESLint**: Hooks 規則可檢查部分 dependency 與 hooks 使用方式。
- **TanStack Query Devtools**: 導入後可在開發環境觀察 cache、stale、fetching 與 invalidation 行為。
- **Type Check**: discriminated union 可讓 TypeScript 檢查狀態分支是否完整。
- **Build Check**: `pnpm --filter frontend run build` 可驗證 Next.js special files 與 route 結構。
- **Manual Review**: 檢查 loading、empty、error、success 分支、query key、`staleTime`、mutation invalidation 與重試/disable 行為。

---

## 總結 / Summary

狀態與錯誤處理的 3 條準則核心思想：

1. **準則 26**: 狀態來源與錯誤邊界要明確，remote/API state 導入後交給 TanStack Query，避免重複 state 和錯誤特殊情況。
2. **準則 27**: 可預期錯誤是 UI 狀態，不是系統 crash；使用者訊息要可操作且不洩漏內部細節。
3. **準則 28**: 非同步流程要有 loading、empty、error、success 狀態，API 查詢與 mutation 導入後依 TanStack Query 的狀態模型落地。

**Linus 哲學 / Linus Philosophy in State & Error Handling**:

- **Good Taste** → 準則 26（清楚邊界消除特殊情況）
- **Never Break Userspace** → 準則 27（錯誤訊息不能把使用者丟進技術細節）
- **Fast Feedback** → 準則 28（每個慢路徑都有可見回饋）

---

## 相關文檔 / Related Documents

- [AGENTS.md](../../AGENTS.md) - Linus Torvalds 風格工程原則。
- [README.md](README.md) - 準則總覽。
- [03-frontend-performance.md](03-frontend-performance.md) - Client boundary、lazy loading 與效能狀態。
- [04-frontend-security.md](04-frontend-security.md) - 錯誤訊息與資料信任邊界。
- [09-typescript.md](09-typescript.md) - TypeScript 狀態模型與型別規則。
- [Next.js Error Handling](https://nextjs.org/docs/15/app/getting-started/error-handling) - App Router error handling。
- [Next.js loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading) - route-level loading UI。
- [React Suspense](https://react.dev/reference/react/Suspense) - fallback UI 與 Suspense boundary。
- [React form pending state](https://react.dev/reference/react-dom/components/form) - `useFormStatus` 與 pending state。
- [TanStack Query Queries](https://tanstack.com/query/v5/docs/framework/react/guides/queries) - `useQuery` 狀態模型。
- [TanStack Query Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) - query key 命名與 cache 邊界。
- [TanStack Query Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations) - mutation 後的 query invalidation。
- [TanStack Query Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) - stale、retry、gcTime 與 background refetch 預設。

---

**最後更新 / Last Updated**: 2026-05-16  
**維護者 / Maintainer**: Frontend Team
