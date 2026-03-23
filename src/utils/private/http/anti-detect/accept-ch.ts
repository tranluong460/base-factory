/**
 * Tracks Accept-CH response headers per origin and generates
 * high-entropy Client Hints on subsequent requests.
 * Real browsers send these hints only after the server requests them.
 */
export class AcceptChTracker {
  private hintsPerOrigin = new Map<string, Set<string>>()

  /** Parse Accept-CH from response and store requested hints for the origin */
  processResponse(url: string, headers: Record<string, string>): void {
    const acceptCh = headers['accept-ch'] ?? headers['Accept-CH']
    if (!acceptCh) {
      return
    }
    try {
      const origin = new URL(url).origin
      const hints = new Set(acceptCh.split(',').map((h) => h.trim().toLowerCase()))
      this.hintsPerOrigin.set(origin, hints)
    } catch {
      // Invalid URL
    }
  }

  /** Generate high-entropy Client Hint headers if the origin previously requested them */
  getHeaders(
    url: string,
    majorVersion: number,
    secChUa: string,
    platformVersion: string,
  ): Record<string, string> {
    const result: Record<string, string> = {}
    try {
      const origin = new URL(url).origin
      const hints = this.hintsPerOrigin.get(origin)
      if (!hints) {
        return result
      }

      if (hints.has('sec-ch-ua-full-version-list') && secChUa) {
        result['sec-ch-ua-full-version-list'] = secChUa.replaceAll(
          `;v="${majorVersion}"`,
          `;v="${majorVersion}.0.${6099 + majorVersion}.0"`,
        )
      }
      if (hints.has('sec-ch-ua-arch')) {
        result['sec-ch-ua-arch'] = '"x86"'
      }
      if (hints.has('sec-ch-ua-bitness')) {
        result['sec-ch-ua-bitness'] = '"64"'
      }
      if (hints.has('sec-ch-ua-platform-version')) {
        result['sec-ch-ua-platform-version'] = `"${platformVersion}"`
      }
      if (hints.has('sec-ch-ua-model')) {
        result['sec-ch-ua-model'] = '""'
      }
    } catch {
      // Invalid URL
    }
    return result
  }

  /** Clear all tracking */
  clear(): void {
    this.hintsPerOrigin.clear()
  }
}
