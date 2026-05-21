---
paths: ['**/*.md', 'apps/frontend/src/**/*.ts', 'apps/frontend/src/**/*.tsx']
---

# 協作與溝通 / Collaboration & Communication (準則 29-31)

本文檔涵蓋 API 契約、Pull Request Review 與 Commit message 規範。目標不是增加流程，而是讓每次變更都能被快速理解、可靠驗證、必要時容易回溯。

This document covers API contracts, Pull Request review, and commit message standards. The goal is not more process, but changes that are easy to understand, verify, and trace.

---

## 準則 29: API 契約與型別同步 / Guideline 29: API Contract & Type Sync

### 說明 / Description

前端與 API provider 之間必須有清楚契約。Request、response、error shape、nullable 欄位、分頁、排序、狀態碼與權限行為，都要能從文件或型別看出來。前端 TypeScript 型別不能靠猜，也不能用 `any` 把 API 變更藏到執行期才失敗。

Frontend code and API providers must have a clear contract. Request, response, error shape, nullable fields, pagination, sorting, status codes, and authorization behavior must be visible through documentation or types. Frontend TypeScript types must not be guessed or hidden behind `any`.

適用範圍：

- 新增或修改 API endpoint。
- 修改 response 欄位、命名、nullable 規則或錯誤格式。
- 前端新增 API adapter、client-side data fetcher 或資料轉換層。
- 串接既有或外部 API，並需要同步 OpenAPI、Swagger、API 文件或團隊約定。

### 為什麼重要 / Why This Matters

- **避免執行期錯誤**：契約不清楚時，欄位改名、`null`、錯誤格式變更會直接進到 UI。
- **降低溝通成本**：reviewer 不需要靠聊天記錄還原 API 行為。
- **維持資料邊界**：API response 命名與前端命名可以不同，但轉換必須集中在 adapter。
- **方便回溯**：API 破壞性變更要能從 PR、commit 與文件追到原因。

### Linus 哲學 / Linus Philosophy

> "Bad programmers worry about the code. Good programmers worry about data structures."

API contract 是跨系統的資料結構。先把資料形狀講清楚，實作才不需要用一堆特殊情況補洞。Good taste 在這裡不是多加工具，而是讓資料邊界簡單、明確、可檢查。

### 檢查清單 / Checklist

- [ ] API 文件是否更新，且和實際 request/response 一致？
- [ ] TypeScript interface 是否明確描述 nullable、optional、enum 與錯誤格式？
- [ ] API response 的 `snake_case` 與前端 `camelCase` 是否只在 adapter 邊界轉換？
- [ ] 是否避免在 API 層、shared type 或 UI props 使用 `any`？
- [ ] 破壞性變更是否寫在 PR 與 commit body，並說明遷移方式？
- [ ] 若目前沒有自動產生型別，是否至少用人工 review 比對 API 文件與前端型別？

### 範例 / Examples

**不推薦 - 前端直接相信未知 response**:

```typescript
export async function getUser(id: string) {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

const user = await getUser(userId)
console.log(user.created_at.toLocaleDateString())
```

問題是呼叫端不知道 `created_at` 是字串、`Date`、`null`，也不知道失敗時 response 長什麼樣子。

**推薦 - 在 API adapter 定義契約與轉換**:

```typescript
interface UserResponse {
  id: string
  display_name: string
  created_at: string
  deleted_at: string | null
}

export interface User {
  id: string
  displayName: string
  createdAt: string
  deletedAt: string | null
}

function mapUser(response: UserResponse): User {
  return {
    id: response.id,
    displayName: response.display_name,
    createdAt: response.created_at,
    deletedAt: response.deleted_at,
  }
}

export async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to load user: ${response.status}`)
  }

  const data = (await response.json()) as UserResponse
  return mapUser(data)
}
```

**推薦 - 明確表示 API 錯誤格式**:

```typescript
interface ApiErrorResponse {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorResponse
  ) {
    super(body.message)
  }
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 欄位命名到處轉換**

