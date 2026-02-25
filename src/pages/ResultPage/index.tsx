import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTestStore } from '@/store/testStore'
import { RadarChart } from '@/components/shared/RadarChart'
import { DimensionBar } from '@/components/shared/DimensionBar'
import { DimensionScore, TestResult, MBTIType } from '@/types'
import { getCurrentToken } from '@/utils/tokenAuth'

// MBTI 类型到猫咪图片的映射
const CAT_IMAGES: Partial<Record<MBTIType, string>> = {
  // 分析家 (NT) - 紫色
  INTP: '/cats/INTP.jpg',
  ENTP: '/cats/ENTP.jpg',
  INTJ: '/cats/INTJ.jpg',
  ENTJ: '/cats/ENTJ.jpg',
  // 外交家 (NF) - 绿色
  INFP: '/cats/INFP.jpg',
  ENFP: '/cats/ENFP.jpg',
  INFJ: '/cats/INFJ.jpg',
  ENFJ: '/cats/ENFJ.jpg',
  // 守护者 (SJ) - 蓝色
  ISTJ: '/cats/ISTJ.jpg',
  ISFJ: '/cats/ISFJ.jpg',
  ESTJ: '/cats/ESTJ.jpg',
  ESFJ: '/cats/ESFJ.jpg',
  // 探险家 (SP) - 黄色
  ISTP: '/cats/ISTP.jpg',
  ISFP: '/cats/ISFP.jpg',
  ESTP: '/cats/ESTP.jpg',
  ESFP: '/cats/ESFP.jpg',
}

// 维度配对
const DIMENSION_PAIRS = [
  { positive: 'E', negative: 'I', positiveName: '外向', negativeName: '内向' },
  { positive: 'S', negative: 'N', positiveName: '务实', negativeName: '好奇' },
  { positive: 'T', negative: 'F', positiveName: '独立', negativeName: '粘人' },
  { positive: 'J', negative: 'P', positiveName: '规律', negativeName: '随性' },
]

