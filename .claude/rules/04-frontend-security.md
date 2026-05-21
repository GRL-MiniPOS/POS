---
paths:
  [
    'apps/frontend/src/**/*.tsx',
    'apps/frontend/src/**/*.ts',
    'apps/frontend/.eslintrc.json',
    'apps/frontend/next.config.ts',
    'apps/frontend/package.json',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
  ]
---

# 前端安全 / Frontend Security (準則 21-25)

本文檔涵蓋 React / Next.js / TypeScript / pnpm 前端的安全準則。核心目標是把瀏覽器、server/API 的責任切清楚：瀏覽器裡的程式碼可以改善 UX，但不能成為安全來源。

This document covers security guidelines for React / Next.js / TypeScript / pnpm frontends. The core goal is to make trust boundaries explicit: browser code can improve UX, but it cannot be the source of security truth.

---

## 準則 21: 跨站腳本攻擊（XSS）防護 / Guideline 21: XSS Protection

### 說明 / Description

預設把 API 回傳、URL 參數、使用者輸入、CMS 內容和第三方資料都視為不可信資料。React JSX 的文字插值會自動轉義，應優先渲染純文字。避免 `dangerouslySetInnerHTML`、`innerHTML`、`outerHTML`、`eval()` 和 `new Function()`。

若真的需要渲染 HTML，需求必須能被 review：集中在一個邊界做清理，限制允許的 HTML tag / attribute，並在同一個變更中加入或指定已核准的 sanitizer。不要把 HTML 清理邏輯散在多個 component。

Treat API responses, URL params, user input, CMS content, and third-party data as untrusted. React JSX text interpolation escapes by default, so render plain text first. Avoid `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `eval()`, and `new Function()`.

If rendering HTML is truly required, make the requirement reviewable: sanitize at one boundary, restrict allowed tags and attributes, and add or identify the approved sanitizer in the same change. Do not spread HTML sanitization across many components.

### 為什麼重要 / Why This Matters

- **Session 風險**：XSS 可以冒用使用者在站內操作；即使 token 放在 `HttpOnly` cookie，也不是免疫。
- **簡單預設**：JSX 文字渲染已經是安全預設，不需要額外抽象。
- **可審查性**：HTML 例外集中在一處，reviewer 才能看懂允許範圍與風險。

### Linus 哲學 / Linus Philosophy

> "Prefer clear invariants over clever control flow."

The invariant here is simple: untrusted data may only be rendered as plain text by default. HTML rendering is an exception, and exceptions must be centralized and verifiable.

### 檢查清單 / Checklist

- [ ] 是否優先用 JSX 文字插值渲染不可信資料？
- [ ] 是否避免直接把不可信資料傳給 `dangerouslySetInnerHTML`？
- [ ] 若必須渲染 HTML，是否集中清理並限制允許的 tag / attribute？
- [ ] 是否避免 `eval()`、`new Function()`、`innerHTML`、`outerHTML`？
- [ ] URL、redirect、`href`、`src` 是否限制 protocol、origin，或使用允許清單（allowlist；常見說法是白名單）？

### 範例 / Examples

**不推薦 ❌ - 直接渲染不可信 HTML**:

```tsx
type CommentProps = {
  html: string
}

export function Comment({ html }: CommentProps) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

**推薦 ✅ - 預設渲染純文字**:

```tsx
type CommentProps = {
  text: string
}

export function Comment({ text }: CommentProps) {
  return <div>{text}</div>
}
```

**推薦 ✅ - 必須渲染 HTML 時集中處理**:

下例的 `approvedHtmlSanitizer` 代表已完成審查的 sanitizer 封裝。若專案尚未導入 sanitizer，應先完成套件評估與允許清單設計，不要手刻 HTML parser。

```tsx
type SafeHtmlProps = {
  html: string
}

function sanitizeRichTextHtml(html: string): string {
  return approvedHtmlSanitizer(html, {
    allowedTags: ['p', 'strong', 'em', 'a'],
    allowedAttributes: {
      a: ['href', 'rel', 'target'],
    },
  })
}

export function SafeHtml({ html }: SafeHtmlProps) {
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(html) }} />
  )
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 開放重新導向（open redirect）**

```typescript
// ❌ URL 參數直接用於跳轉
const next = searchParams.get('next')
window.location.href = next ?? '/'

