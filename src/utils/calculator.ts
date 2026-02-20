import { Answer, Question, MBTIType, DimensionScore, TestResult } from '@/types'
import { personalityTypes } from '@/data/personalityTypes'

// 维度配对（定义正向和负向维度）
const DIMENSION_PAIRS = [
  { positive: 'E', negative: 'I' },
  { positive: 'S', negative: 'N' },
  { positive: 'T', negative: 'F' },
  { positive: 'J', negative: 'P' },
]

// 题目设计的基准维度（题目以哪个维度为基准设计）
// 正向题分数加到基准维度，反向题分数加到对立维度
const QUESTION_BASE_DIMENSIONS: Record<string, string> = {
  E: 'E', // E/I 以 E 为基准
  I: 'E',
  S: 'N', // S/N 以 N 为基准（S的分数来自N的反向题）
  N: 'N',
  T: 'F', // T/F 以 F 为基准（T的分数来自F的反向题）
  F: 'F',
  J: 'J', // J/P 以 J 为基准
  P: 'J',
}

// 维度中文名称
const DIMENSION_NAMES: Record<string, string> = {
  E: '外向',
  I: '内向',
  S: '务实',
  N: '好奇',
  T: '独立',
  F: '粘人',
  J: '规律',
  P: '随性',
}

// 根据题目维度和方向，确定分数应该加到哪个维度
// 正向题：分数加到当前维度
// 反向题：分数加到对立维度
const DIMENSION_OPPOSITES: Record<string, string> = {
  E: 'I', I: 'E',
  S: 'N', N: 'S',
  T: 'F', F: 'T',
  J: 'P', P: 'J',
}

// 强度判定（基于相对百分比差异）
function getIntensity(percentage: number): DimensionScore['intensity'] {
  if (percentage <= 55) return '微弱'
  if (percentage <= 65) return '轻微'
  if (percentage <= 75) return '中等'
  if (percentage <= 85) return '明显'
  return '强烈'
}

// 计算维度得分
// 关键逻辑：正向题得分加到该维度，反向题得分加到对立维度
function calculateDimensionScores(
  questions: Question[],
  answers: Answer[]
): Map<string, number> {
  const dimensionScores = new Map<string, number>()

  questions.forEach((question) => {
    const answer = answers.find((a) => a.questionId === question.id)
    if (!answer) return

    // 确定分数应该加到哪个维度
    // 正向题：加到当前维度（高分=该维度特征明显）
    // 反向题：加到对立维度（高分=对立维度特征明显）
    const targetDimension = question.direction === 'positive'
      ? question.dimension
      : DIMENSION_OPPOSITES[question.dimension]

    const currentScore = dimensionScores.get(targetDimension) || 0
    dimensionScores.set(targetDimension, currentScore + answer.score)
  })

  return dimensionScores
}

// 计算MBTI类型
function calculateMBTIType(dimensionScores: Map<string, number>): MBTIType {
  let type = ''

  DIMENSION_PAIRS.forEach(({ positive, negative }) => {
    const positiveScore = dimensionScores.get(positive) || 0
    const negativeScore = dimensionScores.get(negative) || 0

    if (positiveScore >= negativeScore) {
      type += positive
    } else {
      type += negative
    }
  })

  return type as MBTIType
}

