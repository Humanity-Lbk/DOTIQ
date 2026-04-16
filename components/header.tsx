"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="h-16 px-6 flex items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="DOTIQ"
            width={180}
            height={56}
            className="h-11 w-auto invert brightness-0"
            priority
          />
        </Link>
      </div>
    </header>
  )
}
