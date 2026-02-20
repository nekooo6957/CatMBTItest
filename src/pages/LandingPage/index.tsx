import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cream via-white to-peach/30">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 大型渐变圆 */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-peach/40 to-coral/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 bg-gradient-to-br from-rose/20 to-dusty-rose/20 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-brand-light/50 to-peach/40 rounded-full blur-2xl" />

        {/* 浮动的装饰元素 */}
        <FloatingElement delay={0} className="top-[15%] left-[10%]">
          <span className="text-3xl opacity-20">✨</span>
        </FloatingElement>
        <FloatingElement delay={1} className="top-[25%] right-[15%]">
          <span className="text-2xl opacity-15">🐾</span>
        </FloatingElement>
        <FloatingElement delay={2} className="bottom-[35%] left-[5%]">
          <span className="text-xl opacity-20">⭐</span>
        </FloatingElement>
        <FloatingElement delay={1.5} className="bottom-[25%] right-[8%]">
          <span className="text-2xl opacity-15">💫</span>
        </FloatingElement>
        <FloatingElement delay={0.5} className="top-[60%] left-[85%]">
          <span className="text-xl opacity-20">🌸</span>
        </FloatingElement>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">

        {/* 顶部猫咪动画 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
          className="mb-8"
        >
          <div className="relative">
            {/* 猫咪光晕 */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-coral/20 rounded-full blur-2xl scale-150 animate-pulse-soft" />
            <div className="relative text-[120px] leading-none animate-bounce-soft">
              🐱
            </div>
          </div>
        </motion.div>

        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            发现你家猫咪的
          </h1>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand">
            独特性格类型
          </h2>
        </motion.div>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-gray-600 text-center mb-10 max-w-sm leading-relaxed"
        >
          基于<span className="text-brand font-semibold">MBTI理论</span>，
          解读猫咪的行为密码，
          <br className="hidden sm:block" />
          真正了解它的内心世界
        </motion.p>

        {/* CTA 按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-12"
        >
          <div className="relative inline-block">
            {/* 按钮装饰 - 猫爪 */}
            <span className="absolute -top-2 -right-2 text-xl animate-wiggle z-10">🐾</span>
            <button
              onClick={() => navigate('/test')}
              className="shimmer-btn px-10 py-4 bg-brand text-white text-lg font-semibold rounded-full shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40 hover:bg-brand-dark transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:shadow-md"
            >
              <span className="relative flex items-center gap-2">
                <span>开始测试</span>
                <span className="opacity-80 text-sm">约3分钟</span>
              </span>
            </button>
          </div>
        </motion.div>

        {/* 特点卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="w-full max-w-md space-y-4"
        >
          <FeatureCard
            icon="🎯"
            title="科学测评"
            description="32道精心设计的题目，基于猫咪行为学和MBTI人格类型理论"
            delay={0}
            color="from-brand/10 to-coral/10"
            borderColor="border-brand/20"
          />
          <FeatureCard
            icon="📊"
            title="深度分析"
            description="4大维度解析，16种独特性格类型"
            delay={0.1}
            color="from-peach/30 to-rose/20"
            borderColor="border-peach/40"
          />
          <FeatureCard
            icon="💡"
            title="相处建议"
            description="个性化养猫建议，了解如何让它更幸福"
            delay={0.2}
            color="from-rose/20 to-dusty-rose/10"
            borderColor="border-rose/30"
          />
        </motion.div>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <span>🐾</span>
            <span>专为爱猫人士设计</span>
            <span>🐾</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// 浮动装饰元素组件
const FloatingElement = ({
  children,
  className,
  delay
}: {
  children: React.ReactNode
  className?: string
  delay: number
}) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 5,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
)

// 特点卡片组件
const FeatureCard = ({
  icon,
  title,
  description,
  delay,
  color,
  borderColor
}: {
  icon: string
  title: string
  description: string
  delay: number
  color: string
  borderColor: string
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.9 + delay }}
    whileHover={{ scale: 1.02, x: 5 }}
    className={`bg-gradient-to-r ${color} rounded-2xl p-5 border ${borderColor} backdrop-blur-sm cursor-default transition-all duration-300`}
  >
    <div className="flex items-start gap-4">
      <motion.span
        className="text-3xl"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, delay: delay * 2, repeat: Infinity, repeatDelay: 3 }}
      >
        {icon}
      </motion.span>
      <div>
        <h3 className="font-bold text-gray-800 text-lg mb-1">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
)

export default LandingPage
