import CheckoutForm from './checkout'
import { stripe } from '../../../lib/stripe'
import {SetCheckout} from './action'

export default async function IndexPage() {

  const permit = await SetCheckout()

  const { client_secret: clientSecret } = await stripe.paymentIntents.create({
    amount: (permit * 100),
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return (
    <div id="checkout">
      <CheckoutForm clientSecret={clientSecret} />
    </div>
  )
}
