/**
 * Token 验证工具
 * 用于验证测试链接的有效性
 */

// 加密密钥（需要与生成脚本保持一致）
const SECRET_KEY = 'cat-mbti-secret-key-2024'

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

// Web Crypto API 解密函数
async function decrypt(encryptedData: string): Promise<string | null> {
  try {
    const [ivHex, encrypted] = encryptedData.split(':')
    if (!ivHex || !encrypted) return null

    const iv = hexToUint8Array(ivHex)
    const encryptedBytes = hexToUint8Array(encrypted)

    // 导入密钥
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(SECRET_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-CBC', length: 256 },
      false,
      ['decrypt']
    )

    // 解密
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv as BufferSource },
      key,
      encryptedBytes as BufferSource
    )

    return new TextDecoder().decode(decrypted)
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}

// 十六进制转 Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
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

// 验证 Token
export async function validateToken(token: string): Promise<TokenResult> {
  if (!token) {
    return { valid: false, error: '缺少访问令牌' }
  }

  try {
    // 解密 Token
    const decrypted = await decrypt(token)
    if (!decrypted) {
      return { valid: false, error: '无效的访问令牌' }
    }

    // 解析 payload
    const payload: TokenPayload = JSON.parse(decrypted)

    // 检查过期时间
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return { valid: false, error: '链接已过期' }
    }

    // 检查使用次数
    const usageCount = getTokenUsageCount(payload.id)
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
