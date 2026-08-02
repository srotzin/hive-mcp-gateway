#!/usr/bin/env bash
# smoke.sh: hive-mcp-gateway local smoke test
#
# Tests: /health, /.well-known/mcp.json, honest 404 (no fabricated success),
#        root POST /mcp (tools/list aggregate, tools/call correctly rejected),
#        each mounted feature's /health + /.well-known/mcp.json + tools/list,
#        env validation fail-closed on a bad HIVE_BASE.
#
# Exits 0 on success, 1 on any failure.

set -uo pipefail

PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[PASS]${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "${RED}[FAIL]${NC} $1"; FAIL=$((FAIL+1)); }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

fuser -k "${PORT}/tcp" 2>/dev/null || true
command -v node >/dev/null 2>&1 || { echo "node not found, aborting"; exit 1; }

if [ ! -d "${SCRIPT_DIR}/node_modules" ]; then
  info "Installing dependencies…"
  npm install --omit=dev --no-audit --no-fund --silent
fi

info "Test 0: env validation fails closed on bad HIVE_BASE"
set +e
HIVE_BASE="not-a-url" node gateway.js > /tmp/hive-mcp-gateway-envtest.log 2>&1
ENV_EXIT=$?
set -e 2>/dev/null || true
if [ "$ENV_EXIT" -ne 0 ] && grep -q "FATAL: invalid environment" /tmp/hive-mcp-gateway-envtest.log; then
  ok "Bad HIVE_BASE refused at boot (exit ${ENV_EXIT})"
else
  fail "Bad HIVE_BASE did not fail closed (exit ${ENV_EXIT})"
fi

node gateway.js > /tmp/hive-mcp-gateway-smoke.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null; exit' INT TERM EXIT

info "Waiting for server to be ready…"
for i in $(seq 1 20); do
  if curl -sf "${BASE}/health" >/dev/null 2>&1; then
    info "Server ready after ${i} attempts"
    break
  fi
  sleep 0.5
done

jsonrpc() {
  local path="$1" method="$2" params="$3"
  curl -sf -X POST -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"${method}\",\"params\":${params}}" \
    "${BASE}${path}"
}

info "Test 1: GET /health"
HEALTH=$(curl -sf "${BASE}/health") || fail "GET /health failed"
echo "$HEALTH" | grep -q '"status":"ok"' && ok "GET /health → status ok" || fail "GET /health unexpected: $HEALTH"

info "Test 2: GET /.well-known/mcp.json"
MCP_JSON=$(curl -sf "${BASE}/.well-known/mcp.json") || fail "GET /.well-known/mcp.json failed"
echo "$MCP_JSON" | grep -q '"name":"hive-mcp-gateway"' && ok "well-known → name present" || fail "well-known → name missing"

info "Test 3: honest 404 (no fabricated success)"
CODE=$(curl -s -o /tmp/gw404.json -w "%{http_code}" "${BASE}/totally-not-a-real-route")
if [ "$CODE" = "404" ]; then ok "GET /totally-not-a-real-route → 404"; else fail "GET unknown route → ${CODE} (expected 404)"; fi
grep -q '"error":"not_found"' /tmp/gw404.json && ok "404 body → honest not_found error" || fail "404 body missing error field"

info "Test 4: root POST /mcp tools/list (aggregate)"
ROOT_TOOLS=$(jsonrpc "/mcp" "tools/list" "{}") || fail "root tools/list failed"
ROOT_TOOLS_N=$(echo "$ROOT_TOOLS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['result']['tools']))" 2>/dev/null || echo 0)
[ "$ROOT_TOOLS_N" -gt 0 ] 2>/dev/null && ok "root tools/list → ${ROOT_TOOLS_N} aggregated tools" || fail "root tools/list → 0 tools"

info "Test 5: root POST /mcp tools/call correctly rejected (not fabricated)"
ROOT_CALL=$(jsonrpc "/mcp" "tools/call" '{"name":"x","arguments":{}}') || true
echo "$ROOT_CALL" | grep -q '\-32601' && ok "root tools/call → correctly rejected with method-not-found" || fail "root tools/call → unexpected: $ROOT_CALL"

info "Test 6: mounted feature sub-servers (health + well-known + tools/list)"
for feature in evaluator trade depin compute-grid morph insurance-broker dispute; do
  FH=$(curl -sf "${BASE}/${feature}/health") || { fail "${feature}/health failed"; continue; }
  echo "$FH" | grep -q '"status":"ok"' && ok "${feature}/health → ok" || fail "${feature}/health unexpected: $FH"
  FMCP=$(curl -sf "${BASE}/${feature}/.well-known/mcp.json") || fail "${feature}/.well-known/mcp.json failed"
  echo "$FMCP" | grep -q '"endpoint"' && ok "${feature}/.well-known/mcp.json → endpoint present" || fail "${feature} well-known missing endpoint"
  FTOOLS=$(jsonrpc "/${feature}/mcp" "tools/list" "{}") || fail "${feature} tools/list failed"
  FTOOLS_N=$(echo "$FTOOLS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['result']['tools']))" 2>/dev/null || echo 0)
  [ "$FTOOLS_N" -gt 0 ] 2>/dev/null && ok "${feature} tools/list → ${FTOOLS_N} tools" || fail "${feature} tools/list → 0 tools"
done

info "Test 7: audit-readiness proxy mount"
ARH=$(curl -sf "${BASE}/audit-readiness/health") || fail "audit-readiness/health failed"
echo "$ARH" | grep -q '"status":"ok"' && ok "audit-readiness/health → ok" || fail "audit-readiness/health unexpected: $ARH"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Passed: ${GREEN}${PASS}${NC}  Failed: ${RED}${FAIL}${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}SMOKE TEST FAILED${NC}"
  exit 1
fi
echo -e "${GREEN}SMOKE TEST PASSED${NC}"
exit 0
