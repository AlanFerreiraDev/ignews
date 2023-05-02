import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'

interface IActiveLinkProps extends LinkProps {
  children: ReactNode
  activeClassName: string
}

export const ActiveLink = ({
  children,
  activeClassName,
  ...rest
}: IActiveLinkProps) => {
  const { asPath } = useRouter()

  const className = asPath === rest.href ? activeClassName : ''

  return (
    <Link {...rest} className={className}>
      {children}
    </Link>
  )
}
