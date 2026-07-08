import { isAddress, getAddress } from 'ethers';

// Client-side address validation + checksum verification for multiple chains.
// EVM uses ethers.js; Bitcoin/Litecoin/Tron use Base58Check (SHA-256 double
// hash via Web Crypto); BTC/Litecoin SegWit & Cosmos use Bech32 (BIP-173).

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function b58decode(str) {
  let num = 0n;
  for (const c of str) {
    const idx = B58.indexOf(c);
    if (idx === -1) return null;
    num = num * 58n + BigInt(idx);
  }
  let hex = num.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  for (let i = 0; i < str.length && str[i] === '1'; i++) bytes.unshift(0);
  return new Uint8Array(bytes);
}

async function b58checkOk(str) {
  const bytes = b58decode(str);
  if (!bytes || bytes.length < 5) return false;
  const payload = bytes.slice(0, bytes.length - 4);
  const checksum = bytes.slice(bytes.length - 4);
  const h1 = new Uint8Array(await crypto.subtle.digest('SHA-256', payload));
  const h2 = new Uint8Array(await crypto.subtle.digest('SHA-256', h1));
  return h2.slice(0, 4).every((b, i) => b === checksum[i]);
}

// --- Bech32 (BIP-173) checksum verification ---
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
function bech32Polymod(values) {
  const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= gen[i];
  }
  return chk;
}
function bech32HrpExpand(hrp) {
  return [...hrp].flatMap((c) => [c.charCodeAt(0) >> 5, c.charCodeAt(0) & 31]);
}
function bech32Verify(hrp, data) {
  return bech32Polymod([...bech32HrpExpand(hrp), ...data]) === 1;
}
function bech32Decode(str) {
  if (str.length < 8 || str.length > 90) return null;
  const pos = str.lastIndexOf('1');
  if (pos < 1 || pos + 7 > str.length) return null;
  const hrp = str.slice(0, pos);
  const dataPart = str.slice(pos + 1);
  if (!/^[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/.test(dataPart)) return null;
  const data = [...dataPart].map((c) => BECH32_CHARSET.indexOf(c));
  if (!bech32Verify(hrp, data)) return null;
  return { hrp, data: data.slice(0, -6) };
}
// 5-bit groups -> 8-bit bytes (witness program length check)
function bech32ToBytes(data) {
  const out = [];
  let acc = 0, bits = 0;
  for (const v of data) {
    acc = (acc << 5) | v;
    bits += 5;
    if (bits >= 8) { out.push((acc >> (bits - 8)) & 0xff); bits -= 8; }
  }
  return out;
}

const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
const B58_RE = /^[1-9A-HJ-NP-Za-km-z]+$/;

export async function validateAddress(raw) {
  const addr = (raw || '').trim();
  if (!addr) return { valid: false, chain: null, type: null, note: 'Enter an address to validate.' };

  // Ethereum / EVM (Polygon, BSC, Arbitrum share this format)
  if (EVM_RE.test(addr)) {
    if (isAddress(addr)) {
      const checksummed = getAddress(addr);
      const already = addr === checksummed;
      return {
        valid: true,
        chain: 'Ethereum / EVM',
        type: 'EVM address (EOA or contract)',
        note: already
          ? 'Valid EIP-55 checksummed address. This format is shared across Ethereum, Polygon, BSC, Arbitrum, Optimism and other EVM chains.'
          : 'Valid address — the EIP-55 checksum-encoded version is shown below. Always use the checksummed form to guard against typos.',
        checksummed,
      };
    }
    return { valid: false, chain: 'Ethereum / EVM', type: 'Invalid', note: 'Looks like an EVM address but failed checksum validation.' };
  }

  const lower = addr.toLowerCase();

  // Bitcoin — Bech32 SegWit (bc1…)
  if (lower.startsWith('bc1')) {
    const d = bech32Decode(lower);
    if (d && d.hrp === 'bc' && d.data.length >= 1 && d.data[0] <= 16) {
      const prog = bech32ToBytes(d.data.slice(1));
      if (prog.length >= 2 && prog.length <= 40) {
        return { valid: true, chain: 'Bitcoin', type: d.data[0] === 0 ? 'Native SegWit (Bech32)' : `SegWit v${d.data[0]}`, note: 'Valid Bech32 SegWit address with a correct checksum. SegWit enables lower fees than legacy formats.' };
      }
    }
    return { valid: false, chain: 'Bitcoin', type: 'Invalid', note: 'Not a valid Bitcoin Bech32 / SegWit address.' };
  }
  // Bitcoin — Legacy / P2SH (1… / 3…)
  if (/^[13][1-9A-HJ-NP-Za-km-z]{20,34}$/.test(addr)) {
    if (await b58checkOk(addr)) return { valid: true, chain: 'Bitcoin', type: addr.startsWith('1') ? 'Legacy (P2PKH)' : 'Nested SegWit / P2SH', note: 'Valid Base58Check address with a correct checksum.' };
    return { valid: false, chain: 'Bitcoin', type: 'Invalid', note: 'Checksum verification failed — this address is malformed.' };
  }

  // Litecoin — Bech32 (ltc1…)
  if (lower.startsWith('ltc1')) {
    const d = bech32Decode(lower);
    if (d && d.hrp === 'ltc' && d.data.length >= 1 && d.data[0] <= 16) {
      const prog = bech32ToBytes(d.data.slice(1));
      if (prog.length >= 2 && prog.length <= 40) return { valid: true, chain: 'Litecoin', type: 'SegWit (Bech32)', note: 'Valid Litecoin Bech32 SegWit address.' };
    }
    return { valid: false, chain: 'Litecoin', type: 'Invalid', note: 'Not a valid Litecoin Bech32 address.' };
  }
  // Litecoin — Legacy (L… / M…)
  if (/^[LM][1-9A-HJ-NP-Za-km-z]{20,34}$/.test(addr)) {
    if (await b58checkOk(addr)) return { valid: true, chain: 'Litecoin', type: 'Legacy (P2PKH / P2SH)', note: 'Valid Litecoin Base58Check address.' };
    return { valid: false, chain: 'Litecoin', type: 'Invalid', note: 'Checksum verification failed.' };
  }

  // Tron (T… Base58Check)
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr)) {
    if (await b58checkOk(addr)) return { valid: true, chain: 'Tron', type: 'Base58Check (T-address)', note: 'Valid Tron address with a correct Base58Check checksum.' };
    return { valid: false, chain: 'Tron', type: 'Invalid', note: 'Checksum verification failed.' };
  }

  // Cosmos (cosmos1… Bech32)
  if (lower.startsWith('cosmos1')) {
    const d = bech32Decode(lower);
    if (d && d.hrp === 'cosmos') return { valid: true, chain: 'Cosmos', type: 'Bech32 (cosmos1…)', note: 'Valid Cosmos Hub address with a correct Bech32 checksum.' };
    return { valid: false, chain: 'Cosmos', type: 'Invalid', note: 'Not a valid Cosmos Bech32 address.' };
  }

  // Solana (Base58, 32-byte public key)
  if (B58_RE.test(addr) && addr.length >= 32 && addr.length <= 44) {
    return { valid: true, chain: 'Solana', type: 'Base58 public key', note: 'Valid Solana Base58 public key (32 bytes). Format is correct; on-chain existence is not verified here.' };
  }

  return { valid: false, chain: null, type: 'Unknown format', note: 'Address did not match any supported chain format.' };
}