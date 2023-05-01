import { FiX } from 'react-icons/fi'

import { signIn, signOut, useSession, GetSessionParams } from 'next-auth/react'

import styles from './styles.module.scss'
import { GithubLogo } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

export const SigInButton = () => {
  const [colorButton, setColorButton] = useState<string>('')
  const { data: session } = useSession()

  const handleSignIn = async (provider: string) => {
    await signIn(provider)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  useEffect(() => {
    const loggedColorButton = '#04d361'
    const loggedOutColorButton = '#eba417'

    if (session?.user) {
      setColorButton(loggedColorButton)
    } else {
      setColorButton(loggedOutColorButton)
    }
  }, [session])

  return session ? (
    <button
      type="button"
      className={styles.sigInButton}
      onClick={handleSignOut}
    >
      <GithubLogo color={colorButton} />
      {session.user?.name}
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.sigInButton}
      onClick={() => handleSignIn('github')}
    >
      <GithubLogo color={colorButton} />
      Sign in with Github
    </button>
  )
}
