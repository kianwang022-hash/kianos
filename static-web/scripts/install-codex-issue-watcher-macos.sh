#!/bin/bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer targets macOS." >&2
  exit 2
fi

PROJECT_DIR="${KIANOS_CODEX_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
if [[ -z "$PROJECT_DIR" ]] || ! PROJECT_DIR="$(git -C "$PROJECT_DIR" rev-parse --show-toplevel 2>/dev/null)"; then
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
EXEC_REPO="${KIANOS_CODEX_EXEC_REPO:-$HOME/Library/Application Support/KianOS/codex-executor/kianos}"
COMMAND_TIMEOUT_MS="${KIANOS_CODEX_WATCHER_COMMAND_TIMEOUT_MS:-30000}"
EXECUTOR_TIMEOUT_MS="${KIANOS_CODEX_WATCHER_EXECUTOR_TIMEOUT_MS:-1800000}"
PATH_VALUE="$(dirname "$NODE_BIN"):$(dirname "$GH_BIN"):$(dirname "$CODEX_BIN"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

if [[ ! -f "$SCRIPT" ]]; then
  echo "Watcher script missing: $SCRIPT" >&2
  exit 2
fi
if ! [[ "$INTERVAL" =~ ^[0-9]+$ ]] || (( INTERVAL < 60 )); then
  echo "Interval must be an integer >= 60 seconds." >&2
  exit 2
fi

for timeout in "$COMMAND_TIMEOUT_MS" "$EXECUTOR_TIMEOUT_MS"; do
  if ! [[ "$timeout" =~ ^[0-9]+$ ]] || (( timeout < 100 || timeout > 21600000 )); then
    echo "Timeout must be a positive bounded integer in milliseconds." >&2
    exit 2
  fi
done
if (( COMMAND_TIMEOUT_MS > 300000 )); then
  echo "Command timeout must not exceed 300000 milliseconds." >&2
  exit 2
fi
# Reinstallation must never kill a running executor or clear its durable claim.
# The obsolete lock-acquire directory carries no ownership in the repaired
# watcher. Preserve it for diagnosis; it must not permanently prevent recovery.
SERVICE_STATE="$(launchctl print "gui/$(id -u)/$LABEL" 2>/dev/null || true)"
if [[ "$SERVICE_STATE" == *"state = running"* ]] || [[ -d "$STATE_DIR/lock" ]]; then
  echo "Watcher ownership is active or unresolved; finish/reconcile it before reinstalling." >&2
  exit 2
fi
mkdir -p "$HOME/Library/LaunchAgents" "$STATE_DIR" "$LOG_DIR"
chmod 700 "$STATE_DIR"
DOMAIN="gui/$(id -u)"
PLIST_TMP="$(mktemp "$PLIST.XXXXXX")"
trap 'rm -f "$PLIST_TMP"' EXIT

cat > "$PLIST_TMP" <<EOF
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
    <key>KIANOS_CODEX_EXEC_REPO</key>
    <string>$EXEC_REPO</string>
    <key>KIANOS_CODEX_WATCHER_COMMAND_TIMEOUT_MS</key>
    <string>$COMMAND_TIMEOUT_MS</string>
    <key>KIANOS_CODEX_WATCHER_EXECUTOR_TIMEOUT_MS</key>
    <string>$EXECUTOR_TIMEOUT_MS</string>
    <key>KIANOS_CODEX_BIN</key>
    <string>$CODEX_BIN</string>
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

plutil -lint "$PLIST_TMP" >/dev/null
SERVICE_STATE="$(launchctl print "$DOMAIN/$LABEL" 2>/dev/null || true)"
if [[ "$SERVICE_STATE" == *"state = running"* ]] || [[ -d "$STATE_DIR/lock" ]]; then
  echo "Watcher became active; installation deferred without stopping it." >&2
  exit 2
fi
BACKUP=""
if [[ -f "$PLIST" ]]; then
  BACKUP="$(mktemp "$PLIST.before.XXXXXX")"
  cp -p "$PLIST" "$BACKUP"
fi
launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
mv "$PLIST_TMP" "$PLIST"
if ! launchctl bootstrap "$DOMAIN" "$PLIST"; then
  if [[ -n "$BACKUP" ]]; then
    cp -p "$BACKUP" "$PLIST"
    launchctl bootstrap "$DOMAIN" "$PLIST" || true
  fi
  echo "Watcher installation failed; previous configuration retained." >&2
  exit 2
fi

echo "Installed $LABEL"
echo "interval_seconds=$INTERVAL"
echo "cloud=disabled; local execution has one attempt per task body, no automatic retry"
echo "command_timeout_ms=$COMMAND_TIMEOUT_MS"
echo "executor_timeout_ms=$EXECUTOR_TIMEOUT_MS"
echo "project=$PROJECT_DIR"
echo "executor_repo=$EXEC_REPO"
