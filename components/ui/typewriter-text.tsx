'use client'

import { useState, useEffect } from 'react'

interface TypewriterTextProps {
  text: string
  delay?: number
  speed?: number
  className?: string
  showCursor?: boolean
}

export function TypewriterText({ 
  text, 
  delay = 0, 
  speed = 50, 
  className = '',
  showCursor = true 
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (displayText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1))
      }, speed)

      return () => clearTimeout(timeout)
    } else {
      setCompleted(true)
    }
  }, [started, displayText, text, speed])

  return (
    <span className={className}>
      {displayText}
      {showCursor && !completed && (
        <span className="animate-pulse ml-0.5 text-primary">|</span>
      )}
    </span>
  )
}
