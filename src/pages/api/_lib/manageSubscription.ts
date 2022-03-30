import { query as q } from 'faunadb';
import { fauna } from '../../../services/fauna';
import { stripe } from '../../../services/stripe';
// Arquivo com Underline na frente para ela não ser tratada como um rota da api
// Essa função vai salçvar as informações no Banco de Dados
export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  // Buscar o usuário no banco do FaunaDB com o ID {customerID}
  const userRef = await fauna.query(
    // Select
    q.Select(
      'ref', // Para selecionar apenas o campo ref
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'), // No indice user_by_stripe_customer_id, vai procurar pelo customerId
          customerId
        )
      )
    )
  );

  // Vou buscar todos os dados da subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId); // retrieve para buscar uma só subscription

  // Para salvar o que é apenas importante para mim, crio um objeto com as informações que eu quero
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  };

  if (createAction) {
    // Se for uma criação de assinatura, vou salvar o objeto como uma nova assinatura
    await fauna.query(
      q.Create(
        q.Collection('subscriptions'), // Criar uma coleção
        { data: subscriptionData } // E passar os dados da subscription
      )
    );
  } else {
    await fauna.query(
      q.Replace(
        // Atualiza, substituindo a subscription por completo
        q.Select(
          // Selecionar
          'ref', // O campo ref
          q.Get(
            // Pegar
            q.Match(
              // No indice subscriptions_by_id, vai procurar pelo id da subscription
              q.Index('subscription_by_id'),
              subscriptionId
            )
          )
        ),
        { data: subscriptionData } // E passar os dados da subscription
      )
    );
  }

  console.log(subscriptionId, customerId);
  // Salvar os dados da subsciption do usuário no faunaDB
}
