# hive-mcp-gateway

Single Node.js service hosting all 5 Hive Civilization MCP servers behind one Render deploy.

## Mounted servers

| Path | Repo | Description |
|---|---|---|
| `/evaluator/mcp` | [hive-mcp-evaluator](https://github.com/srotzin/hive-mcp-evaluator) | ERC-8183 / Virtuals ACP v2.0 evaluator-as-a-service |
| `/trade/mcp` | [hive-mcp-trade](https://github.com/srotzin/hive-mcp-trade) | Cross-border SMB invoice settlement on USDC/USDT |
| `/depin/mcp` | [hive-mcp-depin](https://github.com/srotzin/hive-mcp-depin) | DePIN provider marketplace |
| `/compute-grid/mcp` | [hive-mcp-compute-grid](https://github.com/srotzin/hive-mcp-compute-grid) | Cross-pool compute auction grid |
| `/morph/mcp` | [hive-mcp-morph](https://github.com/srotzin/hive-mcp-morph) | Polymorphic-identity & brood telemetry |

Each path also exposes `/<feature>/health` and `/<feature>/.well-known/mcp.json`.

Top-level: `/` (server index) and `/health`.

## Local run

```bash
npm install
node gateway.js
# Then:
curl http://localhost:3000/
curl http://localhost:3000/evaluator/health
curl -X POST http://localhost:3000/morph/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Deploy

Render: see `render.yaml`. Docker: see `Dockerfile`.

## License

MIT. Hive Civilization gold `#C08D23` (Pantone 1245 C).
