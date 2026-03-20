'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/Logo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo height={38} />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">How It Works</a>
            <a href="#features" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Reviews</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-gray-700 hover:text-brand-600 font-medium transition-colors px-4 py-2">
              Log In
            </Link>
            <Link href="/login?signup=true" className="btn-primary text-sm px-5 py-2.5">
              Start Free Trial
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <a href="#how-it-works" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#features" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#pricing" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="#testimonials" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Reviews</a>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link href="/login" className="block w-full text-center py-2.5 text-gray-700 font-medium border border-gray-200 rounded-xl">Log In</Link>
              <Link href="/login?signup=true" className="block w-full text-center py-2.5 btn-primary">Start Free Trial</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
