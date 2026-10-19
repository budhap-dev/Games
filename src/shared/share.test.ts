import { afterEach, describe, expect, it, vi } from 'vitest'
import { share } from './share'

const data = { title: 'PlayPatch', url: 'https://playpatch.vercel.app/' }
const stubNavigator = (nav: Partial<Navigator>) => vi.stubGlobal('navigator', nav)

describe('share', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses the native share sheet on touch devices', async () => {
    const native = vi.fn().mockResolvedValue(undefined)
    stubNavigator({ share: native, maxTouchPoints: 5 })
    expect(await share(data)).toBe('shared')
    expect(native).toHaveBeenCalledWith(data)
  })

  it('reports a dismissed share sheet as cancelled without copying', async () => {
    const writeText = vi.fn()
    stubNavigator({ share: vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' })), maxTouchPoints: 5, clipboard: { writeText } as unknown as Clipboard })
    expect(await share(data)).toBe('cancelled')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('copies the link when the share sheet is unavailable or fails', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubNavigator({ maxTouchPoints: 0, clipboard: { writeText } as unknown as Clipboard })
    expect(await share(data)).toBe('copied')
    stubNavigator({ share: vi.fn().mockRejectedValue(new Error('NotAllowed')), maxTouchPoints: 5, clipboard: { writeText } as unknown as Clipboard })
    expect(await share(data)).toBe('copied')
    expect(writeText).toHaveBeenCalledWith(data.url)
  })

  it('fails quietly when the clipboard is blocked too', async () => {
    stubNavigator({ maxTouchPoints: 0, clipboard: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) } as unknown as Clipboard })
    expect(await share(data)).toBe('failed')
  })
})