// 维度颜色 - 莫兰迪色调，低饱和度
const DIMENSION_COLORS: Record<string, { dark: string; light: string }> = {
  // E/I - 莫兰迪橙/赭石色
  E: { dark: '#C4A484', light: '#E8D4C4' },
  I: { dark: '#C4A484', light: '#E8D4C4' },
  // S/N - 莫兰迪蓝/灰蓝色
  S: { dark: '#8FA5B8', light: '#C8D4E0' },
  N: { dark: '#8FA5B8', light: '#C8D4E0' },
  // T/F - 莫兰迪绿/灰绿色
  T: { dark: '#8FB8A8', light: '#C8E0D8' },
  F: { dark: '#8FB8A8', light: '#C8E0D8' },
  // J/P - 莫兰迪紫/灰紫色
  J: { dark: '#A898B8', light: '#D8D0E0' },
  P: { dark: '#A898B8', light: '#D8D0E0' },
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

// 浮动装饰元素组件
const FloatingPaw = ({ delay, className }: { delay: number; className: string }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    animate={{
      y: [0, -8, 0],
      rotate: [0, 10, -10, 0],
      opacity: [0.15, 0.25, 0.15],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <span className="text-xl">🐾</span>
  </motion.div>
)

// 性格主题色配置（按 MBTI 四大类分组）
// 分析家 (NT) - 紫色 | 外交家 (NF) - 绿色 | 守护者 (SJ) - 蓝色 | 探险家 (SP) - 黄色
const TYPE_COLORS: Record<string, string> = {
  // 分析家 - 紫色
  INTJ: '#7C3AED', INTP: '#7C3AED', ENTJ: '#7C3AED', ENTP: '#7C3AED',
  // 外交家 - 绿色
  INFJ: '#10B981', INFP: '#10B981', ENFJ: '#10B981', ENFP: '#10B981',
  // 守护者 - 蓝色
  ISTJ: '#3B82F6', ISFJ: '#3B82F6', ESTJ: '#3B82F6', ESFJ: '#3B82F6',
  // 探险家 - 黄色
  ISTP: '#F59E0B', ISFP: '#F59E0B', ESTP: '#F59E0B', ESFP: '#F59E0B',
}

// 加载图片的辅助函数
const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// 绘制圆角矩形辅助函数
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[]
) => {
  const radii = typeof r === 'number' ? [r, r, r, r] : r
  const [tl, tr, br, bl] = radii as number[]
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr)
  ctx.lineTo(x + w, y + h - br)
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
  ctx.lineTo(x + bl, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl)
  ctx.lineTo(x, y + tl)
  ctx.quadraticCurveTo(x, y, x + tl, y)
  ctx.closePath()
}

// 绘制平滑雷达图（与 Recharts 版本一致）
const drawRadarChart = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  data: DimensionScore[],
  typeColor: string
) => {
  const dimensions = ['E', 'S', 'T', 'J', 'I', 'N', 'F', 'P'] // 与 Recharts 一致的顺序
  const dimLabels: Record<string, string> = {
    E: '外向E', I: '内向I', S: '务实S', N: '好奇N',
    T: '独立T', F: '粘人F', J: '规律J', P: '随性P'
  }
  // 莫兰迪色调
  const dimColors: Record<string, string> = {
    E: '#C4A484', I: '#E8D4C4', S: '#8FA5B8', N: '#C8D4E0',
    T: '#8FB8A8', F: '#C8E0D8', J: '#A898B8', P: '#D8D0E0'
  }

  const angleStep = (Math.PI * 2) / dimensions.length
  const startAngle = -Math.PI / 2 // 从顶部开始

  // 绘制同心圆网格
  ctx.strokeStyle = '#E8DDD4'
  ctx.lineWidth = 1
  for (let i = 1; i <= 4; i++) {
    const r = (radius * i) / 4
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // 绘制轴线
  ctx.strokeStyle = '#E8DDD4'
  ctx.lineWidth = 1
  for (let i = 0; i < dimensions.length; i++) {
    const angle = startAngle + i * angleStep
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    ctx.stroke()
  }

  // 计算数据点
  const points = dimensions.map((dim, i) => {
    const score = data.find(d => d.dimension === dim)
    const percentage = score?.percentage || 50
    const r = (percentage / 100) * radius
    const angle = startAngle + i * angleStep
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      percentage,
      color: dimColors[dim],
      angle,
      label: dimLabels[dim]
    }
  })

  // 绘制填充区域（使用渐变，类似 Recharts）
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  gradient.addColorStop(0, typeColor + '66') // 中心更透明
  gradient.addColorStop(0.5, typeColor + '44')
  gradient.addColorStop(1, typeColor + '22') // 边缘更透明

  ctx.beginPath()
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  })
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  // 绘制边框线（带发光效果）
  ctx.beginPath()
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  })
  ctx.closePath()
  ctx.strokeStyle = typeColor
  ctx.lineWidth = 2.5
  ctx.stroke()

  // 绘制标签（简化版，只显示中文）
  const simpleLabels: Record<string, string> = {
    E: '外向', I: '内向', S: '务实', N: '好奇',
    T: '独立', F: '粘人', J: '规律', P: '随性'
  }
  ctx.font = 'bold 15px system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  points.forEach(p => {
    const labelR = radius + 32
    const lx = cx + Math.cos(p.angle) * labelR
    const ly = cy + Math.sin(p.angle) * labelR

    // 根据位置调整对齐
    if (Math.abs(lx - cx) < 10) {
      ctx.textAlign = 'center'
    } else if (lx > cx) {
      ctx.textAlign = 'left'
    } else {
      ctx.textAlign = 'right'
    }

    ctx.fillStyle = p.color
    ctx.fillText(simpleLabels[p.label.charAt(0)] || p.label, lx, ly)
  })
}

