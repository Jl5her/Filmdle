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
      fill="currentColor"
    >
      <path d="M8 10c0-1.66 1.34-3 3-3h42c1.66 0 3 1.34 3 3v44c0 1.66-1.34 3-3 3H11c-1.66 0-3-1.34-3-3V10zm5 1v6h6v-6h-6zm0 10v6h6v-6h-6zm0 10v6h6v-6h-6zm0 10v6h6v-6h-6zm0 10v3h6v-3h-6zM45 11v6h6v-6h-6zm0 10v6h6v-6h-6zm0 10v6h6v-6h-6zm0 10v6h6v-6h-6zm0 10v3h6v-3h-6zM24 14c-1.1 0-2 .9-2 2v32c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V16c0-1.1-.9-2-2-2H24z" />
    </svg>
  )
}
