import React from 'react'
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
  getPasswordStrengthLabel
} from '@/lib/password-validation'

interface PasswordStrengthMeterProps {
  password: string
  showFeedback?: boolean
}

export function PasswordStrengthMeter({ password, showFeedback = true }: PasswordStrengthMeterProps) {
  if (!password) return null

  const strength = validatePassword(password)
  const percentage = (strength.score / 4) * 100

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Password Strength</span>
          <span className={`text-xs font-medium ${getPasswordStrengthTextColor(strength.level)}`}>
            {getPasswordStrengthLabel(strength.level)}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getPasswordStrengthColor(strength.level)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Feedback messages */}
      {showFeedback && strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((message, index) => (
            <p
              key={index}
              className={`text-xs ${
                strength.isValid
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              }`}
            >
              {strength.isValid ? '✓' : '•'} {message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
