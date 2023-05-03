import Link from 'next/link'
import { SigInButton } from '../SigInButton'
import styles from './styles.module.scss'
import { ActiveLink } from '../ActiveLink'

export const Header = () => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="ig.news" />
        <nav>
          <ActiveLink href="/" activeClassName={styles.active}>
            Home
          </ActiveLink>
          <ActiveLink href="/posts" activeClassName={styles.active} prefetch>
            Posts
          </ActiveLink>
        </nav>
        <SigInButton />
      </div>
    </header>
  )
}
