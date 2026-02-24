import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import TestPage from './pages/TestPage'
import ResultPage from './pages/ResultPage'
import AdminPage from './pages/AdminPage'
import { validateToken, getTokenFromUrl, saveCurrentToken, clearCurrentToken, getCurrentToken, markTokenUsed } from './utils/tokenAuth'
import { useTestStore } from './store/testStore'

// 获取 basename，适配 GitHub Pages 和本地开发
const basename = import.meta.env.BASE_URL

// 是否启用 Token 验证（设为 false 可关闭验证）
const ENABLE_TOKEN_AUTH = true

// Token 验证包装组件
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [error, setError] = useState<string>('')
  const resetTest = useTestStore((state) => state.resetTest)

  useEffect(() => {
    async function checkAuth() {
      console.log('=== 开始验证 ===')
      console.log('ENABLE_TOKEN_AUTH:', ENABLE_TOKEN_AUTH)
      console.log('当前路径:', window.location.pathname)
      console.log('完整URL:', window.location.href)

      // 如果未启用验证，直接通过
      if (!ENABLE_TOKEN_AUTH) {
        console.log('验证已关闭，直接通过')
        setStatus('valid')
        return
      }

      // admin 页面不需要验证
      if (window.location.pathname.includes('/admin')) {
        console.log('admin页面，跳过验证')
        setStatus('valid')
        return
      }

      let token = getTokenFromUrl()
      console.log('从URL获取的token:', token)

      // 结果页可以从 localStorage 获取 Token（用于刷新场景）
      const isResultPage = window.location.pathname === '/result'
      if (!token && isResultPage) {
        token = getCurrentToken()
        console.log('从localStorage获取的token:', token)
      }

      // 没有 token
      if (!token) {
        clearCurrentToken()
        setStatus('invalid')
        setError('请使用有效的测试链接访问')
        return
      }

      // 判断是否是当前会话的 token（用于允许刷新）
      const currentSessionToken = getCurrentToken()
      const isCurrentSession = token === currentSessionToken
      console.log('是否当前会话:', isCurrentSession)

      // 跳过使用次数检查的条件：
      // 1. 结果页刷新
      // 2. 当前会话的 token（已在本次会话验证过）
      const skipUsageCheck = isResultPage || isCurrentSession
      console.log('是否跳过使用次数检查:', skipUsageCheck)

      // 验证 token
      const result = await validateToken(token, skipUsageCheck)

      if (result.valid && result.payload) {
        // 保存 token 以便后续使用
        saveCurrentToken(token)

        // 如果是新会话（token 来自 URL 且不是当前会话），标记为已使用
        if (!isCurrentSession && getTokenFromUrl()) {
          console.log('标记 token 为已使用')
          markTokenUsed(result.payload.id)
        }

        // 只有在进行新测试时才重置（不是结果页且不是当前会话）
        const shouldResetTest = !isResultPage && !isCurrentSession
        console.log('是否应该重置测试:', shouldResetTest)
        if (shouldResetTest) {
          console.log('清除之前的测试数据，开始新的测试')
          resetTest()
        } else {
          console.log('保留现有测试数据')
        }
        setStatus('valid')
      } else {
        clearCurrentToken()
        setStatus('invalid')
        setError(result.error || '验证失败')
      }
    }

    checkAuth()
  }, [resetTest])

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
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </AuthWrapper>
    </Router>
  )
}

export default App
