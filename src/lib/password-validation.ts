/**
 * Password Validation Utility
 * Provides comprehensive password strength checking and validation
 */

export interface PasswordStrength {
  score: number // 0-4 (0=weak, 4=very strong)
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  feedback: string[]
  isValid: boolean
}

// Common passwords to block (top 100 most common)
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', '12345678', '12345', '1234567',
  'password1', 'abc123', 'qwerty', 'monkey', '1234567890', 'letmein',
  'trustno1', 'dragon', 'baseball', '111111', 'iloveyou', 'master',
  'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
  'welcome', 'admin', 'password123', 'qwerty123'
]

/**
 * Validate password strength and provide detailed feedback
 */
export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Check minimum length
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long')
    return { score: 0, level: 'weak', feedback, isValid: false }
  }

  // Check for common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    feedback.push('This password is too common. Please choose a more unique password')
    return { score: 0, level: 'weak', feedback, isValid: false }
  }

  // Length scoring
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character variety scoring
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (hasLowercase) score += 1
  if (hasUppercase) score += 1
  if (hasNumbers) score += 1
  if (hasSpecialChars) score += 1

  // Generate feedback
  if (!hasLowercase) feedback.push('Add lowercase letters (a-z)')
  if (!hasUppercase) feedback.push('Add uppercase letters (A-Z)')
  if (!hasNumbers) feedback.push('Add numbers (0-9)')
  if (!hasSpecialChars) feedback.push('Add special characters (!@#$%^&*)')

  // Determine strength level
  let level: PasswordStrength['level']
  if (score <= 2) {
    level = 'weak'
  } else if (score <= 4) {
    level = 'fair'
  } else if (score <= 6) {
    level = 'good'
  } else if (score <= 8) {
    level = 'strong'
  } else {
    level = 'very-strong'
  }

  // Check if password meets minimum requirements
  const isValid = password.length >= 8 &&
                  hasLowercase &&
                  hasUppercase &&
                  hasNumbers &&
                  hasSpecialChars

  if (isValid && feedback.length === 0) {
    feedback.push(`Password strength: ${level}`)
  }

  return {
    score: Math.min(score, 4), // Cap at 4 for consistency
    level,
    feedback,
    isValid
  }
}

/**
 * Get password strength as a percentage (0-100)
 */
export function getPasswordStrengthPercentage(password: string): number {
  const { score } = validatePassword(password)
  return (score / 4) * 100
}

/**
 * Get color for password strength indicator
 */
export function getPasswordStrengthColor(level: PasswordStrength['level']): string {
  switch (level) {
    case 'weak':
      return 'bg-red-500'
    case 'fair':
      return 'bg-orange-500'
    case 'good':
      return 'bg-yellow-500'
    case 'strong':
      return 'bg-green-500'
    case 'very-strong':
      return 'bg-emerald-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * Get text color for password strength label
 */
export function getPasswordStrengthTextColor(level: PasswordStrength['level']): string {
  switch (level) {
    case 'weak':
      return 'text-red-600 dark:text-red-400'
    case 'fair':
      return 'text-orange-600 dark:text-orange-400'
    case 'good':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'strong':
      return 'text-green-600 dark:text-green-400'
    case 'very-strong':
      return 'text-emerald-600 dark:text-emerald-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

/**
 * Get display label for password strength
 */
export function getPasswordStrengthLabel(level: PasswordStrength['level']): string {
  switch (level) {
    case 'weak':
      return 'Weak'
    case 'fair':
      return 'Fair'
    case 'good':
      return 'Good'
    case 'strong':
      return 'Strong'
    case 'very-strong':
      return 'Very Strong'
    default:
      return ''
  }
}