// 生成结果图片 - 与结果页一致的卡片式布局
const generateResultImage = async (result: TestResult): Promise<Blob> => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas not supported'))

  // 预加载猫咪图片
  const catImageSrc = CAT_IMAGES[result.type]
  const catImage = catImageSrc ? await loadImage(catImageSrc) : null

  const width = 750
  const margin = 48  // 增大边距
  const cardPadding = 32  // 卡片内边距也增大
  const contentWidth = width - margin * 2

  // 文字自动换行函数
  const wrapText = (text: string, maxWidth: number, fontSize: number, lineHeight: number): { lines: string[], height: number } => {
    const lines: string[] = []
    let currentLine = ''
    ctx.font = `${fontSize}px system-ui, sans-serif`

    for (const char of text) {
      const testLine = currentLine + char
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    return { lines, height: lines.length * lineHeight }
  }

  // 计算标签行数和高度
  const calculateTagsLayout = (tags: string[], fontSize: number, tagH: number, tagPadding: number, maxW: number): { rows: number, height: number } => {
    ctx.font = `${fontSize}px system-ui, sans-serif`
    let currentX = 0
    let rows = 1

    tags.forEach(tag => {
      const tagW = ctx.measureText(tag).width + tagPadding * 2
      if (currentX + tagW > maxW) {
        rows++
        currentX = tagW + 8
      } else {
        currentX += tagW + 8
      }
    })
    return { rows, height: rows * (tagH + 8) }
  }

  // 主题色
  const typeColor = TYPE_COLORS[result.type] || '#FF8C6B'

  // 预计算内容高度
  const innerCardWidth = contentWidth - cardPadding * 2
  const descResult = wrapText(result.typeDescription || '', innerCardWidth, 21, 34)
  const traitsResult = wrapText(result.traits || '', innerCardWidth - 20, 20, 32)
  const suggestionsResult = wrapText(result.suggestions || '', innerCardWidth - 20, 20, 32)
  const traitTagsLayout = calculateTagsLayout(result.traitTags || [], 16, 32, 14, innerCardWidth - 20)
  const suggestionTagsLayout = calculateTagsLayout(result.suggestionTags || [], 16, 32, 14, innerCardWidth - 20)

  // 计算总高度
  let totalHeight = margin * 2
  totalHeight += 100 // 顶部猫咪区域
  totalHeight += 100 // MBTI 类型
  totalHeight += 45 // 类型名称
  totalHeight += 50 // 昵称徽章
  totalHeight += 45 // 引用
  totalHeight += 20 // 间距
  totalHeight += descResult.height + 25 // 描述
  totalHeight += 25 // 间距
  totalHeight += 340 // 雷达图卡片
  totalHeight += 20 // 间距
  totalHeight += 70 + DIMENSION_PAIRS.length * 78 // 维度分析卡片
  totalHeight += 20 // 间距
  totalHeight += 60 + traitTagsLayout.height + 25 + traitsResult.height + 30 // 性格特点卡片
  totalHeight += 20 // 间距
  totalHeight += 60 + suggestionTagsLayout.height + 25 + suggestionsResult.height + 30 // 相处建议卡片
  totalHeight += 80 // 底部

  const height = totalHeight
  canvas.width = width
  canvas.height = height

  // === 背景 ===
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#FFFBF7')
  bgGradient.addColorStop(0.5, '#FFF8F0')
  bgGradient.addColorStop(1, '#FFF3E8')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // 装饰性光晕
  const drawGlow = (x: number, y: number, r: number, color: string) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  drawGlow(width * 0.2, 200, 180, 'rgba(255, 200, 180, 0.15)')
  drawGlow(width * 0.8, 500, 200, 'rgba(255, 180, 160, 0.12)')

  // === 头部区域：猫咪 + 类型信息 ===
  let y = margin + 30

  // 猫咪头像
  const catSize = 140
  const catCenterY = y + catSize / 2

  // 背景光晕
  const catGlow = ctx.createRadialGradient(width / 2, catCenterY, 0, width / 2, catCenterY, 90)
  catGlow.addColorStop(0, typeColor + '30')
  catGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = catGlow
  ctx.beginPath()
  ctx.arc(width / 2, catCenterY, 90, 0, Math.PI * 2)
  ctx.fill()

  // 绘制猫咪图片
  const catX = width / 2 - catSize / 2
  const catY = y
  if (catImage) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(width / 2, catCenterY, catSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(catImage, catX, catY, catSize, catSize)
    ctx.restore()

    // 圆形边框
    ctx.strokeStyle = typeColor + '50'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(width / 2, catCenterY, catSize / 2, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.font = '64px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🐱', width / 2, catCenterY)
  }

  // 移动到猫咪下方
  y += catSize + 70

  // MBTI 类型
  ctx.fillStyle = typeColor
  ctx.font = 'bold 80px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(result.type, width / 2, y)
  y += 50

  // 类型名称
  ctx.fillStyle = typeColor
  ctx.font = '32px system-ui, sans-serif'
  ctx.fillText(result.typeName, width / 2, y)
  y += 45

  // 昵称徽章
  ctx.font = 'italic 22px system-ui, sans-serif'
  const nicknameText = `「${result.typeNickname}」`
  const nicknameW = ctx.measureText(nicknameText).width + 48
  const badgeY = y - 28
  ctx.fillStyle = typeColor + '18'
  roundRect(ctx, width / 2 - nicknameW / 2, badgeY, nicknameW, 44, 22)
  ctx.fill()
  ctx.strokeStyle = typeColor + '50'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = typeColor
  ctx.fillText(nicknameText, width / 2, y - 2)
  y += 50

  // 引用
  ctx.fillStyle = '#8B8178'
  ctx.font = 'italic 20px system-ui, sans-serif'
  ctx.fillText(`"${result.quote}"`, width / 2, y)
  y += 45

  // 描述 - 左对齐更利于阅读
  ctx.fillStyle = '#5C5650'
  ctx.font = '21px system-ui, sans-serif'
  ctx.textAlign = 'left'
  const descX = margin + cardPadding
  descResult.lines.forEach(line => {
    ctx.fillText(line, descX, y)
    y += 34
  })
  y += 35
  ctx.textAlign = 'center'

  // === 绘制卡片辅助函数 ===
  const drawCard = (cardY: number, cardH: number) => {
    // 卡片阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
    roundRect(ctx, margin + 3, cardY + 3, contentWidth, cardH, 24)
    ctx.fill()

    // 卡片背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    roundRect(ctx, margin, cardY, contentWidth, cardH, 24)
    ctx.fill()

    // 卡片边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // === 雷达图卡片 ===
  const radarCardH = 320
  drawCard(y, radarCardH)

  // 卡片标题
  ctx.fillStyle = '#4A4540'
  ctx.font = 'bold 24px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('✦ 性格雷达图', margin + cardPadding, y + 40)

  // 绘制雷达图
  drawRadarChart(ctx, width / 2, y + 175, 95, result.allDimensionScores || result.dimensionScores, typeColor)

  y += radarCardH + 20

  // === 性格维度卡片 ===
  const dimCardH = 60 + DIMENSION_PAIRS.length * 78
  drawCard(y, dimCardH)

  ctx.fillStyle = '#4A4540'
  ctx.font = 'bold 24px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('✦ 性格维度', margin + cardPadding, y + 40)

  let dimY = y + 70
  const labelW = 90
  const barMaxW = innerCardWidth - labelW * 2 - 20

  // 获取 MBTI 类型，用于判断主导维度
  const mbtiType = result.type

  DIMENSION_PAIRS.forEach(({ positive, negative }) => {
    const allScores = result.allDimensionScores || result.dimensionScores
    const posScore = allScores.find(d => d.dimension === positive)
    const negScore = allScores.find(d => d.dimension === negative)

    if (!posScore || !negScore) return

    const leftIsWinning = posScore.isWinning ?? (posScore.score >= negScore.score)
    const leftDim = leftIsWinning ? positive : negative
    const rightDim = leftIsWinning ? negative : positive
    const leftPercent = leftIsWinning
      ? (posScore.dominance || posScore.percentage)
      : (negScore.dominance || negScore.percentage)

    // 判断是否是主导维度（包含在 MBTI 类型中）
    const leftIsDominant = mbtiType?.includes(leftDim) ?? false
    const rightIsDominant = mbtiType?.includes(rightDim) ?? false

    // 根据是否为主导维度选择深浅色
    const leftColor = leftIsDominant ? DIMENSION_COLORS[leftDim].dark : DIMENSION_COLORS[leftDim].light
    const rightColor = rightIsDominant ? DIMENSION_COLORS[rightDim].dark : DIMENSION_COLORS[rightDim].light
    const winningColor = leftIsWinning
      ? (leftIsDominant ? DIMENSION_COLORS[leftDim].dark : DIMENSION_COLORS[leftDim].light)
      : (rightIsDominant ? DIMENSION_COLORS[rightDim].dark : DIMENSION_COLORS[rightDim].light)
    const displayPercent = leftIsWinning ? leftPercent : (100 - leftPercent)

    const barX = margin + cardPadding + labelW
    const barH = 20
    const barY = dimY + 8
    const leftW = (leftPercent / 100) * barMaxW
    const rightW = barMaxW - leftW

    // 左侧标签
    ctx.fillStyle = leftColor
    ctx.font = 'bold 24px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(leftDim, margin + cardPadding, dimY + 22)
    ctx.fillStyle = '#6B7280'
    ctx.font = '18px system-ui, sans-serif'
    ctx.fillText(DIMENSION_LABELS[leftDim], margin + cardPadding + 30, dimY + 22)

    // 右侧标签
    ctx.fillStyle = '#6B7280'
    ctx.font = '18px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(DIMENSION_LABELS[rightDim], margin + cardPadding + innerCardWidth - 30, dimY + 22)
    ctx.fillStyle = rightColor
    ctx.font = 'bold 24px system-ui, sans-serif'
    ctx.fillText(rightDim, margin + cardPadding + innerCardWidth, dimY + 22)

    // 进度条背景
    ctx.fillStyle = '#F3F4F6'
    roundRect(ctx, barX, barY, barMaxW, barH, 10)
    ctx.fill()

    // 左侧进度条
    ctx.fillStyle = leftColor
    roundRect(ctx, barX, barY, leftW, barH, leftW < barMaxW ? [10, 0, 0, 10] : 10)
    ctx.fill()

    // 右侧进度条
    ctx.fillStyle = rightColor
    roundRect(ctx, barX + leftW, barY, rightW, barH, rightW < barMaxW ? [0, 10, 10, 0] : 10)
    ctx.fill()

    // 中间圆圈
    const circleX = barX + leftW
    const circleY = barY + barH / 2
    const circleR = 26

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = winningColor
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = winningColor
    ctx.font = 'bold 15px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${displayPercent}%`, circleX, circleY)

    dimY += 78
  })

  y += dimCardH + 20

  // === 性格特点卡片 ===
  const traitsCardH = 60 + traitTagsLayout.height + 25 + traitsResult.height + 30
  drawCard(y, traitsCardH)

  ctx.fillStyle = '#4A4540'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('✦ 性格特点', margin + cardPadding, y + 45)

  // 标签 - 使用类型主题色
  ctx.font = '16px system-ui, sans-serif'
  let tagX = margin + cardPadding
  let tagY = y + 75
  const tagH = 32
  result.traitTags?.forEach((tag) => {
    const tagW = ctx.measureText(tag).width + 28
    if (tagX + tagW > margin + cardPadding + innerCardWidth) {
      tagX = margin + cardPadding
      tagY += tagH + 8
    }

    ctx.fillStyle = typeColor + '15'
    roundRect(ctx, tagX, tagY - tagH / 2, tagW, tagH, 16)
    ctx.fill()
    ctx.strokeStyle = typeColor + '40'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = typeColor
    ctx.textAlign = 'left'
    ctx.fillText(tag, tagX + 14, tagY + 5)
    tagX += tagW + 8
  })

  // 特点文字
  let traitsY = tagY + tagH / 2 + 30
  ctx.font = '20px system-ui, sans-serif'
  ctx.fillStyle = '#5C5650'
  ctx.textAlign = 'left'
  traitsResult.lines.forEach(line => {
    ctx.fillText(line, margin + cardPadding, traitsY)
    traitsY += 32
  })

  y += traitsCardH + 20

  // === 相处建议卡片 ===
  const suggestionsCardH = 60 + suggestionTagsLayout.height + 25 + suggestionsResult.height + 30
  drawCard(y, suggestionsCardH)

  ctx.fillStyle = '#4A4540'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText('✦ 相处建议', margin + cardPadding, y + 45)

  // 标签 - 使用类型主题色
  ctx.font = '16px system-ui, sans-serif'
  tagX = margin + cardPadding
  tagY = y + 75
  result.suggestionTags?.forEach((tag) => {
    const tagW = ctx.measureText(tag).width + 28
    if (tagX + tagW > margin + cardPadding + innerCardWidth) {
      tagX = margin + cardPadding
      tagY += tagH + 8
    }

    ctx.fillStyle = typeColor + '12'
    roundRect(ctx, tagX, tagY - tagH / 2, tagW, tagH, 16)
    ctx.fill()
    ctx.strokeStyle = typeColor + '35'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = typeColor
    ctx.fillText(tag, tagX + 14, tagY + 5)
    tagX += tagW + 8
  })

  // 建议文字
  let suggY = tagY + tagH / 2 + 30
  ctx.font = '20px system-ui, sans-serif'
  ctx.fillStyle = '#5C5650'
  suggestionsResult.lines.forEach(line => {
    ctx.fillText(line, margin + cardPadding, suggY)
    suggY += 32
  })

  y += suggestionsCardH + 40

  // === 底部 ===
  // 装饰线
  ctx.strokeStyle = typeColor + '50'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(width / 2 - 60, height - margin - 50)
  ctx.lineTo(width / 2 - 15, height - margin - 50)
  ctx.moveTo(width / 2 + 15, height - margin - 50)
  ctx.lineTo(width / 2 + 60, height - margin - 50)
  ctx.stroke()

  // CTA 文字
  ctx.fillStyle = typeColor
  ctx.font = 'bold 18px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🐾 测测你家猫咪的 MBTI 性格 🐾', width / 2, height - margin - 22)

  // 返回 canvas 的 blob
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
    }, 'image/png')
  })
}

