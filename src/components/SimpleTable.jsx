import React from 'react'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'

const severityIcons = {
  high: AlertTriangle,
  medium: Info,
  low: CheckCircle,
}

const severityColors = {
  high: 'text-negative',
  medium: 'text-yellow-500',
  low: 'text-positive',
}

export function SimpleTable({ data, variant = 'data', columns }) {
  if (variant === 'alerts') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map(column => (
                <th key={column.key} className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                  {column.label}
                </th>
              ))}
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                Severity
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const SeverityIcon = severityIcons[row.severity] || Info
              return (
                <tr key={row.id || index} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                  {columns.map(column => (
                    <td key={column.key} className="py-3 px-4 text-sm text-text-primary">
                      {row[column.key]}
                    </td>
                  ))}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <SeverityIcon className={clsx('w-4 h-4', severityColors[row.severity])} />
                      <span className={clsx('text-sm capitalize', severityColors[row.severity])}>
                        {row.severity}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map(column => (
              <th key={column.key} className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
              {columns.map(column => (
                <td key={column.key} className="py-3 px-4 text-sm text-text-primary">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}