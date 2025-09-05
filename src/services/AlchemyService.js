/**
 * Alchemy Service - Blockchain data provider
 * Handles real-time blockchain data, contract interactions, and historical transaction data
 */

class AlchemyService {
  constructor() {
    this.apiKey = import.meta.env.VITE_ALCHEMY_API_KEY
    this.baseUrl = 'https://eth-mainnet.g.alchemy.com/v2'
    this.rateLimitDelay = 100 // ms between requests
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
   * Generic API request handler
   */
  async makeRequest(method, params = []) {
    await this.rateLimit()
    
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method,
          params
        })
      })

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`Alchemy RPC error: ${data.error.message}`)
      }

      return data.result
    } catch (error) {
      console.error('Alchemy API request failed:', error)
      throw error
    }
  }

  /**
   * Get token balances for a liquidity pool
   */
  async getPoolTokenBalances(poolAddress) {
    try {
      // Get the pool contract's token balances
      const balance = await this.makeRequest('eth_getBalance', [poolAddress, 'latest'])
      
      // For ERC-20 tokens, we'd need to call the balanceOf method
      // This is a simplified version - in production, you'd need to:
      // 1. Get the pool contract ABI
      // 2. Call the reserves() function for Uniswap-style pools
      // 3. Parse the returned token amounts
      
      return {
        token0Balance: balance,
        token1Balance: balance, // Placeholder
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get pool token balances:', error)
      throw error
    }
  }

  /**
   * Get historical transaction data for liquidity analysis
   */
  async getPoolTransactions(poolAddress, fromBlock = 'latest', toBlock = 'latest') {
    try {
      const logs = await this.makeRequest('eth_getLogs', [{
        address: poolAddress,
        fromBlock,
        toBlock,
        topics: [
          // Swap event signature for Uniswap V2/V3
          '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822'
        ]
      }])

      return logs.map(log => ({
        transactionHash: log.transactionHash,
        blockNumber: parseInt(log.blockNumber, 16),
        timestamp: Date.now(), // Would need to get block timestamp
        data: log.data,
        topics: log.topics
      }))
    } catch (error) {
      console.error('Failed to get pool transactions:', error)
      throw error
    }
  }

  /**
   * Get current gas prices for transaction cost estimation
   */
  async getGasPrice() {
    try {
      const gasPrice = await this.makeRequest('eth_gasPrice')
      return {
        standard: parseInt(gasPrice, 16),
        fast: parseInt(gasPrice, 16) * 1.2,
        instant: parseInt(gasPrice, 16) * 1.5,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get gas price:', error)
      throw error
    }
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(tokenAddress) {
    try {
      // This would typically involve calling ERC-20 methods
      // For now, returning mock data structure
      return {
        address: tokenAddress,
        name: 'Token Name',
        symbol: 'TKN',
        decimals: 18,
        totalSupply: '1000000000000000000000000'
      }
    } catch (error) {
      console.error('Failed to get token metadata:', error)
      throw error
    }
  }

  /**
   * Monitor contract events for real-time updates
   */
  async subscribeToPoolEvents(poolAddress, callback) {
    try {
      // In a real implementation, this would set up a WebSocket connection
      // to listen for real-time events from the pool contract
      console.log(`Subscribing to events for pool: ${poolAddress}`)
      
      // Simulate real-time updates
      const interval = setInterval(async () => {
        try {
          const balances = await this.getPoolTokenBalances(poolAddress)
          callback({
            type: 'balanceUpdate',
            poolAddress,
            data: balances
          })
        } catch (error) {
          console.error('Error in pool event subscription:', error)
        }
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    } catch (error) {
      console.error('Failed to subscribe to pool events:', error)
      throw error
    }
  }
}

export default new AlchemyService()
