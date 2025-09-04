import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const AppContext = createContext()

const initialState = {
  user: {
    userId: 'user-1',
    email: 'demo@example.com',
    subscriptionTier: 'Basic',
    connectedSocialAccounts: []
  },
  adGenerations: [],
  currentGeneration: null,
  loading: false,
  error: null
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'ADD_AD_GENERATION':
      return {
        ...state,
        adGenerations: [...state.adGenerations, action.payload],
        currentGeneration: action.payload,
        loading: false
      }
    case 'UPDATE_VARIATION_METRICS':
      return {
        ...state,
        adGenerations: state.adGenerations.map(gen =>
          gen.generationId === action.payload.generationId
            ? {
                ...gen,
                generatedVariations: gen.generatedVariations.map(variation =>
                  variation.variationId === action.payload.variationId
                    ? { ...variation, metrics: action.payload.metrics }
                    : variation
                )
              }
            : gen
        )
      }
    case 'CONNECT_SOCIAL_ACCOUNT':
      return {
        ...state,
        user: {
          ...state.user,
          connectedSocialAccounts: [...state.user.connectedSocialAccounts, action.payload]
        }
      }
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        user: { ...state.user, subscriptionTier: action.payload }
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Mock data initialization
  useEffect(() => {
    const mockGenerations = [
      {
        generationId: 'gen-1',
        userId: 'user-1',
        inputImageURL: '/api/placeholder/400/400',
        generatedVariations: [
          {
            variationId: 'var-1',
            generationId: 'gen-1',
            platform: 'Instagram',
            adContent: {
              headline: 'Transform Your Skincare Routine',
              description: 'Discover the secret to radiant skin with our revolutionary formula',
              callToAction: 'Shop Now',
              imageURL: '/api/placeholder/400/400'
            },
            status: 'posted',
            postedAt: new Date().toISOString(),
            metrics: { views: 1245, clicks: 89, engagement: 7.2 }
          },
          {
            variationId: 'var-2',
            generationId: 'gen-1',
            platform: 'TikTok',
            adContent: {
              headline: 'Glow Up Challenge',
              description: 'Join thousands achieving their best skin yet',
              callToAction: 'Try It Free',
              imageURL: '/api/placeholder/400/400'
            },
            status: 'posted',
            postedAt: new Date().toISOString(),
            metrics: { views: 2156, clicks: 156, engagement: 7.8 }
          }
        ],
        createdAt: new Date().toISOString()
      }
    ]
    
    mockGenerations.forEach(gen => {
      dispatch({ type: 'ADD_AD_GENERATION', payload: gen })
    })
  }, [])

  const generateAdVariations = async (imageFile, config) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Mock AI generation - in real app would call OpenAI API
      const generation = {
        generationId: uuidv4(),
        userId: state.user.userId,
        inputImageURL: URL.createObjectURL(imageFile),
        generatedVariations: [
          {
            variationId: uuidv4(),
            generationId: null,
            platform: 'Instagram',
            adContent: {
              headline: 'Revolutionary Product Launch',
              description: 'Experience the future of innovation with our latest breakthrough',
              callToAction: 'Learn More',
              imageURL: URL.createObjectURL(imageFile)
            },
            status: 'draft',
            postedAt: null,
            metrics: null
          },
          {
            variationId: uuidv4(),
            generationId: null,
            platform: 'TikTok',
            adContent: {
              headline: 'Viral Trend Alert',
              description: 'Everyone is talking about this game-changing product',
              callToAction: 'Get Yours',
              imageURL: URL.createObjectURL(imageFile)
            },
            status: 'draft',
            postedAt: null,
            metrics: null
          },
          {
            variationId: uuidv4(),
            generationId: null,
            platform: 'Instagram',
            adContent: {
              headline: 'Limited Time Offer',
              description: 'Exclusive deal for early adopters - don\'t miss out',
              callToAction: 'Shop Now',
              imageURL: URL.createObjectURL(imageFile)
            },
            status: 'draft',
            postedAt: null,
            metrics: null
          }
        ],
        createdAt: new Date().toISOString()
      }

      // Update variation IDs with generation ID
      generation.generatedVariations = generation.generatedVariations.map(v => ({
        ...v,
        generationId: generation.generationId
      }))

      setTimeout(() => {
        dispatch({ type: 'ADD_AD_GENERATION', payload: generation })
      }, 2000)
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const postToSocial = async (variationId, platform) => {
    // Mock posting to social media
    console.log(`Posting variation ${variationId} to ${platform}`)
    
    // Simulate metrics after posting
    setTimeout(() => {
      const mockMetrics = {
        views: Math.floor(Math.random() * 5000) + 500,
        clicks: Math.floor(Math.random() * 200) + 20,
        engagement: (Math.random() * 10 + 2).toFixed(1)
      }
      
      dispatch({
        type: 'UPDATE_VARIATION_METRICS',
        payload: {
          generationId: state.currentGeneration?.generationId,
          variationId,
          metrics: mockMetrics
        }
      })
    }, 1000)
  }

  const connectSocialAccount = (platform, accountData) => {
    dispatch({
      type: 'CONNECT_SOCIAL_ACCOUNT',
      payload: { platform, ...accountData }
    })
  }

  const value = {
    state,
    generateAdVariations,
    postToSocial,
    connectSocialAccount,
    dispatch
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}