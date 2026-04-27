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
  res.setHeader('X-Hive-Gateway', 'hive-mcp-gateway/1.0.3');
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
  version: '1.0.3',
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

// SEO basics
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send([
    'User-agent: *',
    'Allow: /',
    'Sitemap: https://hive-mcp-gateway.onrender.com/sitemap.xml',
  ].join('\n'));
});
app.get('/sitemap.xml', (req, res) => {
  const base = 'https://hive-mcp-gateway.onrender.com';
  const urls = ['/', '/evaluator/health', '/trade/health', '/depin/health', '/compute-grid/health', '/morph/health',
                '/.well-known/mcp.json', '/.well-known/mcp/server-card.json'];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${base}${u}</loc></url>`).join('\n') + `\n</urlset>`;
  res.type('application/xml').send(body);
});

app.get('/health', (req, res) => res.json({
  status: 'ok',
  service: 'hive-mcp-gateway',
  version: '1.0.3',
  servers: ['evaluator','trade','depin','compute-grid','morph'],
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
    serverInfo: { name: 'hive-mcp-gateway', version: '1.0.3' },
    authentication: { required: false, schemes: [] },
    tools, resources: [], prompts: [],
  };
};
app.get('/.well-known/mcp/server-card.json', (req, res) => res.json(aggregateCard()));
app.get('/server-card.json', (req, res) => res.json(aggregateCard()));
app.get('/.well-known/mcp.json', (req, res) => res.json({
  name: 'hive-mcp-gateway',
  version: '1.0.3',
  servers: {
    evaluator: '/evaluator/mcp',
    trade: '/trade/mcp',
    depin: '/depin/mcp',
    'compute-grid': '/compute-grid/mcp',
    morph: '/morph/mcp',
  },
}));

app.listen(PORT, () => {
  console.log(`hive-mcp-gateway running on :${PORT}`);
  for (const m of [M_evaluator, M_trade, M_depin, M_compute_grid, M_morph]) {
    console.log(`  ${m.serverInfo.name}: ${m.TOOLS.length} tools`);
  }
});
