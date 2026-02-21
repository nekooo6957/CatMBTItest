import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import TestPage from './pages/TestPage'
import ResultPage from './pages/ResultPage'
import { validateToken, getTokenFromUrl, markTokenUsed } from './utils/tokenAuth'

// 获取 basename，适配 GitHub Pages 和本地开发
const basename = import.meta.env.BASE_URL

// 是否启用 Token 验证（设为 false 可关闭验证）
const ENABLE_TOKEN_AUTH = true

// Token 验证包装组件
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function checkAuth() {
      // 如果未启用验证，直接通过
      if (!ENABLE_TOKEN_AUTH) {
        setStatus('valid')
        return
      }

      const token = getTokenFromUrl()

      // 没有 token
      if (!token) {
        setStatus('invalid')
        setError('请使用有效的测试链接访问')
        return
      }

      // 验证 token
      const result = await validateToken(token)

      if (result.valid && result.payload) {
        // 标记已使用（测试开始时标记）
        markTokenUsed(result.payload.id)
        setStatus('valid')
      } else {
        setStatus('invalid')
        setError(result.error || '验证失败')
      }
    }

    checkAuth()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🐱</div>
          <p className="text-gray-500">验证中...</p>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😿</div>
          <h1 className="text-xl font-bold text-gray-700 mb-3">无法访问</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="bg-orange-50 rounded-xl p-4 text-left text-sm text-gray-600">
            <p className="font-medium mb-2">可能的原因：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>链接已过期（48小时有效期）</li>
              <li>链接已被使用</li>
              <li>链接格式不正确</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function App() {
  return (
    <Router basename={basename}>
      <AuthWrapper>
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/result" element={<ResultPage />} />
          </Routes>
        </div>
      </AuthWrapper>
    </Router>
  )
}

export default App
