import { useState } from 'react'
import { generateToken, validateToken } from '@/utils/tokenAuth'

const AdminPage = () => {
  const [expireHours, setExpireHours] = useState(48)
  const [maxUse, setMaxUse] = useState(1)
  const [count, setCount] = useState(5)
  const [links, setLinks] = useState<string[]>([])
  const [copied, setCopied] = useState<number | null>(null)
  const [testResult, setTestResult] = useState<string>('')

  const handleGenerate = () => {
    const newLinks: string[] = []
    for (let i = 0; i < count; i++) {
      // 使用固定的 baseUrl
      const token = generateToken(expireHours, maxUse)
      const baseUrl = 'https://nekooo6957.github.io/CatMBTItest'
      newLinks.push(`${baseUrl}/?token=${encodeURIComponent(token)}`)
    }
    setLinks(newLinks)
    setTestResult('')
  }

  // 测试 Token 编解码
  const handleTest = () => {
    if (links.length === 0) {
      setTestResult('请先生成链接')
      return
    }

    // 提取第一个链接的 token
    const url = new URL(links[0])
    const token = url.searchParams.get('token')

    if (!token) {
      setTestResult('无法提取 Token')
      return
    }

    console.log('测试 Token:', token)
    const result = validateToken(token)
    console.log('验证结果:', result)

    if (result.valid) {
      setTestResult(`✅ 验证成功！\n${JSON.stringify(result.payload, null, 2)}`)
    } else {
      setTestResult(`❌ 验证失败: ${result.error}`)
    }
  }

  const handleCopy = (index: number) => {
    navigator.clipboard.writeText(links[index])
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(links.join('\n'))
    setCopied(-1)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🐱</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Token 链接生成器</h1>
          <p className="text-gray-500">生成测试链接分享给用户</p>
        </div>

        {/* 配置区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                有效期（小时）
              </label>
              <input
                type="number"
                value={expireHours}
                onChange={(e) => setExpireHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                可用次数
              </label>
              <input
                type="number"
                value={maxUse}
                onChange={(e) => setMaxUse(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                生成数量
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              生成链接
            </button>
            <button
              onClick={handleTest}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              测试
            </button>
          </div>

          {/* 测试结果 */}
          {testResult && (
            <div className={`mt-4 p-4 rounded-xl ${testResult.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}
        </div>

        {/* 链接列表 */}
        {links.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">生成的链接</h2>
              <button
                onClick={handleCopyAll}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied === -1 ? '已复制全部!' : '复制全部'}
              </button>
            </div>

            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm text-gray-400 mt-2 w-6">{index + 1}.</span>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 break-all text-sm text-gray-600">
                    {link}
                  </div>
                  <button
                    onClick={() => handleCopy(index)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      copied === index
                        ? 'bg-green-100 text-green-600'
                        : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                    }`}
                  >
                    {copied === index ? '已复制' : '复制'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="mt-6 p-4 bg-orange-50 rounded-xl text-sm text-gray-600">
          <p className="font-medium mb-2">使用说明：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>有效期：链接在指定小时数后失效</li>
            <li>可用次数：每个链接可以被使用的次数</li>
            <li>点击"复制"按钮复制单个链接</li>
            <li>点击"复制全部"复制所有链接</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
