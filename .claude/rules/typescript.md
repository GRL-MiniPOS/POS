---
paths:
  [
    'apps/frontend/src/**/*.ts',
    'apps/frontend/src/**/*.tsx',
    'apps/frontend/*.config.ts',
    'apps/frontend/tsconfig.json',
  ]
---

# TypeScript (準則 TS-1 – TS-3, TS-5)

TypeScript 補充準則：讓型別反映真實資料邊界，而不是用型別語法包裝猜測。

TypeScript supplemental guidelines. The focus is making types describe real data boundaries instead of wrapping guesses in type syntax.

---

## 準則 TS-1: 標注邊界，推論其餘 / Guideline TS-1: Annotate Boundaries, Infer the Rest

### 說明 / Description

跨檔案使用的資料模型、helper 回傳值必須有明確型別。物件契約用 `interface`；union、tuple、primitive alias、function alias 用 `type`。區域變數與簡單 callback 讓推論處理。

Object contracts crossing file boundaries need explicit types: shared models, API adapter output, exported helpers. Use `interface` for objects; use `type` for unions, tuples, primitive aliases, and function aliases. Let inference handle local variables and simple callbacks.

### 為什麼重要 / Why This Matters

- **可審查**：邊界清楚，reviewer 不必追呼叫鏈。
- **低噪音**：只標注重要邊界，讓重要型別更醒目。
- **可重構**：公開契約固定，內部實作才有空間改。

### Linus 哲學 / Linus Philosophy

> The goal is not to make every line clever, but to make the data model simple enough that mistakes become obvious.

Annotate the real boundaries; let the compiler handle the rest. Filling every local variable with explicit types is noise, not safety.

### 檢查清單 / Checklist

- [ ] 跨檔案的資料模型與 helper 回傳值有明確型別。
- [ ] 物件契約用 `interface`，union/tuple/alias 用 `type`。
- [ ] 不新增 `any`；真正未知的資料用 `unknown` 並在使用前縮小型別。
- [ ] 匯出的 helper function 有明確 return type。

### 範例 / Examples

**不推薦 ❌ - 用 `any` 讓邊界消失**:

```typescript
export function getDisplayName(user: any) {
  return user.profile.name
}
```

**推薦 ✅ - 邊界清楚，區域推論**:

```typescript
interface UserProfile { name: string }
interface User { profile: UserProfile }

export function getDisplayName(user: User): string {
  return user.profile.name
}

// 區域變數：推論已足夠
const total = price * quantity
```

**推薦 ✅ - union 與 tuple 用 `type`**:

```typescript
type RequestStatus = 'idle' | 'loading' | 'success' | 'error'
type Coordinate = [x: number, y: number]
```

### 常見陷阱 / Common Pitfalls

**陷阱: 為省事把外部資料宣告成 `Record<string, any>`**

```typescript
// ❌ TypeScript 幫不上忙
const payload: Record<string, any> = await response.json()

// ✅ 先承認未知，再縮小
const payload: unknown = await response.json()
```

### 參考現有實作 / Reference Implementation

- `apps/frontend/src/app/types/chart.ts` - literal union 與 domain interface 分開表達。
- `apps/frontend/tailwind.config.ts` - `satisfies Config` 保留推論並檢查設定形狀。

### 自動化 / Automation

- **TypeScript**: `strict: true`、`noEmit: true`
- **ESLint**: `@typescript-eslint/no-explicit-any`
- **Git Hook**: 🤖 `.husky/pre-commit` 執行 type-check 與 staged lint/format
- **Verification**: `pnpm --filter frontend run type-check`

---

## 準則 TS-2: Runtime 邊界先縮小型別 / Guideline TS-2: Narrow Runtime Boundaries First

### 說明 / Description

TypeScript 型別只在編譯期存在。來自 `fetch().json()`、`localStorage`、URL params、表單或第三方 callback 的資料，在 runtime 仍然不可信。先以 `unknown` 接住，再用小而直接的型別守衛轉成內部型別。

TypeScript types exist at compile time only. Data from external sources is untrusted at runtime. Receive it as `unknown`, then convert through a small type guard.

API adapter 的整體設計請參考 [準則 29](06-collaboration.md)。

### 為什麼重要 / Why This Matters

