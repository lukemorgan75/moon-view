#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${GITHUB_REPO:-lukemorgan75/moon-view}"

cd "$ROOT"
GITHUB_PAGES=true npm run build

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT
cp -R dist/. "$TMPDIR/"

cd "$TMPDIR"
git init -b gh-pages
git add -A
git commit -m "Deploy Moon View $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git remote add origin "https://github.com/${REPO}.git"
git -c http.postBuffer=524288000 -c http.version=HTTP/1.1 push -f origin gh-pages

echo "Deployed to https://${REPO%%/*}.github.io/${REPO##*/}/"