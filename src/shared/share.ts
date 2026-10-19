export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

/**
 * Opens the phone's native share sheet on touch devices; elsewhere (or if the sheet fails)
 * copies the link instead. Nothing is sent over the network by the app itself.
 */
export async function share(data: { title: string; text?: string; url: string }): Promise<ShareResult> {
  try {
    if (navigator.share && navigator.maxTouchPoints > 0) { await navigator.share(data); return 'shared' }
  } catch (e) {
    if ((e as Error).name === 'AbortError') return 'cancelled'
  }
  try { await navigator.clipboard.writeText(data.url); return 'copied' } catch { return 'failed' }
}