```typescript
// 不推薦：UI component 知道 API response 欄位命名
function UserName({ user }: { user: UserResponse }) {
  return <span>{user.display_name}</span>
}

// 推薦：API response 格式留在 adapter，UI 使用前端語意
function UserName({ user }: { user: User }) {
  return <span>{user.displayName}</span>
}
```

**陷阱 2: 用 optional 逃避 nullable 契約**

```typescript
// 不推薦：不知道欄位是不存在，還是明確為 null
interface User {
  deletedAt?: string
}

// 推薦：契約說清楚
interface User {
  deletedAt: string | null
}
```

**陷阱 3: API 文件更新但前端型別沒有同步**

```markdown
不推薦：

- API provider 改 response
- 前端 PR 之後才發現欄位壞掉

推薦：

- 同一個 PR 或同一組 PR 說清楚 API 變更
- 文件、API 契約、前端型別一起 review
- 不能同時上線時，先提供向後相容欄位
```

### 參考現有實作 / Reference Implementation

專案中可參考的穩定位置：

- `apps/frontend/src/app/types/` - 前端共享型別放置位置。
- `apps/frontend/src/app/lib/` - 前端工具與資料轉換邏輯放置位置。

### 自動化 / Automation

- **API 文件提醒**: 若串接的 API 有 OpenAPI / Swagger / 文件約定，PR 必須人工比對契約是否同步；目前不要把它寫成 blocking automation。
- **TypeScript**: `pnpm --filter frontend run type-check` 可檢查前端型別使用。
- **ESLint**: `pnpm --filter frontend run lint` 可抓出部分 unsafe 或未使用程式碼。
- **Git Hook**: Husky pre-commit 會執行前端 type-check 與 lint-staged。
- **Claude Hook**: `.claude/hooks/check-guidelines.sh` 是提醒腳本，不是完整 blocking check。

---

## 準則 30: Code Review 規範 / Guideline 30: Code Review Standards

### 說明 / Description

Pull Request 要讓 reviewer 快速回答四件事：這次解決什麼問題、為什麼用這個做法、如何驗證、還剩什麼風險。Review 的重點是正確性、資料流、可維護性與使用者影響，不是把個人口味包裝成規則。

Pull Requests should help reviewers answer four questions quickly: what problem is solved, why this shape, how it was verified, and what risk remains. Review should focus on correctness, data flow, maintainability, and user impact, not personal taste disguised as rules.

適用範圍：

- 所有功能、修 bug、重構、文件與設定變更。
- UI 變更、API contract 變更、跨模組資料流變更。
- 需要其他工程師理解、驗證或接手維護的修改。

### 為什麼重要 / Why This Matters

- **Review 才有效率**：好的 PR 描述會把 reviewer 的時間花在風險上，而不是猜背景。
- **降低合併風險**：小而完整的 PR 比大型混合 PR 更容易驗證。
- **保留決策脈絡**：半年後看 PR，仍能理解當時為什麼這樣改。
- **避免形式主義**：Checklist 只檢查真風險，不替不存在的工具背書。

### Linus 哲學 / Linus Philosophy

> "Talk is cheap. Show me the code."

PR 描述不是長篇作文，而是讓 reviewer 能對照程式碼與驗證結果。Linus 風格的 review 是直接、技術、可行動：指出哪裡會壞、為什麼會壞、最小修法是什麼。

### 檢查清單 / Checklist

- [ ] PR 是否只解一個明確問題，沒有混入無關重構或格式化？
- [ ] 描述是否包含 Problem、Solution、Verification、Risk？
- [ ] UI 變更是否附截圖或影片，並說明測試 viewport 或瀏覽器？
- [ ] API contract、資料模型或公開 interface 變更是否標出破壞性影響？
- [ ] 是否執行與風險相符的 type-check、lint、build 或測試？
- [ ] 大型 PR 是否提供 review 順序，讓 reviewer 先看資料結構與邊界？

### 範例 / Examples

**不推薦 - 空泛 PR 描述**:

```markdown
# update page

改一些 UI 和 bug。
```

