#!/usr/bin/env node
/**
 * hive-mcp-gateway
 *
 * Single Node.js service mounting 5 Hive Civilization MCP servers:
 *   /evaluator/mcp      ERC-8183 evaluator-as-a-service
 *   /trade/mcp          Cross-border invoice settlement
 *   /depin/mcp          DePIN provider marketplace
 *   /compute-grid/mcp   Cross-pool compute auction grid
 *   /morph/mcp          Polymorphic-identity & brood telemetry
 *
 * Each path also exposes:
 *   /<feature>/health
 *   /<feature>/.well-known/mcp.json
 *
 * Plus a top-level:
 *   /          server index (JSON listing all 5 mounts)
 *   /health    aggregate health
 *
 * Spec : MCP 2024-11-05 / Streamable-HTTP / JSON-RPC 2.0
 * Brand: Hive Civilization gold #C08D23 (Pantone 1245 C)
 */

import express from 'express';

import * as M_evaluator from './servers/hive-mcp-evaluator.mjs';
import * as M_trade from './servers/hive-mcp-trade.mjs';
import * as M_depin from './servers/hive-mcp-depin.mjs';
import * as M_compute_grid from './servers/hive-mcp-compute-grid.mjs';
import * as M_morph from './servers/hive-mcp-morph.mjs';

const app = express();
import { renderLanding, renderOgImage } from './landing.js';

app.use(express.json({ limit: '4mb' }));

// Always advertise gateway in headers (visible to crawlers + curl)
app.use((req, res, next) => {
  res.setHeader('X-Hive-Gateway', 'hive-mcp-gateway/1.0.4');
  res.setHeader('X-Hive-Brand', 'Hive Civilization');
  res.setHeader('X-Hive-Brand-Gold', '#C08D23');
  res.setHeader('Link', '</.well-known/mcp.json>; rel="alternate"; type="application/json", </.well-known/mcp/server-card.json>; rel="alternate"; type="application/json"');
  next();
});

const PORT = process.env.PORT || 3000;

function mountFeature(app, basePath, mod) {
  const { TOOLS, executeTool, serverInfo, HIVE_BASE } = mod;

  app.post(`${basePath}/mcp`, async (req, res) => {
    const { jsonrpc, id, method, params } = req.body || {};
    if (jsonrpc !== '2.0') return res.json({ jsonrpc:'2.0', id, error: { code:-32600, message:'Invalid JSON-RPC' } });
    try {
      switch (method) {
        case 'initialize':
          return res.json({ jsonrpc:'2.0', id, result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: serverInfo.name, version: serverInfo.version, description: serverInfo.description },
          } });
        case 'tools/list':
          return res.json({ jsonrpc:'2.0', id, result: { tools: TOOLS } });
        case 'tools/call': {
          const { name, arguments: args } = params || {};
          const out = await executeTool(name, args || {});
          return res.json({ jsonrpc:'2.0', id, result: { content: [out] } });
        }
        case 'ping':
          return res.json({ jsonrpc:'2.0', id, result: {} });
        default:
          return res.json({ jsonrpc:'2.0', id, error: { code:-32601, message: `Method not found: ${method}` } });
      }
    } catch (err) {
      return res.json({ jsonrpc:'2.0', id, error: { code:-32000, message: err.message } });
    }
  });

  app.get(`${basePath}/health`, (req, res) => res.json({
    status: 'ok',
    service: serverInfo.name,
    version: serverInfo.version,
    backend: HIVE_BASE,
  }));

  app.get(`${basePath}/.well-known/mcp.json`, (req, res) => res.json({
    name: serverInfo.name,
    endpoint: `${basePath}/mcp`,
    transport: 'streamable-http',
    protocol: '2024-11-05',
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
  }));

  // Smithery server-card (skips external scan; SEP-1649)
  // https://smithery.ai/docs/build/publish
  const serverCard = {
    serverInfo: { name: serverInfo.name, version: serverInfo.version },
    authentication: { required: false, schemes: [] },
    tools: TOOLS,
    resources: [],
    prompts: [],
  };
  app.get(`${basePath}/.well-known/mcp/server-card.json`, (req, res) => res.json(serverCard));
  // Some scanners probe the root path with no feature prefix
  app.get(`${basePath}/server-card.json`, (req, res) => res.json(serverCard));
}

// Mount all 5 features
  mountFeature(app, '/evaluator', M_evaluator);
  mountFeature(app, '/trade', M_trade);
  mountFeature(app, '/depin', M_depin);
  mountFeature(app, '/compute-grid', M_compute_grid);
  mountFeature(app, '/morph', M_morph);