// ✅ 只允許同 origin（同來源）的相對路徑
function getSafeInternalPath(value: string | null): string {
  if (!value) return '/'

  try {
    const url = new URL(value, window.location.origin)
    if (url.origin !== window.location.origin) return '/'

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/'
  }
}

window.location.href = getSafeInternalPath(searchParams.get('next'))
```

**陷阱 2: 用字串組出可執行邏輯**

```typescript
// ❌ 任意字串都可能變成可執行程式碼
const handler = new Function(userInput)
handler()

// ✅ 用明確分支處理允許的行為
const allowedActions = {
  close: () => closeDialog(),
  submit: () => submitForm(),
}

if (actionName === 'close' || actionName === 'submit') {
  allowedActions[actionName]()
}
```

### 參考現有實作 / Reference Implementation

通用檢查位置：

- `apps/frontend/src/app/**/*.tsx` - component 應優先使用 JSX 文字插值。
- `apps/frontend/src/app/**/*.ts` - URL、redirect、資料轉換邊界應集中驗證。
- `apps/frontend/package.json` 目前未列出已核准的 HTML sanitizer；若新增 HTML 渲染需求，必須在同一個變更中說明 sanitizer 與允許範圍。

### 自動化 / Automation

- **ESLint**: `next/core-web-vitals`、`next/typescript` 可檢查 React / Next.js 基礎問題；XSS 仍需人工 review。
- **Manual Review**: 搜尋 `dangerouslySetInnerHTML`、`innerHTML`、`outerHTML`、`eval(`、`new Function`。
- **Git Hook**: ℹ️ 目前 hook 只做 type-check、staged lint/format 與 commitlint，未阻擋所有 XSS 風險。
- **Claude Hook**: ℹ️ `check-guidelines.sh` 是提醒腳本，不是完整安全掃描。

---

## 準則 22: 輸入驗證 / Guideline 22: Input Validation

### 說明 / Description

前端驗證只負責 UX：即時提示、disabled button、基本格式檢查。真正的安全驗證必須在後端、Next.js Route Handler、Server Action，或任何接收資料的 server/API 邊界重做。TypeScript 型別只是編譯期輔助，不是 runtime（執行期）驗證。

Client-side validation is for UX only: instant feedback, disabled buttons, and basic format checks. Security validation must happen on the backend, Next.js Route Handler, Server Action, or any service boundary that receives data. TypeScript types help at compile time; they are not runtime validation.

### 為什麼重要 / Why This Matters

- **可繞過性**：瀏覽器裡的程式碼可被開發者工具、腳本或直接 API 呼叫繞過。
- **資料完整性**：可信任的 server/API 邊界才有權決定金額、權限、狀態轉換與資料約束。
- **錯誤可診斷**：前後端邊界清楚，錯誤來源才容易定位。

### Linus 哲學 / Linus Philosophy

> "Design the data model and boundaries first."

Validation is not a form decoration — it is a data boundary. The frontend can provide early feedback, but security rules must be enforced again at the server/API boundary.

### 檢查清單 / Checklist

- [ ] 前端驗證是否只被描述為 UX，不被當成安全機制？
- [ ] 後端或 server/API 邊界是否重新驗證資料型別、範圍、格式與權限？
- [ ] 是否避免信任 hidden input、disabled field、client state 或 query string？
- [ ] 金額、角色、權限、配額、狀態轉換是否由 server/API 邊界計算或驗證？
- [ ] 後端驗證錯誤是否有清楚且可顯示的錯誤碼或訊息？

### 範例 / Examples

**不推薦 ❌ - 只靠前端 disable button**:

```tsx
function EmailForm() {
  const [email, setEmail] = useState('')
  const isValid = email.includes('@')

  return (
    <form onSubmit={() => submitEmail({ email })}>
      <input value={email} onChange={(event) => setEmail(event.target.value)} />
      <button disabled={!isValid}>Submit</button>
    </form>
  )
}
```

**推薦 ✅ - 前端做 UX 檢核，提交後仍處理 server/API 邊界錯誤**:

```tsx
function EmailForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValidEmail) return

    const result = await submitEmail({ email })
    if (!result.ok) {
      setError(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(event) => setEmail(event.target.value)} />
      {error ? <p>{error}</p> : null}
      <button disabled={!isValidEmail}>Submit</button>
    </form>
  )
}
```

**推薦 ✅ - server/API 邊界重新驗證**:

```typescript
type SubmitEmailInput = {
  email: unknown
}

