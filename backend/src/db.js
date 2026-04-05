/**
 * In-memory store: members_audit, region_caps.
 * No PII – address and region only.
 */
const DEFAULT_REGIONS = [
  ["EU", 100],
  ["NG", 50],
  ["US", 50],
  ["GB", 50],
  ["AU", 50],
  ["PL", 1],
];

const regionCaps = new Map(DEFAULT_REGIONS);
const auditLogs = [];

export function getDb() {
  return { regionCaps, auditLogs };
}

export function auditLog(address, region, action, txHash = null) {
  auditLogs.push({ address, region, action, timestamp: Date.now(), tx_hash: txHash });
}

export function getRegionCaps() {
  return Array.from(regionCaps.entries()).map(([region, cap]) => ({ region, cap }));
}

export function getRegionCap(region) {
  return regionCaps.get(region) ?? null;
}
