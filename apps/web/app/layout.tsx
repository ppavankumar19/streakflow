import type { Metadata, Viewport } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@streakflow/auth'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'StreakFlow', template: '%s · StreakFlow' },
  description: 'Build habits. Break records. Own your day.',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  themeColor: '#09090C',
  colorScheme: 'dark',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" className="dark">
      <body className="grain min-h-screen bg-[#09090C] antialiased">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  )
}
