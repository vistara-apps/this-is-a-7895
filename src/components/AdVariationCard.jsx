import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Share2, Edit, Eye, MousePointer, TrendingUp } from 'lucide-react'

export default function AdVariationCard({ variation, variant = 'viewOnly' }) {
  const { postToSocial } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(variation.adContent)

  const handlePost = async () => {
    await postToSocial(variation.variationId, variation.platform)
  }

  const handleSave = () => {
    // In a real app, this would update the variation in the backend
    setIsEditing(false)
  }

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Instagram':
        return 'bg-pink-100 text-pink-800'
      case 'TikTok':
        return 'bg-black text-white'
      case 'Facebook':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-surface border border-gray-200 rounded-lg shadow-card overflow-hidden">
      {/* Image */}
      <div className="aspect-square">
        <img
          src={variation.adContent.imageURL}
          alt={variation.adContent.headline}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header with platform and status */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(variation.platform)}`}>
            {variation.platform}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(variation.status)}`}>
            {variation.status}
          </span>
        </div>

        {/* Ad Content */}
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editedContent.headline}
              onChange={(e) => setEditedContent({ ...editedContent, headline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Headline"
            />
            <textarea
              value={editedContent.description}
              onChange={(e) => setEditedContent({ ...editedContent, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
              placeholder="Description"
            />
            <input
              type="text"
              value={editedContent.callToAction}
              onChange={(e) => setEditedContent({ ...editedContent, callToAction: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Call to Action"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">
              {variation.adContent.headline}
            </h3>
            <p className="text-sm text-text-secondary mb-3 line-clamp-2">
              {variation.adContent.description}
            </p>
            <div className="text-sm font-medium text-primary mb-4">
              {variation.adContent.callToAction}
            </div>

            {/* Metrics */}
            {variation.metrics && (
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-md">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="w-3 h-3 text-gray-500 mr-1" />
                  </div>
                  <div className="text-xs font-medium text-gray-900">
                    {variation.metrics.views.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MousePointer className="w-3 h-3 text-gray-500 mr-1" />
                  </div>
                  <div className="text-xs font-medium text-gray-900">
                    {variation.metrics.clicks.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-3 h-3 text-gray-500 mr-1" />
                  </div>
                  <div className="text-xs font-medium text-gray-900">
                    {variation.metrics.engagement}%
                  </div>
                  <div className="text-xs text-gray-500">Engagement</div>
                </div>
              </div>
            )}

            {/* Actions */}
            {variant === 'editable' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handlePost}
                  disabled={variation.status === 'posted'}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{variation.status === 'posted' ? 'Posted' : 'Post'}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}