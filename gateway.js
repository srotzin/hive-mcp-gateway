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
import * as M_insurance_broker from './servers/hive-mcp-insurance-broker.mjs';
import * as M_dispute from './servers/hive-mcp-dispute.mjs';

const app = express();
import { renderLanding, renderOgImage } from './landing.js';

app.use(express.json({ limit: '4mb' }));

// ─── 22-shim registry ────────────────────────────────────────────────────────
// Canonical Render hosts for every hive-mcp-* shim. The gateway is a discovery
// surface — direct URLs are recommended for Glama/Smithery probes.
const SHIM_SLUGS = [
  'agent-kyc', 'agent-storage', 'capital', 'compute', 'compute-grid',
  'connector', 'credit', 'depin', 'dispute', 'escrow', 'evaluator',
  'exchange', 'gateway', 'identity', 'insurance', 'insurance-broker',
  'mining', 'morph', 'mos', 'oracle', 'swap', 'trade', 'vault',
  'zk-attestation',
];
const shimHost = (slug) => `https://hive-mcp-${slug}.onrender.com`;
const SHIM_REGISTRY = Object.fromEntries(SHIM_SLUGS.map((slug) => [slug, {
  url: shimHost(slug),
  mcp: `${shimHost(slug)}/mcp`,
  discovery: `${shimHost(slug)}/.well-known/mcp.json`,
  repo: `https://github.com/srotzin/hive-mcp-${slug}`,
}]));