// Top-level index + aggregate health — content-negotiated.
// Browsers (Accept: text/html) get the branded HTML landing page with full meta.
// MCP scanners / curl / JSON consumers get the JSON manifest.
const rootJson = {
  service: 'hive-mcp-gateway',
  brand: 'Hive Civilization',
  brandGold: '#C08D23',
  version: '1.0.4',
  servers: {
    evaluator:    { mcp: '/evaluator/mcp',    health: '/evaluator/health',    discovery: '/evaluator/.well-known/mcp.json' },
    trade:        { mcp: '/trade/mcp',        health: '/trade/health',        discovery: '/trade/.well-known/mcp.json' },
    depin:        { mcp: '/depin/mcp',        health: '/depin/health',        discovery: '/depin/.well-known/mcp.json' },
    'compute-grid': { mcp: '/compute-grid/mcp', health: '/compute-grid/health', discovery: '/compute-grid/.well-known/mcp.json' },
    morph:        { mcp: '/morph/mcp',        health: '/morph/health',        discovery: '/morph/.well-known/mcp.json' },
  },
};
app.get('/', (req, res) => {
  const accept = String(req.headers.accept || '');
  if (accept.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderLanding());
  }
  return res.json(rootJson);
});

// OG image (referenced by meta tags)
app.get('/og.svg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(renderOgImage());
});