- **避免假安全**：`as SomeType` 不會檢查 runtime 資料。
- **錯誤集中**：guard 失敗的位置就是資料契約破掉的位置。
- **核心保持乾淨**：內部程式碼不用到處防禦未知欄位。

### Linus 哲學 / Linus Philosophy

> Push special cases to the boundary; keep the core logic clean.

One explicit guard at the entry point is simpler and more reviewable than defensive checks scattered through the caller code.

### 檢查清單 / Checklist

- [ ] 外部資料以 `unknown` 接住，使用前有型別守衛或 adapter。
- [ ] 不用雙重 assertion（`as unknown as Target`）跳過編譯器。
- [ ] 不把 TypeScript type 當成 runtime validation。
- [ ] 只在邊界重複且成本明確時，才導入 schema validation 套件。

### 範例 / Examples

**不推薦 ❌ - 用 assertion 假裝資料正確**:

```typescript
const item = (await response.json()) as Item
renderItem(item.name)
```

**推薦 ✅ - 型別守衛縮小後才使用**:

```typescript
interface Item { id: string; name: string }

function isItem(value: unknown): value is Item {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return typeof r.id === 'string' && typeof r.name === 'string'
}

const payload: unknown = await response.json()
if (!isItem(payload)) throw new Error('Invalid item response')

renderItem(payload.name)
```

### 常見陷阱 / Common Pitfalls

**陷阱: 用 optional chaining 掩蓋資料契約錯誤**

```typescript
// ❌ 失敗時只得到 undefined，錯誤來源消失
const name = payload?.item?.name

// ✅ 先驗證，再使用
if (!isItemResponse(payload)) return { status: 'error' }
```

### 自動化 / Automation

- **TypeScript**: `strict` 阻擋部分未縮小的 `unknown` 使用。
- **Manual Review**: 檢查 `as Target` 是否只出現在已驗證的邊界。

---

## 準則 TS-3: 用型別表達互斥狀態 / Guideline TS-3: Model Exclusive States with Types

### 說明 / Description

互斥狀態用 discriminated union 表達，而不是用多個 boolean 組合。Boolean 可以同時為 true，製造未定義行為；discriminated union 讓不可能狀態在型別層級就不可表示。

Use discriminated unions for mutually exclusive states instead of multiple booleans. Booleans can be true simultaneously and create undefined state combinations.

### 為什麼重要 / Why This Matters

- **不可能狀態不可表示**：型別直接阻擋矛盾 state。
- **分支更完整**：`switch` 讓 reviewer 看出每個狀態如何處理。

### Linus 哲學 / Linus Philosophy

> Good data structures make control flow disappear.

Model state correctly and the downstream branches shrink on their own, along with the special cases.

### 檢查清單 / Checklist

- [ ] 互斥狀態使用 `status` 或 `type` 作為 discriminant。
- [ ] 每個狀態只帶該狀態需要的資料。
- [ ] 不用 `isLoading`、`isError`、`hasData` 同時描述同一組 async state。

### 範例 / Examples

**不推薦 ❌ - boolean state 可以互相矛盾**:

```typescript
interface AsyncState {
  isLoading: boolean
  isError: boolean
  data?: Item
}
```

**推薦 ✅ - discriminated union 讓狀態互斥**:

```typescript
type AsyncState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Item }
  | { status: 'error'; message: string }
```

**推薦 ✅ - `satisfies` 確保 map 覆蓋所有狀態**:

```typescript
const statusLabel = {
  idle: 'Ready',
  loading: 'Loading',
  success: 'Loaded',
  error: 'Failed',
} satisfies Record<AsyncState['status'], string>
```

### 常見陷阱 / Common Pitfalls

**陷阱: 使用 string 但不限制可用值**

```typescript
// ❌ 任何字串都能進來
let status: string = 'loading'

// ✅ 狀態集合清楚
type Status = 'idle' | 'loading' | 'success' | 'error'
let status: Status = 'loading'
```

### 自動化 / Automation

- **TypeScript**: 建議在 `switch` 搭配 `assertNever` 或 `satisfies never` 做 exhaustiveness check。
- **Manual Review**: 檢查 boolean state 組合是否能改成單一狀態模型。

---

## 準則 TS-5: 型別工具要服務資料關係 / Guideline TS-5: Type Tools Must Serve Data Relationships

