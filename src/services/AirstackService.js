/**
 * Airstack Service - Cross-chain DeFi data aggregation
 * Handles aggregated DeFi data, token prices, pool reserves, and trading volumes
 */

class AirstackService {
  constructor() {
    this.apiKey = import.meta.env.VITE_AIRSTACK_API_KEY
    this.baseUrl = 'https://api.airstack.xyz/gql'
    this.rateLimitDelay = 200 // ms between requests
    this.lastRequestTime = 0
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
   * Generic GraphQL request handler
   */
  async makeGraphQLRequest(query, variables = {}) {
    await this.rateLimit()
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          variables
        })
      })

      if (!response.ok) {
        throw new Error(`Airstack API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(`Airstack GraphQL error: ${data.errors[0].message}`)
      }

      return data.data
    } catch (error) {
      console.error('Airstack API request failed:', error)
      throw error
    }
  }

  /**
   * Get cross-DEX liquidity data for a trading pair
   */
  async getCrossDEXLiquidity(baseToken, quoteToken) {
    const query = `
      query GetCrossDEXLiquidity($baseToken: String!, $quoteToken: String!) {
        TokenBalances(
          input: {
            filter: {
              tokenAddress: {_in: [$baseToken, $quoteToken]}
            }
            blockchain: ethereum
            limit: 50
          }
        ) {
          TokenBalance {
            tokenAddress
            amount
            formattedAmount
            owner {
              addresses
            }
            tokenNfts {
              tokenId
              blockchain
            }
          }
        }
      }
    `

    try {
      const data = await this.makeGraphQLRequest(query, { baseToken, quoteToken })
      
      // Process and aggregate liquidity data from different DEXs
      const liquidityData = this.processLiquidityData(data.TokenBalances?.TokenBalance || [])
      
      return {
        pair: `${baseToken}/${quoteToken}`,
        exchanges: liquidityData,
        totalLiquidity: liquidityData.reduce((sum, exchange) => sum + exchange.liquidity, 0),
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get cross-DEX liquidity:', error)
      throw error
    }
  }

  /**
   * Process raw liquidity data into structured format
   */
  processLiquidityData(rawData) {
    const exchanges = {}
    
    rawData.forEach(balance => {
      const ownerAddress = balance.owner?.addresses?.[0]
      if (!ownerAddress) return
      
      // Identify exchange based on owner address patterns
      const exchange = this.identifyExchange(ownerAddress)
      
      if (!exchanges[exchange]) {
        exchanges[exchange] = {
          name: exchange,
          liquidity: 0,
          reserves: {}
        }
      }
      
      exchanges[exchange].liquidity += parseFloat(balance.formattedAmount || 0)
      exchanges[exchange].reserves[balance.tokenAddress] = balance.formattedAmount
    })
    
    return Object.values(exchanges)
  }

  /**
   * Identify exchange based on contract address patterns
   */
  identifyExchange(address) {
    const exchangePatterns = {
      'uniswap': ['0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
      'sushiswap': ['0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'],
      'curve': ['0xd533a949740bb3306d119cc777fa900ba034cd52'],
      'balancer': ['0xba100000625a3754423978a60c9317c58441928c']
    }
    
    for (const [exchange, patterns] of Object.entries(exchangePatterns)) {
      if (patterns.some(pattern => address.toLowerCase().includes(pattern.toLowerCase()))) {
        return exchange
      }
    }
    
    return 'unknown'
  }

  /**
   * Get token price data across multiple exchanges
   */
  async getTokenPrices(tokenAddresses) {
    const query = `
      query GetTokenPrices($tokens: [String!]!) {
        Tokens(
          input: {
            filter: {
              address: {_in: $tokens}
            }
            blockchain: ethereum
            limit: 50
          }
        ) {
          Token {
            address
            name
            symbol
            decimals
            projectDetails {
              collectionName
              description
            }
          }
        }
      }
    `

    try {
      const data = await this.makeGraphQLRequest(query, { tokens: tokenAddresses })
      
      return data.Tokens?.Token?.map(token => ({
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        price: Math.random() * 1000, // Mock price - would come from price feeds
        priceChange24h: (Math.random() - 0.5) * 10,
        volume24h: Math.random() * 1000000,
        lastUpdated: new Date().toISOString()
      })) || []
    } catch (error) {
      console.error('Failed to get token prices:', error)
      throw error
    }
  }

  /**
   * Get trading volume data for analysis
   */
  async getTradingVolume(tokenAddress, timeframe = '24h') {
    const query = `
      query GetTradingVolume($tokenAddress: String!, $timeframe: String!) {
        TokenTransfers(
          input: {
            filter: {
              tokenAddress: {_eq: $tokenAddress}
            }
            blockchain: ethereum
            limit: 100
          }
        ) {
          TokenTransfer {
            amount
            formattedAmount
            blockTimestamp
            transactionHash
            from {
              addresses
            }
            to {
              addresses
            }
          }
        }
      }
    `

    try {
      const data = await this.makeGraphQLRequest(query, { tokenAddress, timeframe })
      
      const transfers = data.TokenTransfers?.TokenTransfer || []
      const volume = transfers.reduce((sum, transfer) => {
        return sum + parseFloat(transfer.formattedAmount || 0)
      }, 0)
      
      return {
        tokenAddress,
        volume,
        transferCount: transfers.length,
        timeframe,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get trading volume:', error)
      throw error
    }
  }

  /**
   * Get liquidity pool information
   */
  async getPoolInfo(poolAddress) {
    const query = `
      query GetPoolInfo($poolAddress: String!) {
        TokenBalances(
          input: {
            filter: {
              owner: {_eq: $poolAddress}
            }
            blockchain: ethereum
            limit: 10
          }
        ) {
          TokenBalance {
            tokenAddress
            amount
            formattedAmount
            token {
              name
              symbol
              decimals
            }
          }
        }
      }
    `

    try {
      const data = await this.makeGraphQLRequest(query, { poolAddress })
      
      const balances = data.TokenBalances?.TokenBalance || []
      
      return {
        poolAddress,
        tokens: balances.map(balance => ({
          address: balance.tokenAddress,
          name: balance.token?.name,
          symbol: balance.token?.symbol,
          decimals: balance.token?.decimals,
          balance: balance.formattedAmount,
          rawBalance: balance.amount
        })),
        totalTokens: balances.length,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get pool info:', error)
      throw error
    }
  }

  /**
   * Search for trading pairs across exchanges
   */
  async searchTradingPairs(searchTerm) {
    const query = `
      query SearchTradingPairs($searchTerm: String!) {
        Tokens(
          input: {
            filter: {
              name: {_regex: $searchTerm}
            }
            blockchain: ethereum
            limit: 20
          }
        ) {
          Token {
            address
            name
            symbol
            decimals
          }
        }
      }
    `

    try {
      const data = await this.makeGraphQLRequest(query, { searchTerm })
      
      return data.Tokens?.Token?.map(token => ({
        baseToken: token.symbol,
        quoteToken: 'USDC', // Default quote token
        address: token.address,
        name: token.name,
        decimals: token.decimals
      })) || []
    } catch (error) {
      console.error('Failed to search trading pairs:', error)
      throw error
    }
  }
}

export default new AirstackService()
