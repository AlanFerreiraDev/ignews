import { GetServerSideProps, GetStaticProps } from 'next';
import Head from 'next/head';
import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';

import styles from './home.module.scss';

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        <img src="/images/avatar.svg" alt="Gril Coding" />
      </main>
    </>
  );
}

//* Server Side Rendering - Que faz todo o processo todas as vezes
// par fazer a chamada via ServerSide Rendering, par aevitar que a pagina fique algum tempo sem mostrar nada
// então fazemos a chamada na camada do Next e não do Browser
// Mais dinâmico, mais rápido, mais seguro

// export const getServerSideProps: GetServerSideProps = async () => {
//   const price = await stripe.prices.retrieve('price_1KKW8RFRzGGc8rU7RxlkbUg9');

//   const product = {
//     priceId: price.id,
//     amount: new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//     }).format(price.unit_amount / 100), // Vem em centavos
//   };

//   return {
//     props: {
//       product,
//     },
//   };
// };

//* Static Site Generation - Que gera um apágina estática de acordo com o tempo do revalidate
// Porém se toda vez que alguém entrasse na aplicação eu fizesse o processo de buscar os preços e tudo mais, causaria muita lentidão
// para isso existe o Static Site Generation, que salva o site em cache, e assim quando alguém acessar a aplicação, ele não precisa fazer a chamada
// Problema é que o Site Estático vai ser fixo, então se alguém entrar com o nome Diego e outra pessoa com outro nome, a pagina renderizada será a de Diego, pq o site é estático, não funciona para muitas transações
// Nesse caso foi melhor o estatico, pq a pagina sempre será fixa

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1KKW8RFRzGGc8rU7RxlkbUg9');

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100), // Vem em centavos
  };

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, // Quanto tempo para gerar uma nova página estática, nesse caso será: 24 horas
  };
};

//* O Client Side seria a chamada normal com o useEffect, que é executado toda vez que a página for renderizada, ou quando vc colocar a dependencia
