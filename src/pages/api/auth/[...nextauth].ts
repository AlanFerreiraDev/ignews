import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { signInCallback } from './queries'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: String(process.env.GITHUB_CLIENT_ID),
      clientSecret: String(process.env.GITHUB_CLIENT_SECRET),
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      const { email } = user

      try {
        signInCallback(String(email))

        return true
      } catch {
        return false
      }
    },
  },
})
