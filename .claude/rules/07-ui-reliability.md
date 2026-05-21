---
paths: ['apps/frontend/src/**/*.tsx', 'apps/frontend/src/**/*.ts']
---

# UI 可靠性 / UI Reliability (準則 32-33)

本文檔涵蓋 UI 在不同 viewport、資料版本與公開介面變更下仍能穩定工作的準則。

This document covers UI reliability guidelines for stable behavior across viewports, data versions, and public interface changes.

---

## 準則 32: 響應式布局 / Guideline 32: Responsive Layout

### 說明 / Description

RWD（響應式網頁設計）不是替每個裝置寫一套畫面，而是讓同一個 UI 在合理的 viewport 範圍內維持可閱讀、可操作、不可重疊。使用 Tailwind CSS 的 mobile-first 斷點與 CSS layout 能力處理版面，不要在 render 階段用 `window.innerWidth` 決定初始畫面。

Responsive Web Design (RWD) should keep one UI readable, usable, and non-overlapping across supported viewport ranges. Use Tailwind CSS mobile-first breakpoints and CSS layout primitives instead of reading `window.innerWidth` during render.

適用範圍：

- 頁面 layout、navigation、表格、dialog、drawer、chart、表單與列表。
- 所有會被使用者直接操作的 React component。
- 需要 browser API 的 responsive 行為，例如 `matchMedia`，只能放在 client effect 或專用 hook 中。

具體做法：

- 先定義「此功能必須支援的 viewport」，再決定斷點；不要追逐所有裝置型號。
- Tailwind 未自訂 `screens` 時，使用預設斷點：`sm` 640px、`md` 768px、`lg` 1024px、`xl` 1280px、`2xl` 1536px。
- 預設樣式服務小 viewport；用 `sm:`、`md:`、`lg:` 逐步增加空間與欄位。
- 表格、寬列表與圖表要有明確的 `min-width`、`overflow-x-auto` 或資料分組策略。
- Dialog、Popover、Sheet 等 overlay 要同時限制 `width`、`max-height` 與 scroll 行為。
- 需要讀取 viewport 時，用 `useEffect` / `matchMedia`，並保持 server render 與第一次 client render 一致，避免 hydration mismatch。

### 為什麼重要 / Why This Matters

- **避免實際故障**：內容溢出、按鈕被遮住、表格被裁切，都是使用者可見的 bug。
- **降低維護成本**：用斷點與容器約束解決 layout 問題，比在各頁面散落特例更可維護。
- **保護 Next.js hydration**：render 階段讀取 `window`、`localStorage` 或時間值，會讓 server HTML 與 client 首次 render 不一致。

### Linus 哲學 / Linus Philosophy

> "Talk is cheap. Show me the code."

Responsive layout does not rest on verbal assurances. A good change should explain which viewport problem it solves through clear CSS constraints, a small number of breakpoints, and actual screenshots or manual verification.

- **Good Taste**: Use fluid layout, sensible breakpoints, and overflow boundaries to eliminate special cases.
- **Never break userspace**: Existing desktop flows must not break when adding mobile or large-screen support.
- **Pragmatism**: Support only the viewports that are genuinely needed; do not pile up classes for rare screen sizes.
- **Simplicity**: Prefer CSS and Tailwind utilities; do not reimplement a layout engine in JavaScript.

### 檢查清單 / Checklist

- [ ] 是否說清楚本次 UI 變更支援哪些 viewport？至少檢查一個窄 viewport、一個常見筆電 viewport、一個桌機 viewport。
- [ ] 內容是否能垂直捲動完成操作，而不是依賴水平拖拉才能看到主要功能？
- [ ] 表格、chart、長文字、長檔名或長數字是否不會撐破容器？
- [ ] Dialog、Popover、Sheet 是否有 `max-height` 與內部 scroll，且 close/action button 不會被擠出畫面？
- [ ] 是否避免在 render 階段讀取 `window`、`document`、`localStorage`、`Date()` 或 `Math.random()`？
- [ ] Tailwind responsive class 是否從無前綴樣式開始，再往 `sm:` / `md:` / `lg:` 增加能力？

### 範例 / Examples

**不推薦 ❌ - 用固定寬度假裝穩定**:

```tsx
function FixedWidthPanel() {
  return (
    <section className="w-[1280px]">
      <h2 className="text-2xl font-semibold">Report</h2>
      <p className="whitespace-nowrap">
        A very long generated label that can push actions out of the viewport.
      </p>
    </section>
  )
}
```

**推薦 ✅ - 讓容器有邊界，讓文字能收斂**:

