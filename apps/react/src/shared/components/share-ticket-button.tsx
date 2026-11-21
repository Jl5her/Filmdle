import clsx from "clsx"
import { useState } from "react"
import { Icon } from "@/shared/components/icon"
import { shareTicketImage, type TicketImageData } from "@/shared/lib/ticket-image"

/** Square button that shares the finished game as a ticket-stub image. */
export function ShareTicketButton({ ticket }: { ticket: () => TicketImageData }) {
  const [status, setStatus] = useState<"idle" | "working" | "saved" | "failed">("idle")

  async function handleClick() {
    if (status === "working") return
    setStatus("working")
    try {
      const result = await shareTicketImage(ticket())
      setStatus(result === "saved" ? "saved" : "idle")
    } catch {
      setStatus("failed")
    }
    window.setTimeout(() => setStatus("idle"), 2000)
  }

  const label =
    status === "saved"
      ? "Ticket image saved"
      : status === "failed"
        ? "Couldn't make the ticket image"
        : "Share as ticket image"

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={clsx(
        "flex w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 py-3 transition-colors",
        "border-danger-600 text-danger-600 hover:bg-danger-600/10",
        "dark:border-danger-500 dark:text-primary-50 dark:hover:bg-danger-500/20",
      )}
    >
      <Icon
        name={
          status === "working"
            ? "spinner"
            : status === "saved"
              ? "check"
              : status === "failed"
                ? "triangle-exclamation"
                : "ticket"
        }
        className={status === "working" ? "animate-spin" : undefined}
      />
    </button>
  )
}