// Always advertise gateway in headers (visible to crawlers + curl)
app.use((req, res, next) => {
  res.setHeader('X-Hive-Gateway', 'hive-mcp-gateway/1.1.0');
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
  mountFeature(app, '/insurance-broker', M_insurance_broker);
  mountFeature(app, '/dispute', M_dispute);

// Top-level index + aggregate health — content-negotiated.
// Browsers (Accept: text/html) get the branded HTML landing page with full meta.
// MCP scanners / curl / JSON consumers get the JSON manifest.
const rootJson = {
  service: 'hive-mcp-gateway',
  brand: 'Hive Civilization',
  brandGold: '#C08D23',
  version: '1.1.0',
  description: 'Hive Civilization MCP registry — discovery surface for the 22 hive-mcp-* servers.',
  servers: {
    evaluator:      { mcp: '/evaluator/mcp',      health: '/evaluator/health',      discovery: '/evaluator/.well-known/mcp.json',      direct: shimHost('evaluator') },
    trade:          { mcp: '/trade/mcp',          health: '/trade/health',          discovery: '/trade/.well-known/mcp.json',          direct: shimHost('trade') },
    depin:          { mcp: '/depin/mcp',          health: '/depin/health',          discovery: '/depin/.well-known/mcp.json',          direct: shimHost('depin') },
    'compute-grid': { mcp: '/compute-grid/mcp',   health: '/compute-grid/health',   discovery: '/compute-grid/.well-known/mcp.json',   direct: shimHost('compute-grid') },
    morph:          { mcp: '/morph/mcp',          health: '/morph/health',          discovery: '/morph/.well-known/mcp.json',          direct: shimHost('morph') },
    'insurance-broker': { mcp: '/insurance-broker/mcp', health: '/insurance-broker/health', discovery: '/insurance-broker/.well-known/mcp.json', direct: shimHost('insurance-broker') },
    dispute:        { mcp: '/dispute/mcp',        health: '/dispute/health',        discovery: '/dispute/.well-known/mcp.json',        direct: shimHost('dispute') },
  },
  registry: SHIM_REGISTRY,
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
  const localUrls = [
    '/', '/og.svg',
    '/evaluator/health', '/trade/health', '/depin/health', '/compute-grid/health', '/morph/health',
    '/evaluator/.well-known/mcp.json', '/trade/.well-known/mcp.json', '/depin/.well-known/mcp.json',
    '/compute-grid/.well-known/mcp.json', '/morph/.well-known/mcp.json',
    '/evaluator/sitemap.xml', '/trade/sitemap.xml', '/depin/sitemap.xml',
    '/compute-grid/sitemap.xml', '/morph/sitemap.xml',
    '/.well-known/mcp.json', '/.well-known/mcp/server-card.json', '/.well-known/security.txt',
    '/.well-known/agent-network.json',
    '/v1/discovery/featured', '/v1/earn/leaderboard',
    '/robots.txt', '/sitemap.xml', '/humans.txt',
  ];
  const directUrls = SHIM_SLUGS.flatMap((slug) => [
    shimHost(slug),
    `${shimHost(slug)}/.well-known/mcp.json`,
  ]);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    localUrls.map(u => `  <url><loc>${base}${u}</loc></url>`).join('\n') + '\n' +
    directUrls.map(u => `  <url><loc>${u}</loc></url>`).join('\n') + `\n</urlset>`;
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

// humans.txt — quality signal for crawlers
app.get('/humans.txt', (req, res) => {
  res.type('text/plain').send([
    '/* TEAM */',
    'Creator: Steve Rotzin',
    'Contact: steve@thehiveryiq.com',
    'Location: United States',
    '',
    '/* SITE */',
    'Last update: ' + new Date().toISOString().slice(0, 10),
    'Language: English',
    'Standards: MCP 2024-11-05, x402, schema.org JSON-LD, RFC 9116',
    'Software: Hive Civilization MCP Gateway v1.1.0',
    '',
    '/* THANKS */',
    'Hive Civilization community · hiveagentiq.com',
  ].join('\n'));
});

app.get('/health', (req, res) => res.json({
  status: 'ok',
  service: 'hive-mcp-gateway',
  version: '1.1.0',
  servers: ['evaluator','trade','depin','compute-grid','morph'],
  registry_size: SHIM_SLUGS.length,
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
    serverInfo: { name: 'hive-mcp-gateway', version: '1.1.0' },
    authentication: { required: false, schemes: [] },
    tools, resources: [], prompts: [],
  };
};
app.get('/.well-known/mcp/server-card.json', (req, res) => res.json(aggregateCard()));
app.get('/server-card.json', (req, res) => res.json(aggregateCard()));
app.get('/.well-known/mcp.json', (req, res) => res.json({
  name: 'hive-mcp-gateway',
  version: '1.1.0',
  description: 'Hive Civilization MCP registry — discovery surface for the 22 hive-mcp-* servers.',
  servers: SHIM_REGISTRY,
  legacyMounts: {
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
    { name: 'HiveAgentKYC', category: 'identity_kyc', url: shimHost('agent-kyc'), mcp: `${shimHost('agent-kyc')}/mcp`, agent_card: `${shimHost('agent-kyc')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-agent-kyc' },
    { name: 'HiveAgentStorage', category: 'storage', url: shimHost('agent-storage'), mcp: `${shimHost('agent-storage')}/mcp`, agent_card: `${shimHost('agent-storage')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-agent-storage' },
    { name: 'HiveCapital', category: 'capital', url: shimHost('capital'), mcp: `${shimHost('capital')}/mcp`, agent_card: `${shimHost('capital')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-capital' },
    { name: 'HiveComputeShim', category: 'inference', url: shimHost('compute'), mcp: `${shimHost('compute')}/mcp`, agent_card: `${shimHost('compute')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-compute' },
    { name: 'HiveComputeGrid', category: 'compute_auction', url: shimHost('compute-grid'), mcp: `${shimHost('compute-grid')}/mcp`, agent_card: `${shimHost('compute-grid')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-compute-grid' },
    { name: 'HiveConnector', category: 'connector', url: shimHost('connector'), mcp: `${shimHost('connector')}/mcp`, agent_card: `${shimHost('connector')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-connector' },
    { name: 'HiveCredit', category: 'credit', url: shimHost('credit'), mcp: `${shimHost('credit')}/mcp`, agent_card: `${shimHost('credit')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-credit' },
    { name: 'HiveDePIN', category: 'depin', url: shimHost('depin'), mcp: `${shimHost('depin')}/mcp`, agent_card: `${shimHost('depin')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-depin' },
    { name: 'HiveEscrow', category: 'escrow', url: shimHost('escrow'), mcp: `${shimHost('escrow')}/mcp`, agent_card: `${shimHost('escrow')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-escrow' },
    { name: 'HiveEvaluator', category: 'evaluation', url: shimHost('evaluator'), mcp: `${shimHost('evaluator')}/mcp`, agent_card: `${shimHost('evaluator')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-evaluator' },
    { name: 'HiveExchange', category: 'perps', url: shimHost('exchange'), mcp: `${shimHost('exchange')}/mcp`, agent_card: `${shimHost('exchange')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-exchange' },
    { name: 'HiveGateway', category: 'registry', url: shimHost('gateway'), mcp: `${shimHost('gateway')}/.well-known/mcp.json`, repo: 'https://github.com/srotzin/hive-mcp-gateway' },
    { name: 'HiveIdentity', category: 'identity', url: shimHost('identity'), mcp: `${shimHost('identity')}/mcp`, agent_card: `${shimHost('identity')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-identity' },
    { name: 'HiveInsurance', category: 'insurance', url: shimHost('insurance'), mcp: `${shimHost('insurance')}/mcp`, agent_card: `${shimHost('insurance')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-insurance' },
    { name: 'HiveMining', category: 'btc_hashrate', url: shimHost('mining'), mcp: `${shimHost('mining')}/mcp`, agent_card: `${shimHost('mining')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-mining' },
    { name: 'HiveMorph', category: 'polymorphic_identity', url: shimHost('morph'), mcp: `${shimHost('morph')}/mcp`, agent_card: `${shimHost('morph')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-morph' },
    { name: 'HiveMOS', category: 'mining_orchestration', url: shimHost('mos'), mcp: `${shimHost('mos')}/mcp`, agent_card: `${shimHost('mos')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-mos' },
    { name: 'HiveOracle', category: 'oracle', url: shimHost('oracle'), mcp: `${shimHost('oracle')}/mcp`, agent_card: `${shimHost('oracle')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-oracle' },
    { name: 'HiveSwap', category: 'dex', url: shimHost('swap'), mcp: `${shimHost('swap')}/mcp`, agent_card: `${shimHost('swap')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-swap' },
    { name: 'HiveTrade', category: 'settlement', url: shimHost('trade'), mcp: `${shimHost('trade')}/mcp`, agent_card: `${shimHost('trade')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-trade' },
    { name: 'HiveVault', category: 'vault', url: shimHost('vault'), mcp: `${shimHost('vault')}/mcp`, agent_card: `${shimHost('vault')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-vault' },
    { name: 'HiveZKAttestation', category: 'zk_attestation', url: shimHost('zk-attestation'), mcp: `${shimHost('zk-attestation')}/mcp`, agent_card: `${shimHost('zk-attestation')}/.well-known/agent.json`, repo: 'https://github.com/srotzin/hive-mcp-zk-attestation' },
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


// ─── Schema discoverability ────────────────────────────────────────────────
const AGENT_CARD = {
  name: SERVICE,
  description: 'Hive Civilization MCP registry — discovery surface for the 22 hive-mcp-* servers. New agents: first call free. Loyalty: every 6th paid call is free. Pay in USDC on Base L2.',
  url: `https://${SERVICE}.onrender.com`,
  provider: {
    organization: 'Hive Civilization',
    url: 'https://www.thehiveryiq.com',
    contact: 'steve@thehiveryiq.com',
  },
  version: VERSION,
  capabilities: {
    streaming: false,
    pushNotifications: false,
    stateTransitionHistory: false,
  },
  authentication: {
    schemes: ['x402'],
    credentials: {
      type: 'x402',
      asset: 'USDC',
      network: 'base',
      asset_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      recipient: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
    },
  },
  defaultInputModes: ['application/json'],
  defaultOutputModes: ['application/json'],
  skills: TOOLS.map(t => ({ name: t.name, description: t.description })),
  extensions: {
    hive_pricing: {
      currency: 'USDC',
      network: 'base',
      model: 'per_call',
      first_call_free: true,
      loyalty_threshold: 6,
      loyalty_message: 'Every 6th paid call is free',
    },
  },
};

const AP2 = {
  ap2_version: '1',
  agent: {
    name: SERVICE,
    did: `did:web:${SERVICE}.onrender.com`,
    description: 'Hive Civilization MCP registry — discovery surface for the 22 hive-mcp-* servers. New agents: first call free. Loyalty: every 6th paid call is free. Pay in USDC on Base L2.',
  },
  endpoints: {
    mcp: `https://${SERVICE}.onrender.com/mcp`,
    agent_card: `https://${SERVICE}.onrender.com/.well-known/agent-card.json`,
  },
  payments: {
    schemes: ['x402'],
    primary: {
      scheme: 'x402',
      network: 'base',
      asset: 'USDC',
      asset_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      recipient: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
    },
  },
  brand: { color: '#C08D23', name: 'Hive Civilization' },
};

app.get('/.well-known/agent-card.json', (req, res) => res.json(AGENT_CARD));
app.get('/.well-known/ap2.json',         (req, res) => res.json(AP2));


app.listen(PORT, () => {
  console.log(`hive-mcp-gateway running on :${PORT}`);
  for (const m of [M_evaluator, M_trade, M_depin, M_compute_grid, M_morph]) {
    console.log(`  ${m.serverInfo.name}: ${m.TOOLS.length} tools`);
  }
});
