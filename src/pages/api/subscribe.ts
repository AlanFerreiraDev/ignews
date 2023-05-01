import { query as q } from 'faunadb'
import { fauna } from '@/services/fauna'
import { stripe } from '@/services/stripe'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

type TUser = {
  ref: {
    id: string
  }
  data: {
    stripe_customer_id: string
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req })

    const filterUserHasLogged = await fauna.query<TUser>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(String(session?.user?.email))
        )
      )
    )

    let customerIdHasExists = filterUserHasLogged.data.stripe_customer_id

    const userDoesNotExists = !customerIdHasExists

    if (userDoesNotExists) {
      const stripeCustomer = await stripe.customers.create({
        email: String(session?.user?.email),
        // metadata
      })

      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), filterUserHasLogged?.ref?.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      )

      customerIdHasExists = stripeCustomer.id
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerIdHasExists,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: String(process.env.STRIPE_PRODUCT_KEY), quantity: 1 },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: String(process.env.STRIPE_SUCCESS_URL),
      cancel_url: String(process.env.STRIPE_CANCEL_URL),
    })

    return res.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}