const ResultPage = () => {
  const navigate = useNavigate()
  const { result, resetTest } = useTestStore()

  // 测试完成时标记 token 已使用
  useEffect(() => {
    if (result) {
      console.log('=== 测试完成，开始标记 Token ===')
      const token = getCurrentToken()
      console.log('从 localStorage 获取的 token:', token)

      if (token) {
        // 解码 token 获取 id
        try {
          const base64 = token.split('').reverse().join('')
          console.log('反转后的 base64:', base64)
          const json = decodeURIComponent(atob(base64))
          console.log('解码后的 JSON:', json)
          const payload = JSON.parse(json)
          console.log('Token payload:', payload)

          if (payload.id) {
            // 标记已使用
            const usedTokens = JSON.parse(localStorage.getItem('cat_mbti_used_tokens') || '{}')
            console.log('当前使用记录:', usedTokens)
            usedTokens[payload.id] = (usedTokens[payload.id] || 0) + 1
            localStorage.setItem('cat_mbti_used_tokens', JSON.stringify(usedTokens))
            console.log('Token 已标记使用:', payload.id, '使用次数:', usedTokens[payload.id])
          }
        } catch (e) {
          console.error('标记 token 失败:', e)
        }
      } else {
        console.log('没有找到 token')
      }
    }
  }, [result])

  const handleRetest = () => {
    // 检查 token 是否还有使用次数
    const token = getCurrentToken()
    if (token) {
      try {
        const base64 = token.split('').reverse().join('')
        const json = decodeURIComponent(atob(base64))
        const payload = JSON.parse(json)

        // 检查使用次数
        const usedTokens = JSON.parse(localStorage.getItem('cat_mbti_used_tokens') || '{}')
        const usageCount = usedTokens[payload.id] || 0

        console.log('重新测试检查 - 使用次数:', usageCount, '最大次数:', payload.maxUse)

        if (usageCount >= payload.maxUse) {
          alert('此链接已达到最大使用次数，无法重新测试')
          return
        }
      } catch (e) {
        console.error('验证 token 失败:', e)
      }
    }

    resetTest()
    navigate('/')
  }

  const handleShare = async () => {
    if (!result) return

    try {
      const blob = await generateResultImage(result)
      const file = new File([blob], `猫咪MBTI-${result.type}.png`, { type: 'image/png' })

      // 优先使用 Web Share API（移动端支持）
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: '猫咪MBTI性格测试',
          text: `我的猫咪是${result.type}型人格！`,
          files: [file],
        })
      } else {
        // 降级方案：下载图片
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `猫咪MBTI-${result.type}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      // 用户取消分享不报错
      if ((error as Error).name !== 'AbortError') {
        console.error('分享失败:', error)
        alert('分享失败，请截图保存')
      }
    }
  }

  // 获取维度对的数据
  const getDimensionPairData = (positive: string, negative: string): { left: DimensionScore; right: DimensionScore } | null => {
    const allScores = result?.allDimensionScores

    if (!allScores || allScores.length === 0) {
      // 如果没有allDimensionScores，从dimensionScores构建（兼容旧数据）
      const winningScores = result?.dimensionScores || []
      const winningPositive = winningScores.find(d => d.dimension === positive)
      const winningNegative = winningScores.find(d => d.dimension === negative)

      if (winningPositive) {
        return {
          left: winningPositive,
          right: {
            dimension: negative,
            score: 0,
            percentage: 100 - (winningPositive.percentage || 50),
            dominance: 100 - (winningPositive.dominance || winningPositive.percentage || 50),
            intensity: '微弱',
            isWinning: false,
          },
        }
      } else if (winningNegative) {
        return {
          left: winningNegative,
          right: {
            dimension: positive,
            score: 0,
            percentage: 100 - (winningNegative.percentage || 50),
            dominance: 100 - (winningNegative.dominance || winningNegative.percentage || 50),
            intensity: '微弱',
            isWinning: false,
          },
        }
      }
      return null
    }

    const positiveScore = allScores.find((d) => d.dimension === positive)
    const negativeScore = allScores.find((d) => d.dimension === negative)

    if (!positiveScore || !negativeScore) {
      return null
    }

    // 确定哪个是主导维度（左侧显示主导维度）
    const leftIsWinning = positiveScore.isWinning ?? (positiveScore.score >= negativeScore.score)

    return {
      left: leftIsWinning ? positiveScore : negativeScore,
      right: leftIsWinning ? negativeScore : positiveScore,
    }
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-white to-peach/30">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl mb-6"
          >
            😿
          </motion.div>
          <p className="text-gray-500 mb-6">没有找到测试结果</p>
          <button
            onClick={() => navigate('/')}
            className="shimmer-btn px-8 py-3 bg-brand text-white rounded-full font-semibold shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  // 获取当前类型的主题色
  const typeColor = TYPE_COLORS[result.type] || '#FF8C6B'

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-peach/20 pb-28 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 渐变光晕 */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-peach/30 to-coral/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-16 w-48 h-48 bg-gradient-to-br from-rose/15 to-dusty-rose/10 rounded-full blur-2xl" />
        <div className="absolute bottom-40 right-0 w-40 h-40 bg-gradient-to-br from-brand-light/40 to-peach/30 rounded-full blur-2xl" />

        {/* 浮动猫爪 */}
        <FloatingPaw delay={0} className="top-[8%] left-[5%]" />
        <FloatingPaw delay={1} className="top-[12%] right-[8%]" />
        <FloatingPaw delay={2} className="top-[45%] left-[3%]" />
        <FloatingPaw delay={0.5} className="bottom-[35%] right-[5%]" />
        <FloatingPaw delay={1.5} className="bottom-[20%] left-[6%]" />
      </div>

      <div className="relative z-10 px-4 py-6">
        {/* 头部 - 结果类型展示 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* 猫咪头像 */}
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-4"
          >
            <div className="relative inline-block">
              <div
                className="absolute inset-0 rounded-full blur-xl scale-150 animate-pulse-soft"
                style={{ background: `linear-gradient(135deg, ${TYPE_COLORS[result.type]}33, ${TYPE_COLORS[result.type]}22)` }}
              />
              {CAT_IMAGES[result.type] ? (
                <img
                  src={CAT_IMAGES[result.type]}
                  alt={`${result.type} 猫咪`}
                  className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="relative text-6xl">🐱</div>
              )}
            </div>
          </motion.div>

          {/* MBTI 类型 */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-5xl font-bold mb-2"
            style={{ color: TYPE_COLORS[result.type] }}
          >
            {result.type}
          </motion.h1>

          {/* 类型名称 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg mb-3"
            style={{ color: TYPE_COLORS[result.type] }}
          >
            {result.typeName}
          </motion.p>

          {/* 昵称徽章 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-block mb-4"
          >
            <span
              className="px-5 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${TYPE_COLORS[result.type]}15`,
                color: TYPE_COLORS[result.type],
                borderColor: `${TYPE_COLORS[result.type]}40`,
                border: '1px solid'
              }}
            >
              「{result.typeNickname}」
            </span>
          </motion.div>

          {/* 引用 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 italic text-sm mb-4"
          >
            "{result.quote}"
          </motion.p>

          {/* 描述 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto"
          >
            {result.typeDescription}
          </motion.p>
        </motion.div>

        {/* 雷达图 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-lg shadow-gray-200/50 mb-6 border border-white/50"
        >
          <h2 className="text-base font-semibold text-gray-700 mb-3 text-center flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-gray-300" />
            性格雷达图
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-gray-300" />
          </h2>
          <RadarChart data={result.allDimensionScores || result.dimensionScores} typeColor={typeColor} />
        </motion.div>

        {/* 维度分析 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-lg shadow-gray-200/50 mb-6 border border-white/50"
        >
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-brand">✦</span>
            性格维度
          </h2>
          <div className="space-y-3">
            {DIMENSION_PAIRS.map(({ positive, negative }) => {
              const pairData = getDimensionPairData(positive, negative)
              if (!pairData) return null
              return (
                <DimensionBar
                  key={`${positive}-${negative}`}
                  leftDimension={pairData.left}
                  rightDimension={pairData.right}
                  mbtiType={result.type}
                />
              )
            })}
          </div>
        </motion.div>

        {/* 性格特点 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-lg shadow-gray-200/50 mb-6 border border-white/50"
        >
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-coral">✦</span>
            性格特点
          </h2>
          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {result.traitTags?.map((tag, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-rose-50 text-orange-600 text-sm rounded-full border border-orange-100/50 shadow-sm"
              >
                {tag}
              </motion.span>
            ))}
          </div>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            {result.traits}
          </p>
        </motion.div>

        {/* 相处建议 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-lg shadow-gray-200/50 mb-6 border border-white/50"
        >
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-emerald-500">✦</span>
            相处建议
          </h2>
          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {result.suggestionTags?.map((tag, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 text-sm rounded-full border border-emerald-100/50 shadow-sm"
              >
                {tag}
              </motion.span>
            ))}
          </div>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            {result.suggestions}
          </p>
        </motion.div>
      </div>

      {/* 底部按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100/50 p-4 flex gap-3"
      >
        <button
          onClick={handleRetest}
          className="flex-1 py-3.5 rounded-full border-2 border-brand text-brand font-semibold hover:bg-brand/5 transition-colors"
        >
          重新测试
        </button>
        <button
          onClick={handleShare}
          className="shimmer-btn flex-1 py-3.5 rounded-full bg-brand text-white font-semibold shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 transition-all"
        >
          分享结果
        </button>
      </motion.div>
    </div>
  )
}

export default ResultPage
