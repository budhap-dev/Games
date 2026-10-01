import type { ReactNode } from 'react'

/** Small line-icon set for app chrome (games keep their emoji art). 24×24, stroke = currentColor. */
const PATHS: Record<string, ReactNode> = {
  back: <path d="M15 18l-6-6 6-6" />,
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  pause: <path d="M8.5 5v14M15.5 5v14" strokeWidth={3} />,
  play: <path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.6-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8z" fill="currentColor" />,
  refresh: <><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" /><path d="M3 21v-5h5" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.7-1 1.2-1.9-.6-1.1.2-2.4 1.5-2.4H17a4 4 0 0 0 4-4C21 7.3 17 3 12 3z" /><circle cx="7.5" cy="11" r="1.3" fill="currentColor" stroke="none" /><circle cx="10.5" cy="7" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="7.5" r="1.3" fill="currentColor" stroke="none" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" /></>,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  heart: <path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 0 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1z" />,
  heartFill: <path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 0 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1z" fill="currentColor" />,
  link: <><path d="M10 13.5a4.5 4.5 0 0 0 6.8.5l2.9-2.9a4.5 4.5 0 0 0-6.4-6.4l-1.4 1.4" /><path d="M14 10.5a4.5 4.5 0 0 0-6.8-.5l-2.9 2.9a4.5 4.5 0 0 0 6.4 6.4l1.4-1.4" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-4.5M12 8h.01" /></>,
  gamepad: <><path d="M7 7h10a5 5 0 0 1 5 5v.5a4 4 0 0 1-7.2 2.4L14 14h-4l-.8.9A4 4 0 0 1 2 12.5V12a5 5 0 0 1 5-5z" /><path d="M7.5 10v4M5.5 12h4" /><path d="M16 11h.01M18 13h.01" strokeWidth={2.6} /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1v.1h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z" /></>,
  flask: <><path d="M9 3h6M10 3v6.2L4.6 18.4A1.7 1.7 0 0 0 6.1 21h11.8a1.7 1.7 0 0 0 1.5-2.6L14 9.2V3" /><path d="M7.2 15h9.6" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
}
export type IconName = keyof typeof PATHS

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg className="ico" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  )
}
