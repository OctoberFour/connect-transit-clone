#!/usr/bin/env bash
set -e
PORT=${PORT:-8080}
DIR="$(dirname "$0")/clone"
echo "Serving $DIR on http://localhost:$PORT"
exec npx --yes serve -s -l "$PORT" "$DIR"
