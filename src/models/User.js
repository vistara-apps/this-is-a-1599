/**
 * User Model - Represents user accounts and subscription information
 */

export class User {
  constructor(data = {}) {
    this.id = data.id || null
    this.email = data.email || ''
    this.subscriptionTier = data.subscription_tier || 'free'
    this.stripeCustomerId = data.stripe_customer_id || null
    this.stripeSubscriptionId = data.stripe_subscription_id || null
    this.subscriptionStatus = data.subscription_status || 'active'
    this.usageApiCalls = data.usage_api_calls || 0
    this.usageAlerts = data.usage_alerts || 0
    this.usagePairs = data.usage_pairs || 0
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date()
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : new Date()
  }

  /**
   * Convert to database format
   */
  toDatabase() {
    return {
      id: this.id,
      email: this.email,
      subscription_tier: this.subscriptionTier,
      stripe_customer_id: this.stripeCustomerId,
      stripe_subscription_id: this.stripeSubscriptionId,
      subscription_status: this.subscriptionStatus,
      usage_api_calls: this.usageApiCalls,
      usage_alerts: this.usageAlerts,
      usage_pairs: this.usagePairs,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    }
  }

  /**
   * Create from database row
   */
  static fromDatabase(row) {
    return new User(row)
  }

  /**
   * Validate user data
   */
  validate() {
    const errors = []

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required')
    }

    if (!['free', 'pro', 'institutional'].includes(this.subscriptionTier)) {
      errors.push('Invalid subscription tier')
    }

    if (!['active', 'inactive', 'cancelled', 'past_due'].includes(this.subscriptionStatus)) {
      errors.push('Invalid subscription status')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Check if user has access to a feature
   */
  hasAccess(feature) {
    const tierFeatures = {
      free: ['basic_liquidity', 'limited_api'],
      pro: ['basic_liquidity', 'limited_api', 'ai_prediction', 'real_time_alerts', 'advanced_analytics'],
      institutional: ['basic_liquidity', 'limited_api', 'ai_prediction', 'real_time_alerts', 'advanced_analytics', 'unlimited_api', 'custom_integrations']
    }

    return tierFeatures[this.subscriptionTier]?.includes(feature) || false
  }

  /**
   * Get usage limits based on subscription tier
   */
  getUsageLimits() {
    const limits = {
      free: {
        apiCalls: 100,
        alerts: 3,
        pairs: 5
      },
      pro: {
        apiCalls: 10000,
        alerts: 50,
        pairs: 100
      },
      institutional: {
        apiCalls: -1, // Unlimited
        alerts: -1,
        pairs: -1
      }
    }

    return limits[this.subscriptionTier] || limits.free
  }

  /**
   * Check if user has reached usage limits
   */
  hasReachedLimit(limitType) {
    const limits = this.getUsageLimits()
    const currentUsage = {
      apiCalls: this.usageApiCalls,
      alerts: this.usageAlerts,
      pairs: this.usagePairs
    }

    const limit = limits[limitType]
    if (limit === -1) return false // Unlimited

    return currentUsage[limitType] >= limit
  }

  /**
   * Get usage percentage for a limit type
   */
  getUsagePercentage(limitType) {
    const limits = this.getUsageLimits()
    const currentUsage = {
      apiCalls: this.usageApiCalls,
      alerts: this.usageAlerts,
      pairs: this.usagePairs
    }

    const limit = limits[limitType]
    if (limit === -1) return 0 // Unlimited

    return Math.min((currentUsage[limitType] / limit) * 100, 100)
  }

  /**
   * Increment usage counter
   */
  incrementUsage(limitType, amount = 1) {
    switch (limitType) {
      case 'apiCalls':
        this.usageApiCalls += amount
        break
      case 'alerts':
        this.usageAlerts += amount
        break
      case 'pairs':
        this.usagePairs += amount
        break
    }
    this.updatedAt = new Date()
  }

  /**
   * Reset usage counters (typically done monthly)
   */
  resetUsage() {
    this.usageApiCalls = 0
    this.usageAlerts = 0
    this.usagePairs = 0
    this.updatedAt = new Date()
  }

  /**
   * Update subscription information
   */
  updateSubscription(tier, stripeCustomerId = null, stripeSubscriptionId = null, status = 'active') {
    this.subscriptionTier = tier
    this.stripeCustomerId = stripeCustomerId
    this.stripeSubscriptionId = stripeSubscriptionId
    this.subscriptionStatus = status
    this.updatedAt = new Date()
  }

  /**
   * Get display name for subscription tier
   */
  getSubscriptionTierDisplay() {
    const displayNames = {
      free: 'Free',
      pro: 'Pro',
      institutional: 'Institutional'
    }
    return displayNames[this.subscriptionTier] || 'Unknown'
  }

  /**
   * Check if subscription is active
   */
  isSubscriptionActive() {
    return this.subscriptionStatus === 'active'
  }

  /**
   * Get user summary for display
   */
  getSummary() {
    return {
      id: this.id,
      email: this.email,
      tier: this.getSubscriptionTierDisplay(),
      status: this.subscriptionStatus,
      usage: {
        apiCalls: this.usageApiCalls,
        alerts: this.usageAlerts,
        pairs: this.usagePairs
      },
      limits: this.getUsageLimits(),
      memberSince: this.createdAt.toLocaleDateString()
    }
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      subscriptionTier: this.subscriptionTier,
      subscriptionStatus: this.subscriptionStatus,
      usage: {
        apiCalls: this.usageApiCalls,
        alerts: this.usageAlerts,
        pairs: this.usagePairs
      },
      limits: this.getUsageLimits(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }
}
