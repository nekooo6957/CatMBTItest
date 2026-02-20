import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TestPage from './pages/TestPage'
import ResultPage from './pages/ResultPage'

// 获取 basename，适配 GitHub Pages 和本地开发
const basename = import.meta.env.BASE_URL

function App() {
  return (
    <Router basename={basename}>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
