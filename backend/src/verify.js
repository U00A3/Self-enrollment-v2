/**
 * Wallet-based auth: recover signer from message and signature.
 */
import { ethers } from "ethers";

export function verifySignature(message, signature) {
  try {
    const recovered = ethers.verifyMessage(message, signature);
    return recovered;
  } catch (_) {
    return null;
  }
}

export function verifySigner(address, message, signature) {
  const recovered = verifySignature(message, signature);
  if (!recovered) return false;
  return ethers.getAddress(recovered) === ethers.getAddress(address);
}
