import { GetStaticProps } from 'next'
import Head from 'next/head'

import styles from './home.module.scss'
import { stripe } from '@/services/stripe'
import { priceFormattedInDollars } from '@/utils/priceFormatted'
import { SubscribeButton } from '@/components'

interface HomeProps {
  product: {
    priceId: string
    amount: number
  }
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
            <span>for {product.amount}/month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve(
    String(process.env.STRIPE_PRODUCT_KEY)
  )

  const { id, unit_amount } = price
  const unitAmountNumber = Number(unit_amount)
  const timeOf24Hours = 60 * 60 * 24

  const priceFormatted = priceFormattedInDollars(unitAmountNumber)

  const product = {
    priceId: id,
    amount: priceFormatted,
  }

  return {
    props: {
      product,
    },
    revalidate: timeOf24Hours,
  }
}
