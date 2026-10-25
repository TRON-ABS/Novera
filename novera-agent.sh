#!/usr/bin/env bash
# Convenience launcher for the locally-built Novera agent CLI.
# Usage:
#   ./novera-agent.sh                 -> opens the interactive agent UI
#   ./novera-agent.sh agent status    -> forwards arguments to the local CLI
#   ./novera-agent.sh agent run "..." -> runs a task headlessly

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$DIR/src-tauri/resources/bin"
AGENT_BIN=""

# The standalone CLI still builds as `jan` internally. Accept that name until
# the binary itself is migrated, including its Windows Git Bash/MSYS2 variant.
for name in novera novera.exe jan jan.exe; do
  if [ -x "$BIN_DIR/$name" ]; then
    AGENT_BIN="$BIN_DIR/$name"
    break
  fi
done

if [ -z "$AGENT_BIN" ]; then
  echo "error: Novera agent CLI not found or not executable in $BIN_DIR" >&2
  echo "Build the local agent CLI before using this launcher." >&2
  exit 1
fi

cd "$DIR/src-tauri"

if [ "$#" -eq 0 ]; then
  exec "$AGENT_BIN" agent ui
else
  exec "$AGENT_BIN" "$@"
fi
