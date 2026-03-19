import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import ProblemSection from '@/components/landing/ProblemSection'
import HowItWorks from '@/components/landing/HowItWorks'
import Features from '@/components/landing/Features'
import Testimonials from '@/components/landing/Testimonials'
import Pricing from '@/components/landing/Pricing'
import FAQ from '@/components/landing/FAQ'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
