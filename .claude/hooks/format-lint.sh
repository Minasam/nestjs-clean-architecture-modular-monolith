#!/usr/bin/env bash
# PostToolUse hook (ADR 0010): after Claude edits/writes a file, format it with Prettier
# and auto-fix it with ESLint. Remaining ESLint errors are reported back to Claude
# (exit code 2 => stderr is shown to Claude so it can fix them).
set -uo pipefail

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
bin="$project_dir/node_modules/.bin"

# Extract the edited file path from the hook's JSON input (node is always available here).
file="$(node -e '
  let s = ""; process.stdin.on("data", d => (s += d)).on("end", () => {
    try { const j = JSON.parse(s); process.stdout.write(j.tool_input?.file_path ?? j.tool_response?.filePath ?? ""); }
    catch { /* not JSON: ignore */ }
  });')"

[[ -z "$file" || ! -f "$file" ]] && exit 0
[[ -x "$bin/prettier" ]] || exit 0   # dependencies not installed yet

case "$file" in
  "$project_dir"/node_modules/*|"$project_dir"/dist/*|"$project_dir"/coverage/*) exit 0 ;;
esac

case "$file" in
  *.ts|*.mts|*.cts|*.js|*.mjs|*.cjs)
    "$bin/prettier" --write --log-level=warn "$file" >/dev/null 2>&1
    if ! out="$("$bin/eslint" --fix "$file" 2>&1)"; then
      echo "ESLint found problems in $file after auto-fix:" >&2
      echo "$out" >&2
      exit 2
    fi
    ;;
  *.json|*.md|*.yml|*.yaml)
    "$bin/prettier" --write --log-level=warn --ignore-unknown "$file" >/dev/null 2>&1
    ;;
esac
exit 0
