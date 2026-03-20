import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Logo height={36} />
            </div>
            <p className="text-sm leading-relaxed mb-4">
              AI-powered baby food safety scanner. Protecting 24,000+ babies from toxic chemicals in food.
            </p>
            <p className="text-xs text-gray-600">
              © 2024 FoodFactScanner. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
              <li><Link href="/login?signup=true" className="hover:text-white transition-colors">Sign Up Free</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Baby Food Safety Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Heavy Metals Database</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FDA Recall Tracker</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Prenatal Nutrition Guide</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Science</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="mailto:hello@foodfactscanner.com" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>
              FoodFactScanner provides safety information for educational purposes only.
              Always consult your pediatrician for medical advice.
              Affiliate disclosure: We earn commissions on some recommended products — safety scores are never influenced by commercial relationships.
            </p>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span>🔒 256-bit SSL</span>
              <span>🏥 HIPAA Compliant</span>
              <span>🌿 SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
