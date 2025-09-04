import React from 'react'

export default function AIGeneratorConfig({ config, onChange, variant = 'basic' }) {
  const styles = [
    { value: 'balanced', label: 'Balanced', description: 'Mix of creative and performance-focused' },
    { value: 'creative', label: 'Creative', description: 'Emphasize unique and artistic approaches' },
    { value: 'performance', label: 'Performance', description: 'Focus on conversion-driven copy' }
  ]

  const platforms = [
    { value: 'Instagram', label: 'Instagram', icon: '📸' },
    { value: 'TikTok', label: 'TikTok', icon: '🎵' },
    { value: 'Facebook', label: 'Facebook', icon: '👥' }
  ]

  const angles = [
    { value: 'performance', label: 'Performance', description: 'Results and benefits focused' },
    { value: 'emotional', label: 'Emotional', description: 'Feelings and aspirations' },
    { value: 'urgency', label: 'Urgency', description: 'Time-sensitive offers' },
    { value: 'social_proof', label: 'Social Proof', description: 'Testimonials and reviews' },
    { value: 'curiosity', label: 'Curiosity', description: 'Mystery and intrigue' }
  ]

  const updateConfig = (key, value) => {
    onChange({ ...config, [key]: value })
  }

  const togglePlatform = (platform) => {
    const platforms = config.platforms.includes(platform)
      ? config.platforms.filter(p => p !== platform)
      : [...config.platforms, platform]
    updateConfig('platforms', platforms)
  }

  const toggleAngle = (angle) => {
    const angles = config.angles.includes(angle)
      ? config.angles.filter(a => a !== angle)
      : [...config.angles, angle]
    updateConfig('angles', angles)
  }

  return (
    <div className="space-y-6">
      {/* Generation Style */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Generation Style
        </label>
        <div className="space-y-2">
          {styles.map((style) => (
            <label key={style.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="style"
                value={style.value}
                checked={config.style === style.value}
                onChange={(e) => updateConfig('style', e.target.value)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2"
              />
              <div>
                <div className="font-medium text-text-primary">{style.label}</div>
                <div className="text-sm text-text-secondary">{style.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Target Platforms */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Target Platforms
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {platforms.map((platform) => (
            <label
              key={platform.value}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                config.platforms.includes(platform.value)
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={config.platforms.includes(platform.value)}
                onChange={() => togglePlatform(platform.value)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-lg">{platform.icon}</span>
              <span className="font-medium text-text-primary">{platform.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Marketing Angles */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Marketing Angles
        </label>
        <div className="space-y-2">
          {angles.map((angle) => (
            <label
              key={angle.value}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                config.angles.includes(angle.value)
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={config.angles.includes(angle.value)}
                onChange={() => toggleAngle(angle.value)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <div>
                <div className="font-medium text-text-primary">{angle.label}</div>
                <div className="text-sm text-text-secondary">{angle.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {variant === 'advanced' && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Number of Variations
          </label>
          <select
            value={config.variationCount || 3}
            onChange={(e) => updateConfig('variationCount', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value={3}>3 variations</option>
            <option value={5}>5 variations</option>
            <option value={7}>7 variations</option>
          </select>
        </div>
      )}
    </div>
  )
}