#!/usr/bin/env bash
# Claude Code Hook: POS project context reminder
# Trigger: UserPromptSubmit
# Purpose: Print lightweight POS guidance based on changed files. This hook never blocks work.

set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  exit 0
fi

changed_files="$(
  {
    git diff --name-only HEAD 2>/dev/null || true
    git ls-files --others --exclude-standard 2>/dev/null || true
  } | sort -u
)"

new_files="$(
  {
    git diff --name-only --diff-filter=A HEAD 2>/dev/null || true
    git ls-files --others --exclude-standard 2>/dev/null || true
  } | sort -u
)"

reminders=()

has_changed() {
  printf "%s\n" "$changed_files" | grep -Eq "$1"
}

has_new() {
  printf "%s\n" "$new_files" | grep -Eq "$1"
}

reminders+=("[Claude]")
reminders+=("- MUST check whether there are relevant skills to use first.")
reminders+=("- State the problem in one sentence before changing code.")
reminders+=("- Pick the smallest logical change that solves the real issue.")
reminders+=("- Decide what evidence will prove the change works.")

if [ -z "$changed_files" ]; then
  reminders+=("")
  reminders+=("[No Changed Files]")
  reminders+=("- Keep the next change small and tied to POS project rules.")
fi

if has_changed '^apps/frontend/(src/.*\.(ts|tsx)|next\.config\.ts|tsconfig\.json|package\.json|components\.json|tailwind\.config\.ts|postcss\.config\.mjs|\.eslintrc\.json)$'; then
  reminders+=("")
  reminders+=("[Next.js / React / TypeScript]")
  reminders+=("- Keep props and public interfaces explicit; avoid any.")
  reminders+=("- Keep 'use client' at the smallest event, hook, or browser API boundary.")
  reminders+=("- Check hooks dependencies, cleanup, and derived state.")
  reminders+=("- Verification: pnpm --filter frontend run type-check; add lint/build when risk warrants.")
  reminders+=("- Reference: .claude/rules/01-component-standards.md and .claude/rules/typescript.md")
fi

if has_changed '^apps/frontend/src/app/components/.*\.tsx$'; then
  reminders+=("")
  reminders+=("[Atomic Components]")
  reminders+=("- Use .claude/skills/atomic-design-convention/SKILL.md when placing or changing components.")
  reminders+=("- Choose atoms, molecules, organisms, templates, or pages by responsibility and reuse.")
  reminders+=("- Merge classes with cn(), prefer semantic Tailwind tokens, and keep composition styles predictable.")
  reminders+=("- Reference: .claude/rules/01-component-standards.md and .claude/rules/08-styling.md")
fi

if has_new '^apps/frontend/src/app/components/.*\.tsx$'; then
  reminders+=("")
  reminders+=("[New React Component]")
  reminders+=("- Export shared components from the correct layer index when they are reusable.")
  reminders+=("- Keep component filenames camelCase and component symbols PascalCase.")
  reminders+=("- Make loading, empty, error, and responsive states explicit when user-facing.")
fi

if has_changed '^apps/frontend/src/app/hooks/.*\.(ts|tsx)$'; then
  reminders+=("")
  reminders+=("[React Hooks]")
  reminders+=("- Effects synchronize with external systems; do not store values that can be derived.")
  reminders+=("- Include complete dependencies and clean up timers, listeners, subscriptions, and object URLs.")
  reminders+=("- Keep hook return shapes narrow and named by domain intent.")
  reminders+=("- Reference: .claude/rules/01-component-standards.md and .claude/rules/05-state-error-handling.md")
fi

if has_changed '^apps/frontend/src/app/(lib|types)/.*\.ts$|^apps/frontend/src/app/.*/page\.tsx$|^apps/frontend/src/app/.*/layout\.tsx$'; then
  reminders+=("")
  reminders+=("[Data Boundaries / API Contracts]")
  reminders+=("- Keep DTOs, helpers, and UI types aligned with real API shapes.")
  reminders+=("- Treat external data as unknown at runtime, then narrow through small checks or adapters.")
  reminders+=("- Do not leak repository, handler, temporary, or raw API shapes across boundaries.")
  reminders+=("- Reference: .claude/rules/02-code-quality.md, .claude/rules/04-frontend-security.md, and .claude/rules/06-collaboration.md")
fi

if has_changed '^apps/frontend/(src/.*\.css|tailwind\.config\.ts|components\.json)$'; then
  reminders+=("")
  reminders+=("[Styling / Theme]")
  reminders+=("- Use semantic design tokens; avoid scattered raw colors and one-off arbitrary styles.")
  reminders+=("- Let tokens carry dark mode instead of branching each component's palette.")
  reminders+=("- Keep component styling in className unless CSS is truly global or selector-driven.")
  reminders+=("- Reference: .claude/rules/08-styling.md and .claude/rules/07-ui-reliability.md")
fi

if has_changed '^apps/backend/.*\.(go|sql)$|^apps/backend/go\.(mod|sum)$'; then
  reminders+=("")
  reminders+=("[Go Backend]")
  reminders+=("- Keep handler, DTO, repository, and storage responsibilities separate.")
  reminders+=("- Validate request data at trust boundaries and preserve database invariants.")
  reminders+=("- Verification: cd apps/backend && go test ./...")
  reminders+=("- Reference: .claude/rules/02-code-quality.md and .claude/rules/06-collaboration.md")
fi

if has_changed '^apps/backend/internal/storage/sql/migration/scripts/.*\.(up|down)\.sql$'; then
  reminders+=("")
  reminders+=("[SQL Migrations]")
  reminders+=("- Keep migration up/down files paired and review data-loss risks directly.")
  reminders+=("- Keep schema changes small enough to review and roll back.")
fi

if has_changed '^(\.claude/|AGENTS\.md$|apps/frontend/CLAUDE\.md$|.*\.md$)'; then
  reminders+=("")
  reminders+=("[Project Rules / Docs]")
  reminders+=("- Keep rules tied to actual POS project behavior, not template leftovers.")
  reminders+=("- Keep automation lightweight, reviewable, and honest about what it can block.")
  reminders+=("- PR or handoff notes should explain problem, solution, verification, and remaining risk.")
  reminders+=("- Reference: AGENTS.md and .claude/rules/README.md")
fi

large_components=()
while IFS= read -r file; do
  if [ -f "$file" ] && printf "%s\n" "$file" | grep -Eq '^apps/frontend/src/app/components/.*\.tsx$'; then
    line_count="$(wc -l <"$file" 2>/dev/null || echo "0")"
    if [ "$line_count" -gt 200 ]; then
      large_components+=("$file ($line_count lines)")
    fi
  fi
done <<< "$changed_files"

if [ "${#large_components[@]}" -gt 0 ]; then
  reminders+=("")
  reminders+=("[Large React Components]")
  reminders+=("- These component files exceed 200 lines; split only when responsibility is unclear:")
  for component in "${large_components[@]}"; do
    reminders+=("  - $component")
  done
fi

if [ "${#reminders[@]}" -gt 0 ]; then
  printf "\n"
  printf "============================================================\n"
  printf "  POS Project Context Reminder\n"
  printf "============================================================\n"
  for reminder in "${reminders[@]}"; do
    printf "%s\n" "$reminder"
  done
  printf "============================================================\n"
  printf "\n"
fi

exit 0
