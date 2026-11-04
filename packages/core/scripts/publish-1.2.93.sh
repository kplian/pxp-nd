#!/usr/bin/env bash
# Publish @pxp-nd/core@1.2.93 to the public npm registry.
# Run from repo root or from packages/core after: git push origin refactor
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Branch and version"
git -C "$ROOT/../.." rev-parse --abbrev-ref HEAD
node -p "require('./package.json').version"

echo "==> Build and test"
npm run build
npm test

echo "==> Dry-run pack (expect dist/ + README only)"
npm pack --dry-run

echo "==> npm whoami (must succeed before publish)"
npm whoami

echo "==> Publish"
npm run prod:publish

echo "==> Verify registry"
npm view @pxp-nd/core version

echo "Done. In Tempo: npm install @pxp-nd/core@1.2.93 && npm run build"
