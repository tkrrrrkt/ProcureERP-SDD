/**
 * Normalize code: trim, convert to half-width, uppercase
 */
export function normalizeCode(code: string): string {
  return code
    .trim()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .toUpperCase()
}

/**
 * Validate code length (should be exactly 10 digits)
 */
export function validateCodeLength(code: string): boolean {
  return code.length === 10
}
