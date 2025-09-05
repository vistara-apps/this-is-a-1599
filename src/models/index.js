/**
 * Models Index - Central export for all data models
 */

export { User } from './User.js'
export { TradingPair } from './TradingPair.js'

// Additional model classes for other entities
export class LiquidityData {
  constructor(data = {}) {
    this.id = data.id || null
    this.dataId = data.data_id || ''
    this.pairId = data.pair_id || null
    this.exchange = data.exchange || ''
    this.price = parseFloat(data.price) || 0
    this.depth = parseFloat(data.depth) || 0
    this.volume24h = parseFloat(data.volume_24h) || 0
    this.liquidityUsd = parseFloat(data.liquidity_usd) || 0
    this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date()
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date()
  }

  static fromDatabase(row) {
    return new LiquidityData(row)
  }

  toDatabase() {
    return {
      id: this.id,
      data_id: this.dataId,
      pair_id: this.pairId,
      exchange: this.exchange,
      price: this.price,
      depth: this.depth,
      volume_24h: this.volume24h,
      liquidity_usd: this.liquidityUsd,
      timestamp: this.timestamp.toISOString(),
      created_at: this.createdAt.toISOString()
    }
  }

  toJSON() {
    return {
      id: this.id,
      dataId: this.dataId,
      pairId: this.pairId,
      exchange: this.exchange,
      price: this.price,
      depth: this.depth,
      volume24h: this.volume24h,
      liquidityUsd: this.liquidityUsd,
      timestamp: this.timestamp.toISOString()
    }
  }
}

export class SlippagePrediction {
  constructor(data = {}) {
    this.id = data.id || null
    this.predictionId = data.prediction_id || ''
    this.pairId = data.pair_id || null
    this.exchange = data.exchange || ''
    this.tradeSize = parseFloat(data.trade_size) || 0
    this.predictedSlippage = parseFloat(data.predicted_slippage) || 0
    this.confidenceLevel = parseFloat(data.confidence_level) || 0
    this.priceImpact = parseFloat(data.price_impact) || 0
    this.riskLevel = data.risk_level || 'medium'
    this.recommendation = data.recommendation || ''
    this.factors = data.factors || []
    this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date()
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date()
  }

  static fromDatabase(row) {
    return new SlippagePrediction(row)
  }

  toDatabase() {
    return {
      id: this.id,
      prediction_id: this.predictionId,
      pair_id: this.pairId,
      exchange: this.exchange,
      trade_size: this.tradeSize,
      predicted_slippage: this.predictedSlippage,
      confidence_level: this.confidenceLevel,
      price_impact: this.priceImpact,
      risk_level: this.riskLevel,
      recommendation: this.recommendation,
      factors: this.factors,
      timestamp: this.timestamp.toISOString(),
      created_at: this.createdAt.toISOString()
    }
  }

  getRiskColor() {
    const colors = {
      low: 'text-positive',
      medium: 'text-yellow-500',
      high: 'text-negative'
    }
    return colors[this.riskLevel] || colors.medium
  }

  getConfidenceDisplay() {
    return `${Math.round(this.confidenceLevel)}%`
  }

  getSlippageDisplay() {
    return `${this.predictedSlippage.toFixed(2)}%`
  }

  toJSON() {
    return {
      id: this.id,
      predictionId: this.predictionId,
      pairId: this.pairId,
      exchange: this.exchange,
      tradeSize: this.tradeSize,
      predictedSlippage: this.predictedSlippage,
      confidenceLevel: this.confidenceLevel,
      priceImpact: this.priceImpact,
      riskLevel: this.riskLevel,
      recommendation: this.recommendation,
      factors: this.factors,
      timestamp: this.timestamp.toISOString()
    }
  }
}

export class Alert {
  constructor(data = {}) {
    this.id = data.id || null
    this.alertId = data.alert_id || ''
    this.userId = data.user_id || null
    this.eventType = data.event_type || ''
    this.pairId = data.pair_id || null
    this.details = data.details || {}
    this.thresholdValue = parseFloat(data.threshold_value) || 0
    this.currentValue = parseFloat(data.current_value) || 0
    this.isTriggered = data.is_triggered || false
    this.isActive = data.is_active !== undefined ? data.is_active : true
    this.severity = data.severity || 'medium'
    this.notificationMethods = data.notification_methods || ['in_app']
    this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date()
    this.triggeredAt = data.triggered_at ? new Date(data.triggered_at) : null
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date()
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : new Date()
  }

  static fromDatabase(row) {
    return new Alert(row)
  }

  toDatabase() {
    return {
      id: this.id,
      alert_id: this.alertId,
      user_id: this.userId,
      event_type: this.eventType,
      pair_id: this.pairId,
      details: this.details,
      threshold_value: this.thresholdValue,
      current_value: this.currentValue,
      is_triggered: this.isTriggered,
      is_active: this.isActive,
      severity: this.severity,
      notification_methods: this.notificationMethods,
      timestamp: this.timestamp.toISOString(),
      triggered_at: this.triggeredAt?.toISOString() || null,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    }
  }

  trigger() {
    this.isTriggered = true
    this.triggeredAt = new Date()
    this.updatedAt = new Date()
  }

  reset() {
    this.isTriggered = false
    this.triggeredAt = null
    this.updatedAt = new Date()
  }

  getSeverityColor() {
    const colors = {
      low: 'text-blue-500',
      medium: 'text-yellow-500',
      high: 'text-negative'
    }
    return colors[this.severity] || colors.medium
  }

  getSeverityBadge() {
    const badges = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    return badges[this.severity] || badges.medium
  }

  getEventTypeDisplay() {
    return this.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  toJSON() {
    return {
      id: this.id,
      alertId: this.alertId,
      userId: this.userId,
      eventType: this.eventType,
      pairId: this.pairId,
      details: this.details,
      thresholdValue: this.thresholdValue,
      currentValue: this.currentValue,
      isTriggered: this.isTriggered,
      isActive: this.isActive,
      severity: this.severity,
      notificationMethods: this.notificationMethods,
      timestamp: this.timestamp.toISOString(),
      triggeredAt: this.triggeredAt?.toISOString() || null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }
}

// Export all models as default object
export default {
  User,
  TradingPair,
  LiquidityData,
  SlippagePrediction,
  Alert
}