這種描述沒有問題、解法、驗證，也看不出 reviewer 該先看哪裡。

**推薦 - 可 review 的 PR 描述**:

```markdown
## Problem

使用者在資料列表快速切換篩選條件時，畫面可能顯示前一次請求的結果。

## Solution

- 將查詢參數整理成單一 `queryState`
- 請求完成前比對 request key，忽略過期 response
- 保留既有 pagination UI，不改公開 props

## Verification

- `pnpm --filter frontend run type-check`
- `pnpm --filter frontend run lint`
- 手動測試：Chrome，快速切換篩選條件與頁碼，確認列表不回跳

## Risk

- 目前只處理列表頁查詢競態；其他頁面若有相同問題，需要另開 PR。
```

**推薦 - 大型 PR 提供 review 順序**:

```markdown
## Review Order

1. `apps/frontend/src/app/types/`：先確認資料契約。
2. `apps/frontend/src/app/lib/`：再看 adapter 與資料轉換。
3. `apps/frontend/src/app/components/`：最後看 UI 組合與互動。

## Notes

本 PR 不調整視覺樣式，只處理資料流與錯誤狀態。
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 一個 PR 做太多事**

```markdown
不推薦：

- 新增功能
- 順手改命名
- 重排格式
- 升級套件
- 修另一個 bug

推薦：

- 功能 PR 只放功能所需修改
- 無關重構獨立 PR
- 套件升級獨立 PR，並附驗證結果
```

**陷阱 2: Review 只看語法，不看資料邊界**

```markdown
不推薦：

- 只留言排版、命名偏好
- 忽略 API response 是否可能為 null
- 忽略錯誤狀態與重試行為

推薦：

- 先看資料來源與狀態流向
- 再看錯誤、loading、empty state
- 最後才看可讀性與命名細節
```

**陷阱 3: 截圖存在，但不能證明行為**

```markdown
不推薦：

- 只貼一張完成畫面

推薦：

- 截圖或影片涵蓋 loading、success、empty、error
- UI 變更標明桌機、筆電或 mobile viewport
- 互動流程用文字補充，避免 reviewer 猜測
```

### 參考現有實作 / Reference Implementation

專案中可參考的穩定位置：

- `AGENTS.md` - 工程原則、reviewable patch 與交付前檢查。
- `.claude/rules/README.md` - 準則總覽、維護方式與自動化層級。
- `apps/frontend/CLAUDE.md` - 前端架構與開發規範。

### 自動化 / Automation

- **TypeScript**: `pnpm --filter frontend run type-check`。
- **ESLint**: `pnpm --filter frontend run lint`。
- **Git Hook**: `.husky/pre-commit` 會在 commit 前執行 type-check 與 lint-staged。
- **lint-staged**: staged `js/jsx/ts/tsx` 會執行 ESLint fix 與 Prettier write。

---

## 準則 31: Commit Message 規範 / Guideline 31: Commit Message Standards

### 說明 / Description

Commit message 遵循 Conventional Commits。每個 commit 應描述一個邏輯變更，讓 reviewer 能從歷史看出問題、解法與影響範圍。

Commit messages follow Conventional Commits. Each commit should describe one logical change so reviewers can understand the problem, solution, and impact from history.

基本格式：

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 為什麼重要 / Why This Matters

- **歷史可讀**：reviewer 和維護者能快速知道每個 commit 的意圖。
- **容易 bisect**：一個 commit 一個邏輯變更，出問題時比較容易定位。
- **支援自動化**：commitlint 可阻擋格式錯誤，release 工具可基於類型整理 changelog。
- **降低溝通成本**：commit body 可以保存問題、解法與破壞性變更。

### Linus 哲學 / Linus Philosophy

> "Good taste is about eliminating special cases."

這個觀點放在 commit 也成立：一個 commit 如果需要很多層解釋，通常代表它做太多事。把變更切小，commit message 才能短、準、可回溯。

### 檢查清單 / Checklist

- [ ] Commit 是否只包含一個邏輯變更？
- [ ] Message 是否符合 `<type>(<scope>): <description>`？
- [ ] `type` 是否使用 commitlint config 支援的類型？
- [ ] `scope` 是否描述受影響區域，而不是塞進冗長句子？
- [ ] 破壞性變更是否使用 `!` 或 `BREAKING CHANGE:` footer？
- [ ] 需要背景時，是否在 commit body 說明問題、解法與驗證？

### 範例 / Examples

**推薦 - 清楚的 Commit Message**:

```bash
feat(auth): add password reset flow
fix(table): prevent duplicate fetch on page change
docs(rules): update collaboration guidelines
refactor(api): isolate response mapping
test(user): cover empty state rendering
chore(deps): update frontend lint dependencies
```

**推薦 - 有 body 的 Commit Message**:

```bash
fix(table): ignore stale list responses

