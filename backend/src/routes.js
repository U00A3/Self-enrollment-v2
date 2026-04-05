/**
 * REST API: eligibility, regions, join, migrate, leave, admin revoke.
 * All responses and logs in English.
 */
import { ethers } from "ethers";
import { verifySigner } from "./verify.js";
import {
  isAllowedByCAT,
  isMemberOnChain,
  joinOnChain,
  migrateOnChain,
  revokeOnChain,
  membersByRegionOnChain,
  getRegistryContract,
} from "./contract.js";
import { getRegionCaps, getRegionCap, auditLog } from "./db.js";

const JOIN_MESSAGE_PREFIX = "I declare region ";
const JOIN_MESSAGE_SUFFIX = " and accept DAO Terms v1";
const LEAVE_MESSAGE = "I request to leave the DAO";
const MIGRATE_MESSAGE_PREFIX = "I authorize migration to ";

function normalizeAddress(addr) {
  if (!addr || typeof addr !== "string") return null;
  try {
    return ethers.getAddress(addr.trim());
  } catch (_) {
    return null;
  }
}

export async function getEligibility(req, res) {
  try {
    const address = normalizeAddress(req.query.address);
    if (!address) {
      return res.status(400).json({ error: "Missing or invalid address" });
    }
    const [hasCAT, isMember] = await Promise.all([
      isAllowedByCAT(address),
      isMemberOnChain(address),
    ]);
    const canJoin = hasCAT && !isMember;
    return res.json({ hasCAT, isMember, canJoin });
  } catch (err) {
    console.error("Eligibility error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getRegions(req, res) {
  try {
    const caps = getRegionCaps();
    const out = {};
    for (const { region, cap } of caps) {
      const current = await membersByRegionOnChain(region);
      out[region] = { cap: Number(cap), current: Number(current) };
    }
    return res.json(out);
  } catch (err) {
    console.error("Regions error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function postJoin(req, res) {
  try {
    const { address, region, signature, message } = req.body || {};
    const addr = normalizeAddress(address);
    if (!addr) {
      return res.status(400).json({ error: "Missing or invalid address" });
    }
    const regionCode = (region || "").trim().toUpperCase();
    if (!regionCode) {
      return res.status(400).json({ error: "Missing region" });
    }
    if (!signature || !message) {
      return res.status(400).json({ error: "Missing signature or message" });
    }
    const expectedMessage = JOIN_MESSAGE_PREFIX + regionCode + JOIN_MESSAGE_SUFFIX;
    if (message !== expectedMessage) {
      return res.status(400).json({ error: "Invalid message (must declare region and accept terms)" });
    }
    if (!verifySigner(addr, message, signature)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const [hasCAT, isMember] = await Promise.all([
      isAllowedByCAT(addr),
      isMemberOnChain(addr),
    ]);
    if (!hasCAT) {
      return res.status(403).json({ error: "Wallet not allowed by CAT (Permission)" });
    }
    if (isMember) {
      return res.status(409).json({ error: "Already a member" });
    }

    const cap = getRegionCap(regionCode);
    if (cap != null) {
      const current = await membersByRegionOnChain(regionCode);
      if (Number(current) >= Number(cap)) {
        return res.status(403).json({ error: "Region cap reached" });
      }
    }

    const txHash = await joinOnChain(addr, regionCode, message);
    auditLog(addr, regionCode, "JOIN", txHash);
    return res.json({ status: "joined", txHash });
  } catch (err) {
    console.error("Join error:", err);
    const msg = err.message || "Join failed";
    if (msg.includes("AlreadyMember") || msg.includes("already a member")) {
      return res.status(409).json({ error: "Already a member" });
    }
    return res.status(500).json({ error: msg });
  }
}

export async function postMigrate(req, res) {
  try {
    const { oldAddress, newAddress, oldSignature, newSignature } = req.body || {};
    const oldAddr = normalizeAddress(oldAddress);
    const newAddr = normalizeAddress(newAddress);
    if (!oldAddr || !newAddr) {
      return res.status(400).json({ error: "Missing or invalid oldAddress/newAddress" });
    }
    if (!oldSignature || !newSignature) {
      return res.status(400).json({ error: "Missing oldSignature or newSignature" });
    }
    const migrateMessage = MIGRATE_MESSAGE_PREFIX + newAddr;
    if (!verifySigner(oldAddr, migrateMessage, oldSignature)) {
      return res.status(401).json({ error: "Invalid oldAddress signature" });
    }
    if (!verifySigner(newAddr, migrateMessage, newSignature)) {
      return res.status(401).json({ error: "Invalid newAddress signature" });
    }

    const [oldAllowed, newAllowed] = await Promise.all([
      isAllowedByCAT(oldAddr),
      isAllowedByCAT(newAddr),
    ]);
    if (!oldAllowed || !newAllowed) {
      return res.status(403).json({ error: "Both addresses must be allowed by CAT" });
    }
    const isOldMember = await isMemberOnChain(oldAddr);
    const isNewMember = await isMemberOnChain(newAddr);
    if (!isOldMember || isNewMember) {
      return res.status(400).json({ error: "Old address must be member; new address must not be member" });
    }

    const txHash = await migrateOnChain(oldAddr, newAddr);
    auditLog(oldAddr, "-", "MIGRATE", txHash);
    auditLog(newAddr, "-", "MIGRATE_TO", txHash);
    return res.json({ status: "migrated", txHash });
  } catch (err) {
    console.error("Migrate error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function postLeave(req, res) {
  try {
    const { address, signature, message } = req.body || {};
    const addr = normalizeAddress(address);
    if (!addr) {
      return res.status(400).json({ error: "Missing or invalid address" });
    }
    if (!signature || !message) {
      return res.status(400).json({ error: "Missing signature or message" });
    }
    if (message !== LEAVE_MESSAGE) {
      return res.status(400).json({ error: "Invalid message for leave" });
    }
    if (!verifySigner(addr, message, signature)) {
      return res.status(401).json({ error: "Invalid signature" });
    }
    const isMember = await isMemberOnChain(addr);
    if (!isMember) {
      return res.status(400).json({ error: "Not a member" });
    }

    const txHash = await revokeOnChain(addr);
    auditLog(addr, "-", "REVOKE", txHash);
    return res.json({ status: "left", txHash });
  } catch (err) {
    console.error("Leave error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function postAdminRevoke(req, res) {
  try {
    const { address } = req.body || {};
    const addr = normalizeAddress(address);
    if (!addr) {
      return res.status(400).json({ error: "Missing or invalid address" });
    }
    const isMember = await isMemberOnChain(addr);
    if (!isMember) {
      return res.status(400).json({ error: "Not a member" });
    }
    const txHash = await revokeOnChain(addr);
    auditLog(addr, "-", "ADMIN_REVOKE", txHash);
    return res.json({ status: "revoked", txHash });
  } catch (err) {
    console.error("Admin revoke error:", err);
    return res.status(500).json({ error: err.message });
  }
}