```tsx
function ResponsivePanel() {
  return (
    <section className="w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl font-semibold sm:text-2xl">Report</h2>
      <p className="max-w-prose break-words text-sm text-muted-foreground">
        A very long generated label can wrap without pushing actions out of the
        viewport.
      </p>
    </section>
  )
}
```

**推薦 ✅ - 寬表格保留資料完整性，容器負責捲動**:

```tsx
interface AuditRow {
  id: string
  actor: string
  action: string
  createdAt: string
  status: string
}

function AuditTable({ rows }: { rows: AuditRow[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-border">
      <table className="min-w-[720px] w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="w-[180px] px-3 py-2 text-left">Actor</th>
            <th className="min-w-[240px] px-3 py-2 text-left">Action</th>
            <th className="w-[180px] px-3 py-2 text-left">Created At</th>
            <th className="w-[120px] px-3 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              <td className="px-3 py-2">{row.actor}</td>
              <td className="px-3 py-2 break-words">{row.action}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.createdAt}</td>
              <td className="px-3 py-2">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**推薦 ✅ - Dialog 使用 CSS 約束，不用 JS 計算寬度**:

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/atoms/dialog'

function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Update the options for this workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">{/* form fields */}</div>
      </DialogContent>
    </Dialog>
  )
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 把 `sm:` 當成手機樣式**

```tsx
// ❌ `sm:` 是 640px 以上，不是小螢幕專用。
<div className="sm:grid sm:grid-cols-2" />

// ✅ 無前綴樣式先服務窄 viewport，再往大 viewport 加能力。
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" />
```

**陷阱 2: render 階段讀取 browser-only API**

```tsx
// ❌ server 沒有 window；即使加 typeof window，也可能讓首次 render 不一致。
function Toolbar() {
  const compact = typeof window !== 'undefined' && window.innerWidth < 768

  return compact ? <CompactToolbar /> : <FullToolbar />
}

// ✅ 第一次 render 保持穩定，client mount 後才讀取 viewport。
import { useEffect, useState } from 'react'

function useIsNarrowViewport() {
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsNarrow(query.matches)

    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return isNarrow
}
```

**陷阱 3: 用 arbitrary width 堆出不可維護 layout**

```tsx
// ❌ 單一頁面的魔術數字很快會互相打架。
<aside className="w-[317px]" />
<main className="ml-[317px] w-[calc(100vw-317px)]" />

// ✅ 用 layout primitive 表達關係。
<div className="grid min-h-screen grid-cols-1 lg:grid-cols-[16rem_1fr]">
  <aside className="hidden border-r lg:block" />
  <main className="min-w-0 px-4 py-4 lg:px-6" />
