import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTestStore, useProgress } from '@/store/testStore'
import { SCALE_OPTIONS } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'

const TestPage = () => {
  const navigate = useNavigate()
  const { currentQuestionIndex, questions, answers, answerQuestion, goBack } = useTestStore()
  const progress = useProgress()

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = (score: 1 | 2 | 3 | 4 | 5) => {
    answerQuestion(currentQuestion.id, score)

    if (currentQuestionIndex === questions.length - 1) {
      navigate('/result')
    }
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
    </div>
  )
}

export default TestPage
