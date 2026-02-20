import { Question } from '@/types'

// 32道优化题目
// 维度分配：E/I, S/N, T/F, J/P 各8题（正向4题，反向4题）
//
// 设计原则：
// 1. 正向题和反向题测量该维度的不同方面/子维度，而非同一场景的正反两面
// 2. 每道题都是独特的行为场景，避免重复
// 3. 正向题：倾向于该维度正向特质的不同行为表现
// 4. 反向题：倾向于该维度负向特质的不同行为表现
//
// 维度定义（针对猫咪行为特点）：
// E 外向型：从社交互动中获得能量，主动寻求互动
// I 内向型：从独处中获得能量，对社交保持谨慎
// S 务实型：偏好熟悉环境和常规，对变化保守
// N 好奇型：对新事物充满兴趣，喜欢探索未知
// T 独立型：情感自主，不喜欢过度亲密
// F 粘人型：情感表达丰富，主动寻求亲密接触
// J 规律型：习惯固定作息，对环境变化敏感
// P 随性型：适应性强，行为灵活多变

export const questions: Question[] = [
  // ==================== E/I 社交能量 (8题) ====================
  // E 正向（4题）：外向行为的不同子维度
  // 1.对陌生人的主动反应 2.对主人的响应性 3.社交区域偏好 4.与客人互动
  {
    id: 1,
    text: '家里来了陌生人，猫咪会主动走出来观察或靠近',
    dimension: 'E',
    direction: 'positive',
  },
  {
    id: 2,
    text: '当我呼唤猫咪名字时，它会回应（跑过来、喵一声或看向我）',
    dimension: 'E',
    direction: 'positive',
  },
  {
    id: 3,
    text: '猫咪喜欢待在有人活动的区域，家人在客厅它也会待在客厅',
    dimension: 'E',
    direction: 'positive',
  },
  {
    id: 4,
    text: '猫咪会主动跳到客人的腿上，或主动让客人摸',
    dimension: 'E',
    direction: 'positive',
  },
  // I 反向（4题）：内向行为的不同子维度（与正向题不重叠！）
  // 1.对嘈杂环境的反应 2.被动社交的压力 3.独处时间偏好 4.社交能量恢复方式
  {
    id: 5,
    text: '家里人多或比较吵闹时，猫咪会明显感到不安或躲起来',
    dimension: 'E',
    direction: 'negative',
  },
  {
    id: 6,
    text: '猫咪被陌生人摸或抱时会身体僵硬、耳朵向后贴、或挣扎',
    dimension: 'E',
    direction: 'negative',
  },
  {
    id: 7,
    text: '猫咪大部分时间喜欢独自待在安静、隐蔽的地方（床底、柜子里、高处）',
    dimension: 'E',
    direction: 'negative',
  },
  {
    id: 8,
    text: '猫咪在社交活动（如被很多人围看）之后，需要独自待着才能恢复状态',
    dimension: 'E',
    direction: 'negative',
  },

  // ==================== S/N 认知风格 (8题) ====================
  // N 正向（4题）：好奇探索的不同子维度
  // 1.主动探索能力 2.对窗外的追踪兴趣 3.探索新物品 4.玩耍新玩具
  {
    id: 9,
    text: '猫咪会尝试打开柜门、抽屉，或翻垃圾桶探索',
    dimension: 'N',
    direction: 'positive',
  },
  {
    id: 10,
    text: '猫咪会长时间盯着窗外观察（鸟、虫子、行人等），有时发出"咔咔"声',
    dimension: 'N',
    direction: 'positive',
  },
  {
    id: 11,
    text: '家里出现新东西（快递箱、购物袋、新家具）时，猫咪会第一时间去闻或探索',
    dimension: 'N',
    direction: 'positive',
  },
  {
    id: 12,
    text: '给猫咪买的新玩具，它当天就会去玩',
    dimension: 'N',
    direction: 'positive',
  },
  // S 反向（4题）：务实保守的不同子维度（与正向题不重叠！）
  // 1.对旧物的依恋 2.日常活动规律 3.对新食物的谨慎 4.对熟悉环境的依赖
  {
    id: 13,
    text: '猫咪对新玩具兴趣不大，更喜欢已经玩了很久的旧玩具',
    dimension: 'N',
    direction: 'negative',
  },
  {
    id: 14,
    text: '猫咪每天的活动路线很固定，几乎走同样的路、在同样的地方休息',
    dimension: 'N',
    direction: 'negative',
  },
  {
    id: 15,
    text: '猫咪对新的猫粮、零食比较挑剔，更喜欢熟悉的味道',
    dimension: 'N',
    direction: 'negative',
  },
  {
    id: 16,
    text: '猫咪有自己固定的"安全角落"，压力大时会躲到那里去',
    dimension: 'N',
    direction: 'negative',
  },

  // ==================== T/F 亲密需求 (8题) ====================
  // F 正向（4题）：亲密粘人的不同子维度
  // 1.主动标记气味 2.身体接触偏好 3.爱意表达方式 4.主人离开后的反应
  {
    id: 17,
    text: '猫咪喜欢用头蹭我的脸、手或腿，主动标记气味',
    dimension: 'F',
    direction: 'positive',
  },
  {
    id: 18,
    text: '猫咪会睡在我身上、腿上或紧贴着我睡',
    dimension: 'F',
    direction: 'positive',
  },
  {
    id: 19,
    text: '猫咪会对我"慢眨眼"表达爱意（眯着眼看我后慢慢闭上再睁开）',
    dimension: 'F',
    direction: 'positive',
  },
  {
    id: 20,
    text: '我出门一整天回来后，猫咪会特别粘我，跟着我到处走',
    dimension: 'F',
    direction: 'positive',
  },
  // T 反向（4题）：独立自主的不同子维度（与正向题不重叠！）
  // 1.对被抱的容忍度 2.主动求抚摸频率 3.互动主导权 4.情感独立性
  {
    id: 21,
    text: '猫咪不喜欢被抱太久，很快就会挣扎想下来',
    dimension: 'F',
    direction: 'negative',
  },
  {
    id: 22,
    text: '猫咪主动来求摸摸的时间很少，大部分时间自己玩或睡觉',
    dimension: 'F',
    direction: 'negative',
  },
  {
    id: 23,
    text: '猫咪被摸或撸的时候，会自己决定什么时候结束，然后就走开',
    dimension: 'F',
    direction: 'negative',
  },
  {
    id: 24,
    text: '猫咪即使和我关系很好，也会保持一定的"个人空间"',
    dimension: 'F',
    direction: 'negative',
  },

  // ==================== J/P 生活态度 (8题) ====================
  // J 正向（4题）：规律有序的不同子维度
  // 1.作息时间规律 2.对环境整洁的要求 3.睡觉位置固定性 4.对变化的敏感度
  {
    id: 25,
    text: '猫咪会在固定时间叫我起床或要求喂食（误差不超过半小时）',
    dimension: 'J',
    direction: 'positive',
  },
  {
    id: 26,
    text: '家里的猫砂盆如果不够干净，猫咪会表现出不满（叫唤、犹豫、或在外面解决）',
    dimension: 'J',
    direction: 'positive',
  },
  {
    id: 27,
    text: '猫咪有特别偏爱的一两个睡觉位置，很少换地方',
    dimension: 'J',
    direction: 'positive',
  },
  {
    id: 28,
    text: '家具位置变动或家里重新布置后，猫咪会表现得不太适应',
    dimension: 'J',
    direction: 'positive',
  },
  // P 反向（4题）：灵活随性的不同子维度（与正向题不重叠！）
  // 1.进食习惯 2.对环境变化的适应力 3.行为的可预测性 4.对规则的态度
  {
    id: 29,
    text: '猫咪吃饭不太规律，有时吃得多有时吃得少，时间也不固定',
    dimension: 'J',
    direction: 'negative',
  },
  {
    id: 30,
    text: '搬家、新家具、或家里布置变化后，猫咪很快就能适应，没有明显压力反应',
    dimension: 'J',
    direction: 'negative',
  },
  {
    id: 31,
    text: '猫咪的行为很难预测，同一情况下可能做出完全不同的反应',
    dimension: 'J',
    direction: 'negative',
  },
  {
    id: 32,
    text: '猫咪对吃饭的地点不挑剔，换地方也能正常吃',
    dimension: 'J',
    direction: 'negative',
  },
]
