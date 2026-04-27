// HTML landing page for hive-mcp-gateway
// Branded with Pantone 1245 C (#C08D23). Includes OpenGraph + Twitter Card +
// JSON-LD structured data + banner-agent fly-by animation.

const BRAND_GOLD = '#C08D23';
const SITE_URL = 'https://hive-mcp-gateway.onrender.com';
const SERVERS = [
  { name: 'hive-mcp-evaluator', mount: '/evaluator', tools: 4, blurb: 'EIP-3009 attestations, gates, NEED/YIELD/CLEAN-MONEY scoring' },
  { name: 'hive-mcp-trade', mount: '/trade', tools: 5, blurb: 'Cross-venue spread + yield drivers, ROI radar telemetry' },
  { name: 'hive-mcp-depin', mount: '/depin', tools: 4, blurb: 'DePIN reward routing, capacity verification, settlement reports' },
  { name: 'hive-mcp-compute-grid', mount: '/compute-grid', tools: 11, blurb: 'Solver auction across io.net / Akash / Render with signed receipts' },
  { name: 'hive-mcp-morph', mount: '/morph', tools: 5, blurb: 'Morph spawn/cull, ROI exploitation, polymorphic provenance' },
];

const ldJson = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://hiveagentiq.com/#org',
      name: 'Hive Civilization',
      url: 'https://hiveagentiq.com',
      logo: `${SITE_URL}/og.svg`,
      description: 'The native economy and infrastructure layer for autonomous AI agents. Real rails, real settlement, real provenance.',
      contactPoint: { '@type': 'ContactPoint', email: 'steve@thehiveryiq.com', contactType: 'technical support' },
      sameAs: ['https://github.com/srotzin', 'https://smithery.ai/server/hivecivilization'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Hive Civilization MCP Gateway',
      publisher: { '@id': 'https://hiveagentiq.com/#org' },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Hive Civilization MCP Gateway',
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'AI Agent / MCP Server',
      operatingSystem: 'Any (HTTP)',
      url: SITE_URL,
      softwareVersion: '1.0.4',
      description: 'Unified MCP gateway hosting 5 Hive Civilization servers with 29 tools for evaluation, trade, DePIN, compute, and morph orchestration. Real USDC settlement on Base L2.',
      keywords: 'agent payments, x402 facilitator, MCP USDC, agentic settlement, agent treasury, AI agent inference USDC, DePIN marketplace, agent compliance auditor, Hive Civilization',
      isAccessibleForFree: false,
      inLanguage: 'en',
      offers: [
        { '@type': 'Offer', name: 'Discovery (mcp.json, health, server-card)', price: '0', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Tier 1 micro reads', price: '0.001', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '0.001', priceCurrency: 'USD', unitText: 'per call, settled in USDC on Base L2' } },
        { '@type': 'Offer', name: 'Tier 2 affordance verbs', price: '0.005', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '0.005', priceCurrency: 'USD', unitText: 'per call, settled in USDC on Base L2' } },
        { '@type': 'Offer', name: 'Tier 3 high-value actions (book, settle, dispute, place)', price: '0.05', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '0.05', priceCurrency: 'USD', unitText: 'per call, settled in USDC on Base L2' } },
      ],
      publisher: { '@id': 'https://hiveagentiq.com/#org' },
      author: { '@type': 'Person', name: 'Steve Rotzin', email: 'steve@thehiveryiq.com', url: 'https://www.thehiveryiq.com' },
    },
    {
      '@type': 'WebAPI',
      '@id': `${SITE_URL}/#api`,
      name: 'Hive MCP Gateway API',
      description: 'Unified gateway for 5 Hive MCP servers. x402 pay-per-call in USDC on Base L2. MCP 2024-11-05 Streamable-HTTP transport.',
      url: `${SITE_URL}/`,
      documentation: `${SITE_URL}/.well-known/mcp.json`,
      provider: { '@id': 'https://hiveagentiq.com/#org' },
    },
    {
      '@type': 'Service',
      name: 'Hive MCP Gateway — Agent Payment & Settlement Infrastructure',
      serviceType: 'AI Agent API Gateway',
      provider: { '@id': 'https://hiveagentiq.com/#org' },
      areaServed: 'Worldwide',
      description: 'x402 facilitator and agentic settlement layer for autonomous AI agents. Routes payments, attestations, DePIN matches, compute bookings, and identity morphs in real USDC on Base L2.',
      offers: [
        { '@type': 'Offer', name: 'x402 Tier 1 micro read', price: '0.001', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'x402 Tier 2 affordance', price: '0.005', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'x402 Tier 3 settlement action', price: '0.05', priceCurrency: 'USD' },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hive Civilization', item: 'https://hiveagentiq.com' },
        { '@type': 'ListItem', position: 2, name: 'MCP Gateway', item: `${SITE_URL}/` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the Hive MCP Gateway?',
          acceptedAnswer: { '@type': 'Answer', text: 'The Hive MCP Gateway is a unified Model Context Protocol gateway hosting 5 Hive Civilization servers (evaluator, trade, depin, compute-grid, morph) with 29 tools exposed over Streamable-HTTP. All calls settle pay-per-call in USDC on Base L2 via the x402 protocol.' },
        },
        {
          '@type': 'Question',
          name: 'How does x402 agent payment work?',
          acceptedAnswer: { '@type': 'Answer', text: 'x402 is an HTTP 402 Payment Required facilitator protocol. Agents attach a signed USDC payment intent to API calls. The gateway verifies the payment on Base L2 before routing the request. No subscription, no invoices — pay-per-call with USDC settlement in the same HTTP round trip.' },
        },
        {
          '@type': 'Question',
          name: 'Which MCP servers are hosted at this gateway?',
          acceptedAnswer: { '@type': 'Answer', text: 'Five servers: /evaluator (ERC-8183 compliance, ACP v2.0 scoring), /trade (cross-border SMB invoice settlement, USDC/USDT), /depin (DePIN marketplace, 22 metadata fields, 0.15% match fee), /compute-grid (cross-pool compute auction, Groth16 proofs at $0.001), and /morph (polymorphic identity and brood telemetry, 14 read-only tools).' },
        },
        {
          '@type': 'Question',
          name: 'How do I connect an AI agent to the gateway?',
          acceptedAnswer: { '@type': 'Answer', text: 'Point your MCP client at https://hive-mcp-gateway.onrender.com/evaluator/mcp (or any mount). Fetch /.well-known/mcp.json for the discovery descriptor. Send X-Agent-DID: did:hive:<your-did> for per-DID usage tracking and 100 free reads/day. Calls above the free tier require a USDC payment intent per the x402 spec.' },
        },
        {
          '@type': 'Question',
          name: 'What is the NEED + YIELD + CLEAN-MONEY gate?',
          acceptedAnswer: { '@type': 'Answer', text: 'Every Tier 3 action (book, settle, dispute, place prediction) passes through a three-gate evaluator: NEED (is the action economically necessary?), YIELD (does it improve agent ROI?), and CLEAN-MONEY (does the payment intent pass anti-money-laundering heuristics?). The Evaluator server runs ERC-8183 scoring and issues EIP-3009 attestations.' },
        },
      ],
    },
  ],
};

