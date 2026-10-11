import { useId } from 'react'
import styles from './SearchBar.module.css'

function SearchBar({ value, onChange }) {
  const inputId = useId()

  return (
    <div className={styles.search}>
      <label htmlFor={inputId} className="visually-hidden">
        Search products
      </label>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" className={styles.icon}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        id={inputId}
        type="search"
        className={styles.input}
        placeholder="Search by brand or model"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export default SearchBar
