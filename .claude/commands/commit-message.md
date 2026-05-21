---
allowed-tools: Bash(git status:*), Bash(git diff:*)
description: Generate Conventional Commits message based on staged changes (Chinese & English versions)
---

## Task

Analyze staged Git changes and generate commit messages. Do **not** execute `git commit`, `git add`, or any other mutating command under any circumstances — only output the message for the user to copy.

## Git Status

!git status --short

## Staged Changes (primary analysis source)

!git diff --cached

## Unstaged Changes (for reference only — do not base commit message on these)

!git diff

## Commit Message Format

Use Conventional Commits specification:

```text
<type>[(<scope>)][!]: <subject>

<body>

<footer>
```

### Type Selection Guide

| Type       | Usage                                        | SemVer |
| ---------- | -------------------------------------------- | ------ |
| `feat`     | New feature or API                           | MINOR  |
| `fix`      | Bug fix or error handling                    | PATCH  |
| `perf`     | Performance improvement (no behavior change) | PATCH  |
| `refactor` | Code restructuring (not feat / fix)          | —      |
| `style`    | Formatting, whitespace, linting              | —      |
| `docs`     | Documentation or comments only               | —      |
| `test`     | Adding or modifying tests                    | —      |
| `build`    | Build system or dependency changes           | —      |
| `ci`       | CI/CD configuration changes                  | —      |
| `chore`    | Other maintenance not affecting src/test     | —      |
| `revert`   | Reverting a previous commit                  | —      |

### Scope

Infer from file paths or functional modules, e.g.: `auth`, `api`, `ui`, `components`, `utils`, `router`

### Breaking Change

Add `!` after type/scope; add `BREAKING CHANGE:` in footer:

```text
feat(button)!: remove size prop, use class instead

BREAKING CHANGE: `size` prop has been removed. Use Tailwind classes directly via `class` attribute.
```

### Writing Guidelines

- **Header** (`type(scope): subject`): ≤ 72 characters (ideally ≤ 50), no period at end
- **subject**: Imperative mood — EN: lowercase start / ZH: 繁體中文，25 字以內
- **body**: Explain **why**, not what. Bullet points for multi-item changes. Each line ≤ 72 characters
- **footer**: Issue refs (`Closes #123`, `Refs #456`) or `BREAKING CHANGE:`

---

## Execution Steps

1. **Check staged changes**
   - If nothing staged → ask the user to stage the intended files first; do not proceed
   - If changes exist but nothing staged → list the relevant unstaged paths and ask the user to stage them first; do not stage files yourself

2. **Use this file as the source of truth**
   - Follow the Conventional Commits rules below even if previous commits used a different format

3. **Analyze staged diff** → determine type, infer scope, draft subject and body

4. **Handle multiple unrelated changes** — if staged changes span unrelated concerns, output a concrete split plan **before** the commit messages:
   ```
   建議拆分為：
   1. paths:
      - apps/frontend/src/app/components/atoms/button/button.tsx
      suggested message: feat(button): add loading state

   2. paths:
      - apps/frontend/docs/button.md
      suggested message: docs(button): document loading prop
   ```
   Then still output a combined message as fallback.

---

## Output Format

📝 **繁體中文版本 (Traditional Chinese)**

```text
<type>(<scope>): <中文 subject>

<中文 body>

<footer>
```

📝 **English Version**

```text
<type>(<scope>): <English subject>

<English body>

<footer>
```

---

## Examples

### Single-scope commit

📝 **繁體中文版本**

```text
feat(auth): 新增第三方 OAuth 登入功能

- 實作 Google / GitHub OAuth 登入流程
- 新增 token 刷新機制
- 將登入狀態同步至 store
```

📝 **English Version**

```text
feat(auth): add third-party OAuth login

- Implement Google / GitHub OAuth login flow
- Add token refresh mechanism
- Sync login state to store
```

### Mixed changes → split plan

> ⚠️ Staged changes contain unrelated modifications. Suggested split:
>
> ```
> 1. paths:
>    - apps/frontend/src/app/lib/api.ts
>    - apps/frontend/src/app/types/product.ts
>    suggested message: fix(api): handle product submission errors
>
> 2. paths:
>    - apps/frontend/src/app/components/molecules/inventoryList/inventoryTableContent.tsx
>    - apps/frontend/src/app/components/atoms/button/button.tsx
>    suggested message: style(ui): adjust inventory table actions
> ```

(Combined fallback message follows below)

---

## Rules

- Output both versions directly — do not ask for confirmation
- **Never execute `git commit`** — only generate the message text
- **Never execute mutating Git commands** such as `git add`, `git commit`, `git reset`, or `git checkout`
- Ensure both versions carry consistent meaning
- Accurately reflect staged changes only
- If changes should be split, output the split plan **before** the commit messages
