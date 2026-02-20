// MBTI 类型
export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'

// 维度得分
export interface DimensionScore {
  dimension: string
  dimensionName?: string
  score: number
  percentage: number
  dominance?: number
  intensity: '微弱' | '轻微' | '中等' | '明显' | '强烈'
  isWinning?: boolean
}

// 测试结果
export interface TestResult {
  type: MBTIType
  typeName: string
  typeNickname: string
  typeDescription: string
  quote: string
  dimensionScores: DimensionScore[]
  allDimensionScores?: DimensionScore[]
  traits: string         // 性格特点段落（200-400字）
  traitTags: string[]    // 性格特点标签
  suggestions: string    // 相处建议段落（200-400字）
  suggestionTags: string[] // 相处建议标签
}

// 性格类型数据
export interface PersonalityType {
  type: MBTIType
  name: string
  nickname: string
  description: string
  quote: string
  traits: string         // 性格特点段落（200-400字）
  traitTags: string[]    // 性格特点标签
  suggestions: string    // 相处建议段落（200-400字）
  suggestionTags: string[] // 相处建议标签
}
