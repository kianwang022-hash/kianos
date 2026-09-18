#!/bin/bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer currently targets macOS." >&2
  exit 2
fi

REPO_URL="${KIANOS_REPO_URL:-https://github.com/kianwang022-hash/kianos.git}"
MIRROR_DIR="${KIANOS_CURRENT_DIR:-$HOME/KianOS-current}"
LABEL="com.kianos.current-mirror"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG_DIR="$HOME/Library/Logs/KianOS"
PRIVATE_DIR="${KIANOS_PRIVATE_DIR:-$HOME/Library/Application Support/KianOS/learner-state}"
INTERVAL_MS="${KIANOS_SYNC_INTERVAL_MS:-8000}"
PORT="${KIANOS_PORT:-4321}"

GIT_BIN="$(command -v git || true)"
NODE_BIN="$(command -v node || true)"
NPM_BIN="$(command -v npm || true)"
LSOF_BIN="$(command -v lsof || true)"

for pair in "git:$GIT_BIN" "node:$NODE_BIN" "npm:$NPM_BIN"; do
  name="${pair%%:*}"
  value="${pair#*:}"
  if [[ -z "$value" ]]; then
    echo "Missing required command: $name" >&2
    exit 2
  fi
done

mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR" "$PRIVATE_DIR"
chmod 700 "$PRIVATE_DIR"
DOMAIN="gui/$(id -u)"
launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true

if [[ -n "$LSOF_BIN" ]]; then
  EXISTING_PIDS="$($LSOF_BIN -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$EXISTING_PIDS" ]]; then
    for pid in $EXISTING_PIDS; do
      command_line="$(ps -p "$pid" -o command= 2>/dev/null || true)"
      lower_command="$(printf '%s' "$command_line" | tr '[:upper:]' '[:lower:]')"
      if [[ "$lower_command" == *astro* && "$lower_command" == *kianos* ]]; then
        echo "Stopping old KianOS Astro listener on :$PORT (pid $pid)"
        kill "$pid" >/dev/null 2>&1 || true
      else
        echo "Port $PORT is already used by another process:" >&2
        echo "  pid $pid  $command_line" >&2
        echo "Refusing to kill it. Set KIANOS_PORT to another stable port and rerun." >&2
        exit 2
      fi
    done
    sleep 1
  fi
fi

if [[ ! -e "$MIRROR_DIR" ]]; then
  echo "Cloning dedicated Current mirror → $MIRROR_DIR"
  "$GIT_BIN" clone --branch main --single-branch "$REPO_URL" "$MIRROR_DIR"
elif [[ ! -d "$MIRROR_DIR/.git" ]]; then
  echo "Refusing to reuse non-git directory: $MIRROR_DIR" >&2
  exit 2
elif [[ ! -f "$MIRROR_DIR/.git/kianos-current-mirror" ]]; then
  echo "Refusing to take over an existing working repository." >&2
  echo "Choose an empty KIANOS_CURRENT_DIR or remove that directory yourself first." >&2
  exit 2
fi

cd "$MIRROR_DIR"
touch .git/kianos-current-mirror
"$GIT_BIN" fetch origin main --prune
"$GIT_BIN" checkout -B main origin/main
"$GIT_BIN" reset --hard origin/main

cd "$MIRROR_DIR/static-web"
"$NPM_BIN" install --no-audit --no-fund

PATH_VALUE="$(dirname "$NODE_BIN"):$(dirname "$NPM_BIN"):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
SCRIPT="$MIRROR_DIR/static-web/scripts/kianos-current-sync.mjs"

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
  </array>
  <key>WorkingDirectory</key>
  <string>$MIRROR_DIR</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>$PATH_VALUE</string>
    <key>KIANOS_NPM_BIN</key>
    <string>$NPM_BIN</string>
    <key>KIANOS_SYNC_INTERVAL_MS</key>
    <string>$INTERVAL_MS</string>
    <key>KIANOS_PORT</key>
    <string>$PORT</string>
    <key>KIANOS_PRIVATE_DIR</key>
    <string>$PRIVATE_DIR</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ProcessType</key>
  <string>Background</string>
  <key>ThrottleInterval</key>
  <integer>3</integer>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/current.out.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/current.err.log</string>
</dict>
</plist>
EOF

launchctl bootstrap "$DOMAIN" "$PLIST"
launchctl kickstart -k "$DOMAIN/$LABEL"

sleep 2
open "http://127.0.0.1:$PORT/" >/dev/null 2>&1 || true

cat <<EOF

KianOS Current mirror installed.

GitHub main → $MIRROR_DIR → Astro localhost:$PORT
Sync interval: $((INTERVAL_MS / 1000))s
LaunchAgent: $PLIST
Logs: $LOG_DIR/current.out.log
Private learner checkpoints: $PRIVATE_DIR

This mirror is intentionally disposable/read-only. Do not develop in it.
Your normal development worktree can remain separate.
EOF