</div>
```

### 參考現有實作 / Reference Implementation

可優先參考專案中的通用 UI primitive，而不是單一業務頁面：

- `apps/frontend/src/app/components/atoms/dialog.tsx` - Dialog primitive 的寬度、定位與 overlay 基礎。
- `apps/frontend/src/app/hooks/use-mobile.tsx` - browser-only viewport 判斷應放在 effect 中，不放在 render 階段。

### 自動化 / Automation

- **TypeScript**: `pnpm --filter frontend run type-check` 可抓到 props 型別、client/server 邊界部分錯誤。
- **ESLint**: `pnpm --filter frontend run lint` 可抓 React Hooks 與 Next.js 規則的一部分；目前 script 使用 `next lint`，Next.js 15 可執行但會提示未來移除，升級 Next.js 16 前應遷到 ESLint CLI。
- **Next Build**: `pnpm --filter frontend run build` 可抓 prerender、server/client 使用錯誤與部分 hydration 風險。
- **Manual Review**: 目前沒有既有視覺回歸、E2E 或 component testing 設定；響應式截圖與操作仍需人工或另行導入工具。
- **Git Hook**: `.husky/pre-commit` 會執行 type-check 與 staged lint/format。
- **Claude Hook**: `.claude/hooks/check-guidelines.sh` 是提醒腳本，不是 blocking check。

---

## 準則 33: 向後相容性 / Guideline 33: Backward Compatibility

### 說明 / Description

UI 的向後相容性是指：內部重構、資料格式調整、component props 變更或 route/search params 變更後，既有使用者流程與既有呼叫端仍能工作。新增能力通常安全；改名、刪除、改型別、改預設行為通常是破壞性變更。

UI backward compatibility means existing user workflows and callers continue to work after internal refactors, data shape changes, component prop changes, or route/search parameter changes. Additions are usually safe; renames, removals, type changes, and default behavior changes are usually breaking changes.

適用範圍：

- React component props、custom hook 回傳值、共用 helper function。
- API response/request shape、URL route、search params、form state。
- `localStorage`、cookie、feature flag、theme 或其他瀏覽器端保存資料。
- Next.js Server Component 傳給 Client Component 的可序列化 props。

具體做法：

- 新欄位先用 optional，舊欄位保留到呼叫端完成遷移。
- 改名時保留舊 prop/API，標記 `@deprecated`，內部轉接到新名稱。
- 修改 persisted data 時加版本與 migration，不要假設使用者沒有舊資料。
- 改 route 或 search params 時保留 redirect、alias 或 parser fallback。
- 對外 interface 變更要有驗證：type-check、build、手動 smoke test，必要時補測試工具。

### 為什麼重要 / Why This Matters

- **使用者流程不能被內部改名打斷**：UI 重構不應讓已存在的入口、資料或操作失效。
- **回滾與 bisect 更容易**：相容層讓變更可以分階段落地，錯誤也更容易定位。
- **降低跨團隊成本**：公開 props、API shape 和 URL 是契約，不是只有目前檔案知道的細節。

### Linus 哲學 / Linus Philosophy

> "We do not break userspace!"

In frontend terms, userspace is the screen flows, URLs, persisted data, API shapes, and shared component contracts that users already depend on. A theoretically prettier name is not a valid reason to break existing usage.

- **Good Taste**: Use adapters or migrations to contain special cases at boundaries, rather than making every caller patch the hole.
- **Never break userspace**: Make public contracts backward-compatible first, then remove; never smuggle breaking changes through.
- **Pragmatism**: Small migration steps are easier to review, test, and roll back than a single large change.
- **Simplicity**: Compatibility layers should be short, explicit, and have a removal condition; do not accumulate historical baggage indefinitely.

### 檢查清單 / Checklist

- [ ] 是否改到 component props、hook return、helper signature、API shape、route 或 search params？
- [ ] 舊呼叫端是否仍能 type-check 並保持原行為？
- [ ] 新欄位是否為 optional，或有清楚 default/migration？
- [ ] persisted data 是否有版本、parser fallback 或 migration？
- [ ] deprecation 是否寫在 interface JSDoc、PR 說明或 migration note 中？
- [ ] 是否用 type-check、build、lint 與手動 smoke test 驗證主要流程？

### 範例 / Examples

**不推薦 ❌ - 改名造成所有呼叫端破壞**:

```typescript
interface UserSummary {
  userId: string
  displayName: string
}

// ❌ 舊程式使用 id/name 時會直接壞掉。
function normalizeUser(input: UserSummary) {
  return {
    userId: input.userId,
    displayName: input.displayName,
  }
}
```

**推薦 ✅ - 新 shape 接受舊欄位，邊界集中轉換**:

```typescript
interface LegacyUserSummary {
  id: string
  name: string
}

interface UserSummary {
  userId: string
  displayName: string
}

type UserSummaryInput = LegacyUserSummary | UserSummary

function normalizeUser(input: UserSummaryInput): UserSummary {
  if ('userId' in input) {
    return input
  }

  return {
    userId: input.id,
    displayName: input.name,
  }
}
```

**推薦 ✅ - Props 改名先保留舊名稱**:

```tsx
interface SearchInputProps {
  value: string
  onValueChange?: (value: string) => void
  /** @deprecated Use onValueChange instead. */
  onChange?: (value: string) => void
}

function SearchInput({ value, onValueChange, onChange }: SearchInputProps) {
  const handleChange = (nextValue: string) => {
    onValueChange?.(nextValue)
    onChange?.(nextValue)
  }

  return (
    <input
      value={value}
      onChange={(event) => handleChange(event.target.value)}
    />
  )
}
```

**推薦 ✅ - persisted data 用版本與 parser fallback**:

```typescript
interface PreferencesV1 {
  theme: 'light' | 'dark'
}

interface PreferencesV2 {
  version: 2
  theme: 'light' | 'dark' | 'system'
  density: 'compact' | 'comfortable'
}

const defaultPreferences: PreferencesV2 = {
  version: 2,
  theme: 'system',
  density: 'comfortable',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parsePreferences(raw: string | null): PreferencesV2 {
  if (!raw) return defaultPreferences

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) return defaultPreferences

    if (parsed.version === 2) {
      return {
        version: 2,
        theme:
          parsed.theme === 'light' ||
          parsed.theme === 'dark' ||
          parsed.theme === 'system'
            ? parsed.theme
            : defaultPreferences.theme,
        density:
          parsed.density === 'compact' || parsed.density === 'comfortable'
            ? parsed.density
            : defaultPreferences.density,
      }
    }

    if (parsed.theme === 'light' || parsed.theme === 'dark') {
      const legacy: PreferencesV1 = { theme: parsed.theme }

      return {
        version: 2,
        theme: legacy.theme,
        density: defaultPreferences.density,
      }
    }

    return defaultPreferences
  } catch {
    return defaultPreferences
  }
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: TypeScript 沒報錯就以為相容**

