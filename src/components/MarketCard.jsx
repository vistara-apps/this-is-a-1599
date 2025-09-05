import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { clsx } from 'clsx'

export function MarketCard({ pair, variant = 'tradingPair', isSelected, onClick }) {
  const isPositive = pair.change?.startsWith('+')

  if (variant === 'summary') {
    return (
      <div className="p-4 border border-gray-700 rounded-md hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-text-primary">{pair.baseToken}/{pair.quoteToken}</h4>
            <p className="text-sm text-text-secondary">Volume: {pair.volume24h}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">Liquidity</p>
            <p className="font-medium text-text-primary">{pair.liquidity}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full p-4 border rounded-md transition-all text-left',
        isSelected 
          ? 'border-primary bg-primary bg-opacity-10' 
          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-text-primary">{pair.baseToken}/{pair.quoteToken}</h4>
          <p className="text-sm text-text-secondary">Vol: {pair.volume24h} • Liq: {pair.liquidity}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-positive" />
          ) : (
            <TrendingDown className="w-4 h-4 text-negative" />
          )}
          <span className={clsx(
            'text-sm font-medium',
            isPositive ? 'text-positive' : 'text-negative'
          )}>
            {pair.change}
          </span>
        </div>
      </div>
    </button>
  )
}