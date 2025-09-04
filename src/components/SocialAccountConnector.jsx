import React from 'react'
import { useApp } from '../context/AppContext'
import { Instagram, Music, CheckCircle, Plus } from 'lucide-react'

export default function SocialAccountConnector({ platform }) {
  const { state, connectSocialAccount } = useApp()
  
  const isConnected = state.user.connectedSocialAccounts.some(
    account => account.platform === platform
  )

  const getIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />
      case 'tiktok':
        return <Music className="w-5 h-5" />
      default:
        return <Plus className="w-5 h-5" />
    }
  }

  const getPlatformName = () => {
    switch (platform) {
      case 'instagram':
        return 'Instagram'
      case 'tiktok':
        return 'TikTok'
      default:
        return platform
    }
  }

  const getButtonColor = () => {
    if (isConnected) return 'bg-green-100 text-green-800 border-green-200'
    
    switch (platform) {
      case 'instagram':
        return 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200'
      case 'tiktok':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
    }
  }

  const handleConnect = () => {
    if (!isConnected) {
      // Mock connection - in real app would use OAuth
      connectSocialAccount(platform, {
        accountId: `${platform}_user_123`,
        username: `@demo${platform}user`,
        connectedAt: new Date().toISOString()
      })
    }
  }

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
      isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isConnected ? 'bg-green-100 text-green-600' : getButtonColor()
        }`}>
          {getIcon()}
        </div>
        <div>
          <div className="font-medium text-text-primary">{getPlatformName()}</div>
          <div className="text-sm text-text-secondary">
            {isConnected ? (
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Connected</span>
              </span>
            ) : (
              'Not connected'
            )}
          </div>
        </div>
      </div>

      {!isConnected && (
        <button
          onClick={handleConnect}
          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${getButtonColor()}`}
        >
          Connect
        </button>
      )}
    </div>
  )
}