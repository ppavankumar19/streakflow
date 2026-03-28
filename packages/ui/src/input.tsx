'use client'

import * as React from 'react'
import { cn } from './utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, suffix, id, ...props }, ref) => {
    const inputId = id ?? React.useId()
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium tracking-wide text-[#8A8796] uppercase font-mono"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 text-[#3C3A47] text-sm">{prefix}</div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm text-[#EDE8E3]',
              'placeholder:text-[#3C3A47]',
              'focus:outline-none focus:ring-2 focus:ring-flame/40 focus:border-transparent',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-all duration-150',
              prefix && 'pl-9',
              suffix && 'pr-9',
              error && 'border-red-500/50 focus:ring-red-500/30',
              className,
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 text-[#3C3A47] text-sm">{suffix}</div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-[#3C3A47]">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