```typescript
// ❌ 型別可編譯，但語意變了：空字串以前代表「不篩選」，現在代表「查無資料」。
interface FilterState {
  keyword: string
}

// ✅ 用明確狀態表達新語意，舊值仍可被轉換。
interface FilterState {
  keyword: string | null
}

function normalizeKeyword(keyword: string | null | undefined) {
  return keyword?.trim() ? keyword.trim() : null
}
```

**陷阱 2: 修改 React key 造成 state 被重置**

```tsx
// ❌ key 從穩定 id 改成排序後 index，重新排序會讓 row state 對錯資料。
{
  rows.map((row, index) => <EditableRow key={index} row={row} />)
}

// ✅ key 使用資料本身的穩定 identity。
{
  rows.map((row) => <EditableRow key={row.id} row={row} />)
}
```

**陷阱 3: Server Component 傳不可序列化 props 給 Client Component**

```tsx
// ❌ Client boundary 的 props 需要可序列化；function 不能從 Server Component 直接傳入。
<ClientToolbar onRefresh={() => refreshData()} />

// ✅ 傳可序列化資料；互動行為留在 Client Component 內部。
<ClientToolbar refreshEndpoint="/api/refresh" />
```

### 參考現有實作 / Reference Implementation

可優先檢查專案中的共用邊界，而不是單一業務頁面：

- `apps/frontend/src/app/components/atoms/index.tsx` - component export 是呼叫端依賴的公開入口，移除或改名要視為破壞性變更。
- `apps/frontend/src/app/types/` - 共用 TypeScript interface 是 API 與 UI 的資料契約，調整時應考慮 optional 欄位與轉換層。
- `apps/frontend/src/app/lib/` - normalizer、parser、adapter 適合放在邊界層，避免呼叫端到處處理舊資料。

### 自動化 / Automation

- **TypeScript**: `pnpm --filter frontend run type-check` 可抓公開型別與 props 變更造成的編譯錯誤。
- **ESLint**: `pnpm --filter frontend run lint` 可抓 React Hooks、Next.js 與部分可維護性問題；目前 script 使用 `next lint`，Next.js 15 可執行但會提示未來移除，升級 Next.js 16 前應遷到 ESLint CLI。
- **Next Build**: `pnpm --filter frontend run build` 可抓 prerender、server/client boundary 與 route build 風險。
- **Git Hook**: `.husky/pre-commit` 會執行 type-check 與 staged lint/format。
- **Manual Review**: API 相容性、URL 相容性、persisted data migration 與主要使用者流程目前仍需人工 review；沒有既有 contract testing 或 E2E testing 設定。

---

## 總結 / Summary

UI 可靠性的 2 條準則核心思想：

1. **準則 32**: 響應式布局要靠明確 viewport、CSS 約束與 hydration-safe 實作，不靠裝置特例。
2. **準則 33**: 向後相容性要求公開契約分階段演進，不讓內部重構破壞既有使用方式。

**Linus 哲學 / Linus Philosophy in UI Reliability**:

- **Never break userspace** → 準則 33（公開 props、URL、API shape 與保存資料都算使用者依賴）
- **Pragmatism** → 準則 32（支援真實 viewport，而不是追逐所有裝置）
- **Simplicity** → 準則 32、33（用 CSS、adapter、migration 解決邊界問題，不把特殊情況散到每個呼叫端）

**向後相容性的基本順序**:

1. **新增 / Addition**：新增 optional 欄位或新 prop。
2. **轉接 / Adapter**：舊入口保留，內部轉到新實作。
3. **標記棄用 / Deprecation**：用 JSDoc、PR 說明或 migration note 告知替代方案。
4. **移除 / Removal**：只在呼叫端完成遷移、驗證完成，且有清楚版本或發布計畫時移除。

---

## 相關文檔 / Related Documents

- [AGENTS.md](../../AGENTS.md) - 專案工程原則與 Linus 風格開發哲學。
- [README.md](README.md) - 準則總覽。
- [template.md](template.md) - 準則文件格式模板。
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Tailwind 預設斷點與 mobile-first responsive utilities。
- [Next.js Hydration Error](https://nextjs.org/docs/messages/react-hydration-error) - hydration mismatch 常見原因與修正方向。
- [Next.js `use client`](https://nextjs.org/docs/app/api-reference/directives/use-client) - Client Component 邊界與可序列化 props。

---

**最後更新 / Last Updated**: 2026-05-15  
**維護者 / Maintainer**: Frontend Team