export function renderLanding() {
  const totalTools = SERVERS.reduce((s, x) => s + x.tools, 0);
  const cards = SERVERS.map(s => `
    <a class="card" href="${s.mount}/health" data-mount="${s.mount}">
      <div class="card-head">
        <span class="card-name">${s.name}</span>
        <span class="card-tools">${s.tools} tools</span>
      </div>
      <div class="card-mount">${s.mount}/mcp</div>
      <div class="card-blurb">${s.blurb}</div>
    </a>`).join('');

  // Banner-flying agents: 5 SVG planes pulling banners with each server name
  const planes = SERVERS.map((s, i) => `
    <div class="plane plane-${i}" style="--delay:${i * 4}s; --top:${10 + i * 14}%;">
      <svg viewBox="0 0 220 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g class="plane-body">
          <path d="M10 20 L40 12 L60 12 L70 4 L78 4 L74 14 L100 14 L100 26 L74 26 L78 36 L70 36 L60 28 L40 28 Z" fill="${BRAND_GOLD}" stroke="#1a1410" stroke-width="1.2"/>
          <circle cx="48" cy="20" r="2.5" fill="#1a1410"/>
        </g>
        <line x1="100" y1="20" x2="120" y2="20" stroke="#1a1410" stroke-width="1" stroke-dasharray="2,2"/>
        <rect x="120" y="6" width="98" height="28" fill="#1a1410" stroke="${BRAND_GOLD}" stroke-width="1.2" rx="2"/>
        <text x="169" y="25" text-anchor="middle" fill="${BRAND_GOLD}" font-family="ui-monospace,monospace" font-size="12" font-weight="700">${s.name.replace('hive-mcp-','').toUpperCase()}</text>
      </svg>
    </div>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Hive Civilization MCP Gateway · ${totalTools} tools across 5 servers</title>
<meta name="description" content="Unified MCP gateway hosting 5 Hive Civilization servers — evaluator, trade, depin, compute-grid, morph. ${totalTools} tools, signed receipts, real-time auction across io.net / Akash / Render."/>
<meta name="keywords" content="MCP, Model Context Protocol, Hive Civilization, AI agents, DePIN, compute marketplace, io.net, Akash, Render, Smithery, Glama"/>
<meta name="author" content="Steve Rotzin · Hive Civilization"/>
<meta name="theme-color" content="${BRAND_GOLD}"/>
<meta name="robots" content="index,follow,max-image-preview:large"/>
<meta name="googlebot" content="index,follow,max-image-preview:large"/>
<link rel="canonical" href="${SITE_URL}/"/>
<link rel="icon" href="${SITE_URL}/og.svg" type="image/svg+xml"/>
<link rel="alternate" type="application/xml" title="Sitemap" href="${SITE_URL}/sitemap.xml"/>

<!-- OpenGraph -->
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Hive Civilization"/>
<meta property="og:title" content="Hive Civilization MCP Gateway"/>
<meta property="og:description" content="${totalTools} MCP tools across 5 servers — evaluator, trade, depin, compute-grid, morph. Signed receipts, real auction routing."/>
<meta property="og:url" content="${SITE_URL}/"/>
<meta property="og:image" content="${SITE_URL}/og.svg"/>
<meta property="og:image:type" content="image/svg+xml"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Hive Civilization MCP Gateway"/>
<meta name="twitter:description" content="${totalTools} tools across 5 MCP servers. Real auction. Signed receipts. NEED + YIELD + CLEAN-MONEY."/>
<meta name="twitter:image" content="${SITE_URL}/og.svg"/>
<meta name="twitter:creator" content="@hivecivilization"/>

<!-- Twitter / X additional -->
<meta name="twitter:site" content="@hiveagentiq"/>
<meta name="twitter:creator" content="@hiveagentiq"/>

<!-- OG additional -->
<meta property="og:image:alt" content="Hive Civilization MCP Gateway — unified agent payment infrastructure logo"/>
<meta property="og:locale" content="en_US"/>

<!-- Apple / mobile -->
<meta name="apple-mobile-web-app-title" content="Hive MCP Gateway"/>
<meta name="format-detection" content="telephone=no"/>

<!-- Bing -->
<meta name="bingbot" content="index, follow"/>

<!-- Verification placeholders -->
<!-- <meta name="google-site-verification" content="..." /> -->
<!-- <meta name="msvalidate.01" content="..." /> -->

<!-- Dublin Core -->
<meta name="DC.title" content="Hive Civilization MCP Gateway — Unified Agent Payment Infrastructure"/>
<meta name="DC.creator" content="Hive Civilization"/>
<meta name="DC.subject" content="agent payments, x402 facilitator, MCP USDC, agentic settlement"/>
<meta name="DC.publisher" content="Hive Civilization"/>
<meta name="DC.rights" content="MIT"/>

<!-- Agent / x402 hints -->
<meta name="x402-facilitator" content="https://hivemorph.onrender.com"/>
<meta name="x402-settlement" content="USDC,USDT,Base,Solana"/>
<meta name="agent-onboarding" content="X-Agent-DID header for 100 free reads/day per DID"/>
<meta name="hive-network" content="https://hiveagentiq.com"/>

<!-- MCP discovery -->
<link rel="alternate" type="application/json" title="MCP discovery" href="/.well-known/mcp.json"/>
<link rel="alternate" type="application/json" title="MCP server card" href="/.well-known/mcp/server-card.json"/>

<script type="application/ld+json">${JSON.stringify(ldJson)}</script>

<style>
  :root { --gold:${BRAND_GOLD}; --ink:#0d0a06; --paper:#fbf6ec; --line:rgba(192,141,35,.35); }
  *,*:before,*:after { box-sizing:border-box; }
  html,body { margin:0; padding:0; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, Inter, "Helvetica Neue", Arial, sans-serif;
    background:
      radial-gradient(1200px 600px at 80% -10%, rgba(192,141,35,.12), transparent 60%),
      radial-gradient(900px 500px at -10% 110%, rgba(192,141,35,.10), transparent 55%),
      var(--ink);
    color: var(--paper);
    min-height: 100vh;
    overflow-x: hidden;
  }
  header {
    padding: 56px 32px 24px;
    max-width: 1080px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }
  .badge {
    display:inline-flex; align-items:center; gap:8px;
    padding: 6px 12px; border:1px solid var(--line); border-radius:999px;
    color: var(--gold); font-family: ui-monospace, monospace; font-size:12px; letter-spacing:.08em;
    text-transform: uppercase;
  }
  .dot { width:8px; height:8px; border-radius:50%; background:var(--gold); box-shadow:0 0 12px var(--gold); animation: pulse 2s ease-in-out infinite; }
  h1 { font-size: clamp(36px, 6vw, 64px); margin: 18px 0 8px; letter-spacing:-.02em; line-height:1.05; }
  h1 span { color: var(--gold); }
  .tagline { color: rgba(251,246,236,.72); font-size: 18px; max-width: 640px; }
  .stats { display:flex; gap:24px; margin-top: 22px; flex-wrap:wrap; }
  .stat { padding:14px 18px; border:1px solid var(--line); border-radius:10px; background:rgba(13,10,6,.5); }
  .stat b { color: var(--gold); font-family: ui-monospace, monospace; font-size:22px; display:block; }
  .stat span { font-size:12px; text-transform:uppercase; letter-spacing:.1em; color:rgba(251,246,236,.6); }

  main { max-width: 1080px; margin: 0 auto; padding: 24px 32px 96px; position:relative; z-index:2; }
  .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:14px; margin-top: 16px; }
  .card {
    display:block; text-decoration:none; color:var(--paper);
    padding:18px; border:1px solid var(--line); border-radius:12px;
    background:linear-gradient(180deg, rgba(192,141,35,.06), rgba(13,10,6,.5));
    transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
  }
  .card:hover { transform: translateY(-2px); border-color: var(--gold); box-shadow: 0 12px 32px rgba(192,141,35,.18); }
  .card-head { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; }
  .card-name { font-family: ui-monospace, monospace; font-weight:700; color: var(--gold); }
  .card-tools { font-size:11px; padding:2px 8px; border:1px solid var(--line); border-radius:999px; color: rgba(251,246,236,.7); }
  .card-mount { font-family: ui-monospace, monospace; font-size:12px; color: rgba(251,246,236,.55); margin-bottom:10px; }
  .card-blurb { font-size:14px; color: rgba(251,246,236,.82); line-height:1.45; }

  footer { max-width:1080px; margin:0 auto; padding: 0 32px 48px; color:rgba(251,246,236,.5); font-size:13px; }
  footer a { color: var(--gold); text-decoration:none; border-bottom:1px dotted var(--line); }

  /* Banner-flying agents */
  .sky { position: fixed; inset: 0; pointer-events:none; z-index: 1; overflow:hidden; }
  .plane {
    position:absolute; top: var(--top); left: -260px;
    width: 220px; height: 40px;
    animation: fly 22s linear infinite;
    animation-delay: var(--delay, 0s);
    opacity: .85;
  }
  .plane svg { width:100%; height:100%; filter: drop-shadow(0 4px 12px rgba(192,141,35,.25)); }
  @keyframes fly {
    0%   { transform: translateX(0) translateY(0); }
    50%  { transform: translateX(50vw) translateY(-8px); }
    100% { transform: translateX(calc(100vw + 280px)) translateY(0); }
  }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @media (prefers-reduced-motion: reduce) {
    .plane, .dot { animation: none; }
    .plane { display:none; }
  }
</style>
</head>
<body>
  <div class="sky" aria-hidden="true">${planes}</div>

  <header>
    <span class="badge"><span class="dot"></span>Hive Civilization · MCP Gateway</span>
    <h1>${totalTools} tools.<br/><span>5 servers.</span> One gateway.</h1>
    <p class="tagline">Unified Model Context Protocol gateway. Real auction across io.net / Akash / Render. Signed receipts. NEED + YIELD + CLEAN-MONEY gates.</p>
    <div class="stats">
      <div class="stat"><b>${SERVERS.length}</b><span>MCP servers</span></div>
      <div class="stat"><b>${totalTools}</b><span>Tools exposed</span></div>
      <div class="stat"><b>3</b><span>Compute providers</span></div>
      <div class="stat"><b>v1.0.4</b><span>Gateway</span></div>
    </div>
  </header>

  <main>
    <div class="grid">${cards}</div>
  </main>

  <footer>
    <p>Discovery: <a href="/.well-known/mcp.json">/.well-known/mcp.json</a> · <a href="/.well-known/mcp/server-card.json">server-card.json</a> · <a href="/health">/health</a></p>
    <p>Source: <a href="https://github.com/srotzin">github.com/srotzin/hive-mcp-*</a> · Listed on <a href="https://smithery.ai/server/hivecivilization">Smithery</a> · brand #C08D23</p>
  </footer>
</body>
</html>`;
}

export function renderOgImage() {
  // 1200×630 SVG OG image with brand banner
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d0a06"/>
      <stop offset="100%" stop-color="#1a1410"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${BRAND_GOLD}" stop-opacity=".25"/>
      <stop offset="100%" stop-color="${BRAND_GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(80,90)">
    <text font-family="ui-monospace,monospace" font-size="22" fill="${BRAND_GOLD}" letter-spacing="6">HIVE CIVILIZATION · MCP GATEWAY</text>
    <text y="120" font-family="ui-sans-serif,system-ui,sans-serif" font-size="120" font-weight="800" fill="#fbf6ec" letter-spacing="-3">29 tools.</text>
    <text y="240" font-family="ui-sans-serif,system-ui,sans-serif" font-size="120" font-weight="800" fill="${BRAND_GOLD}" letter-spacing="-3">5 servers.</text>
    <text y="320" font-family="ui-sans-serif,system-ui,sans-serif" font-size="32" fill="rgba(251,246,236,.78)">One gateway. Real auction. Signed receipts.</text>
    <g transform="translate(0,400)" font-family="ui-monospace,monospace" font-size="22" fill="${BRAND_GOLD}">
      <text>EVALUATOR · TRADE · DEPIN · COMPUTE-GRID · MORPH</text>
    </g>
  </g>
  <g transform="translate(0,560)" font-family="ui-monospace,monospace" font-size="16" fill="rgba(251,246,236,.5)">
    <text x="80">hive-mcp-gateway.onrender.com</text>
    <text x="1120" text-anchor="end">v1.0.4 · #C08D23</text>
  </g>
</svg>`;
}
