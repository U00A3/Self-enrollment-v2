/**
 * MembershipRegistry contract – join, migrate, isMember, membersByRegion.
 * Backend signer calls join/migrate; revoke is DAO-only (same key if backend = dao).
 */
import { ethers } from "ethers";

const REGISTRY_ABI = [
  "function join(address user, string calldata region, string calldata declarationMessage) external",
  "function migrate(address oldAddress, address newAddress) external",
  "function leave() external",
  "function revoke(address user) external",
  "function isMember(address user) external view returns (bool)",
  "function getMember(address user) external view returns (bytes32 regionHash, bool active)",
  "function totalMembers() external view returns (uint256)",
  "function membersByRegion(bytes32 regionHash) external view returns (uint256)",
];

const BOOTSTRAP_ABI = [
  "function getContractAddress(string memory contractName) public view returns (address)",
];
const PERMISSION_ABI = ["function isAllowed(address _address) public view returns (bool)"];

const BOOTSTRAP_ADDRESS = process.env.BOOTSTRAP_ADDRESS || "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5";

let registryContract = null;
let permissionContract = null;

function getProvider() {
  const rpc = process.env.RPC_URL;
  if (!rpc) throw new Error("Missing RPC_URL");
  return new ethers.JsonRpcProvider(rpc);
}

export function getRegistryContract() {
  if (!registryContract) {
    const rpc = process.env.RPC_URL;
    const key = process.env.BACKEND_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
    const addr = process.env.DAO_CONTRACT_ADDRESS;
    if (!rpc || !key || !addr) {
      throw new Error("Missing RPC_URL, BACKEND_PRIVATE_KEY (or DEPLOYER_PRIVATE_KEY), or DAO_CONTRACT_ADDRESS");
    }
    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(key.trim().replace(/^["']|["']$/g, ""), provider);
    registryContract = new ethers.Contract(addr.trim(), REGISTRY_ABI, signer);
  }
  return registryContract;
}

export async function getPermissionContract() {
  if (!permissionContract) {
    const provider = getProvider();
    const bootstrap = new ethers.Contract(BOOTSTRAP_ADDRESS, BOOTSTRAP_ABI, provider);
    const permissionAddr = await bootstrap.getContractAddress("permission");
    permissionContract = new ethers.Contract(permissionAddr, PERMISSION_ABI, provider);
  }
  return permissionContract;
}

export async function isAllowedByCAT(address) {
  const permission = await getPermissionContract();
  return permission.isAllowed(address);
}

export async function isMemberOnChain(address) {
  const c = getRegistryContract();
  return c.isMember(address, { blockTag: "latest" });
}

export async function joinOnChain(userAddress, regionCode, declarationMessage) {
  const c = getRegistryContract();
  const region = regionCode != null ? String(regionCode) : "";
  const msg = declarationMessage != null && declarationMessage !== "" ? declarationMessage : "";
  const tx = await c.join(userAddress, region, msg);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function migrateOnChain(oldAddress, newAddress) {
  const c = getRegistryContract();
  const tx = await c.migrate(oldAddress, newAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function revokeOnChain(userAddress) {
  const c = getRegistryContract();
  const tx = await c.revoke(userAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function membersByRegionOnChain(regionCode) {
  const regionHash = ethers.keccak256(ethers.toUtf8Bytes(regionCode));
  const c = getRegistryContract();
  return c.membersByRegion(regionHash, { blockTag: "latest" });
}
