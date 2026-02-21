import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTestStore } from '@/store/testStore'
import { RadarChart } from '@/components/shared/RadarChart'
import { DimensionBar } from '@/components/shared/DimensionBar'
import { DimensionScore, TestResult } from '@/types'

// 维度配对
const DIMENSION_PAIRS = [
  { positive: 'E', negative: 'I', positiveName: '外向', negativeName: '内向' },
  { positive: 'S', negative: 'N', positiveName: '务实', negativeName: '好奇' },
  { positive: 'T', negative: 'F', positiveName: '独立', negativeName: '粘人' },
  { positive: 'J', negative: 'P', positiveName: '规律', negativeName: '随性' },
]

// 维度颜色
const DIMENSION_COLORS: Record<string, string> = {
  E: '#FB923C',
  I: '#FDA4AF',
  S: '#22D3EE',
  N: '#7DD3FC',
  T: '#34D399',
  F: '#5EEAD4',
  J: '#A78BFA',
  P: '#F0ABFC',
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

// 生成结果图片 - 手机端高可读性 + 精致风格
const generateResultImage = (result: TestResult): Promise<Blob> => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas not supported'))

  // roundRect polyfill
  if (!ctx.roundRect) {
    ctx.roundRect = function(x: number, y: number, w: number, h: number, r: number | number[]) {
      const radii = typeof r === 'number' ? [r, r, r, r] : r
      const [tl, tr, br, bl] = radii
      this.beginPath()
      this.moveTo(x + tl, y)
      this.lineTo(x + w - tr, y)
      this.quadraticCurveTo(x + w, y, x + w, y + tr)
      this.lineTo(x + w, y + h - br)
      this.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
      this.lineTo(x + bl, y + h)
      this.quadraticCurveTo(x, y + h, x, y + h - bl)
      this.lineTo(x, y + tl)
      this.quadraticCurveTo(x, y, x + tl, y)
      this.closePath()
      return this
    }
  }

  const width = 750
  const outerMargin = 28
  const innerMargin = 48
  const contentX = outerMargin + innerMargin
  const contentWidth = width - (outerMargin + innerMargin) * 2

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
      const tagW = ctx.measureText(tag).width + tagPadding * 2 + 14
      if (currentX + tagW > maxW) {
        rows++
        currentX = tagW
      } else {
        currentX += tagW
      }
    })
    return { rows, height: rows * (tagH + 12) }
  }

  // 预计算所有内容高度 - 使用更大的字体和行高
  const descResult = wrapText(result.typeDescription || '', contentWidth, 20, 36)
  const traitsResult = wrapText(result.traits || '', contentWidth, 20, 36)
  const suggestionsResult = wrapText(result.suggestions || '', contentWidth, 20, 36)
  const traitTagsLayout = calculateTagsLayout(result.traitTags || [], 17, 38, 16, contentWidth)
  const suggestionTagsLayout = calculateTagsLayout(result.suggestionTags || [], 17, 38, 16, contentWidth)

  // 计算总高度
  let totalHeight = outerMargin * 2
  totalHeight += 80  // 顶部装饰 + 猫咪
  totalHeight += 55  // 标题
  totalHeight += 115 // MBTI 类型
  totalHeight += 60  // 类型名称（增加5）
  totalHeight += 55  // 昵称（增加5）
  totalHeight += 48  // 引用（增加3）
  totalHeight += 30  // 间距
  totalHeight += descResult.height + 30 // 描述
  totalHeight += 55  // 维度标题
  totalHeight += DIMENSION_PAIRS.length * 72 // 维度条（更大间距）
  totalHeight += 30  // 分隔
  totalHeight += 55  // 特点标题
  totalHeight += traitTagsLayout.height + 25 // 特点标签
  totalHeight += traitsResult.height + 30 // 特点内容
  totalHeight += 55  // 建议标题
  totalHeight += suggestionTagsLayout.height + 25 // 建议标签
  totalHeight += suggestionsResult.height + 35 // 建议内容
  totalHeight += 70  // 底部

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
  drawGlow(width * 0.2, 200, 200, 'rgba(255, 200, 180, 0.18)')
  drawGlow(width * 0.8, 400, 180, 'rgba(255, 180, 160, 0.15)')

  // === 双层边框 ===
  ctx.strokeStyle = '#E8DDD4'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 20)
  ctx.stroke()

  ctx.strokeStyle = '#F5EBE0'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(outerMargin + 10, outerMargin + 10, width - outerMargin * 2 - 20, height - outerMargin * 2 - 20, 14)
  ctx.stroke()

  // 四角装饰点
  ctx.fillStyle = '#D4A574'
  const cornerOffset = 24
  ;[
    { x: outerMargin + cornerOffset, y: outerMargin + cornerOffset },
    { x: width - outerMargin - cornerOffset, y: outerMargin + cornerOffset },
    { x: outerMargin + cornerOffset, y: height - outerMargin - cornerOffset },
    { x: width - outerMargin - cornerOffset, y: height - outerMargin - cornerOffset },
  ].forEach(({ x, y }) => {
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
  })

  // === 头部 ===
  let y = outerMargin + 55

  // 顶部装饰线
  ctx.strokeStyle = '#D4A574'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(width / 2 - 60, y)
  ctx.lineTo(width / 2 - 18, y)
  ctx.moveTo(width / 2 + 18, y)
  ctx.lineTo(width / 2 + 60, y)
  ctx.stroke()

  // 猫咪（统一使用 🐱）
  const typeColor = TYPE_COLORS[result.type] || '#FF8C6B'

  // 绘制猫咪背景光晕
  const catGlow = ctx.createRadialGradient(width / 2, y + 45, 0, width / 2, y + 45, 60)
  catGlow.addColorStop(0, typeColor + '30')
  catGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = catGlow
  ctx.beginPath()
  ctx.arc(width / 2, y + 45, 60, 0, Math.PI * 2)
  ctx.fill()

  // 绘制猫咪
  ctx.font = '52px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('🐱', width / 2, y + 55)

  // 标题
  ctx.fillStyle = '#8B7355'
  ctx.font = 'bold 30px system-ui, sans-serif'
  ctx.fillText('猫咪MBTI性格测试', width / 2, y + 105)
  y += 130

  // MBTI 类型（使用主题色）
  ctx.fillStyle = typeColor
  ctx.font = 'bold 84px serif'
  ctx.fillText(result.type, width / 2, y + 60)
  y += 100

  // 类型名称（使用主题色）
  ctx.fillStyle = typeColor
  ctx.font = '28px serif'
  ctx.fillText(result.typeName, width / 2, y)
  y += 55

  // 昵称徽章（使用主题色）
  const nicknameW = ctx.measureText(result.typeNickname).width + 60
  ctx.fillStyle = typeColor + '15'
  ctx.beginPath()
  ctx.roundRect(width / 2 - nicknameW / 2, y, nicknameW, 42, 21)
  ctx.fill()
  ctx.strokeStyle = typeColor + '60'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = typeColor
  ctx.font = 'italic 20px system-ui, sans-serif'
  ctx.fillText(result.typeNickname, width / 2, y + 28)
  y += 65

  // 引用
  ctx.fillStyle = '#9A918A'
  ctx.font = '19px system-ui, sans-serif'
  ctx.fillText(`"${result.quote}"`, width / 2, y)
  y += 40

  // 分隔线
  ctx.strokeStyle = '#E8DDD4'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(contentX, y)
  ctx.lineTo(width - contentX, y)
  ctx.stroke()
  y += 32

  // 描述
  ctx.fillStyle = '#5C5650'
  ctx.font = '20px system-ui, sans-serif'
  ctx.textAlign = 'center'
  descResult.lines.forEach(line => {
    ctx.fillText(line, width / 2, y)
    y += 36
  })
  y += 18

  // === 性格维度 ===
  ctx.fillStyle = '#4A4540'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('✦ 性格维度', contentX, y)
  y += 45

  const labelW = 85
  const barW = contentWidth - labelW * 2

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

    const winningColor = leftIsWinning ? DIMENSION_COLORS[leftDim] : DIMENSION_COLORS[rightDim]
    const displayPercent = leftIsWinning ? leftPercent : (100 - leftPercent)

    // 进度条参数（更大）
    const barX = contentX + labelW
    const barH = 18
    const barY = y + 5
    const leftW = (leftPercent / 100) * barW
    const rightW = barW - leftW

    // 标签的垂直中心与进度条中心对齐
    const labelBaselineY = barY + barH / 2 + 6

    // 左侧标签
    ctx.fillStyle = DIMENSION_COLORS[leftDim]
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(leftDim, contentX, labelBaselineY)
    ctx.fillStyle = '#6B7280'
    ctx.font = '16px system-ui, sans-serif'
    ctx.fillText(DIMENSION_LABELS[leftDim], contentX + 28, labelBaselineY)

    // 右侧标签
    ctx.fillStyle = '#6B7280'
    ctx.font = '16px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(DIMENSION_LABELS[rightDim], contentX + contentWidth - 28, labelBaselineY)
    ctx.fillStyle = DIMENSION_COLORS[rightDim]
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.fillText(rightDim, contentX + contentWidth, labelBaselineY)

    // 进度条
    ctx.fillStyle = DIMENSION_COLORS[leftDim]
    ctx.beginPath()
    ctx.roundRect(barX, barY, leftW, barH, leftW < barW ? [9, 0, 0, 9] : 9)
    ctx.fill()

    ctx.fillStyle = DIMENSION_COLORS[rightDim]
    ctx.beginPath()
    ctx.roundRect(barX + leftW, barY, rightW, barH, rightW < barW ? [0, 9, 9, 0] : 9)
    ctx.fill()

    // 圆圈（更大）
    const circleX = barX + (leftPercent / 100) * barW
    const circleY = barY + barH / 2
    const circleR = 22

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = winningColor
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = winningColor
    ctx.font = 'bold 13px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${displayPercent}%`, circleX, circleY + 5)

    y += 72
  })

  y += 8

  // 分隔线
  ctx.strokeStyle = '#E8DDD4'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(contentX, y)
  ctx.lineTo(width - contentX, y)
  ctx.stroke()
  y += 35

  // === 性格特点 ===
  ctx.fillStyle = '#4A4540'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('✦ 性格特点', contentX, y)
  y += 38

  // 标签（更大）
  ctx.font = '17px system-ui, sans-serif'
  let tagX = contentX
  const tagH = 38
  const tagPad = 16
  result.traitTags?.forEach((tag) => {
    const tagW = ctx.measureText(tag).width + tagPad * 2
    if (tagX + tagW > contentX + contentWidth) {
      tagX = contentX
      y += tagH + 12
    }

    ctx.fillStyle = '#FFF5F0'
    ctx.beginPath()
    ctx.roundRect(tagX, y - tagH / 2, tagW, tagH, tagH / 2)
    ctx.fill()
    ctx.strokeStyle = '#E8C4B4'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#C4856A'
    ctx.textAlign = 'left'
    ctx.fillText(tag, tagX + tagPad, y + 6)
    tagX += tagW + 12
  })
  y += tagH / 2 + 22

  // 特点文字
  ctx.font = '20px system-ui, sans-serif'
  ctx.fillStyle = '#5C5650'
  ctx.textAlign = 'left'
  traitsResult.lines.forEach(line => {
    ctx.fillText(line, contentX, y)
    y += 36
  })
  y += 15

  // 分隔线
  ctx.strokeStyle = '#E8DDD4'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(contentX, y)
  ctx.lineTo(width - contentX, y)
  ctx.stroke()
  y += 35

  // === 相处建议 ===
  ctx.fillStyle = '#4A4540'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('✦ 相处建议', contentX, y)
  y += 38

  // 标签
  ctx.font = '17px system-ui, sans-serif'
  tagX = contentX
  result.suggestionTags?.forEach((tag) => {
    const tagW = ctx.measureText(tag).width + tagPad * 2
    if (tagX + tagW > contentX + contentWidth) {
      tagX = contentX
      y += tagH + 12
    }

    ctx.fillStyle = '#F0FDF4'
    ctx.beginPath()
    ctx.roundRect(tagX, y - tagH / 2, tagW, tagH, tagH / 2)
    ctx.fill()
    ctx.strokeStyle = '#B8DBC8'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#5A9A7C'
    ctx.textAlign = 'left'
    ctx.fillText(tag, tagX + tagPad, y + 6)
    tagX += tagW + 12
  })
  y += tagH / 2 + 22

  // 建议文字
  ctx.font = '20px system-ui, sans-serif'
  ctx.fillStyle = '#5C5650'
  ctx.textAlign = 'left'
  suggestionsResult.lines.forEach(line => {
    ctx.fillText(line, contentX, y)
    y += 36
  })

  // === 底部 ===
  // 底部装饰线
  ctx.strokeStyle = '#D4A574'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(width / 2 - 60, height - outerMargin - 60)
  ctx.lineTo(width / 2 - 18, height - outerMargin - 60)
  ctx.moveTo(width / 2 + 18, height - outerMargin - 60)
  ctx.lineTo(width / 2 + 60, height - outerMargin - 60)
  ctx.stroke()

  ctx.fillStyle = '#A8A098'
  ctx.font = '18px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🐾你家猫咪的性格是什么呢？快来测测吧！🐾', width / 2, height - outerMargin - 32)

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

  const handleRetest = () => {
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
              <div className="relative text-6xl">
                🐱
              </div>
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
          <RadarChart data={result.allDimensionScores || result.dimensionScores} />
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
