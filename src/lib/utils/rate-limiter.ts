export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Simple rate limiter : attend entre chaque appel
export class RateLimiter {
  private lastCall = 0

  constructor(private readonly minIntervalMs: number) {}

  async throttle(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastCall
    if (elapsed < this.minIntervalMs) {
      await sleep(this.minIntervalMs - elapsed)
    }
    this.lastCall = Date.now()
  }
}
