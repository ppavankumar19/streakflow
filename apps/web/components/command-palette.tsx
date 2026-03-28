'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCommandPalette } from '@/hooks/use-command-palette'
import { cn } from '@/lib/utils'

const ACTIONS = [
  { id: 'new-task',   label: 'New task',         icon: '＋', kbd: 'N',   href: '/today?new=task' },
  { id: 'new-habit',  label: 'New habit',        icon: '◉', kbd: 'H',   href: '/habits?new=1' },
  { id: 'freeze',     label: 'Use freeze token', icon: '🧊', kbd: null,  href: '/today?freeze=1' },
] as const

const PAGES = [
  { id: 'today',       label: 'Today',       icon: '◈', href: '/today' },
  { id: 'habits',      label: 'Habits',      icon: '◉', href: '/habits' },
  { id: 'analytics',   label: 'Analytics',   icon: '▦', href: '/analytics' },
  { id: 'routines',    label: 'Routines',    icon: '⊞', href: '/routines' },
  { id: 'settings',    label: 'Settings',    icon: '◁', href: '/settings' },
] as const

type Item = { id: string; label: string; icon: string; kbd?: string | null; href: string; group: string }

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)

  const allItems: Item[] = [
    ...ACTIONS.map((a) => ({ ...a, group: 'Quick Actions' })),
    ...PAGES.map((p) => ({ ...p, group: 'Navigate' })),
  ]

  const filtered = query
    ? allItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : allItems

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    acc[item.group] ??= []
    acc[item.group]!.push(item)
    return acc
  }, {})

  const flatFiltered = Object.values(grouped).flat()

  function selectItem(item: Item) {
    close()
    setQuery('')
    router.push(item.href)
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((i) => (i + 1) % flatFiltered.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((i) => (i - 1 + flatFiltered.length) % flatFiltered.length)
      }
      if (e.key === 'Enter' && flatFiltered[selectedIdx]) {
        selectItem(flatFiltered[selectedIdx]!)
      }
    },
    [isOpen, flatFiltered, selectedIdx], // eslint-disable-line
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    // Cmd+K global shortcut
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        useCommandPalette.getState().toggle()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [isOpen])

  if (!isOpen) return null

  let flatIdx = 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-[14vh] backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div className="w-[560px] overflow-hidden rounded-[18px] border border-border-2 bg-surface-2 shadow-2xl animate-slide-up">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <span className="text-base text-[#3C3A47]">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0) }}
            placeholder="Search tasks, habits, navigate…"
            className="flex-1 bg-transparent text-[15px] text-[#EDE8E3] placeholder-[#3C3A47] outline-none caret-flame"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#3C3A47] hover:text-[#8A8796]">×</button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[340px] overflow-y-auto p-2">
          {flatFiltered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#3C3A47]">No results</p>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="px-2.5 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#3C3A47]">
                  {group}
                </p>
                {items.map((item) => {
                  const isSelected = flatIdx === selectedIdx
                  const currentIdx = flatIdx++
                  return (
                    <button
                      key={item.id}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-[8px] px-2.5 py-2 text-left transition-colors',
                        isSelected ? 'bg-flame/10' : 'hover:bg-surface-3',
                      )}
                      onMouseEnter={() => setSelectedIdx(currentIdx)}
                      onClick={() => selectItem(item)}
                    >
                      <span className={cn(
                        'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] text-[13px]',
                        isSelected ? 'bg-flame/15' : 'bg-surface-3',
                      )}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-[13.5px] text-[#EDE8E3]">{item.label}</span>
                      {item.kbd && (
                        <kbd className="rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-[#3C3A47]">
                          {item.kbd}
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-4 border-t border-border px-4 py-2">
          {[['↑↓', 'navigate'], ['↵', 'select'], ['esc', 'close']].map(([kbd, label]) => (
            <div key={label} className="flex items-center gap-1.5 font-mono text-[10px] text-[#3C3A47]">
              <kbd className="rounded border border-border bg-surface-3 px-1.5 py-0.5">{kbd}</kbd>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
