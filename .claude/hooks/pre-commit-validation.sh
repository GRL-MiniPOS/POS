#!/usr/bin/env bash
# Optional Git/Husky pre-commit validation for the POS workspace.
# This helper is risk-based: it runs only the checks implied by staged files.

set -uo pipefail

project_dir="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$project_dir" || exit 0

echo "[pre-commit] Running POS validation..."

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "[pre-commit] Not in a git repository; skipping."
  exit 0
fi

staged_files="$(git diff --cached --name-only --diff-filter=ACMR)"

if [ -z "$staged_files" ]; then
  echo "[pre-commit] No staged files."
  exit 0
fi

echo "[pre-commit] Staged files:"
printf "%s\n" "$staged_files" | sed 's/^/  - /'

error_count=0

has_staged() {
  printf "%s\n" "$staged_files" | grep -Eq "$1"
}

increment_error() {
  error_count=$((error_count + 1))
}

frontend_typecheck_pattern='^(apps/frontend/(src/.*\.(js|jsx|ts|tsx)|next\.config\.ts|tsconfig\.json|package\.json|components\.json|tailwind\.config\.ts|postcss\.config\.mjs|\.eslintrc\.json)|package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml)$'
frontend_lint_staged_pattern='^apps/frontend/.*\.(js|jsx|ts|tsx)$'
backend_pattern='^apps/backend/.*\.(go|sql)$|^apps/backend/go\.(mod|sum)$'

if has_staged "$frontend_typecheck_pattern"; then
  if command -v pnpm >/dev/null 2>&1; then
    if pnpm --filter frontend run type-check; then
      echo "[pre-commit] Frontend type check passed."
    else
      echo "[pre-commit] Frontend type check failed: pnpm --filter frontend run type-check"
      increment_error
    fi
  else
    echo "[pre-commit] pnpm not found; install pnpm to validate frontend changes."
    increment_error
  fi
fi

if has_staged "$frontend_lint_staged_pattern"; then
  if command -v pnpm >/dev/null 2>&1; then
    if pnpm --filter frontend run lint-staged; then
      echo "[pre-commit] Frontend lint-staged passed."
    else
      echo "[pre-commit] Frontend lint-staged failed: pnpm --filter frontend run lint-staged"
      increment_error
    fi
  else
    echo "[pre-commit] pnpm not found; install pnpm to validate staged frontend files."
    increment_error
  fi
fi

if has_staged "$backend_pattern"; then
  if command -v go >/dev/null 2>&1; then
    if (cd apps/backend && go test ./...); then
      echo "[pre-commit] Backend Go tests passed."
    else
      echo "[pre-commit] Backend Go tests failed: cd apps/backend && go test ./..."
      increment_error
    fi
  else
    echo "[pre-commit] go not found; install Go to validate backend changes."
    increment_error
  fi
fi

migration_files="$(printf "%s\n" "$staged_files" | grep -E '^apps/backend/internal/storage/sql/migration/scripts/.*\.(up|down)\.sql$' || true)"
if [ -n "$migration_files" ]; then
  while IFS= read -r file; do
    [ -z "$file" ] && continue

    case "$file" in
      *.up.sql) pair="${file%.up.sql}.down.sql" ;;
      *.down.sql) pair="${file%.down.sql}.up.sql" ;;
      *) pair="" ;;
    esac

    if [ -n "$pair" ] && [ ! -f "$pair" ] && ! printf "%s\n" "$staged_files" | grep -Fxq "$pair"; then
      echo "[pre-commit] Missing paired migration for $file: expected $pair"
      increment_error
    fi
  done <<< "$migration_files"
fi

shell_files="$(printf "%s\n" "$staged_files" | grep -E '\.sh$' || true)"
if [ -n "$shell_files" ]; then
  while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ -f "$file" ] || continue

    if bash -n "$file"; then
      echo "[pre-commit] Shell syntax passed: $file"
    else
      echo "[pre-commit] Shell syntax failed: $file"
      increment_error
    fi
  done <<< "$shell_files"
fi

json_files="$(printf "%s\n" "$staged_files" | grep -E '\.json$' || true)"
if [ -n "$json_files" ]; then
  if command -v node >/dev/null 2>&1; then
    while IFS= read -r file; do
      [ -z "$file" ] && continue
      [ -f "$file" ] || continue

      if node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'))" "$file"; then
        echo "[pre-commit] JSON syntax passed: $file"
      else
        echo "[pre-commit] JSON syntax failed: $file"
        increment_error
      fi
    done <<< "$json_files"
  else
    echo "[pre-commit] node not found; install Node.js to validate staged JSON files."
    increment_error
  fi
fi

large_components=()
tsx_component_files="$(printf "%s\n" "$staged_files" | grep -E '^apps/frontend/src/app/components/.*\.tsx$' || true)"
if [ -n "$tsx_component_files" ]; then
  while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ -f "$file" ] || continue

    line_count="$(wc -l <"$file" 2>/dev/null || echo "0")"
    if [ "$line_count" -gt 200 ]; then
      large_components+=("$file ($line_count lines)")
    fi
  done <<< "$tsx_component_files"
fi

if [ "${#large_components[@]}" -gt 0 ]; then
  echo "[pre-commit] Warning: these React component files exceed 200 lines:"
  for component in "${large_components[@]}"; do
    echo "  - $component"
  done
fi

if [ "$error_count" -gt 0 ]; then
  echo "[pre-commit] Validation failed with $error_count error(s)."
  exit 1
fi

echo "[pre-commit] Validation passed."
exit 0
