import styles from './OptionSelector.module.css'

// A group of radio buttons styled as pills. Native radios give keyboard
// navigation (arrow keys) and screen-reader support for free.
function OptionSelector({ label, name, options, selected, onSelect }) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.code} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.code}
              checked={selected === option.code}
              onChange={() => onSelect(option.code)}
              className={styles.input}
            />
            <span className={styles.pill}>{option.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default OptionSelector
