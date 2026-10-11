import { useEffect, useState } from 'react'
import styles from './StatusMessage.module.css'

export const SLOW_THRESHOLD_MS = 3000

// The API runs on a free hosting tier that sleeps when idle; the first request
// after a while can take up to a minute. If loading is slow, say so.
/** @param {{ message?: string }} props */
function LoadingState({ message = 'Loading…' }) {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_THRESHOLD_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={styles.status} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
      {isSlow && (
        <p className={styles.hint}>
          The server is waking up. The first load can take up to a minute.
        </p>
      )}
    </div>
  )
}

export default LoadingState
