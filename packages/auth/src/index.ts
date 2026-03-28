import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@streakflow/db'
import type { NextAuthOptions, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions['adapter'],

  session: { strategy: 'jwt' },

  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/login?verify=1',
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),

    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 465,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY ?? '',
        },
      },
      from: process.env.EMAIL_FROM ?? 'noreply@streakflow.app',
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Persist user id + plan into the JWT on sign-in
      if (user) {
        token.id = user.id
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { plan: true, trialEndsAt: true },
        })
        token.plan = dbUser?.plan ?? 'FREE'
        token.trialEndsAt = dbUser?.trialEndsAt ?? null
      }

      // Allow client-side session updates (e.g. after plan upgrade)
      if (trigger === 'update' && session?.plan) {
        token.plan = session.plan
      }

      return token
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          plan: token.plan as string,
          trialEndsAt: token.trialEndsAt as Date | null,
        },
      }
    },
  },

  events: {
    async createUser({ user }) {
      // Start 14-day Pro trial for every new user
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)

      await db.user.update({
        where: { id: user.id },
        data: { trialEndsAt },
      })
    },
  },
}

// Re-export for convenience
export type { Session, JWT }
