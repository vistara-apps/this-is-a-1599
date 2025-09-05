import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function LiquidityChart({ data, variant = 'heatmap' }) {
  if (variant === 'depth') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="price" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, 'Liquidity']}
              labelFormatter={(label) => `Price: $${label}`}
            />
            <Bar dataKey="uniswap" fill="#FF6B9D" name="Uniswap" />
            <Bar dataKey="sushiswap" fill="#0993EC" name="SushiSwap" />
            <Bar dataKey="curve" fill="#FFD23F" name="Curve" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="price" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
            formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, 'Liquidity']}
            labelFormatter={(label) => `Price: $${label}`}
          />
          <Legend />
          <Bar dataKey="uniswap" stackId="a" fill="hsl(160, 70%, 45%)" name="Uniswap" />
          <Bar dataKey="sushiswap" stackId="a" fill="hsl(210, 80%, 40%)" name="SushiSwap" />
          <Bar dataKey="curve" stackId="a" fill="hsl(50, 80%, 60%)" name="Curve" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}