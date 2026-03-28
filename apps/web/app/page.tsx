import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@streakflow/auth'

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/today')
  } else {
    redirect('/login')
  }
}
