import React from 'react'
import { Bell, Settings, User, Crown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function AppHeader({ onUpgrade, user }) {
  const { logout } = useAuth()

  return (
    <header className="bg-surface border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-text-primary">LiquidityPulse</h1>
          <span className="text-sm text-text-secondary">AI-driven liquidity insights</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {user?.subscriptionTier === 'free' && (
            <button 
              onClick={onUpgrade}
              className="flex items-center space-x-2 bg-accent text-white px-3 py-1.5 rounded-md hover:bg-opacity-90 transition-colors text-sm font-medium"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade to Pro</span>
            </button>
          )}
          
          <button className="p-2 rounded-md hover:bg-gray-700 transition-colors">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
          
          <button className="p-2 rounded-md hover:bg-gray-700 transition-colors">
            <Settings className="w-5 h-5 text-text-secondary" />
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 transition-colors">
              <User className="w-5 h-5 text-text-secondary" />
              <span className="text-sm text-text-secondary">{user?.email}</span>
            </button>
            <button 
              onClick={logout}
              className="text-sm text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}