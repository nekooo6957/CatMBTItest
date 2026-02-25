import { DimensionScore } from '@/types'

interface DimensionBarProps {
  leftDimension: DimensionScore
  rightDimension: DimensionScore
}

// 同色系颜色方案 - 每个维度的两端使用同色系的不同深浅，保证清晰度
const DIMENSION_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  // E/I - 橙色系：E 深橙，I 浅橙
  E: { bg: 'bg-gradient-to-r from-orange-600 to-orange-500', text: 'text-orange-600', hex: '#EA580C' },
  I: { bg: 'bg-gradient-to-r from-orange-300 to-orange-200', text: 'text-orange-500', hex: '#FDBA74' },
  // S/N - 蓝色系：S 深蓝，N 浅蓝
  S: { bg: 'bg-gradient-to-r from-blue-600 to-blue-500', text: 'text-blue-600', hex: '#2563EB' },
  N: { bg: 'bg-gradient-to-r from-blue-300 to-blue-200', text: 'text-blue-500', hex: '#93C5FD' },
  // T/F - 绿色系：T 深绿，F 浅绿
  T: { bg: 'bg-gradient-to-r from-emerald-600 to-emerald-500', text: 'text-emerald-600', hex: '#059669' },
  F: { bg: 'bg-gradient-to-r from-emerald-300 to-emerald-200', text: 'text-emerald-500', hex: '#6EE7B7' },
  // J/P - 紫色系：J 深紫，P 浅紫
  J: { bg: 'bg-gradient-to-r from-violet-600 to-violet-500', text: 'text-violet-600', hex: '#7C3AED' },
  P: { bg: 'bg-gradient-to-r from-violet-300 to-violet-200', text: 'text-violet-500', hex: '#C4B5FD' },
}

const DIMENSION_LABELS: Record<string, string> = {
  E: '外向',
  I: '内向',
  S: '务实',
  N: '好奇',
  T: '独立',
  F: '粘人',
  J: '规律',
  P: '随性',
}

export const DimensionBar = ({ leftDimension, rightDimension }: DimensionBarProps) => {
  const leftColor = DIMENSION_COLORS[leftDimension.dimension] || { bg: 'bg-brand', text: 'text-brand', hex: '#F97316' }
  const rightColor = DIMENSION_COLORS[rightDimension.dimension] || { bg: 'bg-gray-400', text: 'text-gray-400', hex: '#9CA3AF' }

  // 胜出维度的百分比
  const leftPercentage = leftDimension.dominance || leftDimension.percentage
  const circlePosition = leftPercentage

  // 判断哪个维度胜出
  const leftIsWinning = leftDimension.isWinning ?? (leftDimension.score >= rightDimension.score)
  const winningColor = leftIsWinning ? leftColor : rightColor
  const displayPercentage = leftIsWinning ? leftPercentage : (100 - leftPercentage)

  return (
    <div className="grid grid-cols-[70px_1fr_70px] items-center h-12 gap-2">
      {/* 左侧维度标签 */}
      <div className="flex items-center gap-1">
        <span className={`font-bold text-lg ${leftColor.text}`}>
          {leftDimension.dimension}
        </span>
        <span className="text-gray-500 text-xs">
          {DIMENSION_LABELS[leftDimension.dimension]}
        </span>
      </div>

      {/* 进度条区域 */}
      <div className="relative h-6 flex items-center">
        <div className="w-full h-3 rounded-full overflow-hidden flex">
          <div
            className={`h-full ${leftColor.bg} transition-all duration-500`}
            style={{ width: `${circlePosition}%` }}
          />
          <div
            className={`h-full ${rightColor.bg} transition-all duration-500`}
            style={{ width: `${100 - circlePosition}%` }}
          />
        </div>

        {/* 移动的圆圈 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-white border-2 shadow-sm flex items-center justify-center transition-all duration-500"
          style={{
            left: `${circlePosition}%`,
            borderColor: winningColor.hex
          }}
        >
          <span className={`font-bold text-xs ${winningColor.text}`}>
            {displayPercentage}%
          </span>
        </div>
      </div>

      {/* 右侧维度标签 */}
      <div className="flex items-center justify-end gap-1">
        <span className="text-gray-500 text-xs">
          {DIMENSION_LABELS[rightDimension.dimension]}
        </span>
        <span className={`font-bold text-lg ${rightColor.text}`}>
          {rightDimension.dimension}
        </span>
      </div>
    </div>
  )
}

// 导出一个简单的版本，用于兼容旧的数据结构
interface SimpleDimensionBarProps {
  dimension: string
  percentage: number
  intensity: string
}

export const SimpleDimensionBar = ({ dimension, percentage }: SimpleDimensionBarProps) => {
  const color = DIMENSION_COLORS[dimension]?.bg || 'bg-brand'

  return (
    <div className="flex items-center gap-3">
      <span className="w-8 font-bold text-gray-700">{dimension}</span>
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-20 text-right text-sm">
        <span className="font-semibold">{percentage}%</span>
      </span>
    </div>
  )
}
