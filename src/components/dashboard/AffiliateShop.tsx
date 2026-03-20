'use client'

import { useState } from 'react'
import { Star, ExternalLink, ShoppingCart } from 'lucide-react'
import { AffiliateProduct, UserProfile, ProductCategory } from '@/lib/types'
import { getRecommendedProducts } from '@/lib/affiliate-products'
import { proxyImg } from '@/lib/utils'

interface Props {
  products: AffiliateProduct[]
  profile?: UserProfile
}

const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: 'all', label: 'All Products', emoji: '🛒' },
  { id: 'organic-food', label: 'Organic Baby Food', emoji: '🥣' },
  { id: 'prenatal-vitamins', label: 'Prenatal Vitamins', emoji: '💊' },
  { id: 'postnatal-vitamins', label: 'Postnatal Support', emoji: '🤱' },
  { id: 'food-makers', label: 'Food Makers', emoji: '🫕' },
  { id: 'storage', label: 'Safe Storage', emoji: '🫙' },
  { id: 'feeding-gear', label: 'Feeding Gear', emoji: '🍽️' },
  { id: 'testing-kits', label: 'Testing Kits', emoji: '🔬' },
  { id: 'baby-formula', label: 'Baby Formula', emoji: '🍼' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function AffiliateShop({ products, profile }: Props) {
  const [category, setCategory] = useState('all')

  const recommended = profile
    ? getRecommendedProducts(profile.concerns, profile.momStatus)
    : []

  const filtered = category === 'all'
    ? products
    : products.filter(p => p.category === category)

  const recommendedIds = new Set(recommended.map(p => p.id))

  return (
    <div className="w-full min-w-0">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Safe Baby Shop</h1>
        <p className="text-gray-500 text-sm">
          Expert-curated, safety-scored products. We earn a small commission when you buy — at no extra cost to you.
        </p>
      </div>

      {/* Personalized recommendations */}
      {recommended.length > 0 && (
        <div className="bg-gradient-to-r from-brand-50 to-green-50 border border-brand-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✨</span>
            <h2 className="font-bold text-brand-800">Personalized for You</h2>
            <span className="bg-brand-100 text-brand-600 text-xs font-bold px-2 py-0.5 rounded-full">AI Picks</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recommended.slice(0, 4).map(product => (
              <a
                key={product.id}
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center gap-3 bg-white rounded-xl p-3 hover:shadow-md transition-all group border border-brand-100"
              >
                <img
                  src={proxyImg(product.imageUrl)}
                  alt={product.title}
                  className="w-12 h-12 object-contain rounded-lg bg-gray-50 flex-shrink-0"
                  onError={(e) => { e.currentTarget.src = '' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-brand-700">
                    {product.title.split(' ').slice(0, 4).join(' ')}...
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-gray-500">{product.price}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-brand-500 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border-2 flex-shrink-0 ${
              category === cat.id
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(product => (
          <div
            key={product.id}
            className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-lg transition-all group ${
              recommendedIds.has(product.id) ? 'border-brand-200' : 'border-gray-100'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-36 relative overflow-hidden">
              <img
                src={proxyImg(product.imageUrl)}
                alt={product.title}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fb = e.currentTarget.nextElementSibling as HTMLElement | null
                  if (fb) fb.style.display = 'flex'
                }}
              />
              <span
                style={{ display: 'none' }}
                className="absolute inset-0 items-center justify-center text-5xl"
              >
                {product.category === 'organic-food' ? '🥣' :
                 product.category === 'prenatal-vitamins' ? '💊' :
                 product.category === 'postnatal-vitamins' ? '🤱' :
                 product.category === 'food-makers' ? '🫕' :
                 product.category === 'storage' ? '🫙' :
                 product.category === 'feeding-gear' ? '🍽️' :
                 product.category === 'testing-kits' ? '🔬' :
                 product.category === 'baby-formula' ? '🍼' : '📦'}
              </span>
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <span className="bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    {product.badge}
                  </span>
                </div>
              )}
              {recommendedIds.has(product.id) && (
                <div className="absolute top-3 right-3">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-lg">
                    ✨ For You
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-2.5 sm:p-4">
              <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                {product.title}
              </h3>
              <p className="hidden sm:block text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>

              {/* Tags */}
              <div className="hidden sm:flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-green-50 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                    ✓ {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={product.rating} />
                <span className="text-xs text-gray-400">({product.reviewCount.toLocaleString()})</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-base sm:text-xl font-black text-gray-900">{product.price}</span>
                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs sm:text-sm font-bold w-full py-2 rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Buy on Amazon
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        🛒 As an Amazon Associate, FoodFactScanner earns from qualifying purchases.
        Affiliate commissions fund our safety research — thank you for supporting us!
        Safety scores and recommendations are never influenced by affiliate relationships.
      </p>
    </div>
  )
}