### 說明 / Description

泛型、utility types 與 `satisfies` 只應解決可說明的資料關係。`import type` / `export type` 分清楚 runtime 與 compile-time import。不為「看起來進階」而新增型別技巧；不為尚未採用的套件預寫 module augmentation。

Use generics, utility types, and `satisfies` only to solve a clear data relationship. Separate runtime and compile-time imports with `import type` / `export type`. Do not add type machinery for decoration, and do not write module augmentation for packages not in use.

### 為什麼重要 / Why This Matters

- **避免過度抽象**：型別越複雜，review 成本越高。
- **保持真實**：規則只描述目前技術棧能驗證的做法。

### Linus 哲學 / Linus Philosophy

> Solve the real problem first; decide whether abstraction is warranted after.

Good type machinery eliminates duplication and special cases. Bad type machinery turns error messages into another problem.

### 檢查清單 / Checklist

- [ ] 泛型用來保留輸入與輸出之間的型別關係。
- [ ] `Pick`、`Omit`、`Partial` 只用在 derived type，不取代清楚的 domain model。
- [ ] `satisfies` 用於 config、lookup map、variant map 等需要保留 literal inference 的地方。
- [ ] type-only import/export 使用 `import type`、`export type`，避免混淆 runtime import。
- [ ] module augmentation 只在套件已採用且有實際 extension point 時新增。

### 範例 / Examples

**不推薦 ❌ - 泛型沒有保留任何關係**:

```typescript
function wrap<T>(value: string): { value: string } {
  return { value }
}
```

**推薦 ✅ - 泛型保留輸入與輸出關係**:

```typescript
function wrap<T>(value: T): { value: T } {
  return { value }
}
```

**推薦 ✅ - type-only import/export**:

```typescript
import type { User } from './types'
export type { User }
```

### 常見陷阱 / Common Pitfalls

**陷阱: 用 `Partial` 讓必要欄位消失**

```typescript
// ❌ 呼叫端不知道哪些欄位真的存在
function saveItem(item: Partial<Item>) {}

// ✅ 新增和更新使用不同契約
interface ItemUpdateInput { name?: string; price?: number }
function updateItem(id: string, input: ItemUpdateInput): void {}
```

### 參考現有實作 / Reference Implementation

- `apps/frontend/tailwind.config.ts` - `satisfies Config` 檢查 config 形狀。

### 自動化 / Automation

- **TypeScript**: `isolatedModules` 讓 type/value import 邊界更重要。
- **ESLint**: `@typescript-eslint` 捕捉部分不安全模式。
- **Manual Review**: 泛型和 utility types 是否真的降低重複或保留資料關係。

---

## 總結 / Summary

TypeScript 的 4 條補充準則核心思想：

1. **準則 TS-1**: 標注真正的邊界，推論處理細節。
2. **準則 TS-2**: Runtime 邊界用 `unknown` + guard，不用 assertion 假裝安全。
3. **準則 TS-3**: discriminated union 表達互斥狀態，消除 boolean 矛盾組合。
4. **準則 TS-5**: 泛型與 `satisfies` 只服務真實資料關係。

**Linus 哲學在 TypeScript 中的體現**:

- **Good Taste** → TS-3（讓不可能狀態不可表示）
- **Pragmatism** → TS-1、TS-5（只在真邊界加型別，不為語法本身加戲）
- **Simplicity** → TS-2（邊界集中處理，核心保持乾淨）

---

## 術語備註 / Terminology Notes

本文使用台灣前端社群常見譯法：`型別`、`型別推論`、`型別別名`、`聯合型別`、`泛型`、`型別守衛`、`型別收窄`。必要時保留英文原詞，避免硬翻造成溝通成本。

---

## 相關文檔 / Related Documents

- [AGENTS.md](../../AGENTS.md) - Linus Torvalds 風格工程原則。
- [README.md](README.md) - 準則總覽。
- [06-collaboration.md](06-collaboration.md) - API adapter 與型別同步（準則 29）。
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) - 官方 TypeScript 基礎型別文件。
- [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig/) - 官方 TSConfig 參考。

---

**最後更新 / Last Updated**: 2026-05-14  
**維護者 / Maintainer**: Frontend Team
