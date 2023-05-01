import { fauna } from '@/services/fauna'
import { query as q } from 'faunadb'

export const signInCallback = async (email: string) => {
  await fauna.query(
    q.If(
      q.Not(
        q.Exists(q.Match(q.Index('user_by_email'), q.Casefold(String(email))))
      ),
      q.Create(q.Collection('users'), { data: { email } }),
      q.Get(q.Match(q.Index('user_by_email'), q.Casefold(String(email))))
    )
  )
}
