# Claude Code Status Line 顏色化作法

## 目的
- 讓 `model`、`ctx`、`5h`、`r`、`7d` 在 status line 上更易讀。
- 避免只靠數字判斷風險，改用顏色即時提示。

## 欄位來源（官方 + 相容）
- `model.display_name`
- `context_window.remaining_percentage`
- `rate_limits.five_hour.used_percentage`
- `rate_limits.seven_day.used_percentage`
- `rate_limits.five_hour.resets_at`（官方）
- `rate_limits.five_hour.reset_at`（相容舊欄位）

> 註：`rate_limits` 相關欄位可能依帳號/會話狀態缺失，必須有 fallback。

## 顏色規則建議
- `model`：固定紫色（辨識當前模型）
- `ctx`：依剩餘百分比
  - 綠：>= 50
  - 黃：21 ~ 49
  - 紅：<= 20
- `5h` / `7d`：以 used% 判斷
  - 綠：<= 50
  - 黃：51 ~ 79
  - 紅：>= 80
- `r`（倒數）：
  - 灰：正常
  - 黃：<= 30 分鐘
  - 紅：<= 10 分鐘
  - `--`：缺值（建議灰色）
  - `parse_err`：解析失敗（建議紅色）

## 輸出格式建議
- 基本：
  - `Model | POS | ctx:90% left | 5h:97% | r:02h13m | 7d:29%`
- 顏色化後：
  - 各段以 ANSI 顏色包裹，分隔符 `|` 可用淡灰色。

## 實作重點
1. 使用 `jq` 取值，對缺值一律使用 `// empty`。
2. `resets_at` 優先，`reset_at` 作為後備。
3. `resets_at` 可能是 Unix epoch，需支援純數字判斷。
4. 時間解析建議流程：
   - 若為純數字：直接視為 epoch 秒。
   - 否則嘗試 `date -d`。
   - 再 fallback `python3 datetime.fromisoformat`。
5. 倒數輸出：
   - 成功：`HHhMMm`
   - 缺值：`--`
   - 解析失敗：`parse_err`
   - 過期：`00h00m`

## 驗證清單
- 語法驗證
  - `sh -n ~/.claude/statusline-command.sh`
- 行為驗證（四種）
  - future：應顯示 `r:HHhMMm`
  - missing：應顯示 `r:--`
  - invalid：應顯示 `r:parse_err`
  - expired：應顯示 `r:00h00m`
- 介面驗證
  - 確認 status line 不被截斷
  - 紅黃綠轉換是否符合門檻

## 常見問題
- `r:--` 一直出現：
  - 多半是 payload 沒提供 reset 欄位，不一定是程式錯。
- 整段 status line 消失：
  - 先做 `sh -n`，通常是腳本語法錯誤。
- 顏色不顯示：
  - 先檢查終端是否支援 ANSI。

