import React from 'react'
import { X, Check, Crown, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Basic liquidity data',
      'Limited DEX coverage',
      '5 alerts per month',
      'Community support'
    ],
    icon: Zap,
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$15',
    period: '/month',
    description: 'For active traders',
    features: [
      'Real-time liquidity data',
      'All DEX coverage',
      'AI slippage prediction',
      'Unlimited alerts',
      'Priority support',
      'Advanced analytics'
    ],
    icon: Crown,
    popular: true
  },
  {
    id: 'institutional',
    name: 'Institutional',
    price: 'Custom',
    period: 'pricing',
    description: 'For high-volume traders',
    features: [
      'Everything in Pro',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ],
    icon: Crown,
    popular: false
  }
]

export function SubscriptionModal({ onClose }) {
  const { login } = useAuth()

  const handleSubscribe = (plan) => {
    // Simulate user signup/login
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      email: 'user@example.com',
      subscriptionTier: plan.id,
      createdAt: new Date().toISOString()
    }
    
    login(userData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Choose Your Plan</h2>
              <p className="text-text-secondary mt-1">Navigate crypto markets with AI-driven liquidity insights</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    plan.popular
                      ? 'border-accent bg-accent bg-opacity-5'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <Icon className={`w-12 h-12 mx-auto mb-4 ${plan.popular ? 'text-accent' : 'text-primary'}`} />
                    <h3 className="text-xl font-semibold text-text-primary">{plan.name}</h3>
                    <p className="text-text-secondary text-sm mt-1">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                      <span className="text-text-secondary">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-positive flex-shrink-0" />
                        <span className="text-sm text-text-primary">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      plan.popular
                        ? 'bg-accent text-white hover:bg-opacity-90'
                        : 'bg-primary text-white hover:bg-opacity-90'
                    }`}
                  >
                    {plan.id === 'institutional' ? 'Contact Sales' : 'Get Started'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}