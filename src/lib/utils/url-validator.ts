/**
 * Validates that a URL is safe to fetch server-side.
 * Rejects private IPs, reserved ranges, and non-HTTP(S) schemes.
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { valid: false, error: 'URL invalide' }
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Seuls les protocoles HTTP et HTTPS sont autorisés' }
  }

  if (url.length > 2048) {
    return { valid: false, error: 'URL trop longue (max 2048 caractères)' }
  }

  const hostname = parsed.hostname.toLowerCase()

  if (hostname === 'localhost' || hostname === '[::1]') {
    return { valid: false, error: 'localhost non autorisé' }
  }

  // Check for private/reserved IPv4 ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4Match) {
    const [, a, b, c] = ipv4Match.map(Number)
    if (
      a === 127 ||                          // 127.0.0.0/8 loopback
      a === 10 ||                           // 10.0.0.0/8 private
      (a === 172 && b >= 16 && b <= 31) ||  // 172.16.0.0/12 private
      (a === 192 && b === 168) ||           // 192.168.0.0/16 private
      (a === 169 && b === 254) ||           // 169.254.0.0/16 link-local
      a === 0 ||                            // 0.0.0.0/8
      (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 carrier-grade NAT
      (a === 198 && b >= 18 && b <= 19) ||  // 198.18.0.0/15 benchmarking
      (a === 192 && b === 0 && c === 0) ||  // 192.0.0.0/24 IETF protocol
      (a === 192 && b === 0 && c === 2)     // 192.0.2.0/24 documentation
    ) {
      return { valid: false, error: 'Adresses IP privées/réservées non autorisées' }
    }
  }

  return { valid: true }
}
