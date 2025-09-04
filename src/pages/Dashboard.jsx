import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Plus, TrendingUp, Eye, MousePointer, Zap } from 'lucide-react'
import AdVariationCard from '../components/AdVariationCard'

export default function Dashboard() {
  const { state } = useApp()

  const totalVariations = state.adGenerations.reduce(
    (acc, gen) => acc + gen.generatedVariations.length,
    0
  )

  const totalViews = state.adGenerations.reduce(
    (acc, gen) => acc + gen.generatedVariations.reduce(
      (varAcc, variation) => varAcc + (variation.metrics?.views || 0),
      0
    ),
    0
  )

  const totalClicks = state.adGenerations.reduce(
    (acc, gen) => acc + gen.generatedVariations.reduce(
      (varAcc, variation) => varAcc + (variation.metrics?.clicks || 0),
      0
    ),
    0
  )

  const avgEngagement = state.adGenerations.length > 0
    ? (state.adGenerations.reduce(
        (acc, gen) => acc + gen.generatedVariations.reduce(
          (varAcc, variation) => varAcc + (parseFloat(variation.metrics?.engagement) || 0),
          0
        ),
        0
      ) / totalVariations).toFixed(1)
    : 0

  const recentVariations = state.adGenerations
    .flatMap(gen => gen.generatedVariations)
    .sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0))
    .slice(0, 6)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-text-primary mb-2">
            Welcome to AdRemix
          </h1>
          <p className="text-base leading-7 text-text-secondary">
            Spin unique engaging ad creatives in seconds, and deploy them automatically.
          </p>
        </div>
        <Link
          to="/create"
          className="mt-4 sm:mt-0 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Ads</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Variations</p>
              <p className="text-2xl font-semibold text-text-primary">{totalVariations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Views</p>
              <p className="text-2xl font-semibold text-text-primary">{totalViews.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Clicks</p>
              <p className="text-2xl font-semibold text-text-primary">{totalClicks.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Avg Engagement</p>
              <p className="text-2xl font-semibold text-text-primary">{avgEngagement}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Variations */}
      <div className="bg-surface rounded-lg shadow-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-text-primary">Recent Ad Variations</h2>
          <Link
            to="/analytics"
            className="text-primary hover:text-blue-600 font-medium"
          >
            View All
          </Link>
        </div>

        {recentVariations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVariations.map((variation) => (
              <AdVariationCard
                key={variation.variationId}
                variation={variation}
                variant="viewOnly"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No ad variations yet
            </h3>
            <p className="text-text-secondary mb-6">
              Create your first ad variations to see them here
            </p>
            <Link
              to="/create"
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Ad</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}