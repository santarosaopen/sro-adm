'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const [width, setWidth] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPathRef = useRef(pathname)

  useEffect(() => {
    if (typeof window === 'undefined') return

    function handleStart() {
      if (timerRef.current) clearTimeout(timerRef.current)
      setWidth(0)
      setActive(true)
      // Progresso gradual até 85%
      let w = 0
      const grow = () => {
        w = w < 30 ? w + 15 : w < 60 ? w + 8 : w < 80 ? w + 3 : w < 85 ? w + 0.5 : 85
        setWidth(w)
        if (w < 85) timerRef.current = setTimeout(grow, 100)
      }
      timerRef.current = setTimeout(grow, 50)
    }

    function handleStop() {
      if (timerRef.current) clearTimeout(timerRef.current)
      setWidth(100)
      timerRef.current = setTimeout(() => {
        setActive(false)
        setWidth(0)
      }, 300)
    }

    // Intercepta cliques em links de navegação
    function onClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('#') || href === pathname) return
      handleStart()
    }

    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  // Completa a barra quando o pathname muda
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      if (timerRef.current) clearTimeout(timerRef.current)
      setWidth(100)
      timerRef.current = setTimeout(() => {
        setActive(false)
        setWidth(0)
      }, 300)
    }
  }, [pathname])

  if (!active && width === 0) return null

  return (
    <div
      className="fixed left-0 top-0 z-[9999] h-0.5 bg-blue-500 transition-all duration-200 ease-out"
      style={{ width: `${width}%`, opacity: active || width === 100 ? 1 : 0 }}
    />
  )
}