## 參考
- Claude Code 官方文件（Status Line）
- 社群教學文章：  
  [Claude Code Status Line 設定教學](https://israynotarray.com/ai/20260326/1431610072/)

## 可直接貼上的腳本範本（Bash）

> 建議儲存為 `~/.claude/statusline-command.sh`，並在 `settings.json` 指向此檔案。

```bash
#!/usr/bin/env bash
input=$(cat)

JQ_BIN=""
if command -v jq >/dev/null 2>&1; then
  JQ_BIN="jq"
elif [ -f "/c/Users/ig2506/AppData/Local/Microsoft/WinGet/Packages/jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe/jq.exe" ]; then
  JQ_BIN="/c/Users/ig2506/AppData/Local/Microsoft/WinGet/Packages/jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe/jq.exe"
else
  echo "Claude Code"
  exit 0
fi

model=$(echo "$input" | $JQ_BIN -r '.model.display_name // "Claude"')
cwd=$(echo "$input" | $JQ_BIN -r '.workspace.current_dir // .cwd // ""')
remaining=$(echo "$input" | $JQ_BIN -r '.context_window.remaining_percentage // empty')
five=$(echo "$input" | $JQ_BIN -r '.rate_limits.five_hour.used_percentage // empty')
five_reset=$(echo "$input" | $JQ_BIN -r '.rate_limits.five_hour.resets_at // .rate_limits.five_hour.reset_at // empty')
week=$(echo "$input" | $JQ_BIN -r '.rate_limits.seven_day.used_percentage // empty')

to_epoch_utc() {
  local val="$1"
  [ -z "$val" ] && return 1
  if printf '%s' "$val" | awk '/^[0-9]+$/{exit 0} {exit 1}'; then
    printf '%s\n' "$val"
    return 0
  fi
  if date -u -d "$val" +%s >/dev/null 2>&1; then
    date -u -d "$val" +%s
    return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$val" <<'PY'
import sys
from datetime import datetime
try:
    s = sys.argv[1].replace("Z", "+00:00")
    print(int(datetime.fromisoformat(s).timestamp()))
except Exception:
    sys.exit(1)
PY
    return $?
  fi
  return 1
}

now_epoch_utc() {
  if date -u +%s >/dev/null 2>&1; then
    date -u +%s
    return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
import time
print(int(time.time()))
PY
    return $?
  fi
  return 1
}

fmt_hhmm() {
  local seconds="$1"
  [ -z "$seconds" ] && return 1
  [ "$seconds" -le 0 ] && return 1
  local h=$((seconds / 3600))
  local m=$(((seconds % 3600) / 60))
  printf "%02dh%02dm" "$h" "$m"
}

color_ctx() {
  local remain="$1"
  if [ "$remain" -le 20 ]; then printf "\033[31m"; return; fi
  if [ "$remain" -le 49 ]; then printf "\033[33m"; return; fi
  printf "\033[32m"
}

color_used() {
  local used="$1"
  if [ "$used" -ge 80 ]; then printf "\033[31m"; return; fi
  if [ "$used" -ge 51 ]; then printf "\033[33m"; return; fi
  printf "\033[32m"
}

color_reset() {
  local left="$1"
  if [ "$left" = "parse_err" ]; then printf "\033[31m"; return; fi
  if [ "$left" = "--" ]; then printf "\033[2m"; return; fi
  if [ "$left" = "00h00m" ]; then printf "\033[31m"; return; fi
  local hh="${left%%h*}"
  local mm="${left#*h}"; mm="${mm%m}"
  local total=$((10#$hh * 60 + 10#$mm))
  if [ "$total" -le 10 ]; then printf "\033[31m"; return; fi
  if [ "$total" -le 30 ]; then printf "\033[33m"; return; fi
  printf "\033[2m"
}

RESET="\033[0m"
SEP="\033[2m | ${RESET}"
MODEL_C="\033[35m"
DIR_C="\033[36m"

dir_name=$(basename "$cwd")
out="${MODEL_C}${model}${RESET}"
[ -n "$dir_name" ] && out="${out}${SEP}${DIR_C}${dir_name}${RESET}"

if [ -n "$remaining" ]; then
  ctx_i=$(printf '%.0f' "$remaining")
  out="${out}${SEP}$(printf '%bctx:%s%% left%b' "$(color_ctx "$ctx_i")" "$ctx_i" "$RESET")"
fi

if [ -n "$five" ]; then
  five_i=$(printf '%.0f' "$five")
  reset_show="--"
  if [ -n "$five_reset" ]; then
    now_e=$(now_epoch_utc)
    rs_e=$(to_epoch_utc "$five_reset")
    if [ $? -eq 0 ] && [ -n "$now_e" ] && [ -n "$rs_e" ]; then
      left=$((rs_e - now_e))
      if [ "$left" -le 0 ]; then
        reset_show="00h00m"
      else
        hhmm=$(fmt_hhmm "$left")
        if [ $? -eq 0 ] && [ -n "$hhmm" ]; then
          reset_show="$hhmm"
        else
          reset_show="parse_err"
        fi
      fi
    else
      reset_show="parse_err"
    fi
  fi
  five_seg=$(printf '%b5h:%s%%%b' "$(color_used "$five_i")" "$five_i" "$RESET")
  r_seg=$(printf '%br:%s%b' "$(color_reset "$reset_show")" "$reset_show" "$RESET")
  out="${out}${SEP}${five_seg}${SEP}${r_seg}"
fi

if [ -n "$week" ]; then
  week_i=$(printf '%.0f' "$week")
  out="${out}${SEP}$(printf '%b7d:%s%%%b' "$(color_used "$week_i")" "$week_i" "$RESET")"
fi

printf '%b' "$out"
```

## 啟用設定範本

在 `~/.claude/settings.json` 加上：

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash /c/Users/<你的使用者名稱>/.claude/statusline-command.sh"
  }
}
```

## 快速驗證指令

```bash
sh -n ~/.claude/statusline-command.sh
```

```bash
echo '{"model":{"display_name":"Sonnet 4.6"},"workspace":{"current_dir":"/c/Users/me/Documents/POS"},"context_window":{"remaining_percentage":90},"rate_limits":{"five_hour":{"used_percentage":97,"resets_at":4102444800},"seven_day":{"used_percentage":29}}}' | bash /c/Users/me/.claude/statusline-command.sh
```
