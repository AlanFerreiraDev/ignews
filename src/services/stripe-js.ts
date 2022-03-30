// Parte Front-End do Stripe, parte pública
import { loadStripe } from '@stripe/stripe-js';

export async function getStripeJs() {
  const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY); // Aqui passo a chave pública do Stripe, essa chave é pública e precisa ser carregada pelo browser, para isso eu coloco no arquivo de .env.local o inicio dela como NEXT_PUBLIC_STRIPE_PUBLIC_KEY, é a única maneira do nosso front-end conseguir ler a chave

  return stripeJs;
}
