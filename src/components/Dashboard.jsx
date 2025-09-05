import React, { useState } from 'react'
import { MarketCard } from './MarketCard'
import { LiquidityChart } from './LiquidityChart'
import { SlippageEstimator } from './SlippageEstimator'
import { AlertConfigurator } from './AlertConfigurator'
import { SimpleTable } from './SimpleTable'
import { TrendingUp, Droplets, AlertTriangle, DollarSign } from 'lucide-react'

// Mock data
const mockTradingPairs = [
  { id: 1, baseToken: 'WETH', quoteToken: 'USDC', volume24h: '$2.4M', liquidity: '$45.2M', change: '+2.3%' },
  { id: 2, baseToken: 'WBTC', quoteToken: 'USDT', volume24h: '$1.8M', liquidity: '$32.1M', change: '-1.2%' },
  { id: 3, baseToken: 'UNI', quoteToken: 'WETH', volume24h: '$980K', liquidity: '$18.7M', change: '+5.7%' },
]

const mockLiquidityData = [
  { price: 1800, uniswap: 120000, sushiswap: 80000, curve: 60000 },
  { price: 1850, uniswap: 150000, sushiswap: 100000, curve: 75000 },
  { price: 1900, uniswap: 200000, sushiswap: 130000, curve: 90000 },
  { price: 1950, uniswap: 180000, sushiswap: 110000, curve: 85000 },
  { price: 2000, uniswap: 160000, sushiswap: 95000, curve: 70000 },
]

const mockAlerts = [
  { id: 1, type: 'Pool Balance Change', pair: 'WETH/USDC', message: 'Large withdrawal detected (-$2.1M)', timestamp: '2 minutes ago', severity: 'high' },
  { id: 2, type: 'Slippage Warning', pair: 'UNI/WETH', message: 'High slippage expected (>3%)', timestamp: '5 minutes ago', severity: 'medium' },
  { id: 3, type: 'Liquidity Alert', pair: 'WBTC/USDT', message: 'New liquidity pool created', timestamp: '12 minutes ago', severity: 'low' },
]

export function Dashboard() {
  const [selectedPair, setSelectedPair] = useState(mockTradingPairs[0])

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Liquidity</p>
              <p className="text-2xl font-semibold text-text-primary">$2.4B</p>
            </div>
            <Droplets className="w-8 h-8 text-accent" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">24h Volume</p>
              <p className="text-2xl font-semibold text-text-primary">$184M</p>
            </div>
            <DollarSign className="w-8 h-8 text-positive" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Avg Slippage</p>
              <p className="text-2xl font-semibold text-text-primary">0.23%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active Alerts</p>
              <p className="text-2xl font-semibold text-text-primary">12</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-negative" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Pairs */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Trading Pairs</h3>
          <div className="space-y-3">
            {mockTradingPairs.map((pair) => (
              <MarketCard 
                key={pair.id}
                pair={pair}
                variant="tradingPair"
                isSelected={selectedPair.id === pair.id}
                onClick={() => setSelectedPair(pair)}
              />
            ))}
          </div>
        </div>

        {/* Slippage Estimator */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI Slippage Predictor</h3>
          <SlippageEstimator selectedPair={selectedPair} />
        </div>
      </div>

      {/* Liquidity Heatmap */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Cross-DEX Liquidity Heatmap - {selectedPair.baseToken}/{selectedPair.quoteToken}</h3>
        <LiquidityChart data={mockLiquidityData} variant="heatmap" />
      </div>

      {/* Recent Alerts */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <SimpleTable 
          data={mockAlerts}
          variant="alerts"
          columns={[
            { key: 'type', label: 'Type' },
            { key: 'pair', label: 'Pair' },
            { key: 'message', label: 'Message' },
            { key: 'timestamp', label: 'Time' },
          ]}
        />
      </div>
    </div>
  )
}