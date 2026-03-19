'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How accurate is the chemical detection?',
    a: "Our AI has a 98% detection accuracy rate, validated against lab test results from third-party testing organizations including Healthy Babies Bright Futures and the Environmental Defense Fund. We compare ingredient profiles against established databases of chemical contamination data from FDA and independent lab reports.",
  },
  {
    q: 'Does "organic" mean a product is safe to scan?',
    a: 'Not necessarily. Congressional investigations found that several USDA Certified Organic baby foods still contained dangerous levels of heavy metals like arsenic and lead. These metals occur naturally in soil and water — "organic" certification doesn\'t test for them. FoodFactScanner checks beyond organic status.',
  },
  {
    q: 'What toxic chemicals does FoodFactScanner detect?',
    a: 'We screen for 2,400+ substances including heavy metals (arsenic, lead, cadmium, mercury), pesticide residues (chlorpyrifos, glyphosate), phthalates, BPA/BPS, artificial dyes (Red 40, Yellow 5), nitrates, perchlorate, and many more. Our database is updated weekly with new research.',
  },
  {
    q: 'Is this safe for use during pregnancy?',
    a: 'Absolutely — in fact, we highly recommend starting during pregnancy! Our pre-natal mode tracks foods and supplements that are especially important to avoid during pregnancy, including high-mercury fish, excess vitamin A, and certain herbs. Many expecting moms start with us in their first trimester.',
  },
  {
    q: 'How does the AI analyze products I scan?',
    a: 'When you scan a product, our AI first identifies it via barcode or OCR text recognition. It then matches the ingredient list against our chemical database, cross-referencing each ingredient with known contamination data, FDA reports, and third-party lab studies. It calculates contamination probability and risk levels adjusted for your baby\'s age.',
  },
  {
    q: 'Can I trust the safer alternatives you recommend?',
    a: 'Yes. Alternatives are ranked purely by safety score — not by paid placement. We earn commission on some recommended products through our affiliate program, but safety scores are never influenced by commercial relationships. Disclosure: affiliate relationships are marked in our app.',
  },
  {
    q: 'What if a product is not in your database?',
    a: 'If we can\'t find a product by barcode, our OCR reads the ingredient list directly from the photo. We can analyze any ingredient list. For completely unknown products with no data, we provide a conservative analysis based on ingredient type and flag it as "limited data — proceed with caution."',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, absolutely. Cancel anytime from your account settings with no fees or penalties. If you cancel an annual plan within 30 days, we\'ll refund your full payment. After 30 days, you keep access until the end of your billing period.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Frequently Asked{' '}
            <span className="text-brand-600">Questions</span>
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about FoodFactScanner.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`border-2 rounded-2xl overflow-hidden transition-all duration-200 ${
                open === i ? 'border-brand-200' : 'border-gray-100'
              }`}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`font-semibold pr-4 ${open === i ? 'text-brand-700' : 'text-gray-800'}`}>
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    open === i ? 'rotate-180 text-brand-600' : 'text-gray-400'
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 bg-brand-50/30">
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-500 mb-4">Still have questions?</p>
          <a
            href="mailto:hello@foodfactscanner.com"
            className="inline-flex items-center gap-2 btn-secondary"
          >
            Contact Our Support Team
          </a>
        </div>
      </div>
    </section>
  )
}
