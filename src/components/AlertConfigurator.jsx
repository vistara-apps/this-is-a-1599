import React, { useState } from 'react'
import { Plus, Trash2, Bell } from 'lucide-react'

const alertTypes = [
  { id: 'slippage', name: 'High Slippage Warning', description: 'Alert when slippage exceeds threshold' },
  { id: 'pool_balance', name: 'Pool Balance Change', description: 'Alert on significant pool balance changes' },
  { id: 'liquidity', name: 'Liquidity Event', description: 'Alert on major liquidity events' },
  { id: 'price', name: 'Price Movement', description: 'Alert on significant price movements' },
]

export function AlertConfigurator({ variant = 'modal' }) {
  const [alerts, setAlerts] = useState([])
  const [newAlert, setNewAlert] = useState({
    type: alertTypes[0].id,
    pair: 'WETH/USDC',
    threshold: '',
    enabled: true
  })

  const addAlert = () => {
    if (newAlert.threshold) {
      setAlerts([...alerts, { ...newAlert, id: Date.now() }])
      setNewAlert({
        type: alertTypes[0].id,
        pair: 'WETH/USDC',
        threshold: '',
        enabled: true
      })
    }
  }

  const removeAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const toggleAlert = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ))
  }

  return (
    <div className="space-y-6">
      {/* Create New Alert */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>Create Alert</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Alert Type
            </label>
            <select
              value={newAlert.type}
              onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
              className="input-field w-full"
            >
              {alertTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-secondary mt-1">
              {alertTypes.find(t => t.id === newAlert.type)?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Trading Pair
              </label>
              <input
                type="text"
                value={newAlert.pair}
                onChange={(e) => setNewAlert({ ...newAlert, pair: e.target.value })}
                className="input-field w-full"
                placeholder="e.g., WETH/USDC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Threshold
              </label>
              <input
                type="number"
                value={newAlert.threshold}
                onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
                className="input-field w-full"
                placeholder="e.g., 2.5"
                step="0.1"
              />
            </div>
          </div>

          <button
            onClick={addAlert}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Alert</span>
          </button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-md border border-gray-700"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={alert.enabled}
                      onChange={() => toggleAlert(alert.id)}
                      className="rounded border-gray-600 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium text-text-primary">
                        {alertTypes.find(t => t.id === alert.type)?.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {alert.pair} • Threshold: {alert.threshold}%
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-2 text-negative hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}