import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/shared/Icon'

/** Header for the secondary pages: back to Home, a title and optional actions on the right. */
export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="topbar">
      <Link className="btn icon ghost" to="/" aria-label="Back"><Icon name="back" /></Link>
      <h1 className="page-title">{title}</h1>
      <div className="grow" />
      {children}
    </header>
  )
}
