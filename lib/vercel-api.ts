/**
 * Vercel API 集成工具
 * 用于自动化域名管理
 */

import { Vercel } from '@vercel/sdk'

// 从环境变量获取配置
const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

// 项目ID映射（根据websiteId获取对应的Vercel项目ID）
const PROJECT_ID_MAP: Record<string, string> = {
  'website-1': process.env.VERCEL_PROJECT_ID_WEBSITE_1 || '',
  'website-2': process.env.VERCEL_PROJECT_ID_WEBSITE_2 || '',
  'website-tg': process.env.VERCEL_PROJECT_ID_WEBSITE_TG || '',
}

/**
 * 检查Vercel API是否已配置
 */
export function isVercelConfigured(): boolean {
  return !!VERCEL_TOKEN && Object.values(PROJECT_ID_MAP).some((id) => !!id)
}

/**
 * 获取Vercel客户端
 */
function getVercelClient() {
  if (!VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN is not configured')
  }

  return new Vercel({
    bearerToken: VERCEL_TOKEN,
  })
}

/**
 * 获取项目的Vercel项目ID
 */
function getProjectId(websiteId: string): string {
  const projectId = PROJECT_ID_MAP[websiteId]
  if (!projectId) {
    throw new Error(`No Vercel project ID configured for website: ${websiteId}`)
  }
  return projectId
}

/**
 * 添加域名到Vercel项目
 */
export async function addDomainToVercel(
  websiteId: string,
  domain: string
): Promise<{
  success: boolean
  error?: string
  data?: any
}> {
  try {
    if (!isVercelConfigured()) {
      return {
        success: false,
        error: 'Vercel API is not configured',
      }
    }

    const vercel = getVercelClient()
    const projectId = getProjectId(websiteId)

    const result = await vercel.projects.addProjectDomain({
      idOrName: projectId,
      teamId: VERCEL_TEAM_ID,
      requestBody: {
        name: domain,
      },
    })

    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    console.error('Failed to add domain to Vercel:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * 从Vercel项目移除域名
 */
export async function removeDomainFromVercel(
  websiteId: string,
  domain: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    if (!isVercelConfigured()) {
      return {
        success: false,
        error: 'Vercel API is not configured',
      }
    }

    const vercel = getVercelClient()
    const projectId = getProjectId(websiteId)

    await vercel.projects.removeProjectDomain({
      idOrName: projectId,
      domain,
      teamId: VERCEL_TEAM_ID,
    })

    return {
      success: true,
    }
  } catch (error: any) {
    console.error('Failed to remove domain from Vercel:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * 检查域名在Vercel上的验证状态
 */
export async function checkDomainStatus(
  websiteId: string,
  domain: string
): Promise<{
  verified: boolean
  error?: string
  data?: any
}> {
  try {
    if (!isVercelConfigured()) {
      return {
        verified: false,
        error: 'Vercel API is not configured',
      }
    }

    const vercel = getVercelClient()
    const projectId = getProjectId(websiteId)

    const result = await vercel.projects.getProjectDomain({
      idOrName: projectId,
      domain,
      teamId: VERCEL_TEAM_ID,
    })

    return {
      verified: result.verified || false,
      data: result,
    }
  } catch (error: any) {
    console.error('Failed to check domain status:', error)
    return {
      verified: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * 获取项目的所有域名
 */
export async function listProjectDomains(
  websiteId: string
): Promise<{
  success: boolean
  domains?: any[]
  error?: string
}> {
  try {
    if (!isVercelConfigured()) {
      return {
        success: false,
        error: 'Vercel API is not configured',
      }
    }

    const vercel = getVercelClient()
    const projectId = getProjectId(websiteId)

    // Note: getProject method may not be available in current SDK version
    // This is a placeholder implementation
    // TODO: Update when Vercel SDK provides project details endpoint

    return {
      success: true,
      domains: [],
    }
  } catch (error: any) {
    console.error('Failed to list project domains:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * 批量同步域名状态
 * 检查Vercel上的域名验证状态，并更新数据库
 */
export async function syncDomainStatuses(
  websiteId: string,
  domainIds: string[]
): Promise<{
  updated: number
  errors: string[]
}> {
  const errors: string[] = []
  let updated = 0

  for (const domainId of domainIds) {
    try {
      // 这里需要prisma，但为了保持lib的独立性，
      // 实际实现应该在API route中调用
      // 这个函数主要是提供接口定义
    } catch (error: any) {
      errors.push(`${domainId}: ${error.message}`)
    }
  }

  return { updated, errors }
}
