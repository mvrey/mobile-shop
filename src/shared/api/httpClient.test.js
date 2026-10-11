import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL, ApiError, request } from './httpClient'

describe('httpClient.request', () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn(() => Promise.resolve(new Response('{"ok":true}', { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls the API and returns the parsed body', async () => {
    await expect(request('/api/thing')).resolves.toEqual({ ok: true })
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/api/thing`)
  })

  it('gives every request a timeout signal', async () => {
    await request('/api/thing')

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it('throws an ApiError with the status on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 503 }))

    const error = await request('/api/thing').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(503)
  })
})
