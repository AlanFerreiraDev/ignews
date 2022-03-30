/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Transformar a requisição que estou fazendo para ficar legível no Node, pois os webhooks do stripe vem em formato de streaming
import { Readable } from 'stream';
import { stripe } from '../../services/stripe';
import { saveSubscription } from './_lib/manageSubscription';

// Essa função vai pegando parte por parte do buffer e colocando em um array chamado chuncks
async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

// Uso para tirar o entendimento padrão do Next que entende que toda requisição vem em formato de json, no nosso caso vem em formato de stream
export const config = {
  api: {
    bodyParser: false,
  },
};

//Pegando eventos relevantes na hora de fazer a assinatura
const relevantEvents = new Set([
  // O set é como um array, mas não pode ter dados repetidos dentro dele
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req); // Aqui terei todos os dados da requisiçao feita no stripe
    const secret = req.headers['stripe-signature']; // Essa é a chave que vem dos headers da requisição, eu vou comparar com minha variavel de ambiente

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        // Aqui eu vou verificar se o evento é valido
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const { type } = event;

    // Confiro qual o tipo de evento estou recebendo
    if (relevantEvents.has(type)) {
      // Para cada tipo de evento eu tenho uma ação

      console.log('Evento recebido', event);
      try {
        switch (type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              type === 'customer.subscription.created' // Para identificar o evento de criação
            );

            break;
          case 'checkout.session.completed':
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session; // Faço isso pois o meu primeiro event é um evento genérico, e aqui eu tenho o próprio evento do checkout.session.completed, agora com o tipo eu consigo saber tudo que existe dentro dela

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            );
            break;
          default:
            throw new Error(`Unexpected event type: ${type}`);
        }
      } catch (err) {
        // Isso retorna p Stripe
        return res.json({
          error: 'Webhook handler failed',
        });
      }
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} not allowed`);
  }
};
