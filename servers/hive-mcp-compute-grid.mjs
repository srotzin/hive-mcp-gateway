// Auto-derived from hive-mcp-compute-grid server.js — do not edit by hand.
// Re-build via launch_artifacts/scripts/build_gateway.py

/**
 * HiveComputeGrid MCP Server
 * Cross-pool compute auction grid — 15-agent fleet, 6 driver types, Groth16-verified
 *
 * Backend: https://hivemorph.onrender.com
 * Spec   : MCP 2024-11-05 / Streamable-HTTP / JSON-RPC 2.0
 * Brand  : Hive Civilization gold #C08D23 (Pantone 1245 C)
 */



const HIVE_BASE = process.env.HIVE_BASE || 'https://hivemorph.onrender.com';

// ─── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
{
  name: 'computegrid_list_agents',
  description: 'List the 15-agent compute grid fleet across all 6 driver types. Returns agent type, count, and revenue model. No auth required.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},{
  name: 'computegrid_get_capacity',
  description: 'Read-only capacity view from the Capacity Listener fleet. Per spec section 8: NO bids, NO hedges, NO positions, NO derivatives — pure read-only telemetry.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},    {
      name: 'computegrid_verify_proof',
      description: 'Submit a compute job for verification by the Verification Fleet (4 agents). Returns Groth16-style proof. $0.001/proof in USDC.',
      inputSchema: {
type: 'object',
required: ["job_id", "driver", "claimed_output_hash", "submitter_did"],
properties: {
  job_id: { type: 'string', description: 'Job ID to verify' },
  driver: { type: 'string', description: 'Source driver: ionet | render | akash | aleo | custom' },
  claimed_output_hash: { type: 'string', description: 'SHA-256 of claimed output' },
  submitter_did: { type: 'string', description: 'DID of the submitting agent' }
},
      },
    }
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
  let data; try { data = await res.json(); } catch { data = { raw: await res.text() }; }
  return { data, status: res.status };
}

// ─── Tool execution ──────────────────────────────────────────────────────────
async function executeTool(name, args) {
  switch (name) {
      case 'computegrid_list_agents': {
const data = await hiveGet('/v1/compute-grid/agents');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'computegrid_get_capacity': {
const data = await hiveGet('/v1/compute-grid/capacity');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'computegrid_verify_proof': {
const { data, status } = await hivePost('/v1/compute-grid/verify', {
  job_id: args.job_id,
  driver: args.driver,
  claimed_output_hash: args.claimed_output_hash,
  submitter_did: args.submitter_did
});
return { type: 'text', text: JSON.stringify({ status, ...data }, null, 2) };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── MCP JSON-RPC handler ────────────────────────────────────────────────────

// ─── Discovery + health ──────────────────────────────────────────────────────


export const serverInfo = {
  name: 'hive-mcp-compute-grid',
  display: 'HiveComputeGrid',
  description: 'Cross-pool compute auction grid — 15-agent fleet, Groth16-verified',
  version: '1.0.0',
  slug: 'compute-grid',
};
export { TOOLS, executeTool, HIVE_BASE };
