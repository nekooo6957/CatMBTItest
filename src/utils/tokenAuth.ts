/**
 * Token 验证工具（纯前端版本）
 */

// Token 存储键名
const STORAGE_KEY = 'cat_mbti_used_tokens'

interface TokenPayload {
  exp: number    // 过期时间戳
  maxUse: number // 最大使用次数
  id: string     // 唯一标识
}

interface TokenResult {
  valid: boolean
  error?: string
  payload?: TokenPayload
}

// 生成随机 ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

// 简单的 Base64 编码（带混淆）
function encode(payload: TokenPayload): string {
  const json = JSON.stringify(payload)
  const base64 = btoa(encodeURIComponent(json))
  // 简单混淆：反转字符串
  return base64.split('').reverse().join('')
}

// 简单的 Base64 解码
function decode(token: string): TokenPayload | null {
  try {
    // 反转回来
    const base64 = token.split('').reverse().join('')
    const json = decodeURIComponent(atob(base64))
    return JSON.parse(json)
  } catch {
    return null
  }
}

// 获取已使用的 Token 记录
function getUsedTokens(): Record<string, number> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

// 保存 Token 使用记录
function saveTokenUsage(tokenId: string) {
  const usedTokens = getUsedTokens()
  usedTokens[tokenId] = (usedTokens[tokenId] || 0) + 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usedTokens))
}

// 获取 Token 已使用次数
function getTokenUsageCount(tokenId: string): number {
  const usedTokens = getUsedTokens()
  return usedTokens[tokenId] || 0
}

// 生成 Token
export function generateToken(expireHours: number = 48, maxUse: number = 1): string {
  const payload: TokenPayload = {
    exp: Math.floor(Date.now() / 1000) + expireHours * 60 * 60,
    maxUse: maxUse,
    id: generateId()
  }
  return encode(payload)
}

// 生成完整链接
export function generateLink(expireHours: number = 48, maxUse: number = 1): string {
  const token = generateToken(expireHours, maxUse)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?token=${encodeURIComponent(token)}`
}

// 验证 Token
export function validateToken(token: string): TokenResult {
  console.log('验证 Token:', token)

  if (!token) {
    return { valid: false, error: '缺少访问令牌' }
  }

  try {
    // 解码 Token
    const payload = decode(token)
    console.log('解码结果:', payload)

    if (!payload) {
      return { valid: false, error: '无效的访问令牌' }
    }

    // 检查过期时间
    const now = Math.floor(Date.now() / 1000)
    console.log('过期时间:', payload.exp, '当前时间:', now)

    if (payload.exp < now) {
      return { valid: false, error: '链接已过期' }
    }

    // 检查使用次数
    const usageCount = getTokenUsageCount(payload.id)
    console.log('使用次数:', usageCount, '最大次数:', payload.maxUse)

    if (usageCount >= payload.maxUse) {
      return { valid: false, error: '链接已被使用' }
    }

    return { valid: true, payload }
  } catch (error) {
    console.error('Token 验证失败:', error)
    return { valid: false, error: '令牌验证失败' }
  }
}

// 标记 Token 已使用
export function markTokenUsed(tokenId: string) {
  saveTokenUsage(tokenId)
}

// 从 URL 获取 Token
export function getTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('token')
}

// 清除所有使用记录（调试用）
export function clearAllTokenRecords() {
  localStorage.removeItem(STORAGE_KEY)
}
