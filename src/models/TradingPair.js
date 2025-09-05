/**
 * TradingPair Model - Represents trading pairs across exchanges
 */

export class TradingPair {
  constructor(data = {}) {
    this.id = data.id || null
    this.pairId = data.pair_id || ''
    this.baseToken = data.base_token || ''
    this.quoteToken = data.quote_token || ''
    this.baseTokenAddress = data.base_token_address || null
    this.quoteTokenAddress = data.quote_token_address || null
    this.sourceExchanges = data.source_exchanges || []
    this.isActive = data.is_active !== undefined ? data.is_active : true
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date()
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : new Date()
  }

  /**
   * Convert to database format
   */
  toDatabase() {
    return {
      id: this.id,
      pair_id: this.pairId,
      base_token: this.baseToken,
      quote_token: this.quoteToken,
      base_token_address: this.baseTokenAddress,
      quote_token_address: this.quoteTokenAddress,
      source_exchanges: this.sourceExchanges,
      is_active: this.isActive,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    }
  }

  /**
   * Create from database row
   */
  static fromDatabase(row) {
    return new TradingPair(row)
  }

  /**
   * Validate trading pair data
   */
  validate() {
    const errors = []

    if (!this.baseToken || this.baseToken.trim() === '') {
      errors.push('Base token is required')
    }

    if (!this.quoteToken || this.quoteToken.trim() === '') {
      errors.push('Quote token is required')
    }

    if (!this.pairId || this.pairId.trim() === '') {
      errors.push('Pair ID is required')
    }

    if (this.sourceExchanges.length === 0) {
      errors.push('At least one source exchange is required')
    }

    if (this.baseTokenAddress && !this.isValidAddress(this.baseTokenAddress)) {
      errors.push('Invalid base token address')
    }

    if (this.quoteTokenAddress && !this.isValidAddress(this.quoteTokenAddress)) {
      errors.push('Invalid quote token address')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if address is valid Ethereum address
   */
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  /**
   * Get display name for the pair
   */
  getDisplayName() {
    return `${this.baseToken}/${this.quoteToken}`
  }

  /**
   * Get pair symbol for URLs and IDs
   */
  getPairSymbol() {
    return this.pairId || `${this.baseToken}-${this.quoteToken}`
  }

  /**
   * Check if pair is available on specific exchange
   */
  isAvailableOnExchange(exchange) {
    return this.sourceExchanges.includes(exchange.toLowerCase())
  }

  /**
   * Add exchange to source exchanges
   */
  addExchange(exchange) {
    const exchangeLower = exchange.toLowerCase()
    if (!this.sourceExchanges.includes(exchangeLower)) {
      this.sourceExchanges.push(exchangeLower)
      this.updatedAt = new Date()
    }
  }

  /**
   * Remove exchange from source exchanges
   */
  removeExchange(exchange) {
    const exchangeLower = exchange.toLowerCase()
    const index = this.sourceExchanges.indexOf(exchangeLower)
    if (index > -1) {
      this.sourceExchanges.splice(index, 1)
      this.updatedAt = new Date()
    }
  }

  /**
   * Get formatted exchange list
   */
  getFormattedExchanges() {
    return this.sourceExchanges.map(exchange => 
      exchange.charAt(0).toUpperCase() + exchange.slice(1)
    ).join(', ')
  }

  /**
   * Activate/deactivate pair
   */
  setActive(active) {
    this.isActive = active
    this.updatedAt = new Date()
  }

  /**
   * Get pair summary for display
   */
  getSummary() {
    return {
      id: this.id,
      pairId: this.pairId,
      displayName: this.getDisplayName(),
      baseToken: this.baseToken,
      quoteToken: this.quoteToken,
      exchanges: this.getFormattedExchanges(),
      exchangeCount: this.sourceExchanges.length,
      isActive: this.isActive,
      createdAt: this.createdAt.toLocaleDateString()
    }
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      id: this.id,
      pairId: this.pairId,
      baseToken: this.baseToken,
      quoteToken: this.quoteToken,
      baseTokenAddress: this.baseTokenAddress,
      quoteTokenAddress: this.quoteTokenAddress,
      sourceExchanges: this.sourceExchanges,
      isActive: this.isActive,
      displayName: this.getDisplayName(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }
}
