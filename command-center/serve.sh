#!/usr/bin/env bash
# Start the MoneyBot Command Center dashboard server.
#
# Usage:
#   bash command-center/serve.sh
#   bash command-center/serve.sh --refresh   # regenerate data first

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT="${MONEYBOT_COMMAND_CENTER_PORT:-8765}"

if [[ "${1:-}" == "--refresh" ]]; then
  bash "$ROOT/aggregate-data.sh"
fi

echo "MoneyBot Command Center"
echo "Open: http://localhost:$PORT"
echo "Press Ctrl+C to stop"
echo

cd "$ROOT"
exec python3 -m http.server --bind 0.0.0.0 "$PORT"
