import CheckoutForm from './checkout'
import { stripe } from '../../../lib/stripe'
import {SetCheckout} from './actions'

export default async function IndexPage() {
  const { client_secret: clientSecret } = await stripe.paymentIntents.create({
    amount: await SetCheckout(),
    currency: 'usd',
  })

  return (
    <div id="checkout">
      <CheckoutForm clientSecret={clientSecret} />
    </div>
  )
}