// 计算所有8个维度的百分比
function calculateAllDimensionPercentages(
  dimensionScores: Map<string, number>,
  questions: Question[]
): DimensionScore[] {
  const results: DimensionScore[] = []

  DIMENSION_PAIRS.forEach(({ positive, negative }) => {
    // 找到该维度对对应的题目基准维度
    const baseDim = QUESTION_BASE_DIMENSIONS[positive]

    // 计算每个维度的问题数量
    // 基准维度的正向题分数加到基准维度
    // 基准维度的反向题分数加到对立维度
    const positiveDirectionCount = questions.filter(
      (q) => q.dimension === baseDim && q.direction === 'positive'
    ).length
    const negativeDirectionCount = questions.filter(
      (q) => q.dimension === baseDim && q.direction === 'negative'
    ).length

    // 确定哪个维度对应正向题，哪个对应反向题
    // 如果基准维度是positive（如E、J），则正向题→positive，反向题→negative
    // 如果基准维度是negative（如N、F），则正向题→negative，反向题→positive
    const isBasePositive = baseDim === positive
    const positiveMax = (isBasePositive ? positiveDirectionCount : negativeDirectionCount) * 5
    const negativeMax = (isBasePositive ? negativeDirectionCount : positiveDirectionCount) * 5

    const positiveScore = dimensionScores.get(positive) || 0
    const negativeScore = dimensionScores.get(negative) || 0

    // 计算每个维度相对于自身最大值的百分比
    const positivePercentage = positiveMax > 0 ? Math.round((positiveScore / positiveMax) * 100) : 0
    const negativePercentage = negativeMax > 0 ? Math.round((negativeScore / negativeMax) * 100) : 0

    // 计算主导百分比（胜出方在对立总分中的占比）
    const totalScore = positiveScore + negativeScore
    const positiveDominance = totalScore > 0 ? Math.round((positiveScore / totalScore) * 100) : 50
    const negativeDominance = totalScore > 0 ? Math.round((negativeScore / totalScore) * 100) : 50

    // 添加正向维度
    results.push({
      dimension: positive,
      dimensionName: DIMENSION_NAMES[positive],
      score: positiveScore,
      percentage: positivePercentage,
      dominance: positiveDominance,
      intensity: getIntensity(positiveDominance),
      isWinning: positiveScore >= negativeScore,
    })

    // 添加负向维度
    results.push({
      dimension: negative,
      dimensionName: DIMENSION_NAMES[negative],
      score: negativeScore,
      percentage: negativePercentage,
      dominance: negativeDominance,
      intensity: getIntensity(negativeDominance),
      isWinning: negativeScore > positiveScore,
    })
  })

  return results
}

// 获取主导维度（每个维度对的胜出方）
function getWinningDimensions(
  dimensionScores: Map<string, number>
): DimensionScore[] {
  const results: DimensionScore[] = []

  DIMENSION_PAIRS.forEach(({ positive, negative }) => {
    const positiveScore = dimensionScores.get(positive) || 0
    const negativeScore = dimensionScores.get(negative) || 0

    const totalScore = positiveScore + negativeScore

    if (positiveScore >= negativeScore) {
      const dominance = totalScore > 0 ? Math.round((positiveScore / totalScore) * 100) : 50
      results.push({
        dimension: positive,
        dimensionName: DIMENSION_NAMES[positive],
        score: positiveScore,
        percentage: dominance,
        dominance: dominance,
        intensity: getIntensity(dominance),
        isWinning: true,
      })
    } else {
      const dominance = totalScore > 0 ? Math.round((negativeScore / totalScore) * 100) : 50
      results.push({
        dimension: negative,
        dimensionName: DIMENSION_NAMES[negative],
        score: negativeScore,
        percentage: dominance,
        dominance: dominance,
        intensity: getIntensity(dominance),
        isWinning: true,
      })
    }
  })

  return results
}

// 主计算函数
export function calculateResult(
  questions: Question[],
  answers: Answer[]
): TestResult {
  const dimensionScores = calculateDimensionScores(questions, answers)
  const mbtiType = calculateMBTIType(dimensionScores)
  const allDimensionPercentages = calculateAllDimensionPercentages(dimensionScores, questions)
  const winningDimensions = getWinningDimensions(dimensionScores)

  const personalityType = personalityTypes[mbtiType]

  return {
    type: mbtiType,
    typeName: personalityType.name,
    typeNickname: personalityType.nickname,
    typeDescription: personalityType.description,
    quote: personalityType.quote,
    dimensionScores: winningDimensions,
    allDimensionScores: allDimensionPercentages,
    traits: personalityType.traits,
    traitTags: personalityType.traitTags,
    suggestions: personalityType.suggestions,
    suggestionTags: personalityType.suggestionTags,
  }
}
