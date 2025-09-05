/**
 * Stripe Service - Payment processing and subscription management
 * Handles subscription tiers, payment processing, and billing
 */

class StripeService {
  constructor() {
    this.publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    this.stripe = null
    this.initialized = false
    
    // Subscription tier configurations
    this.subscriptionTiers = {
      free: {
        name: 'Free',
        price: 0,
        priceId: null,
        features: [
          'Basic liquidity data',
          'Limited API calls',
          'Community support'
        ],
        limits: {
          apiCalls: 100,
          alerts: 3,
          pairs: 5
        }
      },
      pro: {
        name: 'Pro',
        price: 15,
        priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
        features: [
          'Advanced analytics',
          'AI slippage prediction',
          'Real-time alerts',
          'Priority support',
          'API access'
        ],
        limits: {
          apiCalls: 10000,
          alerts: 50,
          pairs: 100
        }
      },
      institutional: {
        name: 'Institutional',
        price: 'Custom',
        priceId: import.meta.env.VITE_STRIPE_INSTITUTIONAL_PRICE_ID,
        features: [
          'Unlimited API access',
          'Custom integrations',
          'Dedicated support',
          'White-label options',
          'Advanced reporting'
        ],
        limits: {
          apiCalls: -1, // Unlimited
          alerts: -1,
          pairs: -1
        }
      }
    }
  }

  /**
   * Initialize Stripe
   */
  async init() {
    if (!this.initialized && this.publishableKey) {
      try {
        // Dynamically import Stripe to avoid SSR issues
        const { loadStripe } = await import('@stripe/stripe-js')
        this.stripe = await loadStripe(this.publishableKey)
        this.initialized = true
      } catch (error) {
        console.error('Failed to initialize Stripe:', error)
      }
    }
    return this.stripe
  }

  /**
   * Get Stripe instance
   */
  async getStripe() {
    if (!this.initialized) {
      await this.init()
    }
    return this.stripe
  }

  /**
   * Get subscription tiers
   */
  getSubscriptionTiers() {
    return this.subscriptionTiers
  }

  /**
   * Get specific tier information
   */
  getTier(tierName) {
    return this.subscriptionTiers[tierName] || this.subscriptionTiers.free
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(tierName, userId, successUrl, cancelUrl) {
    try {
      const tier = this.getTier(tierName)
      
      if (!tier.priceId) {
        throw new Error('Invalid subscription tier')
      }

      // This would typically be handled by your backend
      // For demo purposes, we'll simulate the API call
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: tier.priceId,
          userId,
          successUrl,
          cancelUrl,
          mode: 'subscription'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()
      return session
    } catch (error) {
      console.error('Create checkout session failed:', error)
      throw error
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId) {
    try {
      const stripe = await this.getStripe()
      if (!stripe) {
        throw new Error('Stripe not initialized')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Redirect to checkout failed:', error)
      throw error
    }
  }

  /**
   * Create subscription checkout flow
   */
  async subscribeToTier(tierName, userId) {
    try {
      const tier = this.getTier(tierName)
      
      if (tierName === 'free') {
        // Free tier doesn't require payment
        return {
          success: true,
          tier: tierName,
          message: 'Successfully subscribed to free tier'
        }
      }

      if (tierName === 'institutional') {
        // Institutional tier requires custom pricing
        return {
          success: false,
          tier: tierName,
          message: 'Please contact sales for institutional pricing',
          contactSales: true
        }
      }

      // Create checkout session for Pro tier
      const successUrl = `${window.location.origin}/subscription/success?tier=${tierName}`
      const cancelUrl = `${window.location.origin}/subscription/cancel`
      
      const session = await this.createCheckoutSession(
        tierName,
        userId,
        successUrl,
        cancelUrl
      )

      // Redirect to Stripe Checkout
      await this.redirectToCheckout(session.id)
      
      return {
        success: true,
        tier: tierName,
        sessionId: session.id
      }
    } catch (error) {
      console.error('Subscribe to tier failed:', error)
      return {
        success: false,
        tier: tierName,
        error: error.message
      }
    }
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(customerId, returnUrl) {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: returnUrl || window.location.origin
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const session = await response.json()
      return session
    } catch (error) {
      console.error('Create portal session failed:', error)
      throw error
    }
  }

  /**
   * Redirect to customer portal
   */
  async redirectToPortal(customerId) {
    try {
      const session = await this.createPortalSession(customerId)
      window.location.href = session.url
    } catch (error) {
      console.error('Redirect to portal failed:', error)
      throw error
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(customerId) {
    try {
      const response = await fetch(`/api/subscription-status/${customerId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      const status = await response.json()
      return status
    } catch (error) {
      console.error('Get subscription status failed:', error)
      return {
        tier: 'free',
        status: 'inactive',
        error: error.message
      }
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Cancel subscription failed:', error)
      throw error
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Update subscription failed:', error)
      throw error
    }
  }

  /**
   * Validate user access based on subscription tier
   */
  validateAccess(userTier, requiredTier) {
    const tierHierarchy = ['free', 'pro', 'institutional']
    const userTierIndex = tierHierarchy.indexOf(userTier)
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier)
    
    return userTierIndex >= requiredTierIndex
  }

  /**
   * Check if user has reached usage limits
   */
  checkUsageLimits(userTier, usage) {
    const tier = this.getTier(userTier)
    const limits = tier.limits
    
    const violations = []
    
    if (limits.apiCalls !== -1 && usage.apiCalls >= limits.apiCalls) {
      violations.push('API call limit reached')
    }
    
    if (limits.alerts !== -1 && usage.alerts >= limits.alerts) {
      violations.push('Alert limit reached')
    }
    
    if (limits.pairs !== -1 && usage.pairs >= limits.pairs) {
      violations.push('Trading pair limit reached')
    }
    
    return {
      hasViolations: violations.length > 0,
      violations,
      limits,
      usage
    }
  }

  /**
   * Get usage percentage for a specific limit
   */
  getUsagePercentage(userTier, limitType, currentUsage) {
    const tier = this.getTier(userTier)
    const limit = tier.limits[limitType]
    
    if (limit === -1) {
      return 0 // Unlimited
    }
    
    return Math.min((currentUsage / limit) * 100, 100)
  }

  /**
   * Format price for display
   */
  formatPrice(price) {
    if (price === 0) return 'Free'
    if (typeof price === 'string') return price
    return `$${price}/month`
  }

  /**
   * Get tier color for UI
   */
  getTierColor(tierName) {
    const colors = {
      free: 'text-gray-500',
      pro: 'text-primary',
      institutional: 'text-accent'
    }
    return colors[tierName] || colors.free
  }

  /**
   * Get tier badge for UI
   */
  getTierBadge(tierName) {
    const badges = {
      free: { text: 'FREE', class: 'bg-gray-100 text-gray-800' },
      pro: { text: 'PRO', class: 'bg-primary text-white' },
      institutional: { text: 'ENTERPRISE', class: 'bg-accent text-white' }
    }
    return badges[tierName] || badges.free
  }
}

export default new StripeService()
