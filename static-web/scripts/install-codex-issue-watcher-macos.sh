#!/bin/bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer targets macOS." >&2
  exit 2
fi

PROJECT_DIR="${KIANOS_CODEX_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
if [[ -z "$PROJECT_DIR" || ! -d "$PROJECT_DIR/.git" ]]; then
  echo "Run from the real KianOS local project or set KIANOS_CODEX_PROJECT_DIR." >&2
  exit 2
fi

ORIGIN="$(git -C "$PROJECT_DIR" remote get-url origin 2>/dev/null || true)"
if [[ "$ORIGIN" != *"kianwang022-hash/kianos"* ]]; then
  echo "Refusing non-KianOS project: $ORIGIN" >&2
  exit 2
fi

NODE_BIN="$(command -v node || true)"
GH_BIN="$(command -v gh || true)"
CODEX_BIN="$(command -v codex || true)"
for pair in "node:$NODE_BIN" "gh:$GH_BIN" "codex:$CODEX_BIN"; do
  name="${pair%%:*}"
  value="${pair#*:}"
  if [[ -z "$value" ]]; then
    echo "Missing required command: $name" >&2
    exit 2
  fi
done

LABEL="com.kianos.codex-issue-watcher"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
STATE_DIR="$HOME/Library/Application Support/KianOS/codex-issue-watcher"
LOG_DIR="$HOME/Library/Logs/KianOS"
SCRIPT="$PROJECT_DIR/static-web/scripts/codex-issue-watcher.mjs"
INTERVAL="${KIANOS_CODEX_WATCHER_INTERVAL_SECONDS:-300}"
MODEL="${KIANOS_CODEX_WATCHER_MODEL:-gpt-5.6-terra}"
EFFORT="${KIANOS_CODEX_WATCHER_EFFORT:-medium}"
PATH_VALUE="$(dirname "$NODE_BIN"):$(dirname "$GH_BIN"):$(dirname "$CODEX_BIN"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

if [[ ! -f "$SCRIPT" ]]; then
  echo "Watcher script missing: $SCRIPT" >&2
  exit 2
fi
if ! [[ "$INTERVAL" =~ ^[0-9]+$ ]] || (( INTERVAL < 60 )); then
  echo "Interval must be an integer >= 60 seconds." >&2
  exit 2
fi

mkdir -p "$HOME/Library/LaunchAgents" "$STATE_DIR" "$LOG_DIR"
chmod 700 "$STATE_DIR"
DOMAIN="gui/$(id -u)"
launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE_BIN</string>
    <string>$SCRIPT</string>
    <string>--json</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$PROJECT_DIR</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>$PATH_VALUE</string>
    <key>KIANOS_CODEX_PROJECT_DIR</key>
    <string>$PROJECT_DIR</string>
    <key>KIANOS_CODEX_WATCHER_STATE_DIR</key>
    <string>$STATE_DIR</string>
    <key>KIANOS_CODEX_WATCHER_MODEL</key>
    <string>$MODEL</string>
    <key>KIANOS_CODEX_WATCHER_EFFORT</key>
    <string>$EFFORT</string>
  </dict>
  <key>StartInterval</key>
  <integer>$INTERVAL</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>ProcessType</key>
  <string>Background</string>
  <key>LowPriorityIO</key>
  <true/>
  <key>Nice</key>
  <integer>10</integer>
  <key>ThrottleInterval</key>
  <integer>60</integer>
  <key>StandardOutPath</key>
  <string>/dev/null</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/codex-issue-watcher.err.log</string>
</dict>
</plist>
EOF

plutil -lint "$PLIST" >/dev/null
launchctl bootstrap "$DOMAIN" "$PLIST"
launchctl kickstart -k "$DOMAIN/$LABEL"

echo "Installed $LABEL"
echo "interval_seconds=$INTERVAL"
echo "model=$MODEL"
echo "effort=$EFFORT"
echo "project=$PROJECT_DIR"
