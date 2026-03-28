import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@streakflow/db'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Dynamic import to avoid issues when Stripe isn't configured
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe webhook error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.userId
      if (userId) {
        await db.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: 'ACTIVE',
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: 'ACTIVE',
          },
        })
        await db.user.update({ where: { id: userId }, data: { plan: 'PRO' } })
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const existing = await db.subscription.findFirst({
        where: { stripeSubscriptionId: sub.id },
      })
      if (existing) {
        const status = sub.status === 'active' ? 'ACTIVE'
          : sub.status === 'canceled' ? 'CANCELED'
          : sub.status === 'past_due' ? 'PAST_DUE'
          : 'INCOMPLETE'

        await db.subscription.update({
          where: { id: existing.id },
          data: {
            status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        })

        if (event.type === 'customer.subscription.deleted') {
          await db.user.update({ where: { id: existing.userId }, data: { plan: 'FREE' } })
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
