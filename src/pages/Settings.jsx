import React from 'react'
import { useApp } from '../context/AppContext'
import SocialAccountConnector from '../components/SocialAccountConnector'
import { CreditCard, User, Bell } from 'lucide-react'

export default function Settings() {
  const { state, dispatch } = useApp()

  const subscriptionPlans = [
    {
      name: 'Free',
      price: '$0',
      features: ['5 ad variations/month', 'Basic templates', 'Email support'],
      current: state.user.subscriptionTier === 'Free'
    },
    {
      name: 'Basic',
      price: '$29',
      features: ['50 ad variations/month', 'Basic analytics', 'Priority support', 'Social posting'],
      current: state.user.subscriptionTier === 'Basic'
    },
    {
      name: 'Pro',
      price: '$79',
      features: ['Unlimited variations', 'Advanced analytics', '24/7 support', 'API access', 'Custom templates'],
      current: state.user.subscriptionTier === 'Pro'
    }
  ]

  const handleUpgrade = (planName) => {
    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: planName })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-text-primary mb-2">
          Settings
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Manage your account, connected platforms, and subscription.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile */}
          <div className="bg-surface rounded-lg shadow-card p-6">
            <h2 className="text-2xl font-semibold text-text-primary mb-4 flex items-center">
              <User className="w-6 h-6 mr-2" />
              Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={state.user.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-text-secondary"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Current Plan
                </label>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {state.user.subscriptionTier}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-surface rounded-lg shadow-card p-6">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Connected Social Accounts
            </h2>
            <div className="space-y-4">
              <SocialAccountConnector platform="instagram" />
              <SocialAccountConnector platform="tiktok" />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-surface rounded-lg shadow-card p-6">
            <h2 className="text-2xl font-semibold text-text-primary mb-4 flex items-center">
              <Bell className="w-6 h-6 mr-2" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Email notifications</div>
                  <div className="text-sm text-text-secondary">Get notified about ad performance</div>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  defaultChecked
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Weekly reports</div>
                  <div className="text-sm text-text-secondary">Receive weekly performance summaries</div>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  defaultChecked
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-lg shadow-card p-6">
            <h2 className="text-2xl font-semibold text-text-primary mb-4 flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Subscription
            </h2>
            <div className="space-y-4">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`border rounded-lg p-4 ${
                    plan.current ? 'border-primary bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-text-primary">{plan.name}</h3>
                    <span className="text-xl font-bold text-text-primary">{plan.price}</span>
                  </div>
                  <ul className="text-sm text-text-secondary mb-3 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                  {plan.current ? (
                    <div className="text-sm font-medium text-primary">Current Plan</div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.name)}
                      className="w-full bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}