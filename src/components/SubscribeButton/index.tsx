import { signIn, useSession } from 'next-auth/react'
import styles from './styles.module.scss'
import { api } from '@/services/api'
import { getStripeJs } from '@/services/stripe-js'

interface ISubscribeButtonProps {
  priceId: string
}

export const SubscribeButton = ({ priceId }: ISubscribeButtonProps) => {
  const { data: session } = useSession()
  async function handleSubscribe() {
    const userHasNoActiveSession = !session

    if (userHasNoActiveSession) {
      signIn('github')
      return
    }

    try {
      const callStripeSubscription = await api.post('/subscribe')

      const { sessionId } = callStripeSubscription.data

      const stripeService = await getStripeJs()

      await stripeService?.redirectToCheckout({ sessionId })
    } catch (error) {
      alert(error)
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}
