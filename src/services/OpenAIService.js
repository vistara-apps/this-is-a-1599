/**
 * OpenAI Service - AI-powered analytics and predictions
 * Handles slippage prediction, market analysis, and insight generation
 */

class OpenAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.baseUrl = 'https://api.openai.com/v1'
    this.model = 'gpt-4'
    this.rateLimitDelay = 1000 // ms between requests (OpenAI has stricter limits)
    this.lastRequestTime = 0
    this.predictionCache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Rate limiting helper
   */
  async rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
    }
    this.lastRequestTime = Date.now()
  }

  /**
   * Generic OpenAI API request handler
   */
  async makeRequest(endpoint, data) {
    await this.rateLimit()
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(`OpenAI API error: ${result.error.message}`)
      }

      return result
    } catch (error) {
      console.error('OpenAI API request failed:', error)
      throw error
    }
  }

  /**
   * Predict slippage for a given trade
   */
  async predictSlippage(tradeParams) {
    const { baseToken, quoteToken, tradeSize, exchange, liquidityData, historicalData } = tradeParams
    
    // Check cache first
    const cacheKey = `${baseToken}-${quoteToken}-${tradeSize}-${exchange}`
    const cached = this.predictionCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }

    try {
      const prompt = this.buildSlippagePredictionPrompt(tradeParams)
      
      const response = await this.makeRequest('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert DeFi analyst specializing in liquidity analysis and slippage prediction. Provide accurate, data-driven predictions with confidence intervals.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })

      const prediction = this.parseSlippagePrediction(response.choices[0].message.content)
      
      // Cache the result
      this.predictionCache.set(cacheKey, {
        data: prediction,
        timestamp: Date.now()
      })

      return prediction
    } catch (error) {
      console.error('Failed to predict slippage:', error)
      
      // Return fallback prediction based on simple heuristics
      return this.getFallbackSlippagePrediction(tradeParams)
    }
  }

  /**
   * Build prompt for slippage prediction
   */
  buildSlippagePredictionPrompt(tradeParams) {
    const { baseToken, quoteToken, tradeSize, exchange, liquidityData, historicalData } = tradeParams
    
    return `
Analyze the following DeFi trading scenario and predict the slippage:

Trading Pair: ${baseToken}/${quoteToken}
Exchange: ${exchange}
Trade Size: ${tradeSize} ${baseToken}
Current Liquidity: ${JSON.stringify(liquidityData, null, 2)}
Historical Data: ${JSON.stringify(historicalData, null, 2)}

Please provide:
1. Predicted slippage percentage
2. Confidence level (0-100%)
3. Price impact analysis
4. Risk factors
5. Optimal trade size recommendation

Format your response as JSON:
{
  "slippage": number,
  "confidence": number,
  "priceImpact": number,
  "riskLevel": "low|medium|high",
  "recommendation": "string",
  "factors": ["factor1", "factor2"]
}
    `
  }

  /**
   * Parse AI response into structured prediction
   */
  parseSlippagePrediction(aiResponse) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          slippage: parsed.slippage || 0,
          confidence: parsed.confidence || 50,
          priceImpact: parsed.priceImpact || 0,
          riskLevel: parsed.riskLevel || 'medium',
          recommendation: parsed.recommendation || 'Consider smaller trade size',
          factors: parsed.factors || ['Insufficient data'],
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
    }

    // Fallback parsing
    return {
      slippage: this.extractNumber(aiResponse, 'slippage') || 0.5,
      confidence: this.extractNumber(aiResponse, 'confidence') || 60,
      priceImpact: this.extractNumber(aiResponse, 'impact') || 0.3,
      riskLevel: aiResponse.toLowerCase().includes('high') ? 'high' : 
                 aiResponse.toLowerCase().includes('low') ? 'low' : 'medium',
      recommendation: 'AI analysis completed',
      factors: ['Market volatility', 'Liquidity depth'],
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Extract numbers from text
   */
  extractNumber(text, context) {
    const patterns = [
      new RegExp(`${context}[:\\s]*([0-9.]+)%?`, 'i'),
      new RegExp(`([0-9.]+)%?[\\s]*${context}`, 'i')
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        return parseFloat(match[1])
      }
    }
    
    return null
  }

  /**
   * Fallback slippage prediction using simple heuristics
   */
  getFallbackSlippagePrediction(tradeParams) {
    const { tradeSize, liquidityData } = tradeParams
    
    // Simple heuristic: larger trades in smaller pools = higher slippage
    const totalLiquidity = liquidityData?.totalLiquidity || 1000000
    const tradeSizeUSD = parseFloat(tradeSize) * 2000 // Assume $2000 per token
    const liquidityRatio = tradeSizeUSD / totalLiquidity
    
    let slippage = 0.1 // Base slippage
    if (liquidityRatio > 0.1) slippage = 5.0
    else if (liquidityRatio > 0.05) slippage = 2.0
    else if (liquidityRatio > 0.01) slippage = 0.5
    
    return {
      slippage,
      confidence: 40, // Lower confidence for fallback
      priceImpact: slippage * 0.8,
      riskLevel: slippage > 2 ? 'high' : slippage > 0.5 ? 'medium' : 'low',
      recommendation: slippage > 2 ? 'Consider reducing trade size' : 'Trade size appears reasonable',
      factors: ['Fallback calculation', 'Limited data available'],
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Generate market insights and summaries
   */
  async generateMarketInsights(marketData) {
    try {
      const prompt = `
Analyze the following DeFi market data and provide key insights:

Market Data: ${JSON.stringify(marketData, null, 2)}

Please provide:
1. Key trends and patterns
2. Risk assessment
3. Opportunities
4. Market sentiment
5. Actionable recommendations

Keep the response concise and focused on actionable insights.
      `

      const response = await this.makeRequest('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi market analyst. Provide clear, actionable insights based on market data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 300
      })

      return {
        insights: response.choices[0].message.content,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to generate market insights:', error)
      return {
        insights: 'Market analysis temporarily unavailable. Please check back later.',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Analyze liquidity events for alerts
   */
  async analyzeLiquidityEvent(eventData) {
    try {
      const prompt = `
Analyze this liquidity event and determine its significance:

Event Data: ${JSON.stringify(eventData, null, 2)}

Classify the event severity (low/medium/high) and provide a brief explanation.
Format as JSON: {"severity": "level", "explanation": "text", "actionable": boolean}
      `

      const response = await this.makeRequest('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi event analyzer. Classify events by severity and impact.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 200
      })

      try {
        const analysis = JSON.parse(response.choices[0].message.content)
        return {
          ...analysis,
          timestamp: new Date().toISOString()
        }
      } catch (parseError) {
        return {
          severity: 'medium',
          explanation: 'Event detected but analysis unavailable',
          actionable: false,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Failed to analyze liquidity event:', error)
      return {
        severity: 'low',
        explanation: 'Analysis temporarily unavailable',
        actionable: false,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Clear prediction cache
   */
  clearCache() {
    this.predictionCache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.predictionCache.size,
      entries: Array.from(this.predictionCache.keys())
    }
  }
}

export default new OpenAIService()
