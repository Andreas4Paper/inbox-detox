import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  wordmarkColor?: 'dark' | 'white'
  className?: string
  iconOnly?: boolean
}

export function InboxDetoxLogo({ size = 'md', wordmarkColor = 'dark', className, iconOnly = false }: LogoProps) {
  const iconDim = size === 'sm' ? 28 : size === 'md' ? 32 : 48
  const textClass =
    size === 'sm'
      ? 'text-lg'
      : size === 'md'
        ? 'text-xl'
        : 'text-3xl'
  const gap = size === 'sm' ? 'gap-2' : size === 'md' ? 'gap-2.5' : 'gap-3'
  const colorClass = wordmarkColor === 'white' ? 'text-white' : 'text-slate-900'

  return (
    <div className={cn('flex items-center', gap, className)}>
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Envelope body */}
        <rect x="2.2" y="5.2" width="19.6" height="14.2" rx="3.4" fill="oklch(0.62 0.12 158)" />
        {/* Envelope fold line */}
        <path
          d="M5 9.2 L12 13.6 L19 9.2"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Sparkle badge background */}
        <circle cx="19.3" cy="5.4" r="3.6" fill="#fbfbf8" />
        {/* Sparkle star shape */}
        <path
          d="M12 2.2 C12 6.4, 12.9 7.5, 17.8 12 C12.9 16.5, 12 17.6, 12 21.8 C12 17.6, 11.1 16.5, 6.2 12 C11.1 7.5, 12 6.4, 12 2.2 Z"
          fill="oklch(0.62 0.12 158)"
          transform="translate(19.3 5.4) scale(0.26) translate(-12 -12)"
        />
      </svg>
      {!iconOnly && (
        <span
          className={cn('leading-none tracking-tight whitespace-nowrap', textClass, colorClass)}
          style={{ letterSpacing: '-0.022em' }}
        >
          <span className="font-semibold">Inbox</span>
          <span className="font-normal"> Detox</span>
        </span>
      )}
    </div>
  )
}
