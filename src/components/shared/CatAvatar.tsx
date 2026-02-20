import { MBTIType } from '@/types'

interface CatAvatarProps {
  type: MBTIType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// 16种性格猫咪的视觉配置
const CAT_CONFIG: Record<MBTIType, {
  // 眼睛样式
  eyes: 'serious' | 'thinking' | 'confident' | 'mischievous' | 'gentle' | 'dreamy' | 'warm' | 'excited' | 'focused' | 'caring' | 'proud' | 'friendly' | 'cool' | 'elegant' | 'energetic' | 'star'
  // 嘴巴样式
  mouth: 'neutral' | 'smile' | 'smirk' | 'open' | 'small' | 'happy'
  // 配饰
  accessory?: 'glasses' | 'crown' | 'bow' | 'star' | 'heart' | 'sparkle' | 'monocle' | 'headphones' | 'hat' | 'bowtie' | 'cape' | 'spotlight' | 'clock' | 'palette' | 'lightning'
  // 主色调
  color: string
  // 背景色
  bgColor: string
}> = {
  // ==================== 分析家 ====================
  INTJ: {
    eyes: 'serious',
    mouth: 'neutral',
    accessory: 'glasses',
    color: '#6366f1', // 靛蓝
    bgColor: '#EEF2FF',
  },
  INTP: {
    eyes: 'thinking',
    mouth: 'small',
    accessory: 'monocle',
    color: '#8b5cf6', // 紫色
    bgColor: '#F5F3FF',
  },
  ENTJ: {
    eyes: 'confident',
    mouth: 'smirk',
    accessory: 'crown',
    color: '#dc2626', // 红色
    bgColor: '#FEF2F2',
  },
  ENTP: {
    eyes: 'mischievous',
    mouth: 'smirk',
    accessory: 'sparkle',
    color: '#f59e0b', // 琥珀
    bgColor: '#FFFBEB',
  },

  // ==================== 外交家 ====================
  INFJ: {
    eyes: 'gentle',
    mouth: 'small',
    accessory: 'star',
    color: '#10b981', // 翠绿
    bgColor: '#ECFDF5',
  },
  INFP: {
    eyes: 'dreamy',
    mouth: 'smile',
    accessory: 'heart',
    color: '#ec4899', // 粉红
    bgColor: '#FDF2F8',
  },
  ENFJ: {
    eyes: 'warm',
    mouth: 'happy',
    accessory: 'bow',
    color: '#f97316', // 橙色
    bgColor: '#FFF7ED',
  },
  ENFP: {
    eyes: 'excited',
    mouth: 'open',
    accessory: 'sparkle',
    color: '#eab308', // 黄色
    bgColor: '#FEFCE8',
  },

  // ==================== 守护者 ====================
  ISTJ: {
    eyes: 'focused',
    mouth: 'neutral',
    accessory: 'clock',
    color: '#475569', // 石板灰
    bgColor: '#F8FAFC',
  },
  ISFJ: {
    eyes: 'caring',
    mouth: 'smile',
    accessory: 'heart',
    color: '#14b8a6', // 青色
    bgColor: '#F0FDFA',
  },
  ESTJ: {
    eyes: 'proud',
    mouth: 'neutral',
    accessory: 'bowtie',
    color: '#1d4ed8', // 蓝色
    bgColor: '#EFF6FF',
  },
  ESFJ: {
    eyes: 'friendly',
    mouth: 'happy',
    accessory: 'bow',
    color: '#f43f5e', // 玫瑰红
    bgColor: '#FFF1F2',
  },

  // ==================== 探险家 ====================
  ISTP: {
    eyes: 'cool',
    mouth: 'smirk',
    accessory: 'glasses',
    color: '#64748b', // 冷灰
    bgColor: '#F1F5F9',
  },
  ISFP: {
    eyes: 'elegant',
    mouth: 'smile',
    accessory: 'palette',
    color: '#a855f7', // 紫罗兰
    bgColor: '#FAF5FF',
  },
  ESTP: {
    eyes: 'energetic',
    mouth: 'open',
    accessory: 'lightning',
    color: '#22c55e', // 绿色
    bgColor: '#F0FDF4',
  },
  ESFP: {
    eyes: 'star',
    mouth: 'happy',
    accessory: 'spotlight',
    color: '#FF8C6B', // 品牌色
    bgColor: '#FFF5F0',
  },
}

export const CatAvatar = ({ type, size = 'md', className = '' }: CatAvatarProps) => {
  const config = CAT_CONFIG[type]

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const { eyes, mouth, accessory, color, bgColor } = config

  // 渲染眼睛
  const renderEyes = () => {
    const eyeStyle = {
      serious: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-800" />
            <div className="w-3 h-3 rounded-full bg-gray-800" />
          </div>
        </>
      ),
      thinking: (
        <>
          <div className="flex gap-3 items-end">
            <div className="w-3 h-2 rounded-full bg-gray-800 mb-0.5" />
            <div className="w-3 h-3 rounded-full bg-gray-800" />
          </div>
        </>
      ),
      confident: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-800 relative">
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <div className="w-3 h-3 rounded-full bg-gray-800 relative">
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </>
      ),
      mischievous: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-1.5 rounded-full bg-gray-800 rotate-12" />
            <div className="w-3 h-1.5 rounded-full bg-gray-800 -rotate-12" />
          </div>
        </>
      ),
      gentle: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-2 rounded-full bg-gray-600" />
            <div className="w-3 h-2 rounded-full bg-gray-600" />
          </div>
        </>
      ),
      dreamy: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-2.5 rounded-full bg-pink-400 relative">
              <div className="absolute inset-0 flex items-center justify-center text-[8px]">✨</div>
            </div>
            <div className="w-3 h-2.5 rounded-full bg-pink-400 relative">
              <div className="absolute inset-0 flex items-center justify-center text-[8px]">✨</div>
            </div>
          </div>
        </>
      ),
      warm: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-2 rounded-full bg-amber-700 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            </div>
            <div className="w-3 h-2 rounded-full bg-amber-700 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            </div>
          </div>
        </>
      ),
      excited: (
        <>
          <div className="flex gap-3">
            <div className="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </>
      ),
      focused: (
        <>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-800" />
            <div className="w-2 h-2 rounded-full bg-gray-800" />
          </div>
        </>
      ),
      caring: (
        <>
          <div className="flex gap-3">
            <div className="relative">
              <div className="w-3 h-2.5 rounded-full bg-teal-700" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[6px]">💕</div>
            </div>
            <div className="relative">
              <div className="w-3 h-2.5 rounded-full bg-teal-700" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[6px]">💕</div>
            </div>
          </div>
        </>
      ),
      proud: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-2 rounded-full bg-blue-800" />
            <div className="w-3 h-2 rounded-full bg-blue-800" />
          </div>
        </>
      ),
      friendly: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-2.5 rounded-full bg-rose-600 relative">
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-white" />
            </div>
            <div className="w-3 h-2.5 rounded-full bg-rose-600 relative">
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-white" />
            </div>
          </div>
        </>
      ),
      cool: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-1 bg-gray-800 rounded-full" />
            <div className="w-3 h-1 bg-gray-800 rounded-full" />
          </div>
        </>
      ),
      elegant: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-600 relative">
              <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white opacity-60" />
            </div>
            <div className="w-3 h-3 rounded-full bg-purple-600 relative">
              <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white opacity-60" />
            </div>
          </div>
        </>
      ),
      energetic: (
        <>
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse" />
          </div>
        </>
      ),
      star: (
        <>
          <div className="flex gap-3">
            <div className="text-sm">⭐</div>
            <div className="text-sm">⭐</div>
          </div>
        </>
      ),
    }

    return eyeStyle[eyes]
  }

  // 渲染嘴巴
  const renderMouth = () => {
    const mouthStyle = {
      neutral: <div className="w-2 h-0.5 bg-gray-600 rounded-full" />,
      smile: (
        <div className="w-4 h-2 border-b-2 border-gray-600 rounded-b-full" />
      ),
      smirk: (
        <div className="w-3 h-1 bg-gray-600 rounded-full rotate-12" />
      ),
      open: (
        <div className="w-3 h-2 bg-pink-300 rounded-full relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-pink-400 rounded-full" />
        </div>
      ),
      small: <div className="w-1.5 h-0.5 bg-gray-500 rounded-full" />,
      happy: (
        <div className="w-5 h-2.5 border-b-2 border-gray-600 rounded-b-full" />
      ),
    }

    return mouthStyle[mouth]
  }

  // 渲染配饰
  const renderAccessory = () => {
    if (!accessory) return null

    const accessoryStyle: Record<string, JSX.Element> = {
      glasses: (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center">
          <div className="w-5 h-3 border-2 border-gray-700 rounded-full" />
          <div className="w-2 h-0.5 bg-gray-700" />
          <div className="w-5 h-3 border-2 border-gray-700 rounded-full" />
        </div>
      ),
      crown: (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>
      ),
      bow: (
        <div className="absolute top-1 right-1 text-sm">🎀</div>
      ),
      star: (
        <div className="absolute top-0 right-0 text-sm animate-pulse">✨</div>
      ),
      heart: (
        <div className="absolute top-0 right-0 text-sm">💕</div>
      ),
      sparkle: (
        <>
          <div className="absolute top-0 right-0 text-xs animate-ping">✨</div>
          <div className="absolute top-2 left-0 text-xs animate-pulse">⚡</div>
        </>
      ),
      monocle: (
        <div className="absolute top-5 right-4 text-lg">🧐</div>
      ),
      headphones: (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xl">🎧</div>
      ),
      hat: (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl">🎩</div>
      ),
      bowtie: (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm">🎀</div>
      ),
      cape: (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xl">🦸</div>
      ),
      spotlight: (
        <>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">🌟</div>
          <div className="absolute top-0 right-0 text-xs animate-bounce">✨</div>
          <div className="absolute top-0 left-0 text-xs animate-bounce delay-100">✨</div>
        </>
      ),
      clock: (
        <div className="absolute top-0 right-0 text-sm">⏰</div>
      ),
      palette: (
        <div className="absolute top-0 right-0 text-sm">🎨</div>
      ),
      lightning: (
        <>
          <div className="absolute top-0 right-0 text-sm animate-bounce">⚡</div>
          <div className="absolute top-1 left-0 text-xs animate-pulse">💨</div>
        </>
      ),
    }

    return accessoryStyle[accessory]
  }

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* 猫耳 */}
      <div className="absolute -top-1 left-3 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent" style={{ borderBottomColor: color }} />
      <div className="absolute -top-1 right-3 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent" style={{ borderBottomColor: color }} />

      {/* 内耳 */}
      <div className="absolute -top-0.5 left-4 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px] border-l-transparent border-r-transparent border-b-pink-200" />
      <div className="absolute -top-0.5 right-4 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px] border-l-transparent border-r-transparent border-b-pink-200" />

      {/* 猫脸 */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        {/* 配饰 */}
        {renderAccessory()}

        {/* 眼睛 */}
        <div className="mb-2">
          {renderEyes()}
        </div>

        {/* 鼻子 */}
        <div
          className="w-2 h-1.5 rounded-full mb-1"
          style={{ backgroundColor: color }}
        />

        {/* 嘴巴 */}
        {renderMouth()}

        {/* 胡须 */}
        <div className="absolute bottom-4 -left-4 flex flex-col gap-1">
          <div className="w-4 h-0.5 bg-gray-300 rounded-full -rotate-6" />
          <div className="w-5 h-0.5 bg-gray-300 rounded-full" />
          <div className="w-4 h-0.5 bg-gray-300 rounded-full rotate-6" />
        </div>
        <div className="absolute bottom-4 -right-4 flex flex-col gap-1">
          <div className="w-4 h-0.5 bg-gray-300 rounded-full rotate-6" />
          <div className="w-5 h-0.5 bg-gray-300 rounded-full" />
          <div className="w-4 h-0.5 bg-gray-300 rounded-full -rotate-6" />
        </div>
      </div>
    </div>
  )
}

// 导出配置供其他组件使用
export { CAT_CONFIG }
