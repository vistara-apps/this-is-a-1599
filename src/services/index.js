/**
 * Services Index - Central export for all API services
 * Provides a unified interface for accessing all external services
 */

import AlchemyService from './AlchemyService.js'
import AirstackService from './AirstackService.js'
import OpenAIService from './OpenAIService.js'
import SupabaseService from './SupabaseService.js'
import StripeService from './StripeService.js'

// Export individual services
export {
  AlchemyService,
  AirstackService,
  OpenAIService,
  SupabaseService,
  StripeService
}

// Export default services object for convenience
export default {
  alchemy: AlchemyService,
  airstack: AirstackService,
  openai: OpenAIService,
  supabase: SupabaseService,
  stripe: StripeService
}

/**
 * Service health check utility
 */
export const checkServiceHealth = async () => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    services: {}
  }

  // Check Supabase connection
  try {
    await SupabaseService.getClient().from('users').select('count', { count: 'exact', head: true })
    healthStatus.services.supabase = { status: 'healthy', message: 'Connected' }
  } catch (error) {
    healthStatus.services.supabase = { status: 'error', message: error.message }
  }

  // Check Stripe initialization
  try {
    await StripeService.init()
    healthStatus.services.stripe = { status: 'healthy', message: 'Initialized' }
  } catch (error) {
    healthStatus.services.stripe = { status: 'error', message: error.message }
  }

  // Check OpenAI cache stats
  try {
    const cacheStats = OpenAIService.getCacheStats()
    healthStatus.services.openai = { 
      status: 'healthy', 
      message: `Cache size: ${cacheStats.size}`,
      cacheStats 
    }
  } catch (error) {
    healthStatus.services.openai = { status: 'error', message: error.message }
  }

  // Alchemy and Airstack are checked on first API call
  healthStatus.services.alchemy = { status: 'ready', message: 'Ready for API calls' }
  healthStatus.services.airstack = { status: 'ready', message: 'Ready for API calls' }

  return healthStatus
}

/**
 * Initialize all services
 */
export const initializeServices = async () => {
  console.log('🚀 Initializing LiquidityPulse services...')
  
  try {
    // Initialize Supabase
    SupabaseService.init()
    console.log('✅ Supabase initialized')

    // Initialize Stripe
    await StripeService.init()
    console.log('✅ Stripe initialized')

    // Other services initialize on first use
    console.log('✅ All services ready')
    
    return true
  } catch (error) {
    console.error('❌ Service initialization failed:', error)
    return false
  }
}

/**
 * Service configuration validator
 */
export const validateServiceConfig = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_ALCHEMY_API_KEY',
    'VITE_AIRSTACK_API_KEY'
  ]

  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar])
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing)
    return {
      valid: false,
      missing,
      message: `Missing required environment variables: ${missing.join(', ')}`
    }
  }

  return {
    valid: true,
    message: 'All required environment variables are configured'
  }
}
