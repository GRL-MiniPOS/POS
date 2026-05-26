---
allowed-tools: Bash(git status:*), Bash(git diff:*)
description: Generate Conventional Commits message based on staged changes (Chinese & English versions)
---

## Task

Analyze staged Git changes and generate commit messages. Do **not** execute
`git commit`, `git add`, or any other mutating command under any
circumstances. Only output the message for the user to copy.

## Git Status

!git status --short

## Staged Changes (primary analysis source)

!git diff --cached

## Unstaged Changes (for reference only - do not base commit message on these)

!git diff

---

## Commit Message Format

Use the Conventional Commits specification:

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
| `refactor` | Code restructuring (not feat / fix)          | -      |
| `style`    | Formatting, whitespace, linting              | -      |
| `docs`     | Documentation or comments only               | -      |
| `test`     | Adding or modifying tests                    | -      |
| `build`    | Build system or dependency changes           | -      |
| `ci`       | CI/CD configuration changes                  | -      |
| `chore`    | Other maintenance not affecting src/test     | -      |
| `revert`   | Reverting a previous commit                  | -      |

### Scope

Infer the scope from file paths or functional modules, for example:
`auth`, `api`, `ui`, `views`, `components`, `stores`, `router`, `survey`,
`utils`, `docs`.

Prefer the smallest meaningful scope. If one clear scope cannot be inferred,
omit the scope instead of inventing one.

### Breaking Change

Add `!` after type/scope and add `BREAKING CHANGE:` in the footer:

```text
feat(button)!: remove size prop

BREAKING CHANGE: `size` prop has been removed. Use CSS classes via `class`.
```

### Writing Guidelines

- **Header** (`type(scope): subject`): <= 72 characters, ideally <= 50;
  no period at the end
- **subject**: imperative mood; EN starts lowercase; ZH uses Traditional
  Chinese and stays within 25 characters when possible
- **body**: one terse bullet per concern — state the outcome or reason
  in ≤ 50 characters; omit detail that is obvious from the diff
- Use bullet points for multi-item bodies; keep total bullets ≤ 5
- Keep each body/footer line **<= 72 characters** — do not wrap;
  shorten or split bullets instead
- **footer**: issue refs (`Closes #123`, `Refs #456`) or
  `BREAKING CHANGE:`

---

## Execution Steps

1. **Check staged changes**
   - If nothing is staged, ask the user to stage the intended files first;
     do not proceed to generate a commit message
   - If there are unstaged changes but nothing staged, list the relevant
     unstaged paths and ask the user to stage them first
   - Never stage files yourself

2. **Use this file as the source of truth**
   - Follow these Conventional Commits rules even if previous commits used a
     different format
   - Do not rely on recent commit style if it conflicts with this file

3. **Analyze staged diff**
   - Determine the best type
   - Infer the narrowest useful scope
   - Draft a concise subject
   - Add a body only when type + scope + subject do not convey full intent
   - Omit body if the change is self-evident (e.g., `fix(btn): add disabled state`)
   - Keep bullets ≤ 5; prefer fewer, shorter bullets over many detailed ones

4. **Handle multiple unrelated changes**
   - If staged changes span unrelated concerns, output a concrete split plan
     **before** the commit messages
   - The split plan must list paths and suggested messages only; do not
     include `git add`, `git commit`, or other mutating commands
   - Still output a combined message as a fallback

```text
建議拆分為：
1. paths:
   - src/services/surveyApi.ts
   - src/types/survey.ts
   suggested message: fix(api): handle survey submission errors

2. paths:
   - src/views/survey/SurveyEditor.vue
   - src/components/survey/QuestionList.vue
   suggested message: refactor(survey): simplify question editing flow
```

---

## Output Format

Output both versions directly. Do not ask for confirmation.

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

If no body or footer is needed, omit that section cleanly.

---

## Examples

### Single-scope commit

📝 **繁體中文版本**

```text
feat(auth): 新增第三方 OAuth 登入

- 支援 Google / GitHub OAuth 登入流程
- 讓登入狀態能在重新整理後保留
- 降低手動管理 token 的風險
```

📝 **English Version**

```text
feat(auth): add third-party OAuth login

- Support Google / GitHub OAuth login flow
- Preserve login state after page refresh
- Reduce the risk of manual token handling
```

### Documentation-only commit

📝 **繁體中文版本**

```text
docs(commands): 更新提交訊息指引

- 收斂可執行的 Git 指令範圍
- 明確要求只根據 staged diff 產生訊息
```

📝 **English Version**

```text
docs(commands): update commit message guide

- Narrow the allowed Git command surface
- Require messages to be based on staged diffs only
```

### Simple fix — no body needed

📝 **繁體中文版本**

```text
fix(form): 修正 email 欄位送出前未驗證
```

📝 **English Version**

```text
fix(form): validate email before submission
```

### Mixed changes - split plan

> ⚠️ Staged changes contain unrelated modifications. Suggested split:
>
> ```text
> 1. paths:
>    - src/services/surveyApi.ts
>    - src/types/survey.ts
>    suggested message: fix(api): handle survey submission errors
>
> 2. paths:
>    - docs/survey.md
>    - .claude/commands/commit-message.md
>    suggested message: docs(survey): update survey workflow docs
> ```

(Combined fallback message follows below.)

---

## Rules

- Output both Traditional Chinese and English versions
- Do not ask for confirmation before outputting the messages
- **Never execute `git commit`**
- **Never execute mutating Git commands** such as `git add`, `git commit`, `git reset`, or `git checkout`
- Accurately reflect staged changes only
- Use unstaged changes only to explain why no message can be generated when nothing is staged
- Ensure both language versions carry consistent meaning
- If changes should be split, output the split plan **before** the commit messages
- Avoid examples or assumptions from projects outside the current `.claude` context
