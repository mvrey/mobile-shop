import { useCallback, useEffect, useState } from 'react'

// Runs an async `load` function and tracks its result.
// `load` must be stable between renders (a module function, or wrapped in
// useCallback): a new `load` means "fetch something else" and starts a new request.
//
// Returns { data, error, loading, retry }.
export function useRequest(load) {
  const [attempt, setAttempt] = useState(0)
  // The result remembers which request produced it, so `loading` can be derived:
  // if the stored result is not for the current load/attempt, we're still waiting.
  const [result, setResult] = useState({ load: null, attempt: -1, data: undefined, error: null })

  useEffect(() => {
    let active = true
    load().then(
      (data) => {
        if (active) setResult({ load, attempt, data, error: null })
      },
      (error) => {
        if (active) setResult({ load, attempt, data: undefined, error })
      },
    )
    // Ignore the answer if the component unmounted or a newer request started.
    return () => {
      active = false
    }
  }, [load, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const isCurrent = result.load === load && result.attempt === attempt
  return {
    data: isCurrent ? result.data : undefined,
    error: isCurrent ? result.error : null,
    loading: !isCurrent,
    retry,
  }
}
