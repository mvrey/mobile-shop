import { Outlet, ScrollRestoration } from 'react-router'
import Header from './Header'
import styles from './Layout.module.css'

function Layout() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  )
}

export default Layout
