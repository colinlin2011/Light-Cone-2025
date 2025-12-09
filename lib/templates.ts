// lib/templates.ts
export const PHOTON_TEMPLATES = [
  {
    id: "moment",
    name: "那个瞬间",
    color: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-300",
    icon: "🔵",
    prompt: "哪一刻让你觉得L4真的要来了，或者觉得L4遥遥无期？",
    example: "2025年冬，看着测试车在暴雪中无接管跑完了50公里，我第一次觉得不需要高精地图也行。",
    description: "记录行业关键突破或顿悟时刻"
  },
  {
    id: "prophecy", 
    name: "预言胶囊",
    color: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-300",
    icon: "🟣",
    prompt: "写给5年后的行业，或者5年后的自己。",
    example: "立贴为证，2028年之前，纯视觉方案解决不了所有的Corner Case。",
    description: "写给未来行业或自己的预言"
  },
  {
    id: "culture",
    name: "行业黑话",
    color: "bg-amber-500/20", 
    borderColor: "border-amber-500/30",
    textColor: "text-amber-300",
    icon: "🟡",
    prompt: "只有圈内人才懂的痛。",
    example: "又在这个路口接管了，感知和规控又要打架了。",
    description: "只有圈内人才懂的痛与梗"
  },
  {
    id: "onsite",
    name: "我在现场",
    color: "bg-green-500/20",
    borderColor: "border-green-500/30",
    textColor: "text-green-300",
    icon: "🟢",
    prompt: "分享你亲身经历的行业重要时刻",
    example: "2024年3月，在测试场亲眼看到无图方案首次突破1000公里无接管。",
    description: "亲身经历的行业重要时刻"
  },
  {
    id: "inspiration",
    name: "灵光闪现",
    color: "bg-cyan-500/20",
    borderColor: "border-cyan-500/30", 
    textColor: "text-cyan-300",
    icon: "💡",
    prompt: "那些突然的、改变思路的灵感时刻",
    example: "凌晨调试代码时突然想到用Transformer重构整个规控模块。",
    description: "改变思路的灵感时刻"
  },
  {
    id: "history",
    name: "历史回顾", 
    color: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-300",
    icon: "📜",
    prompt: "回顾自动驾驶发展史上的重要节点",
    example: "2016年，第一次看到特斯拉Autopilot在国内开放，就知道这行业要变天了。",
    description: "回顾行业发展重要节点"
  },
  {
    id: "darkmoment",
    name: "至暗时刻",
    color: "bg-red-500/20",
    borderColor: "border-red-500/30",
    textColor: "text-red-300",
    icon: "⚫",
    prompt: "分享那些困难、挫折但最终成长的时刻",
    example: "项目延期半年，团队走了一半人，在停车场抽烟时怀疑这一切是否值得。",
    description: "困难挫折但最终成长的时刻"
  }
] as const;

export type PhotonTemplate = typeof PHOTON_TEMPLATES[number];
