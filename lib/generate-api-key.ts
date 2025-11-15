/**
 * API Key Generator
 *
 * Generates secure random API keys for websites
 */

import crypto from 'crypto'

/**
 * Generate a secure API key
 *
 * Format: sk_live_<32-char-random-string>
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24)
  const randomString = randomBytes.toString('base64url') // URL-safe base64
  return `sk_live_${randomString}`
}

/**
 * Generate a test API key
 *
 * Format: sk_test_<32-char-random-string>
 */
export function generateTestApiKey(): string {
  const randomBytes = crypto.randomBytes(24)
  const randomString = randomBytes.toString('base64url')
  return `sk_test_${randomString}`
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return /^sk_(live|test)_[A-Za-z0-9_-]{32}$/.test(apiKey)
}
