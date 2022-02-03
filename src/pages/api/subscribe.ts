import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { query as q } from 'faunadb';
import { fauna } from './../../services/fauna';
import { stripe } from './../../services/stripe';

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    // Preciso criar um user no Stripe, para isso preciso saber quem está logado na aplicação
    // Pego via cookies, pois eles podem ser acessados tanto no front-end quanto no back-end
    // O localStorage só está disponivel no Brwser, ou seja, não está disponivel no server
    // Usando o método no next-auth de pegar a sessão
    const session = await getSession({ req });

    // Vamos dividir em duas queries
    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index('user_by_email'), q.Casefold(session.user.email)))
    );

    // Preciso verificar se o usuario já possui uma conta no Stripe, para evitar que o usuario crie duas contas no Stripe
    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      // Se não tiver uma conta no Stripe, vamos criar uma
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        // metadata
      });

      // Salvar esse user do Stripe na primeira vez que for criado e assim evitar que seja duplicado no nosso banco de dados FaunaDB
      await fauna.query(
        q.Update(
          // Update é uma função do FaunaDB, que é usada para atualizar um documento
          q.Ref(q.Collection('users'), user.ref.id), // Ref é uma função do FaunaDB, que é usada para referenciar um documento, só consigo pela Ref, não pela Collection e o ID
          {
            data: {
              // Dados que quero atualizar
              stripe_customer_id: stripeCustomer.id,
            },
          }
        )
      );

      customerId = stripeCustomer.id;
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId, // Quem está comprando | ID do customer no Stripe, não no Fauna
      payment_method_types: ['card'], // Método de pagamento de cartão
      billing_address_collection: 'required', // Endereço de cobrança
      line_items: [
        //Produto
        { price: 'price_1KKW8RFRzGGc8rU7RxlkbUg9', quantity: 1 },
      ],
      mode: 'subscription', // Modo de pagamento, recorrente
      allow_promotion_codes: true, // Permite o uso de códigos promocionais
      success_url: process.env.STRIPE_SUCCESS_URL, // URL que ele vai ser redirecionado caso o pagamento seja bem sucedido
      cancel_url: process.env.STRIPE_CANCEL_URL, // URL que ele vai ser redirecionado caso o pagamento seja cancelado
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader('Allow', 'POST'); // Explicando p front, quem faz a requisição q o método q essa rota aceita é POST
    res.status(405).end(`Method ${req.method} not allowed`); // Erro 405: Método não permitido
  }
};
