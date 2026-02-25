import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { DimensionScore } from '@/types'

interface RadarChartProps {
  data: DimensionScore[]
  typeColor?: string // MBTI 类型主题色
}

const DIMENSION_LABELS: Record<string, string> = {
  E: '外向E',
  I: '内向I',
  S: '务实S',
  N: '好奇N',
  T: '独立T',
  F: '粘人F',
  J: '规律J',
  P: '随性P',
}

// 维度颜色映射
const getDimensionColor = (dim: string): string => {
  const colors: Record<string, string> = {
    E: '#FB923C',
    I: '#FDA4AF',
    S: '#22D3EE',
    N: '#7DD3FC',
    T: '#34D399',
    F: '#5EEAD4',
    J: '#A78BFA',
    P: '#F0ABFC',
  }
  return colors[dim] || '#F97316'
}

export const RadarChart = ({ data, typeColor = '#FF8C6B' }: RadarChartProps) => {
  // 按固定顺序排列维度
  const orderedDimensions = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']
  const chartData = orderedDimensions.map(dim => {
    const score = data.find(d => d.dimension === dim)
    return {
      dimension: DIMENSION_LABELS[dim],
      fullDimension: dim,
      percentage: score?.percentage || 50,
      isWinning: score?.isWinning,
      color: getDimensionColor(dim),
    }
  })

  // 生成唯一的 gradient id
  const gradientId = `radarGradient-${typeColor.replace('#', '')}`
  const filterId = `radarGlow-${typeColor.replace('#', '')}`

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={typeColor} stopOpacity={0.5} />
              <stop offset="50%" stopColor={typeColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={typeColor} stopOpacity={0.5} />
            </linearGradient>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <PolarGrid
            stroke="#E8DDD4"
            strokeWidth={1}
            radialLines={true}
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#6B635B', fontSize: 11, fontWeight: 500 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={22.5}
            domain={[0, 100]}
            tick={{ fill: '#A8A098', fontSize: 9 }}
            tickCount={4}
            axisLine={{ stroke: '#E8DDD4' }}
          />
          <Radar
            name="得分"
            dataKey="percentage"
            stroke={typeColor}
            fill={`url(#${gradientId})`}
            fillOpacity={0.8}
            strokeWidth={2.5}
            filter={`url(#${filterId})`}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
