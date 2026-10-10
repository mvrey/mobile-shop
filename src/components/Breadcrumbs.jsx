import { Link, useMatches } from 'react-router'
import styles from './Breadcrumbs.module.css'

// Builds the trail from the matched routes that declare a `handle.crumb`.
// Every crumb links to its page, except the last one (the current page).
function Breadcrumbs() {
  const crumbs = useMatches().filter((match) => match.handle?.crumb)

  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.list}>
        {crumbs.map((match, index) => {
          const label = match.handle.crumb(match)
          const isCurrent = index === crumbs.length - 1
          return (
            <li key={match.id} className={styles.item}>
              {isCurrent ? (
                <span aria-current="page">{label}</span>
              ) : (
                <Link to={match.pathname}>{label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
