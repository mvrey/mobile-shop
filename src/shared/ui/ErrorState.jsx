import styles from './StatusMessage.module.css'

function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className={styles.status} role="alert">
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" className="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export default ErrorState
