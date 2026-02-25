import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTestStore, useProgress } from '@/store/testStore'
import { SCALE_OPTIONS } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'

const TestPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentQuestionIndex, questions, answers, answerQuestion, goBack, setCatNickname } = useTestStore()
  const progress = useProgress()
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = (score: 1 | 2 | 3 | 4 | 5) => {
    answerQuestion(currentQuestion.id, score)

    if (currentQuestionIndex === questions.length - 1) {
      // 显示昵称输入弹窗
      setShowNicknameModal(true)
    }
  }

  const handleNicknameSubmit = () => {
    const trimmed = nicknameInput.trim()
    if (trimmed) {
      setCatNickname(trimmed)
    } else {
      setCatNickname('我家猫咪')
    }
    setShowNicknameModal(false)
    // 跳转到结果页
    const token = searchParams.get('token')
    const resultUrl = token ? `/result?token=${encodeURIComponent(token)}` : '/result'
    navigate(resultUrl)
  }

  const handleSkip = () => {
    setCatNickname('我家猫咪')
    setShowNicknameModal(false)
    const token = searchParams.get('token')
    const resultUrl = token ? `/result?token=${encodeURIComponent(token)}` : '/result'
    navigate(resultUrl)
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      goBack()
    } else {
      navigate('/')
    }
  }

  if (!currentQuestion) {
    return <div>加载中...</div>
  }

  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.score

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleBack}
          className="p-2 text-gray-600 hover:text-gray-800"
        >
          ← 返回
        </button>
        <span className="text-gray-500 font-medium">
          {currentQuestionIndex + 1}/{questions.length}
        </span>
        <div className="w-10" />
      </div>

      {/* 进度条 */}
      <ProgressBar progress={progress} />

      {/* 问题内容 */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <p className="text-xl text-gray-800 text-center leading-relaxed">
              {currentQuestion.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* 选项 */}
        <div className="space-y-3">
          {SCALE_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                currentAnswer === option.value
                  ? 'border-brand bg-brand/10'
                  : 'border-gray-200 bg-white hover:border-brand/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-2">{option.emoji}</span>
              <span className="font-medium">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 昵称输入弹窗 */}
      <AnimatePresence>
        {showNicknameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleSkip()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
            >
              {/* 猫咪图标 */}
              <motion.div
                className="text-center mb-6"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-5xl">🐱</span>
              </motion.div>

              {/* 主标题 */}
              <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
                请输入您家猫咪的昵称
              </h2>

              {/* 副标题 */}
              <p className="text-xs text-center text-gray-400 mb-6">
                这个名字会出现在测试结果中哦
              </p>

              {/* 输入框 */}
              <div className="mb-6">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value.slice(0, 8))}
                  onKeyDown={(e) => e.key === 'Enter' && handleNicknameSubmit()}
                  placeholder="例如：橘子、咪咪、大橘..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#E8927C] focus:border-[#E8927C] focus:ring-2 focus:ring-[#E8927C]/20 outline-none transition-all text-gray-700 placeholder:text-gray-300"
                  autoFocus
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {nicknameInput.length}/8
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                >
                  跳过
                </button>
                <button
                  onClick={handleNicknameSubmit}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#E8927C] text-white font-medium hover:bg-[#D07058] transition-colors"
                >
                  确认
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TestPage
