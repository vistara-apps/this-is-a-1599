/**
 * Supabase Service - Backend database and authentication
 * Handles user management, data storage, and real-time subscriptions
 */

import { createClient } from '@supabase/supabase-js'

class SupabaseService {
  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    this.client = null
    this.initialized = false
  }

  /**
   * Initialize Supabase client
   */
  init() {
    if (!this.initialized) {
      this.client = createClient(this.supabaseUrl, this.supabaseKey)
      this.initialized = true
    }
    return this.client
  }

  /**
   * Get Supabase client instance
   */
  getClient() {
    if (!this.initialized) {
      this.init()
    }
    return this.client
  }

  // ==================== Authentication ====================

  /**
   * Sign up new user
   */
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await this.getClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            subscription_tier: 'free',
            ...userData
          }
        }
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          subscription_tier: 'free',
          ...userData
        })
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    }
  }

  /**
   * Sign in user
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.getClient().auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      const { error } = await this.getClient().auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await this.getClient().auth.getUser()
      return user
    } catch (error) {
      console.error('Get current user failed:', error)
      return null
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      const { error } = await this.getClient().auth.resetPasswordForEmail(email)
      if (error) throw error
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  }

  // ==================== User Management ====================

  /**
   * Create user profile
   */
  async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await this.getClient()
        .from('users')
        .insert([{
          id: userId,
          created_at: new Date().toISOString(),
          ...profileData
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Create user profile failed:', error)
      throw error
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.getClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get user profile failed:', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await this.getClient()
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Update user profile failed:', error)
      throw error
    }
  }

  // ==================== Trading Pairs ====================

  /**
   * Get all trading pairs
   */
  async getTradingPairs() {
    try {
      const { data, error } = await this.getClient()
        .from('trading_pairs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get trading pairs failed:', error)
      throw error
    }
  }

  /**
   * Create trading pair
   */
  async createTradingPair(pairData) {
    try {
      const { data, error } = await this.getClient()
        .from('trading_pairs')
        .insert([{
          ...pairData,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Create trading pair failed:', error)
      throw error
    }
  }

  // ==================== Liquidity Data ====================

  /**
   * Store liquidity data
   */
  async storeLiquidityData(liquidityData) {
    try {
      const { data, error } = await this.getClient()
        .from('liquidity_data')
        .insert([{
          ...liquidityData,
          timestamp: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Store liquidity data failed:', error)
      throw error
    }
  }

  /**
   * Get liquidity data for a pair
   */
  async getLiquidityData(pairId, limit = 100) {
    try {
      const { data, error } = await this.getClient()
        .from('liquidity_data')
        .select('*')
        .eq('pair_id', pairId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get liquidity data failed:', error)
      throw error
    }
  }

  // ==================== Slippage Predictions ====================

  /**
   * Store slippage prediction
   */
  async storeSlippagePrediction(predictionData) {
    try {
      const { data, error } = await this.getClient()
        .from('slippage_predictions')
        .insert([{
          ...predictionData,
          timestamp: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Store slippage prediction failed:', error)
      throw error
    }
  }

  /**
   * Get slippage predictions
   */
  async getSlippagePredictions(pairId, limit = 50) {
    try {
      const { data, error } = await this.getClient()
        .from('slippage_predictions')
        .select('*')
        .eq('pair_id', pairId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get slippage predictions failed:', error)
      throw error
    }
  }

  // ==================== Alerts ====================

  /**
   * Create alert
   */
  async createAlert(userId, alertData) {
    try {
      const { data, error } = await this.getClient()
        .from('alerts')
        .insert([{
          user_id: userId,
          ...alertData,
          timestamp: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Create alert failed:', error)
      throw error
    }
  }

  /**
   * Get user alerts
   */
  async getUserAlerts(userId) {
    try {
      const { data, error } = await this.getClient()
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get user alerts failed:', error)
      throw error
    }
  }

  /**
   * Update alert
   */
  async updateAlert(alertId, updates) {
    try {
      const { data, error } = await this.getClient()
        .from('alerts')
        .update(updates)
        .eq('id', alertId)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Update alert failed:', error)
      throw error
    }
  }

  /**
   * Delete alert
   */
  async deleteAlert(alertId) {
    try {
      const { error } = await this.getClient()
        .from('alerts')
        .delete()
        .eq('id', alertId)

      if (error) throw error
    } catch (error) {
      console.error('Delete alert failed:', error)
      throw error
    }
  }

  // ==================== Real-time Subscriptions ====================

  /**
   * Subscribe to liquidity data changes
   */
  subscribeLiquidityData(pairId, callback) {
    return this.getClient()
      .channel(`liquidity_data_${pairId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'liquidity_data',
        filter: `pair_id=eq.${pairId}`
      }, callback)
      .subscribe()
  }

  /**
   * Subscribe to user alerts
   */
  subscribeUserAlerts(userId, callback) {
    return this.getClient()
      .channel(`user_alerts_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }

  /**
   * Unsubscribe from channel
   */
  unsubscribe(subscription) {
    if (subscription) {
      this.getClient().removeChannel(subscription)
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Execute raw SQL query
   */
  async executeQuery(query, params = []) {
    try {
      const { data, error } = await this.getClient().rpc('execute_sql', {
        query,
        params
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Execute query failed:', error)
      throw error
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const stats = {}
      
      // Get table counts
      const tables = ['users', 'trading_pairs', 'liquidity_data', 'slippage_predictions', 'alerts']
      
      for (const table of tables) {
        const { count, error } = await this.getClient()
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (!error) {
          stats[table] = count
        }
      }
      
      return stats
    } catch (error) {
      console.error('Get database stats failed:', error)
      throw error
    }
  }
}

export default new SupabaseService()