// SEO basics — comprehensive crawler-discovery surface
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send([
    'User-agent: *',
    'Allow: /',
    'Sitemap: https://hive-mcp-gateway.onrender.com/sitemap.xml',
    '',
    '# Hive Civilization · public discovery surface · indexing welcome',
  ].join('\n'));
});
app.get('/sitemap.xml', (req, res) => {
  const base = 'https://hive-mcp-gateway.onrender.com';
  const urls = [
    '/', '/og.svg',
    '/evaluator/health', '/trade/health', '/depin/health', '/compute-grid/health', '/morph/health',
    '/evaluator/.well-known/mcp.json', '/trade/.well-known/mcp.json', '/depin/.well-known/mcp.json',
    '/compute-grid/.well-known/mcp.json', '/morph/.well-known/mcp.json',
    '/.well-known/mcp.json', '/.well-known/mcp/server-card.json', '/.well-known/security.txt',
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${base}${u}</loc></url>`).join('\n') + `\n</urlset>`;
  res.type('application/xml').send(body);
});
// RFC 9116 security.txt — published security disclosure contact
app.get('/.well-known/security.txt', (req, res) => {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  res.type('text/plain').send([
    'Contact: mailto:steve@thehiveryiq.com',
    `Expires: ${expires}`,
    'Preferred-Languages: en',
    'Canonical: https://hive-mcp-gateway.onrender.com/.well-known/security.txt',
    'Policy: https://www.thehiveryiq.com',
    '',
    '# Hive Civilization · security disclosure contact',
  ].join('\n'));
});

app.get('/health', (req, res) => res.json({
  status: 'ok',
  service: 'hive-mcp-gateway',
  version: '1.0.4',
  servers: ['evaluator','trade','depin','compute-grid','morph'],
  meta: {
    discovery: '/.well-known/mcp.json',
    sitemap:   '/sitemap.xml',
    robots:    '/robots.txt',
    security:  '/.well-known/security.txt',
    seo_image: '/og.svg',
    brand:     '#C08D23',
  },
}));

// Smithery scanner walks the HOST root, not the mount path. Aggregate card
// returns all tools across all 5 mounts so any root-level scan succeeds.
const aggregateCard = () => {
  const tools = [];
  for (const m of [M_evaluator, M_trade, M_depin, M_compute_grid, M_morph]) {
    const prefix = m.serverInfo.name.replace('hive-mcp-','');
    for (const t of m.TOOLS) tools.push({ ...t, name: `${prefix}__${t.name}` });
  }
  return {
    serverInfo: { name: 'hive-mcp-gateway', version: '1.0.4' },
    authentication: { required: false, schemes: [] },
    tools, resources: [], prompts: [],
  };
};
app.get('/.well-known/mcp/server-card.json', (req, res) => res.json(aggregateCard()));
app.get('/server-card.json', (req, res) => res.json(aggregateCard()));
app.get('/.well-known/mcp.json', (req, res) => res.json({
  name: 'hive-mcp-gateway',
  version: '1.0.4',
  servers: {
    evaluator: '/evaluator/mcp',
    trade: '/trade/mcp',
    depin: '/depin/mcp',
    'compute-grid': '/compute-grid/mcp',
    morph: '/morph/mcp',
  },
}));

// ─── Agent-network beacon ────────────────────────────────────────────────────
// Single-fetch ecosystem discovery for CrewAI/AutoGen/LangChain/A2A crawlers.
// RFC-style: /.well-known/ prefix so any agent pinging the root finds all Hive
// surfaces in one round-trip without knowing individual service URLs.
const AGENT_NETWORK = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  schema_version: 'agent-network/v0.1',
  ecosystem: 'Hive Civilization',
  homepage: 'https://hiveagentiq.com',
  brand_color: '#C08D23',
  settlement: {
    protocol: 'x402',
    chains: ['base', 'solana', 'ethereum'],
    tokens: ['USDC', 'USDT'],
    facilitator: 'https://hivemorph.onrender.com',
  },
  agent_onboarding: 'Send X-Agent-DID header for 100 free reads/day per DID',
  surfaces: [
    { name: 'HiveCompute', category: 'inference', url: 'https://hivecompute-g2g7.onrender.com', mcp: 'https://hivecompute-g2g7.onrender.com/mcp', agent_card: 'https://hivecompute-g2g7.onrender.com/.well-known/agent-card.json', repo: 'https://github.com/srotzin/hivecompute' },
    { name: 'HiveEvaluator', category: 'evaluation', url: 'https://hive-mcp-gateway.onrender.com/evaluator', agent_card: 'https://hive-mcp-gateway.onrender.com/evaluator/.well-known/agent.json', repo: 'https://github.com/srotzin/hive-mcp-evaluator' },
    { name: 'HiveTrade', category: 'settlement', url: 'https://hive-mcp-gateway.onrender.com/trade', agent_card: 'https://hive-mcp-gateway.onrender.com/trade/.well-known/agent.json', repo: 'https://github.com/srotzin/hive-mcp-trade' },
    { name: 'HiveDePIN', category: 'depin', url: 'https://hive-mcp-gateway.onrender.com/depin', agent_card: 'https://hive-mcp-gateway.onrender.com/depin/.well-known/agent.json', repo: 'https://github.com/srotzin/hive-mcp-depin' },
    { name: 'HiveComputeGrid', category: 'compute_auction', url: 'https://hive-mcp-gateway.onrender.com/compute-grid', agent_card: 'https://hive-mcp-gateway.onrender.com/compute-grid/.well-known/agent.json', repo: 'https://github.com/srotzin/hive-mcp-compute-grid' },
    { name: 'HiveMining', category: 'btc_hashrate', url: 'https://hive-mcp-gateway.onrender.com/mining', agent_card: 'https://hive-mcp-gateway.onrender.com/mining/.well-known/agent.json', repo: 'https://github.com/srotzin/hive-mcp-mining' },
    { name: 'HiveSwap', category: 'dex', url: 'https://hive-mcp-gateway.onrender.com/swap', repo: 'https://github.com/srotzin/hive-mcp-swap' },
    { name: 'HiveVault', category: 'vault', url: 'https://hive-mcp-gateway.onrender.com/vault', repo: 'https://github.com/srotzin/hive-mcp-vault' },
    { name: 'HiveExchange', category: 'perps', url: 'https://hive-mcp-gateway.onrender.com/exchange', repo: 'https://github.com/srotzin/hive-mcp-exchange' },
    { name: 'HiveMOS', category: 'mining_orchestration', url: 'https://hivemorph.onrender.com/v1/mining/orchestrate', repo: 'https://github.com/srotzin/hive-mos-plugin' },
    { name: 'HiveMorph', category: 'polymorphic_identity', url: 'https://hive-mcp-gateway.onrender.com/morph', repo: 'https://github.com/srotzin/hive-mcp-morph' },
  ],
  discovery: {
    featured: 'https://hivemorph.onrender.com/v1/discovery/featured',
    stranded: 'https://hivemorph.onrender.com/v1/discovery/stranded',
    leaderboard: 'https://hivemorph.onrender.com/v1/earn/leaderboard',
  },
  registries: {
    smithery: 'https://smithery.ai/?q=hive-mcp',
    glama: 'https://glama.ai/mcp/servers?q=hive',
    mcp_so: 'https://mcp.so/?q=hive',
    awesome_mcp_pr: 'https://github.com/punkpeye/awesome-mcp-servers/pull/5481',
  },
};
app.get('/.well-known/agent-network.json', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json(AGENT_NETWORK);
});

app.listen(PORT, () => {
  console.log(`hive-mcp-gateway running on :${PORT}`);
  for (const m of [M_evaluator, M_trade, M_depin, M_compute_grid, M_morph]) {
    console.log(`  ${m.serverInfo.name}: ${m.TOOLS.length} tools`);
  }
});
