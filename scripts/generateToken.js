/**
 * 生成带 Token 的测试链接
 * 运行方式：node scripts/generateToken.js [小时数] [使用次数]
 * 示例：node scripts/generateToken.js 48 1
 */

const crypto = require('crypto')

// 加密密钥（请修改为你自己的密钥，需要与前端保持一致）
const SECRET_KEY = 'cat-mbti-secret-key-2024'
const ALGORITHM = 'aes-256-cbc'

// 加密函数
function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(SECRET_KEY, 'salt', 32)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

// 生成 Token
function generateToken(expireHours = 48, maxUse = 1) {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + expireHours * 60 * 60,
    maxUse: maxUse,
    id: crypto.randomBytes(8).toString('hex')
  }

  const token = encrypt(JSON.stringify(payload))
  return token
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const expireHours = parseInt(args[0]) || 48
  const maxUse = parseInt(args[1]) || 1

  console.log('\n🐱 猫咪MBTI测试 - Token 生成器\n')
  console.log('='.repeat(50))

  // 生成单个 Token
  const token = generateToken(expireHours, maxUse)
  const baseUrl = 'https://nekooo6957.github.io/CatMBTItest'
  const fullUrl = `${baseUrl}?token=${encodeURIComponent(token)}`

  console.log(`\n📝 配置信息：`)
  console.log(`   有效期: ${expireHours} 小时`)
  console.log(`   最大使用次数: ${maxUse} 次`)

  console.log(`\n🔗 测试链接：`)
  console.log(`   ${fullUrl}`)

  console.log(`\n📦 Token 值：`)
  console.log(`   ${token}`)

  // 批量生成
  console.log('\n' + '='.repeat(50))
  console.log('\n📋 批量生成 5 个链接：\n')

  for (let i = 1; i <= 5; i++) {
    const t = generateToken(expireHours, maxUse)
    const url = `${baseUrl}?token=${encodeURIComponent(t)}`
    console.log(`${i}. ${url}\n`)
  }

  console.log('='.repeat(50))
  console.log('\n✅ 生成完成！复制链接分享给用户即可\n')
}

main()
