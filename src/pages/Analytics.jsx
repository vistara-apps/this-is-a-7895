import React from 'react'
import { useApp } from '../context/AppContext'
import { BarChart3, TrendingUp, Eye, MousePointer } from 'lucide-react'

export default function Analytics() {
  const { state } = useApp()

  const allVariations = state.adGenerations.flatMap(gen => gen.generatedVariations)
  const postedVariations = allVariations.filter(v => v.status === 'posted' && v.metrics)

  const platformStats = postedVariations.reduce((acc, variation) => {
    const platform = variation.platform
    if (!acc[platform]) {
      acc[platform] = { views: 0, clicks: 0, count: 0 }
    }
    acc[platform].views += variation.metrics.views
    acc[platform].clicks += variation.metrics.clicks
    acc[platform].count += 1
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-text-primary mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Track performance across all your ad variations and platforms.
        </p>
      </div>

      {/* Platform Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {Object.entries(platformStats).map(([platform, stats]) => (
          <div key={platform} className="bg-surface rounded-lg shadow-card p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              {platform} Performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.views.toLocaleString()}
                </div>
                <div className="text-sm text-text-secondary">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {stats.clicks.toLocaleString()}
                </div>
                <div className="text-sm text-text-secondary">Total Clicks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {((stats.clicks / stats.views) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-text-secondary">CTR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.count}
                </div>
                <div className="text-sm text-text-secondary">Ads Posted</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Variations */}
      <div className="bg-surface rounded-lg shadow-card p-6">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          Top Performing Variations
        </h2>
        
        {postedVariations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Ad</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Platform</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Views</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Clicks</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">CTR</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {postedVariations
                  .sort((a, b) => (b.metrics?.engagement || 0) - (a.metrics?.engagement || 0))
                  .slice(0, 10)
                  .map((variation) => (
                    <tr key={variation.variationId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={variation.adContent.imageURL}
                            alt={variation.adContent.headline}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div>
                            <div className="font-medium text-text-primary">
                              {variation.adContent.headline}
                            </div>
                            <div className="text-sm text-text-secondary truncate max-w-xs">
                              {variation.adContent.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {variation.platform}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {variation.metrics.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {variation.metrics.clicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {((variation.metrics.clicks / variation.metrics.views) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {variation.metrics.engagement}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No analytics data yet
            </h3>
            <p className="text-text-secondary">
              Create and post ad variations to see performance analytics here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}