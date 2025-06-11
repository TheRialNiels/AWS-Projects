import PatternDark from '@/assets/pattern-dark.svg'

export function BackgroundPattern() {
  return (
    <div className="absolute inset-0 size-full">
      <div className="relative h-full w-full select-none">
        <svg
          className="absolute right-0 min-h-dvh min-w-dvh text-foreground"
          width="803"
          height="775"
          viewBox="0 0 803 775"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
            {PatternDark}
        </svg>
      </div>
    </div>
  )
}
