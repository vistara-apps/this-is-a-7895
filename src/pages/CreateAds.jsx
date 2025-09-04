import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import ImageUploader from '../components/ImageUploader'
import AIGeneratorConfig from '../components/AIGeneratorConfig'
import AdVariationCard from '../components/AdVariationCard'
import { Loader2 } from 'lucide-react'

export default function CreateAds() {
  const { state, generateAdVariations } = useApp()
  const [uploadedImage, setUploadedImage] = useState(null)
  const [generatorConfig, setGeneratorConfig] = useState({
    style: 'balanced',
    platforms: ['Instagram', 'TikTok'],
    angles: ['performance', 'emotional', 'urgency']
  })

  const handleImageUpload = (file) => {
    setUploadedImage(file)
  }

  const handleGenerate = async () => {
    if (!uploadedImage) return
    await generateAdVariations(uploadedImage, generatorConfig)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-text-primary mb-2">
          Create Ad Variations
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Upload your product image and let AI generate multiple engaging ad variations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Upload Section */}
        <div className="bg-surface rounded-lg shadow-card p-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Upload Product Image
          </h2>
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>

        {/* Configuration Section */}
        <div className="bg-surface rounded-lg shadow-card p-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Generation Settings
          </h2>
          <AIGeneratorConfig
            config={generatorConfig}
            onChange={setGeneratorConfig}
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center mb-8">
        <button
          onClick={handleGenerate}
          disabled={!uploadedImage || state.loading}
          className="bg-primary text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          {state.loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Variations...</span>
            </>
          ) : (
            <span>Generate Ad Variations</span>
          )}
        </button>
      </div>

      {/* Generated Variations */}
      {state.currentGeneration && (
        <div className="bg-surface rounded-lg shadow-card p-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Generated Variations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.currentGeneration.generatedVariations.map((variation) => (
              <AdVariationCard
                key={variation.variationId}
                variation={variation}
                variant="editable"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800">{state.error}</p>
        </div>
      )}
    </div>
  )
}