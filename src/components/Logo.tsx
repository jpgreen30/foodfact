import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  /** Height in pixels — width scales proportionally (aspect ~3.5:1) */
  height?: number
  /** Wrap the logo in a <Link href="/"> — default true */
  linked?: boolean
  className?: string
}

export default function Logo({ height = 36, linked = true, className = '' }: LogoProps) {
  const img = (
    <Image
      src="/logo.svg"
      alt="FoodFactScanner"
      height={height}
      width={Math.round(height * 4.5)}
      priority
      className={className}
    />
  )

  return linked ? <Link href="/">{img}</Link> : img
}
