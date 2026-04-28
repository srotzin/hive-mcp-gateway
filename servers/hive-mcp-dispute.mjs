// Auto-derived from hive-mcp-dispute server.js — do not edit by hand.

/**
 * HiveDispute MCP Server
 * Observational dispute/chargeback signal surface for agent-to-agent commerce
 *
 * Backend: https://hivemorph.onrender.com
 * Spec   : MCP 2024-11-05 / Streamable-HTTP / JSON-RPC 2.0
 * Brand  : Hive Civilization gold #C08D23 (Pantone 1245 C)
 *
 * OBSERVATIONAL DISCLAIMER:
 *   Hive does not arbitrate, judge, freeze funds, or enforce dispute
 *   outcomes. This is observational signal data only. Disputes are
 *   resolved by third-party protocols (Kleros, UMA, Reality.eth) or
 *   off-chain legal process. Hive is not a court.
 */

const HIVE_BASE = process.env.HIVE_BASE || 'https://hivemorph.onrender.com';

// ─── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'dispute_check',
    description: 'Given a counterparty address + chain, return public dispute history, active arbitration cases, and on-chain reversal-pattern flags. Sources: Kleros / UMA / Reality.eth subgraphs (with direct on-chain RPC fallback) plus Etherscan-family transaction scans. Observational only — Hive does NOT judge, freeze, or enforce.',
    inputSchema: {
      type: 'object',
      required: ['address', 'chain'],
      properties: {
        address: { type: 'string', description: '0x-prefixed counterparty address (20 bytes)' },
        chain:   { type: 'string', description: 'ethereum | base | arbitrum' },
      },
    },
  },
  {
    name: 'dispute_providers',
    description: 'List available third-party arbitration protocols (Kleros, UMA Optimistic Oracle, Reality.eth) with current case load, intake URLs, and jurisdiction model. Hive is not one of them — Hive only surfaces signal.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'dispute_route',
    description: 'Given a case description, disputed amount in USD, and optional jurisdiction preference, return ranked arbitration provider options. NO automatic filing — Hive returns options + intake URLs only. The disputing party files directly with the chosen provider.',
    inputSchema: {
      type: 'object',
      required: ['description', 'amount_usd'],
      properties: {
        description:  { type: 'string', description: 'Free-form case description (max 2000 chars)' },
        amount_usd:   { type: 'number', description: 'Disputed amount in USD' },
        jurisdiction: { type: 'string', description: 'Optional preference (e.g. \'decentralized\', \'optimistic\', \'crowdsourced\')' },
      },
    },
  },
  {
    name: 'dispute_today',
    description: '24-hour rollup: flagged-counterparty count + top arbitration providers by active case load.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// ─── HTTP helpers ────────────────────────────────────────────────────────────
async function hiveGet(path, params = {}) {
  const url = new URL(`${HIVE_BASE}${path.startsWith('/') ? path : '/' + path}`);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
  return res.json();
}
async function hivePost(path, body) {
  const res = await fetch(`${HIVE_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  let data;
  try { data = await res.json(); } catch { data = { raw: await res.text() }; }
  return { data, status: res.status };
}

// ─── Tool execution ──────────────────────────────────────────────────────────
async function executeTool(name, args) {
  switch (name) {
    case 'dispute_check': {
      const { data, status } = await hivePost('/v1/dispute/check', {
        address: args.address,
        chain:   args.chain,
      });
      return { type: 'text', text: JSON.stringify({ status, ...data }, null, 2) };
    }
    case 'dispute_providers': {
      const data = await hiveGet('/v1/dispute/providers');
      return { type: 'text', text: JSON.stringify(data, null, 2) };
    }
    case 'dispute_route': {
      const body = {
        description: args.description,
        amount_usd:  args.amount_usd,
      };
      if (args.jurisdiction) body.jurisdiction = args.jurisdiction;
      const { data, status } = await hivePost('/v1/dispute/route', body);
      return { type: 'text', text: JSON.stringify({ status, ...data }, null, 2) };
    }
    case 'dispute_today': {
      const data = await hiveGet('/v1/dispute/today');
      return { type: 'text', text: JSON.stringify(data, null, 2) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export const serverInfo = {
  name: 'hive-mcp-dispute',
  display: 'HiveDispute',
  description: 'Observational dispute/chargeback signal surface for agent-to-agent commerce',
  version: '1.0.0',
  slug: 'dispute',
};
export { TOOLS, executeTool, HIVE_BASE };
