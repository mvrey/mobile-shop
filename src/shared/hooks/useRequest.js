import { useCallback, useEffect, useEffectEvent, useState } from 'react'

// Runs the async `load` function and tracks its result. `key` identifies what is
// being loaded: a new key starts a new request; a new `load` function alone does
// not (so callers can pass an inline arrow function).
//
// Returns { data, error, loading, retry }.
export function useRequest(key, load) {
  const [attempt, setAttempt] = useState(0)
  // The result remembers which request produced it, so `loading` can be derived:
  // if the stored result is not for the current key/attempt, we're still waiting.
  const [result, setResult] = useState({
    key: undefined,
    attempt: -1,
    data: undefined,
    error: null,
  })

  // Always calls the latest `load`, without making it an effect dependency.
  const runLoad = useEffectEvent(() => load())

  useEffect(() => {
    let active = true
    runLoad().then(
      (data) => {
        if (active) setResult({ key, attempt, data, error: null })
      },
      (error) => {
        if (active) setResult({ key, attempt, data: undefined, error })
      },
    )
    // Ignore the answer if the component unmounted or a newer request started.
    return () => {
      active = false
    }
  }, [key, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const isCurrent = result.key === key && result.attempt === attempt
  return {
    data: isCurrent ? result.data : undefined,
    error: isCurrent ? result.error : null,
    loading: !isCurrent,
    retry,
  }
}
