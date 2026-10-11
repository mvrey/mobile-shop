import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LoadingState, { SLOW_THRESHOLD_MS } from './LoadingState'

describe('LoadingState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the message, and explains the delay only if loading is slow', () => {
    render(<LoadingState message="Loading products…" />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading products…')
    expect(screen.queryByText(/server is waking up/i)).not.toBeInTheDocument()

    act(() => vi.advanceTimersByTime(SLOW_THRESHOLD_MS))

    expect(screen.getByText(/server is waking up/i)).toBeInTheDocument()
  })
})
