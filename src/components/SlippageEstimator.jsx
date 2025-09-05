import React, { useState, useEffect } from 'react'
import { Calculator, TrendingUp } from 'lucide-react'

const exchanges = [
  { id: 'uniswap', name: 'Uniswap V3', fee: 0.3 },
  { id: 'sushiswap', name: 'SushiSwap', fee: 0.25 },
  { id: 'curve', name: 'Curve Finance', fee: 0.04 },
]

export function SlippageEstimator({ selectedPair, variant = 'inputForm' }) {
  const [tradeSize, setTradeSize] = useState('')
  const [selectedExchange, setSelectedExchange] = useState(exchanges[0])
  const [prediction, setPrediction] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateSlippage = async () => {
    if (!tradeSize || parseFloat(tradeSize) <= 0) return

    setIsCalculating(true)
    
    // Simulate AI calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock slippage calculation based on trade size and exchange
    const size = parseFloat(tradeSize)
    const baseSlippage = selectedExchange.fee / 100
    const sizeImpact = Math.log(size / 1000) * 0.1
    const predictedSlippage = Math.max(0.01, baseSlippage + sizeImpact)
    const priceImpact = size * predictedSlippage * 0.01
    
    setPrediction({
      slippage: predictedSlippage,
      priceImpact,
      estimatedCost: size * predictedSlippage,
      confidence: 92
    })
    
    setIsCalculating(false)
  }

  useEffect(() => {
    if (tradeSize && parseFloat(tradeSize) > 0) {
      const timer = setTimeout(calculateSlippage, 800)
      return () => clearTimeout(timer)
    }
  }, [tradeSize, selectedExchange])

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Trade Size ({selectedPair.baseToken})
          </label>
          <input
            type="number"
            placeholder="Enter amount..."
            value={tradeSize}
            onChange={(e) => setTradeSize(e.target.value)}
            className="input-field w-full"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Exchange
          </label>
          <select
            value={selectedExchange.id}
            onChange={(e) => setSelectedExchange(exchanges.find(ex => ex.id === e.target.value))}
            className="input-field w-full"
          >
            {exchanges.map(exchange => (
              <option key={exchange.id} value={exchange.id}>
                {exchange.name} ({exchange.fee}% fee)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prediction Results */}
      {isCalculating && (
        <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-accent animate-pulse" />
            <span className="text-text-secondary">AI calculating slippage...</span>
          </div>
        </div>
      )}

      {prediction && !isCalculating && (
        <div className="p-4 bg-gray-800 rounded-md border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Predicted Slippage</span>
            <span className="text-lg font-semibold text-negative">
              {(prediction.slippage * 100).toFixed(3)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Price Impact</span>
            <span className="text-sm font-medium text-text-primary">
              ${prediction.priceImpact.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Estimated Cost</span>
            <span className="text-sm font-medium text-text-primary">
              ${prediction.estimatedCost.toFixed(2)}
            </span>
          </div>
          
          <div className="pt-2 border-t border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">AI Confidence</span>
              <span className="text-xs font-medium text-accent">
                {prediction.confidence}%
              </span>
            </div>
          </div>
        </div>
      )}

      {tradeSize && !prediction && !isCalculating && (
        <button
          onClick={calculateSlippage}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Calculate Slippage</span>
        </button>
      )}
    </div>
  )
}