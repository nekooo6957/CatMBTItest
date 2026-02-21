/**
 * 生成带 Token 的测试链接
 *
 * 运行方式：
 *   node scripts/generateToken.cjs [小时数] [使用次数] [生成数量]
 *
 * 示例：
 *   node scripts/generateToken.cjs 48 1       # 默认生成 5 个链接
 *   node scripts/generateToken.cjs 48 1 10    # 生成 10 个链接
 *   node scripts/generateToken.cjs 72 3 5     # 72小时有效，可用3次，生成5个
 */

const crypto = require('crypto')

// 加密密钥（需要与前端 tokenAuth.ts 保持一致）
const SECRET_KEY = 'cat-mbti-secret-key-2024'
const ALGORITHM = 'aes-256-cbc'

// 使用 PBKDF2 派生密钥（与浏览器 Web Crypto API 兼容）
async function deriveKey(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
}

// 加密函数
async function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const salt = Buffer.from('salt', 'utf8')
  const key = await deriveKey(SECRET_KEY, salt)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

// 生成 Token
async function generateToken(expireHours, maxUse) {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + expireHours * 60 * 60,
    maxUse: maxUse,
    id: crypto.randomBytes(8).toString('hex')
  }
  return encrypt(JSON.stringify(payload))
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  const expireHours = parseInt(args[0]) || 48
  const maxUse = parseInt(args[1]) || 1
  const count = parseInt(args[2]) || 5

  const baseUrl = 'https://nekooo6957.github.io/CatMBTItest'

  console.log('\n🐱 猫咪MBTI测试 - Token 生成器')
  console.log('='.repeat(60))
  console.log(`\n📋 配置：有效期 ${expireHours} 小时 | 可用 ${maxUse} 次 | 生成 ${count} 个链接\n`)
  console.log('🔗 测试链接：\n')

  for (let i = 1; i <= count; i++) {
    const token = await generateToken(expireHours, maxUse)
    const url = `${baseUrl}/?token=${encodeURIComponent(token)}`
    console.log(`${i}. ${url}\n`)
  }

  console.log('='.repeat(60))
  console.log('\n✅ 复制上面的链接发送给用户即可！\n')
}

main()
