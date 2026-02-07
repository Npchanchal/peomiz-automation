#!/usr/bin/env bash
# Regression suite runner: Integration (PHPUnit) + Sanity + E2E (Playwright)
# Runs all suites in sequence. Fails fast on first failure.
# Idempotent: Integration uses RefreshDatabase; Playwright tests use unique IDs or read-only ops.
# CI-ready: Set CI=1 for retries and junit output.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTOMATION_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$AUTOMATION_DIR/.." && pwd)"

cd "$AUTOMATION_DIR"

echo "=== Regression Suite ==="
echo "1/2 Integration (PHPUnit)"
echo "2/2 Playwright (sanity + e2e + regression)"
echo ""

# 1. Integration tests (Laravel PHPUnit)
echo ">> Running Integration tests..."
(cd "$PROJECT_ROOT/peomiz.prod" && php vendor/bin/phpunit --testsuite=Integration)
echo ">> Integration OK"
echo ""

# 2. Playwright: sanity + e2e + regression
echo ">> Running Playwright (sanity, e2e, regression)..."
cd "$AUTOMATION_DIR"
if [ -n "$CI" ]; then
  npx playwright test suites/sanity suites/e2e suites/regression \
    --config=playwright.config.ts \
    --reporter=list \
    --reporter=junit,output=test-results/junit.xml
else
  npx playwright test suites/sanity suites/e2e suites/regression \
    --config=playwright.config.ts
fi
echo ">> Playwright OK"
echo ""
echo "=== Regression suite passed ==="
