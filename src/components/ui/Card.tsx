import { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ title, children, className = '', padding = true }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
    </div>
  )
}
