import React, { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { SubscriptionModal } from './components/SubscriptionModal'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const { user } = useAuth()
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="card text-center">
            <h1 className="text-2xl font-semibold mb-4">Welcome to LiquidityPulse</h1>
            <p className="text-text-secondary mb-6">Navigate crypto markets with AI-driven liquidity insights</p>
            <button 
              className="btn-primary w-full"
              onClick={() => setShowSubscriptionModal(true)}
            >
              Get Started
            </button>
          </div>
        </div>
        {showSubscriptionModal && (
          <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader 
        onUpgrade={() => setShowSubscriptionModal(true)}
        user={user}
      />
      <div className="flex">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
        />
        <main className="flex-1 p-6">
          <Dashboard />
        </main>
      </div>
      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App