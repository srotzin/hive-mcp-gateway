# hive-mcp-gateway

[![srotzin/hive-mcp-gateway MCP server](https://glama.ai/mcp/servers/srotzin/hive-mcp-gateway/badges/score.svg)](https://glama.ai/mcp/servers/srotzin/hive-mcp-gateway)

Hive Civilization MCP registry — discovery surface for the 22 hive-mcp-* servers.

The gateway hosts a registry at `/.well-known/mcp.json` and continues to mount 5 MCP servers in-process for legacy compatibility. Direct shim URLs are recommended for Glama / Smithery probes; the gateway is for discovery, not as a hot-path proxy.

## Mounted servers (legacy in-process mounts)

| Path | Repo | Description |
|---|---|---|
| `/evaluator/mcp` | [hive-mcp-evaluator](https://github.com/srotzin/hive-mcp-evaluator) | ERC-8183 / Virtuals ACP v2.0 evaluator-as-a-service |
| `/trade/mcp` | [hive-mcp-trade](https://github.com/srotzin/hive-mcp-trade) | Cross-border SMB invoice settlement on USDC/USDT |
| `/depin/mcp` | [hive-mcp-depin](https://github.com/srotzin/hive-mcp-depin) | DePIN provider marketplace |
| `/compute-grid/mcp` | [hive-mcp-compute-grid](https://github.com/srotzin/hive-mcp-compute-grid) | Cross-pool compute auction grid |
| `/morph/mcp` | [hive-mcp-morph](https://github.com/srotzin/hive-mcp-morph) | Polymorphic-identity & brood telemetry |

Each path also exposes `/<feature>/health` and `/<feature>/.well-known/mcp.json`.

Top-level: `/` (server index) and `/health`.

## Direct Shim URLs

The gateway is a discovery surface. Direct URLs are recommended for Glama / Smithery probes.

| Slug | Direct URL | Repo |
|---|---|---|
| `agent-kyc` | https://hive-mcp-agent-kyc.onrender.com | https://github.com/srotzin/hive-mcp-agent-kyc |
| `agent-storage` | https://hive-mcp-agent-storage.onrender.com | https://github.com/srotzin/hive-mcp-agent-storage |
| `capital` | https://hive-mcp-capital.onrender.com | https://github.com/srotzin/hive-mcp-capital |
| `compute` | https://hive-mcp-compute.onrender.com | https://github.com/srotzin/hive-mcp-compute |
| `compute-grid` | https://hive-mcp-compute-grid.onrender.com | https://github.com/srotzin/hive-mcp-compute-grid |
| `connector` | https://hive-mcp-connector.onrender.com | https://github.com/srotzin/hive-mcp-connector |
| `credit` | https://hive-mcp-credit.onrender.com | https://github.com/srotzin/hive-mcp-credit |
| `depin` | https://hive-mcp-depin.onrender.com | https://github.com/srotzin/hive-mcp-depin |
| `escrow` | https://hive-mcp-escrow.onrender.com | https://github.com/srotzin/hive-mcp-escrow |
| `evaluator` | https://hive-mcp-evaluator.onrender.com | https://github.com/srotzin/hive-mcp-evaluator |
| `exchange` | https://hive-mcp-exchange.onrender.com | https://github.com/srotzin/hive-mcp-exchange |
| `gateway` | https://hive-mcp-gateway.onrender.com | https://github.com/srotzin/hive-mcp-gateway |
| `identity` | https://hive-mcp-identity.onrender.com | https://github.com/srotzin/hive-mcp-identity |
| `insurance` | https://hive-mcp-insurance.onrender.com | https://github.com/srotzin/hive-mcp-insurance |
| `mining` | https://hive-mcp-mining.onrender.com | https://github.com/srotzin/hive-mcp-mining |
| `morph` | https://hive-mcp-morph.onrender.com | https://github.com/srotzin/hive-mcp-morph |
| `mos` | https://hive-mcp-mos.onrender.com | https://github.com/srotzin/hive-mcp-mos |
| `oracle` | https://hive-mcp-oracle.onrender.com | https://github.com/srotzin/hive-mcp-oracle |
| `swap` | https://hive-mcp-swap.onrender.com | https://github.com/srotzin/hive-mcp-swap |
| `trade` | https://hive-mcp-trade.onrender.com | https://github.com/srotzin/hive-mcp-trade |
| `vault` | https://hive-mcp-vault.onrender.com | https://github.com/srotzin/hive-mcp-vault |
| `zk-attestation` | https://hive-mcp-zk-attestation.onrender.com | https://github.com/srotzin/hive-mcp-zk-attestation |

Each shim exposes `/mcp` (JSON-RPC) and `/.well-known/mcp.json` (discovery).

## Local run

```bash
npm install
node gateway.js
# Then:
curl http://localhost:3000/
curl http://localhost:3000/.well-known/mcp.json
curl http://localhost:3000/evaluator/health
curl -X POST http://localhost:3000/morph/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Deploy

Render: see `render.yaml`. Docker: see `Dockerfile`.

## License

MIT. Hive Civilization gold `#C08D23` (Pantone 1245 C).

## Hive Civilization Directory

Part of the Hive Civilization — agent-native financial infrastructure.

- Endpoint Directory: https://thehiveryiq.com
- Live Leaderboard: https://hive-a2amev.onrender.com/leaderboard
- Revenue Dashboard: https://hivemine-dashboard.onrender.com
- Other MCP Servers: https://github.com/srotzin?tab=repositories&q=hive-mcp

Brand: #C08D23
<!-- /hive-footer -->

---

## About Hive Civilization

This MCP server is part of the [Hive Civilization](https://thehiveryiq.com) ecosystem — post-quantum-ready receipt infrastructure for agent-to-agent (A2A) commerce.

Each transaction can be receipted with [post-quantum receipts](https://thehiveryiq.com/post-quantum-receipts.html) using [ML-DSA-65 (NIST FIPS 204)](https://thehiveryiq.com/ml-dsa-receipts.html) dual signatures and [ML-KEM-768 (NIST FIPS 203)](https://thehiveryiq.com/post-quantum-receipts.html) key encapsulation. Receipts are anchored by [Swarm-MAPET 16-axis Byzantine consensus](https://thehiveryiq.com/swarm-mapet.html) and settled in USDC on Base 8453.

**Pricing:** per-call profiles from Nano $0.0001 to Swarm $0.0096. See [pricing](https://thehiveryiq.com/pricing.html).

**Learn more:**
- [How agent-to-agent commerce works (A2A / AP2 / MCP primer)](https://thehiveryiq.com/agent-to-agent-commerce.html)
- [Hive platform architecture](https://thehiveryiq.com/platform.html)
- [Developer SDKs (Node, Python, Go)](https://thehiveryiq.com/developers.html)
- [Compliance & EU AI Act alignment](https://thehiveryiq.com/compliance.html)

<!-- HIVE_FOOTER_END -->