export function parseSubmitEmailInput(input: SubmitEmailInput) {
  if (typeof input.email !== 'string') {
    throw new Error('INVALID_EMAIL')
  }

  const email = input.email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('INVALID_EMAIL')
  }

  return { email }
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 信任前端計算的金額或權限**

```typescript
// ❌ total / role 由瀏覽器提交，可以被竄改
await submitRequest({ resourceIds, total, role })

// ✅ 提交最小可驗證資料，由 server/API 邊界重新計算與授權
await submitRequest({ resourceIds })
```

**陷阱 2: 把 TypeScript type 當 runtime（執行期）驗證**

```typescript
type ProfileInput = {
  displayName: string
}

// ❌ assertion 不會檢查執行期資料
const input = JSON.parse(rawBody) as ProfileInput

// ✅ 解析 unknown，再逐項驗證
const parsed: unknown = JSON.parse(rawBody)
if (!isProfileInput(parsed)) {
  throw new Error('INVALID_PROFILE_INPUT')
}
```

### 參考現有實作 / Reference Implementation

通用檢查位置：

- `apps/frontend/src/app/types/**/*.ts` - TypeScript types 只代表編譯期契約。
- `apps/frontend/src/app/hooks/**/*.ts` - hook 中的驗證應定位為 UX 或資料整理。
- Route Handler / Server Action / server/API 邊界若新增到專案，需在接收資料處重新驗證。

### 自動化 / Automation

- **TypeScript**: ✅ 可檢查編譯期型別，不等於 runtime（執行期）驗證。
- **ESLint**: ✅ 可檢查部分型別、Hooks 與 React / Next.js 問題；不能替代 runtime（執行期）驗證。
- **Contract Tests**: ℹ️ 若有後端或 API contract，應補上邊界驗證測試。
- **Claude Hook**: ℹ️ `check-guidelines.sh` 目前會提醒準則 22。

---

## 準則 23: 敏感資料處理 / Guideline 23: Sensitive Data Handling

### 說明 / Description

不要把 secret、密碼、API key、refresh token 或不可公開資料放進前端 bundle、瀏覽器裡可被 JavaScript 讀到的 storage、URL、log 或 mock data。`NEXT_PUBLIC_*` 變數會進入前端 bundle，必須視為公開資訊。auth token / session 優先由後端以 `HttpOnly; Secure; SameSite` cookie 管理，前端只透過同源 API 或受控 proxy 存取需要 secret 的服務。

Do not put secrets, passwords, API keys, refresh tokens, or non-public data in the client bundle, browser-readable storage, URLs, logs, or mock data. `NEXT_PUBLIC_*` variables are shipped to the browser and must be treated as public. Auth tokens should be set by the backend as `HttpOnly; Secure; SameSite` cookies, and the frontend should access secret-backed services through same-origin APIs or controlled proxies.

### 為什麼重要 / Why This Matters

- **XSS 放大效應**：`localStorage` 和 `sessionStorage` 可被成功執行的前端腳本讀取。
- **前端 bundle 不可保密**：前端程式碼和 `NEXT_PUBLIC_*` 環境變數可被使用者檢視。
- **外洩面積**：URL、console、mock data 和錯誤回報常被第三方系統保存。

### Linus 哲學 / Linus Philosophy

> "Keep the core simple."

The core rule for sensitive data handling is small: secrets do not enter the browser. Actions that require secrets belong at the server/API boundary, not patched with a collection of special cases in the frontend.

### 檢查清單 / Checklist

- [ ] 是否避免把 token、secret、password、private API key 放進 `localStorage` 或 `sessionStorage`？
- [ ] 是否避免把敏感資料放進 `NEXT_PUBLIC_*`、前端程式碼或 mock data？
- [ ] Session / auth cookie 是否由後端設定 `HttpOnly`、`Secure`、`SameSite`？
- [ ] 是否避免在 URL query、hash、path 傳遞敏感資料？
- [ ] log、toast、error message 是否避免輸出完整個資、token 或 secret？

### 範例 / Examples

