import { Link } from 'react-router'
import Breadcrumbs from './Breadcrumbs'
import CartBadge from './CartBadge'
import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/" className={styles.title}>
            Mobile Shop
          </Link>
          <Breadcrumbs />
        </div>
        <CartBadge />
      </div>
    </header>
  )
}

export default Header
