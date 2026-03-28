import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-3 text-[#3C3A47]',
        flame:   'bg-flame/10 text-flame',
        ice:     'bg-ice/10 text-ice',
        mint:    'bg-mint/10 text-mint',
        gold:    'bg-gold/10 text-gold',
        danger:  'bg-red-500/10 text-red-400',
        pro:     'bg-flame-gradient text-white shadow-flame-sm',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
