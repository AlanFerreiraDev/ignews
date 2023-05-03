import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { stripe } from '@/services/stripe'
// import { buffer } from '@/utils/buffer'
import { saveSubscription } from './_lib/manageSubscription'
import { Readable } from 'stream'
import { log } from 'console'

async function buffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const bufferOfWebhooks = await buffer(req)

    const secret = req.headers['stripe-signature']

    let event: Stripe.Event = {
      id: '',
      object: 'event',
      api_version: null,
      created: 0,
      data: {
        object: '',
      },
      livemode: true,
      pending_webhooks: 0,
      request: null,
      type: '',
    }

    try {
      event = stripe.webhooks.constructEvent(
        bufferOfWebhooks,
        String(secret),
        String(process.env.STRIPE_WEBHOOK_SECRET)
      )

      alert(event)
    } catch (err) {
      if (err instanceof Error) {
        return res.status(400).send(`Webhook error: ${err.message}`)
      }
    }

    const { type } = event

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            )

            break
          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session

            await saveSubscription(
              String(checkoutSession?.subscription),
              String(checkoutSession?.customer),
              true
            )

            break
          default:
            throw new Error('Unhandled event.')
        }
      } catch (err) {
        if (err instanceof Error) {
          return res.json({ error: 'Webhook handler failed.' })
        }
      }
    }

    res.status(200).json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}
