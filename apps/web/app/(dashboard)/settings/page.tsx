'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { trpc } from '@/lib/trpc'
import { Topbar } from '@/components/topbar'
import { Button, Input, Badge } from '@streakflow/ui'
import { getInitials } from '@/lib/utils'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { data: user } = trpc.users.me.useQuery()
  const { data: tokens } = trpc.users.freezeTokenBalance.useQuery()
  const utils = trpc.useUtils()

  const [name, setName] = useState(session?.user?.name ?? '')
  const [deleteEmail, setDeleteEmail] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  const { mutate: updateProfile, isPending: saving } = trpc.users.updateProfile.useMutation({
    onSuccess: (u) => {
      void update({ name: u.name })
      void utils.users.me.invalidate()
    },
  })

  const { mutate: deleteAccount, isPending: deleting } = trpc.users.deleteAccount.useMutation({
    onSuccess: () => signOut({ callbackUrl: '/login' }),
  })

  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? 'FREE'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar title="Settings" />

      <div className="flex-1 overflow-y-auto px-7 py-8">
        <div className="mx-auto max-w-lg space-y-8">

          {/* Profile */}
          <Section title="Profile">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-flame-gradient text-[18px] font-bold text-white shadow-flame">
                {getInitials(session?.user?.name)}
              </div>
              <div>
                <p className="font-semibold text-[#EDE8E3]">{session?.user?.name ?? 'No name'}</p>
                <p className="text-sm text-[#8A8796]">{session?.user?.email}</p>
              </div>
            </div>
            <form
              className="flex gap-3"
              onSubmit={(e) => { e.preventDefault(); updateProfile({ name }) }}
            >
              <Input
                className="flex-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name"
              />
              <Button type="submit" loading={saving}>Save</Button>
            </form>
          </Section>

          {/* Plan */}
          <Section title="Plan & Billing" id="billing">
            <div className="flex items-center justify-between rounded-[12px] border border-border bg-surface p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-[#EDE8E3]">{plan} Plan</span>
                  <Badge variant={plan === 'PRO' || plan === 'TEAM' ? 'pro' : 'default'}>
                    {plan}
                  </Badge>
                </div>
                {user?.subscription && (
                  <p className="mt-0.5 text-xs text-[#8A8796]">
                    {user.subscription.status === 'TRIALING'
                      ? 'Free trial active'
                      : user.subscription.cancelAtPeriodEnd
                      ? 'Cancels at period end'
                      : 'Active subscription'}
                  </p>
                )}
              </div>
              {plan === 'FREE' && (
                <Button size="sm" asChild>
                  <a href="/api/stripe/checkout">Upgrade to Pro</a>
                </Button>
              )}
            </div>

            {tokens && (
              <div className="mt-3 rounded-[10px] border border-border bg-surface p-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#EDE8E3]">🧊 Freeze tokens</p>
                  <p className="text-[12px] text-[#8A8796]">{tokens.remaining} remaining this month</p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: tokens.limit }, (_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 w-2.5 rounded-full ${i < tokens.remaining ? 'bg-ice' : 'bg-surface-3'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Stats */}
          {user && (
            <Section title="Account Stats">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[10px] border border-border bg-surface p-3">
                  <p className="font-mono text-[22px] font-medium text-[#EDE8E3]">{user._count.habits}</p>
                  <p className="text-[11px] text-[#3C3A47]">Total habits</p>
                </div>
                <div className="rounded-[10px] border border-border bg-surface p-3">
                  <p className="font-mono text-[22px] font-medium text-[#EDE8E3]">{user._count.tasks}</p>
                  <p className="text-[11px] text-[#3C3A47]">Total tasks</p>
                </div>
              </div>
            </Section>
          )}

          {/* Danger zone */}
          <Section title="Danger Zone">
            {!showDelete ? (
              <Button variant="danger" onClick={() => setShowDelete(true)}>Delete account</Button>
            ) : (
              <div className="space-y-3 rounded-[10px] border border-red-500/30 bg-red-500/5 p-4">
                <p className="text-sm text-red-400">
                  This will permanently delete your account and all data. Type your email to confirm.
                </p>
                <Input
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder={session?.user?.email ?? 'your@email.com'}
                />
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    loading={deleting}
                    onClick={() => deleteAccount({ confirmEmail: deleteEmail })}
                  >
                    Delete permanently
                  </Button>
                  <Button variant="ghost" onClick={() => { setShowDelete(false); setDeleteEmail('') }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Section>

          {/* Sign out */}
          <Button variant="secondary" className="w-full" onClick={() => signOut({ callbackUrl: '/login' })}>
            Sign out
          </Button>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id}>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#3C3A47]">{title}</p>
      {children}
    </div>
  )
}
