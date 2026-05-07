---
name: project-coding-standards
description: |
  Project-wide coding standards — naming conventions (PascalCase components,
  camelCase functions, no pinyin), code cleanliness (no console.log, no
  commented code, no orphan TODOs), security checklist (env vars, no hardcoded
  keys, input validation), TypeScript project rules (types/ directory,
  interface over type, no Zod by default), npm dev commands, pre-commit checks,
  and Code Review priority list (Critical / Important / Nice-to-have). Use when
  writing or reviewing any project code.
version: 1.0.0
---

# Project Coding Standards

## Dev Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run type-check` | Type checking |
| `npm run lint` | Lint check |
| `npm run format` | Prettier formatting |
| `npm run format:check` | Format check (no modification) |
| `npm run build` | Build |
| `npm test` | Run tests |

## Code Style

- ESLint + Prettier auto-formatting
- `lint-staged` runs automatically before commits
- Follow the existing project style

## Naming Conventions

```typescript
// ✅ Components: PascalCase
function ProductCard() {}
function ProductList() {}

// ✅ Functions/variables: camelCase
const handleSubmit = () => {}
const productList: Product[] = []

// ✅ Booleans: is / has / should prefix
const isLoggedIn = true
const hasPermission = false
const shouldShowModal = false

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_ITEMS = 100
const API_BASE_URL = 'https://api.example.com'

// ✅ Private members: _ prefix
const _privateMethod = () => {}

// ❌ Avoid pinyin and meaningless abbreviations (project-specific rule)
const yonghu = '用戶'    // ❌
const btn = <button />   // ❌
const user = 'user'      // ✅
const button = <button /> // ✅
```

> General TypeScript naming and type details: see `Mastering TypeScript` Skill.

## Code Cleanliness

Must remove:
- `console.log` / `console.error` (unless intentional error logging)
- Commented-out code (git manages versions — never keep commented code)
- Unhandled `TODO` / `FIXME` (convert to an Issue or address immediately)
- Unused imports / variables / functions

## Security Checks

### Environment Variable Management

```typescript
// ✅ Use environment variables (browser-visible vars use NEXT_PUBLIC_ prefix)
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY

// ✅ Server-side sensitive vars do NOT use NEXT_PUBLIC_
const SECRET_KEY = process.env.SECRET_KEY

// ❌ Hardcoded keys
const API_KEY = 'sk-1234567890abcdef' // ❌ Dangerous!
```

### Input Validation

```typescript
// ✅ Validate user input (empty values, max length)
const handleSubmit = (input: string) => {
  if (!input || input.trim().length === 0) {
    toast('Input cannot be empty')
    return
  }
  if (input.length > 100) {
    toast('Input too long (max 100 characters)')
    return
  }
  sendToAPI(input)
}

// ✅ Limit length on <input>
<input
  type="text"
  value={name}
  maxLength={100}
  onChange={e => setName(e.target.value)}
/>
```

### Security Checklist

- [ ] No hardcoded API keys, tokens, or passwords
- [ ] `.env` is in `.gitignore`
- [ ] All user input is validated
- [ ] Sensitive logs are removed or redacted

## TypeScript Type Management

- All shared type definitions go in `src/app/types/`
- Prefer `interface` over `type` (unless there's a specific reason)
- **This project does not introduce Zod unless explicitly required**
- General advanced TypeScript patterns: see `Mastering TypeScript` Skill

## Testing

- Interactive / E2E tests: see `Webapp Testing` Skill (Playwright)
- Coverage target for new components > 70%

## Pre-Commit Checklist

```bash
npm run type-check && npm run lint && npm run format:check && npm test
```

Code quality checklist:
- [ ] TypeScript types are correct
- [ ] No ESLint errors or warnings
- [ ] Formatted with Prettier
- [ ] Removed `console.log` / commented code / unhandled TODOs
- [ ] No unused imports or variables
- [ ] No hardcoded sensitive information
- [ ] Tests pass with sufficient coverage

## Code Review Priority

### Critical (must check)

- ❌ **No `any` type**: all variables, function parameters, and `useState` must have explicit types
- ❌ **No `@ts-ignore`**: TypeScript errors must not be suppressed
- ⚠️ **Complete useEffect dependencies**: all external variables must be in the dependency array
- ⚠️ **Side-effect cleanup**: all timers, listeners, and subscriptions must be cleaned up
- 🔒 **No hardcoded keys**: use environment variables for sensitive information

### Important (should check)

- 📦 **Component size**: single component under 200 lines, follows single responsibility
- 🎯 **Props design**: props count under 7, provide default values
- ⚡ **Basic performance requirements**: list items have unique keys, large lists paginated, images use `next/image`
- ⚠️ **Avoid premature optimization**: don't default to memo / useCallback / useMemo (see `react-patterns` Skill)
- 🎨 **Use Tailwind CSS**: no inline styles or CSS-in-JS
- ♿ **Accessibility**: UI passes a11y review from `Web Design Guidelines` Skill

### Nice to have (recommended)

- 💅 Naming conventions (PascalCase / camelCase / `is`-`has` prefix)
- 🧹 Code cleanliness (remove `console.log` / commented code / unhandled TODOs)
- 📝 New components have tests with coverage > 70%

## Other

- **shadcn/ui is the single UI source**: Do not stack additional Tailwind/shadcn variant skills (e.g. tailwind-v4-shadcn alongside the main shadcn skill). Install one UI skill path only.
- Use `lucide-react` for icons to keep visual style consistent
- Confirm existing components aren't broken before modifying them
- Check for reusable components before adding new functionality
- Git commit messages follow the project's existing commit history style
