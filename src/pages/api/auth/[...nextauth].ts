// COm essa forma de [...nextauth] é possível criar rotas com qualquer parametro que eu quiser passar, ele vai receber todos os parametros da url, exemplo:
// localhost:3000/api/auth/qualquercoisaaqui, qualquercoisaaqui é o parametro que eu quero passar.

import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user',
        },
      },
    }),
    // ...add more providers here
  ],
});
