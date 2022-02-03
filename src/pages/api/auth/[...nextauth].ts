// Com essa forma de [...nextauth] é possível criar rotas com qualquer parametro que eu quiser passar, ele vai receber todos os parametros da url, exemplo:
// localhost:3000/api/auth/qualquercoisaaqui, qualquercoisaaqui é o parametro que eu quero passar.

import { query as q } from 'faunadb';

import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

import { fauna } from '../../../services/fauna';

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
  ],
  // Função de callback que é chamada toda vez que fazemos a autenticação
  callbacks: {
    async signIn({ user }) {
      const { email } = user;
      // Query do Fauna
      // Escrita em FQL, Fauna Query Language
      // Essa função adiciona o email em users no banco de dados, toda vez que alguém logar
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                // se existir
                q.Match(
                  // Como se fosse o where do SQL
                  q.Index('user_by_email'), // Index, é um índice, é um índice que foi criado para a tabela users na console do faunadb, e vai ser criado com o nome users_by_email
                  q.Casefold(user.email) // Casefold, para deixar tudo minusculo, quando o ususario digitar
                )
              )
            ),
            q.Create(q.Collection('users'), { data: { email } }), // Se existir, ele cria um novo usuário
            q.Get(
              // Se não existir, ele pega os dados do usuário, ou seja, o email
              q.Match(
                // Como se fosse o where do SQL
                q.Index('user_by_email'), // Index, é um índice, é um índice que foi criado para a tabela users na console do faunadb, e vai ser criado com o nome users_by_email
                q.Casefold(user.email) // Casefold, para deixar tudo minusculo, quando o ususario digitar
              )
            )
          )
        );
        return true;
      } catch {
        return false;
      }
    },
  },
});

// FaunaDB ou DynamoDB - principalmente usado em Serverlless, ou seja, ambiente que utiliza acesso ao banco de dados, sem servidor.
// Quando falamos de serevrlless não temos um pool de conexões, ou seja, acessamos o banco e depois fechamos.
