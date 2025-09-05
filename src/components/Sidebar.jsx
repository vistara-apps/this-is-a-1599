import React from 'react'
import { BarChart3, TrendingUp, AlertTriangle, Droplets, Settings } from 'lucide-react'
import { clsx } from 'clsx'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'liquidity', label: 'Liquidity Pools', icon: Droplets },
  { id: 'slippage', label: 'Slippage Predictor', icon: TrendingUp },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ activeView, onViewChange }) {
  return (
    <aside className="bg-surface border-r border-gray-800 w-64 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors text-left',
                    activeView === item.id
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}