快速切換篩選條件時，較慢完成的舊請求可能覆蓋最新結果。
此變更加入 request key 比對，只接受目前查詢條件對應的 response。

Verification:
- pnpm --filter frontend run type-check
- pnpm --filter frontend run lint
```

**推薦 - 破壞性變更**:

```bash
feat(api)!: rename user display fields

BREAKING CHANGE: `display_name` is mapped to `displayName` at the frontend adapter boundary.
```

**不推薦 - 無法回溯的 Commit Message**:

```bash
update
fix bug
feat: add stuff
fix: final
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 用 `chore` 藏功能變更**

```bash
# 不推薦
chore: update user page

# 推薦
feat(user): add profile completion banner
```

**陷阱 2: 一個 commit 混多種變更**

```bash
# 不推薦
feat(user): add form and fix table pagination and update docs

# 推薦
feat(user): add profile form
fix(table): correct pagination reset
docs(readme): update setup notes
```

**陷阱 3: scope 寫成句子**

```bash
# 不推薦
fix(the table page when users click next): prevent duplicate fetch

# 推薦
fix(table): prevent duplicate fetch on page change
```

### 參考現有實作 / Reference Implementation

專案中可參考的穩定位置：

- `commitlint.config.js` - 使用 `@commitlint/config-conventional`。
- `.husky/commit-msg` - commit-msg hook 會執行 commitlint。
- `package.json` - `npm run commit` 使用 Commitizen 產生 commit message。

### 自動化 / Automation

- **Commitlint**: 檢查 commit message 是否符合 Conventional Commits。
- **Husky**: `.husky/commit-msg` 在 commit 時執行 commitlint。
- **Commitizen**: `npm run commit` 提供互動式 commit message 流程。
- **Standard Version**: 專案已安裝，可用於依 commit 歷史產生版本與 changelog；實際 release 流程需另行定義。
- **Claude Skill**: `commit-generator`。

---

## 總結 / Summary

協作與溝通的 3 條準則核心思想：

1. **準則 29**: API contract 是跨系統資料結構，文件與型別要同步。
2. **準則 30**: Pull Request 要小、清楚、可驗證，讓 review 聚焦真風險。
3. **準則 31**: Commit message 使用 Conventional Commits，讓歷史可讀、可追、可自動化。

**Linus 哲學在協作與溝通中的體現 / Linus Philosophy in Collaboration & Communication**:

- **Data structures first** → 準則 29（先穩住 API contract，再談實作）。
- **Show the code** → 準則 30（PR 描述必須能對照程式碼與驗證結果）。
- **Small logical changes** → 準則 31（一個 commit 一個邏輯變更）。

---

## 相關文檔 / Related Documents

- [AGENTS.md](../../AGENTS.md) - 專案工程原則與 Linus 風格開發哲學。
- [README.md](README.md) - 準則總覽。
- [template.md](template.md) - 準則文件格式模板。
- [Conventional Commits](https://www.conventionalcommits.org/) - Conventional Commits 官方規範。
- [commitlint Local Setup](https://commitlint.js.org/guides/local-setup) - commitlint 與 Husky commit-msg hook 設定。

---

**最後更新 / Last Updated**: 2026-05-16  
**維護者 / Maintainer**: Frontend Team