**不推薦 ❌ - 瀏覽器可讀取的 storage 保存敏感資料**:

```typescript
localStorage.setItem('access_token', accessToken)
sessionStorage.setItem('refresh_token', refreshToken)
localStorage.setItem('api_key', 'sk_live_xxx')
```

**推薦 ✅ - 前端只呼叫同源 API**:

```typescript
const response = await fetch('/api/account', {
  credentials: 'include',
})

if (!response.ok) {
  throw new Error('REQUEST_FAILED')
}
```

**不推薦 ❌ - 把 private key 放進公開環境變數**:

```typescript
const apiKey = process.env.NEXT_PUBLIC_PRIVATE_API_KEY

await fetch(`https://api.example.com/data?key=${apiKey}`)
```

**推薦 ✅ - secret 留在 server 端**:

```typescript
// Server-only code，只能在 server 端執行
const apiKey = process.env.PRIVATE_API_KEY

export async function fetchExternalData() {
  const response = await fetch('https://api.example.com/data', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  return response.json()
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 用 URL 傳 token**

```typescript
// ❌ URL 會進入瀏覽器歷史、server log、監控和截圖
router.push(`/verify?token=${token}`)

// ✅ 用 POST body 或一次性 server 流程
await fetch('/api/verify', {
  method: 'POST',
  body: JSON.stringify({ token }),
})
```

**陷阱 2: 開發 log 漏到正式環境**

```typescript
// ❌ response 可能包含 token 或個資
console.log('response', response)

// ✅ 只在開發環境輸出最小必要資訊
if (process.env.NODE_ENV === 'development') {
  console.debug('request failed', { status: response.status })
}
```

### 參考現有實作 / Reference Implementation

通用檢查位置：

- `.gitignore` - `.env*` 應被忽略，`.env.example` 可保留公開範例。
- `apps/frontend/package.json` - 確認沒有把 secret 透過 script 注入前端 build。
- `apps/frontend/src/**/*.ts(x)` - 搜尋 `localStorage`、`sessionStorage`、`NEXT_PUBLIC`、`console.`。

### 自動化 / Automation

- **Git Hook**: ℹ️ 目前未設定 secret 掃描工具。
- **Manual Review**: 搜尋 `NEXT_PUBLIC`、`localStorage`、`sessionStorage`、`console.log`、`api_key`、`token`。
- **Optional Scanner**: 可視需求加入 secret 掃描工具；新增前需說明阻擋規則與誤報處理。
- **Claude Hook**: ℹ️ 目前是準則提醒，不是 secret scanning。

---

## 準則 24: CORS（跨來源資源共享）與同源政策 / Guideline 24: CORS And Same-Origin Policy

### 說明 / Description

CORS 是瀏覽器同源政策下的跨來源讀取控制，不是 API 驗證、授權或 CSRF 防護。若前端只呼叫同源 API，通常不需要在前端專案新增 CORS 設定。若 Next.js Route Handler、proxy 或後端服務真的需要開放跨來源存取，正式環境必須使用明確允許清單（allowlist；常見說法是白名單），並搭配 `Vary: Origin`、credentials / cookie 規則和後端驗證。

CORS controls cross-origin reads in browsers. It is not API authentication, authorization, or CSRF protection. If the frontend only calls same-origin APIs, the frontend project usually does not need CORS configuration. If a Next.js Route Handler, proxy, or backend service needs cross-origin access, production must use an explicit allowlist with `Vary: Origin`, credentials rules, and backend validation.

### 為什麼重要 / Why This Matters

- **錯誤安全感**：CORS 不會阻擋 curl、Postman、server-to-server request。
- **Cookie 風險**：帶 cookie / credentials 的 request 需要更嚴格的 origin 與 CSRF 設計。
- **部署可預測**：明確允許清單比開發期 wildcard 更容易審查和回滾。

### Linus 哲學 / Linus Philosophy

> "Do not add abstractions, frameworks, dependencies, or configuration until the current code shows a real need."

If there is no cross-origin need, do not add CORS configuration. When there is a need, write the allowed origins and credentials rules as a small, reviewable boundary.

### 檢查清單 / Checklist

- [ ] 是否先確認真的需要跨來源存取？
- [ ] 正式環境是否避免 `Access-Control-Allow-Origin: *` 搭配 credentials？
- [ ] allowed origins 是否是明確的允許清單/白名單，而不是任意 regex 或 echo origin？
- [ ] 使用 cookie 驗證時，是否另外處理 CSRF 風險？
- [ ] CORS 設定是否放在 Route Handler、proxy 或後端邊界，而不是散落在 client 呼叫端？

### 範例 / Examples

**不推薦 ❌ - wildcard 搭配 credentials**:

```typescript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
}
```

**推薦 ✅ - 明確允許清單**:

```typescript
const allowedOrigins = new Set(['https://app.example.com'])

export function getCorsHeaders(origin: string | null) {
  if (!origin || !allowedOrigins.has(origin)) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  }
}
```

**推薦 ✅ - 同源呼叫不需要 CORS**:

```typescript
const response = await fetch('/api/profile', {
  credentials: 'include',
})
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 誤把 CORS 當 API 保護**

```typescript
// ❌ CORS 不會替 API 做授權
// Access-Control-Allow-Origin: https://app.example.com

// ✅ API 仍要驗證身份、權限和輸入
await requireAuthenticatedUser(request)
await validateRequestBody(request)
```

**陷阱 2: 開發設定直接帶到正式環境**

```typescript
// ❌ 正式環境不應沿用寬鬆設定
const allowedOrigin = '*'

// ✅ 由環境設定明確來源，缺少時 fail closed
const allowedOrigin = process.env.APP_ORIGIN
if (!allowedOrigin) {
  throw new Error('APP_ORIGIN_REQUIRED')
}
```

### 參考現有實作 / Reference Implementation

通用檢查位置：

- `apps/frontend/next.config.ts` - 若新增 headers 或 image / remote 來源允許清單，範圍要明確。
- `apps/frontend/src/app/**/route.ts` - 若新增 Route Handler，CORS、auth、輸入驗證應在此類邊界處理。
- Client Component 中的 `fetch()` 不應用來補救後端 CORS 或授權設計。

### 自動化 / Automation

- **Manual Review**: 搜尋 `Access-Control-Allow-Origin`、`Access-Control-Allow-Credentials`、`headers()`。
- **Integration Test**: 若有跨來源 API，測試允許與拒絕來源各一個案例。
- **Git Hook**: ℹ️ 目前沒有 CORS / security headers 自動掃描。
- **Claude Hook**: ℹ️ 目前是提醒腳本，不是 blocking check。

---

## 準則 25: 套件安全稽核 / Guideline 25: Dependency Security Audit

### 說明 / Description

新增套件前先確認它解決真問題，且沒有現有 API 或小型本地實作能更簡單地完成。套件安全更新要小而可審查：先看漏洞影響範圍、套件用途、lockfile 差異和 breaking changes，再更新。目前 workspace 使用 pnpm，因此安全稽核與 lockfile review 應以 `pnpm-lock.yaml` 和 `pnpm-workspace.yaml` 為準。

Before adding a dependency, confirm it solves a real problem and cannot be replaced by an existing API or a small local implementation. Security updates should be small and reviewable: inspect the vulnerability scope, package usage, lockfile diff, and breaking changes before updating. The current workspace uses pnpm, so security audits and lockfile review should be based on `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

### 為什麼重要 / Why This Matters

- **供應鏈風險**：每個套件都是新的維護與攻擊面。
- **可審查性**：安全更新若混入大量無關升級，reviewer 很難判斷風險。
- **可回滾性**：小範圍更新比較容易 bisect、rollback 和驗證。

### Linus 哲學 / Linus Philosophy

> "Prefer small, logical changes that can be understood and verified on their own."

Dependency changes must be as reviewable as code patches. Do not hide the actual vulnerability fix inside a large bulk upgrade.

### 檢查清單 / Checklist

- [ ] 新套件是否有明確問題、替代方案與取捨？
- [ ] 是否檢查套件維護狀態、下載量、授權與近期安全紀錄？
- [ ] 是否用 `pnpm audit` 或同等工具檢查 high / critical 漏洞？
- [ ] `pnpm-lock.yaml` diff 是否只包含本次必要變更？
- [ ] 安全更新是否有對應驗證命令或 smoke test？

### 範例 / Examples

**不推薦 ❌ - 為小問題加入大型套件**:

```typescript
import leftPad from 'left-pad'

export function formatCode(value: number) {
  return leftPad(String(value), 4, '0')
}
```

**推薦 ✅ - 用小型本地實作或標準 API**:

```typescript
export function formatCode(value: number) {
  return String(value).padStart(4, '0')
}
```

**推薦 ✅ - 用 pnpm 做安全稽核**:

```bash
pnpm audit --audit-level high
pnpm outdated --recursive
pnpm why <package-name>
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 盲目更新所有套件**

```bash
# ❌ diff 太大，難以審查和回滾
pnpm update --latest --recursive

# ✅ 只更新受影響套件，並檢查 lockfile diff
pnpm update <package-name>
```

**陷阱 2: 把 audit 結果全部當成同一級風險**

```text
// ❌ 不看影響範圍，只貼 audit output
found vulnerabilities

// ✅ 寫清楚是否在正式環境路徑、是否可觸發、如何修
high severity: package-name
impact: used by frontend production bundle
fix: update package-name from x.y.z to x.y.z+1
verification: pnpm audit --audit-level high; pnpm --filter frontend run type-check
```

### 參考現有實作 / Reference Implementation

通用檢查位置：

- `apps/frontend/package.json` - 前端套件與 script 的主要來源。
- `package.json` - workspace、commit tooling 與 repo-level scripts。
- `pnpm-workspace.yaml` - workspace package 範圍，避免審查漏掉新增 package。
- `pnpm-lock.yaml` - 套件審查時必看 lockfile diff。

### 自動化 / Automation

- **pnpm audit**: ℹ️ 可手動執行 `pnpm audit --audit-level high`。
- **Optional Monitoring**: 若新增套件監控工具，需在 README 記錄觸發條件與處理流程。
- **Git Hook**: ℹ️ 目前 pre-commit 不執行套件安全稽核。
- **Code Review**: ✅ 套件與 lockfile diff 必須人工審查。

---

## 總結 / Summary

前端安全的 5 條準則核心思想：

1. **準則 21**: 跨站腳本攻擊（XSS）防護 - 不可信資料預設渲染為純文字。
2. **準則 22**: 輸入驗證 - 前端驗證是 UX，server/API 邊界才是安全。
3. **準則 23**: 敏感資料處理 - secret 不進瀏覽器、URL 或 log。
4. **準則 24**: CORS（跨來源資源共享）與同源政策 - 沒有跨來源需求就不加設定，有需求就明確允許清單。
5. **準則 25**: 套件安全稽核 - 套件變更要小、可審查、可驗證。

**Linus 哲學 / Linus Philosophy in Frontend Security**:

- **Clear invariants** → 準則 21（不可信資料預設純文字）。
- **Trust boundaries first** → 準則 22-24（安全決策放在 server/API 邊界）。
- **Small reviewable patches** → 準則 25（套件更新不混入無關變更）。
- **Pragmatism** → 全部準則（只為真實風險增加工具或配置）。

---

## 相關文檔 / Related Documents

- [AGENTS.md](../../AGENTS.md) - Linus Torvalds 風格工程原則。
- [README.md](README.md) - 準則總覽。
- [template.md](template.md) - 準則文件格式模板。
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - 常見 Web 安全風險。
- [MDN: CORS](https://developer.mozilla.org/zh-TW/docs/Glossary/CORS) - 正體中文用語「跨來源資源共享」。
- [MDN: 同源政策](https://developer.mozilla.org/zh-TW/docs/Web/Security/Defenses/Same-origin_policy) - 同源政策、CORS、CSRF 用語參考。
- [MDN: 使用 HTTP Cookie](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Guides/Cookies) - `HttpOnly`、`Secure`、`SameSite` 與敏感訊息參考。
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) - CSP 參考。
- [iThome: VMware NSX XSS 漏洞](https://www.ithome.com.tw/news/169446) - 台灣資安新聞用語「跨站腳本攻擊」「輸入驗證不當」。
- [iThome: GlassWorm 供應鏈攻擊](https://www.ithome.com.tw/news/174484) - 台灣資安新聞用語「供應鏈攻擊」「套件」。
- [Next.js Environment Variables](https://nextjs.org/docs/app/guides/environment-variables) - Next.js 環境變數行為。

---

**最後更新 / Last Updated**: 2026-05-14  
**維護者 / Maintainer**: Frontend Team
