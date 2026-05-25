interface Props {
  className?: string
  title?: string
}

export function FilmIcon({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      fill="none"
    >
      {title ? <title>{title}</title> : null}
      {/* Body of the clapperboard */}
      <rect x="6" y="26" width="52" height="30" rx="3" fill="currentColor" opacity="0.18" />
      <rect x="6" y="26" width="52" height="30" rx="3" stroke="currentColor" strokeWidth="3" />
      {/* Stripe across the body */}
      <line x1="6" y1="38" x2="58" y2="38" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      {/* The hinged top "clapper" plank */}
      <path d="M8 24 L56 12 L60 22 L12 34 Z" fill="currentColor" />
      {/* Diagonal stripes on the clapper */}
      <path
        d="M20 28 L24 16 M32 26 L36 14 M44 24 L48 12"
        stroke="var(--icon-stripe, #fff)"
        strokeOpacity="0.85"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
