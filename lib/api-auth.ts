/**
 * API Key Authentication Utilities
 *
 * For public API access from Vercel websites
 */

import { NextRequest } from 'next/server'
import { prisma } from '@repo/database'

/**
 * Verify API key from request headers
 *
 * @param request - Next.js request object
 * @returns Website ID if valid, null if invalid
 */
export async function verifyApiKey(request: NextRequest): Promise<string | null> {
  // Get API key from headers
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')

  if (!apiKey) {
    return null
  }

  try {
    // Look up website by API key
    const website = await prisma.website.findFirst({
      where: {
        apiKey: apiKey,
      },
      select: {
        id: true,
      },
    })

    return website?.id || null
  } catch (error) {
    console.error('API key verification failed:', error)
    return null
  }
}

/**
 * Get API key from environment (for server-side use)
 */
export function getApiKeyFromEnv(websiteId: string): string | undefined {
  // Allow env var like: WEBSITE_1_API_KEY
  return process.env[`WEBSITE_${websiteId}_API_KEY`]
}
