'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface SecretLogoProps {
  src: string
  alt: string
}

export default function SecretLogo({ src, alt }: SecretLogoProps) {
  const router = useRouter()
  const [clickCount, setClickCount] = useState(0)

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000)
      return () => clearTimeout(timer)
    }
  }, [clickCount])

  const handleSecretClick = () => {
    const newCount = clickCount + 1
    if (newCount >= 5) {
      router.push('/auth/login')
      setClickCount(0)
    } else {
      setClickCount(newCount)
    }
  }

  return (
    <div 
      className="relative w-20 h-20 sm:w-24 sm:h-24 select-none cursor-default"
      onClick={handleSecretClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain pointer-events-none"
        priority
      />
    </div>
  )
}
