// 问题维度类型
export type Dimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'

// 问题方向类型
export type Direction = 'positive' | 'negative'

// 5点量表分数类型
export type Score = 1 | 2 | 3 | 4 | 5

// 单个问题类型
export interface Question {
  id: number
  text: string
  dimension: Dimension
  direction: Direction
}

// 用户答案类型
export interface Answer {
  questionId: number
  score: Score
}

// 5点量表选项（从上到下：非常符合 -> 非常不符合）
export const SCALE_OPTIONS: { value: Score; label: string; emoji: string }[] = [
  { value: 5, label: '非常符合', emoji: '😻' },
  { value: 4, label: '较为符合', emoji: '😸' },
  { value: 3, label: '一般符合', emoji: '😐' },
  { value: 2, label: '较不符合', emoji: '🙀' },
  { value: 1, label: '非常不符合', emoji: '😿' },
]
