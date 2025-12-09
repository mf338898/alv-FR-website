"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

type RevealProps = {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
    >
      {children}
    </div>
  )
}

type ShuffleTextProps = {
  text: string
  speed?: number
  duration?: number
  className?: string
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

export function ShuffleText({ text, speed = 24, duration = 900, className = "" }: ShuffleTextProps) {
  const [displayed, setDisplayed] = useState(text)

  useEffect(() => {
    let frame: number
    const start = performance.now()

    const shuffle = () => {
      const elapsed = performance.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const chars = text.split("").map((char, index) => {
        const revealAt = index / text.length
        if (progress > revealAt) return char
        const randomIndex = Math.floor(Math.random() * alphabet.length)
        return alphabet[randomIndex]
      })
      setDisplayed(chars.join(""))
      if (progress < 1) {
        frame = requestAnimationFrame(shuffle)
      }
    }

    frame = requestAnimationFrame(shuffle)
    return () => cancelAnimationFrame(frame)
  }, [text, duration])

  return <span className={className}>{displayed}</span>
}

type FadeInTextProps = {
  text: string
  delay?: number
  className?: string
}

export function FadeInText({ text, delay = 0, className = "" }: FadeInTextProps) {
  const characters = useMemo(() => text.split(""), [text])
  return (
    <span className={className}>
      {characters.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="inline-block opacity-0 animate-fade-in"
          style={{ animationDelay: `${delay + index * 20}ms` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  )
}

// Tailwind animation helper classes (fade-in)
// Add to globals if missing:
// .animate-fade-in { @apply motion-safe:animate-[fadeIn_0.7s_ease-out_forwards]; }
