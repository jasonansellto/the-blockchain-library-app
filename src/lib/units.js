// Exact decimal-string ↔ BigInt base-unit conversion (no floating point).
// Used by the Unit Converter so wei/satoshi math never loses precision.

// "1.5" with 18 decimals -> 1500000000000000000n
export function toBaseUnits(decStr, decimals) {
  if (decStr == null) return 0n;
  const s = String(decStr).trim().replace(/,/g, '');
  if (s === '' || s === '-' || s === '.') return 0n;
  if (!/^-?\d*\.?\d*$/.test(s)) return 0n;
  const neg = s.startsWith('-');
  const body = neg ? s.slice(1) : s;
  let [intPart, fracPart = ''] = body.split('.');
  fracPart = (fracPart + '0'.repeat(decimals)).slice(0, decimals);
  intPart = intPart.replace(/^0+/, '') || '0';
  const big = BigInt(intPart + fracPart || '0');
  return neg ? -big : big;
}

// 1500000000000000000n with 18 decimals -> "1.5"
export function fromBaseUnits(base, decimals) {
  let s = (base || 0n).toString();
  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  s = s.padStart(decimals + 1, '0');
  const intPart = s.slice(0, s.length - decimals);
  const fracPart = s.slice(s.length - decimals).replace(/0+$/, '');
  return (neg ? '-' : '') + intPart + (fracPart ? '.' + fracPart : '');
}

export const ETH_DECIMALS = 18;
export const GWEI_DECIMALS = 9;
export const BTC_DECIMALS = 8;
export const TYPICAL_TX_GAS = 21000;