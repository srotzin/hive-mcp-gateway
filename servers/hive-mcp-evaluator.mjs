// Auto-derived from hive-mcp-evaluator server.js — do not edit by hand.
// Re-build via launch_artifacts/scripts/build_gateway.py

/**
 * HiveEvaluator MCP Server
 * ERC-8183 / Virtuals ACP v2.0 evaluator-as-a-service for autonomous AI agents
 *
 * Backend: https://hivemorph.onrender.com
 * Spec   : MCP 2024-11-05 / Streamable-HTTP / JSON-RPC 2.0
 * Brand  : Hive Civilization gold #C08D23 (Pantone 1245 C)
 */



const HIVE_BASE = process.env.HIVE_BASE || 'https://hivemorph.onrender.com';

// ─── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
{
  name: 'evaluator_get_fees',
  description: 'Get the live evaluator fee schedule (3 tiers, settlement currencies, recipient addresses, ERC-8183 / Virtuals ACP v2.0 spec). No auth required.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},    {
      name: 'evaluator_submit_job',
      description: 'Submit a job for evaluation. Choose tier (simple, evaluation, arbitration). Job value is quoted in USDC; fee = max($0.05, value * tier_bps / 10000). Returns job_id and quoted fee.',
      inputSchema: {
type: 'object',
required: ["tier", "job_value_usdc", "subject_did", "submitter_did"],
properties: {
  tier: { type: 'string', description: '\'simple\' (0.5%), \'evaluation\' (1.0%), or \'arbitration\' (2.0%)' },
  job_value_usdc: { type: 'number', description: 'Notional job value in USDC' },
  subject_did: { type: 'string', description: 'DID of the agent or output being evaluated' },
  submitter_did: { type: 'string', description: 'DID of the submitting agent' },
  context: { type: 'string', description: 'Free-form context for the evaluator (max 4 KB)' }
},
      },
    },    {
      name: 'evaluator_get_job',
      description: 'Retrieve evaluation status, verdict, and attestation for a previously-submitted job.',
      inputSchema: {
type: 'object',
required: ["job_id"],
properties: {
  job_id: { type: 'string', description: 'Job ID returned from evaluator_submit_job' }
},
      },
    },    {
      name: 'evaluator_attest_job',
      description: 'Trigger settlement and emit the on-chain attestation for a completed job. Settles to the Hive Safe Treasury on the chain selected at submission. Requires EIP-3009 signature for Base/Ethereum.',
      inputSchema: {
type: 'object',
required: ["job_id"],
properties: {
  job_id: { type: 'string', description: 'Job ID returned from evaluator_submit_job' },
  signature: { type: 'string', description: 'EIP-3009 signature (required for EVM chains)' }
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
      case 'evaluator_get_fees': {
const data = await hiveGet('/v1/evaluator/fees');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'evaluator_submit_job': {
const { data, status } = await hivePost('/v1/evaluator/jobs', {
  tier: args.tier,
  job_value_usdc: args.job_value_usdc,
  subject_did: args.subject_did,
  submitter_did: args.submitter_did,
  context: args.context
});
return { type: 'text', text: JSON.stringify({ status, ...data }, null, 2) };
      }
      case 'evaluator_get_job': {
const data = await hiveGet(`/v1/evaluator/jobs/${args.job_id}`);
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'evaluator_attest_job': {
const { data, status } = await hivePost(`/v1/evaluator/jobs/${args.job_id}/attest`, {
  signature: args.signature
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
  name: 'hive-mcp-evaluator',
  display: 'HiveEvaluator',
  description: 'ERC-8183 / Virtuals ACP v2.0 evaluator-as-a-service for autonomous AI agents',
  version: '1.0.0',
  slug: 'evaluator',
};
export { TOOLS, executeTool, HIVE_BASE };
