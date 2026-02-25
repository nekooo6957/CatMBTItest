import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Answer, Score, TestResult } from '@/types'
import { questions } from '@/data/questions'
import { calculateResult } from '@/utils/calculator'

interface TestState {
  // 状态
  currentQuestionIndex: number
  questions: typeof questions
  answers: Answer[]
  result: TestResult | null
  catNickname: string

  // 操作
  answerQuestion: (questionId: number, score: Score) => void
  goBack: () => void
  resetTest: () => void
  getProgress: () => number
  setCatNickname: (nickname: string) => void
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentQuestionIndex: 0,
      questions: questions,
      answers: [],
      result: null,
      catNickname: '',

      // 回答问题
      answerQuestion: (questionId, score) => {
        set((state) => {
          const existingIndex = state.answers.findIndex(
            (a) => a.questionId === questionId
          )

          let newAnswers: Answer[]
          if (existingIndex >= 0) {
            // 更新已有答案
            newAnswers = [...state.answers]
            newAnswers[existingIndex] = { questionId, score }
          } else {
            // 添加新答案
            newAnswers = [...state.answers, { questionId, score }]
          }

          // 检查是否完成所有问题
          const isComplete = newAnswers.length === state.questions.length
          let result = state.result

          if (isComplete) {
            result = calculateResult(state.questions, newAnswers)
          }

          return {
            answers: newAnswers,
            currentQuestionIndex: Math.min(
              state.currentQuestionIndex + 1,
              state.questions.length - 1
            ),
            result,
          }
        })
      },

      // 返回上一题
      goBack: () => {
        set((state) => ({
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        }))
      },

      // 重置测试
      resetTest: () => {
        set({
          currentQuestionIndex: 0,
          answers: [],
          result: null,
          catNickname: '',
        })
      },

      // 设置猫咪昵称
      setCatNickname: (nickname) => {
        set({ catNickname: nickname })
      },

      // 获取进度
      getProgress: () => {
        const state = get()
        return Math.round((state.answers.length / state.questions.length) * 100)
      },
    }),
    {
      name: 'cat-mbti-storage',
      partialize: (state) => ({
        answers: state.answers,
        result: state.result,
        currentQuestionIndex: state.currentQuestionIndex,
        catNickname: state.catNickname,
      }),
    }
  )
)

// Hook for progress
export const useProgress = () => {
  const answers = useTestStore((state) => state.answers)
  const questions = useTestStore((state) => state.questions)
  return Math.round((answers.length / questions.length) * 100)
}
