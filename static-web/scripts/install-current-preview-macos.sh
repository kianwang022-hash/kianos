#!/bin/bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This preview installer currently targets macOS." >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REF="${KIANOS_SYNC_REF:-$(git -C "$REPO_ROOT" branch --show-current)}"

if [[ -z "$REF" || "$REF" == "HEAD" ]]; then
  echo "Cannot infer preview branch from detached HEAD. Set KIANOS_SYNC_REF explicitly." >&2
  exit 2
fi
if [[ "$REF" == "main" ]]; then
  echo "Current branch is main. Use npm run current:install for the stable mirror." >&2
  exit 2
fi

echo "Installing KianOS Current preview from: $REF"
KIANOS_SYNC_REF="$REF" exec bash "$SCRIPT_DIR/install-current-macos.sh"
