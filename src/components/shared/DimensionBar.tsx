import { DimensionScore } from '@/types'

interface DimensionBarProps {
  leftDimension: DimensionScore
  rightDimension: DimensionScore
  mbtiType?: string // 用于判断主导维度
}

// 温暖奶油色调 - 适中饱和度，舒适不刺眼
const DIMENSION_COLORS: Record<string, { dark: string; light: string; darkHex: string; lightHex: string }> = {
  // E/I - 温暖珊瑚橙/奶油橙
  E: { dark: 'bg-gradient-to-r from-[#E8927C] to-[#F0A090]', light: 'bg-gradient-to-r from-[#F5C4A0] to-[#FAD8B8]', darkHex: '#E8927C', lightHex: '#F5C4A0' },
  I: { dark: 'bg-gradient-to-r from-[#E8927C] to-[#F0A090]', light: 'bg-gradient-to-r from-[#F5C4A0] to-[#FAD8B8]', darkHex: '#E8927C', lightHex: '#F5C4A0' },
  // S/N - 清澈薄荷绿/淡雅薄荷
  S: { dark: 'bg-gradient-to-r from-[#6BB5A0] to-[#7CC5B0]', light: 'bg-gradient-to-r from-[#A8D8C8] to-[#B8E8D8]', darkHex: '#6BB5A0', lightHex: '#A8D8C8' },
  N: { dark: 'bg-gradient-to-r from-[#6BB5A0] to-[#7CC5B0]', light: 'bg-gradient-to-r from-[#A8D8C8] to-[#B8E8D8]', darkHex: '#6BB5A0', lightHex: '#A8D8C8' },
  // T/F - 舒适天空蓝/柔和天蓝
  T: { dark: 'bg-gradient-to-r from-[#5A9BC8] to-[#6AABD8]', light: 'bg-gradient-to-r from-[#9CC8E8] to-[#B8D8F0]', darkHex: '#5A9BC8', lightHex: '#9CC8E8' },
  F: { dark: 'bg-gradient-to-r from-[#5A9BC8] to-[#6AABD8]', light: 'bg-gradient-to-r from-[#9CC8E8] to-[#B8D8F0]', darkHex: '#5A9BC8', lightHex: '#9CC8E8' },
  // J/P - 温柔紫罗兰/淡雅薰衣草
  J: { dark: 'bg-gradient-to-r from-[#9B8DC7] to-[#AB9DD7]', light: 'bg-gradient-to-r from-[#C8BFE8] to-[#D8D0F0]', darkHex: '#9B8DC7', lightHex: '#C8BFE8' },
  P: { dark: 'bg-gradient-to-r from-[#9B8DC7] to-[#AB9DD7]', light: 'bg-gradient-to-r from-[#C8BFE8] to-[#D8D0F0]', darkHex: '#9B8DC7', lightHex: '#C8BFE8' },
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

// 维度文字颜色 - 温暖奶油色调
const DIMENSION_TEXT_COLORS: Record<string, string> = {
  E: 'text-[#D07058]',
  I: 'text-[#E8927C]',
  S: 'text-[#4A9580]',
  N: 'text-[#6BB5A0]',
  T: 'text-[#3A7BA8]',
  F: 'text-[#5A9BC8]',
  J: 'text-[#7B6DA7]',
  P: 'text-[#9B8DC7]',
}

export const DimensionBar = ({ leftDimension, rightDimension, mbtiType }: DimensionBarProps) => {
  // 判断是否是主导维度（包含在 mbtiType 中）
  const leftIsDominant = mbtiType?.includes(leftDimension.dimension) ?? false
  const rightIsDominant = mbtiType?.includes(rightDimension.dimension) ?? false

  // 获取颜色配置
  const leftColors = DIMENSION_COLORS[leftDimension.dimension]
  const rightColors = DIMENSION_COLORS[rightDimension.dimension]

  // 根据是否为主导维度选择深色或浅色
  const leftBg = leftIsDominant ? leftColors.dark : leftColors.light
  const rightBg = rightIsDominant ? rightColors.dark : rightColors.light
  const leftHex = leftIsDominant ? leftColors.darkHex : leftColors.lightHex
  const rightHex = rightIsDominant ? rightColors.darkHex : rightColors.lightHex

  // 胜出维度的百分比
  const leftPercentage = leftDimension.dominance || leftDimension.percentage
  const circlePosition = leftPercentage

  // 判断哪个维度胜出
  const leftIsWinning = leftDimension.isWinning ?? (leftDimension.score >= rightDimension.score)
  const winningHex = leftIsWinning ? leftHex : rightHex
  const winningTextColor = leftIsWinning ? DIMENSION_TEXT_COLORS[leftDimension.dimension] : DIMENSION_TEXT_COLORS[rightDimension.dimension]
  const displayPercentage = leftIsWinning ? leftPercentage : (100 - leftPercentage)

  return (
    <div className="grid grid-cols-[70px_1fr_70px] items-center h-12 gap-2">
      {/* 左侧维度标签 */}
      <div className="flex items-center gap-1">
        <span className={`font-bold text-lg ${DIMENSION_TEXT_COLORS[leftDimension.dimension]}`}>
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
            className={`h-full ${leftBg} transition-all duration-500`}
            style={{ width: `${circlePosition}%` }}
          />
          <div
            className={`h-full ${rightBg} transition-all duration-500`}
            style={{ width: `${100 - circlePosition}%` }}
          />
        </div>

        {/* 移动的圆圈 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-white border-2 shadow-sm flex items-center justify-center transition-all duration-500"
          style={{
            left: `${circlePosition}%`,
            borderColor: winningHex
          }}
        >
          <span className={`font-bold text-xs ${winningTextColor}`}>
            {displayPercentage}%
          </span>
        </div>
      </div>

      {/* 右侧维度标签 */}
      <div className="flex items-center justify-end gap-1">
        <span className="text-gray-500 text-xs">
          {DIMENSION_LABELS[rightDimension.dimension]}
        </span>
        <span className={`font-bold text-lg ${DIMENSION_TEXT_COLORS[rightDimension.dimension]}`}>
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
  // 简单版本默认使用深色
  const color = DIMENSION_COLORS[dimension]?.dark || 'bg-brand'

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
