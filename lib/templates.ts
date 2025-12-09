// lib/templates.ts - 光子模板定义
export interface PhotonTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  prompt?: string;
  textColor?: string; // 添加这个属性
}

export const PHOTON_TEMPLATES: PhotonTemplate[] = [
  {
    id: 'moment',
    name: '那个瞬间',
    description: '行业中的决定性时刻、突破瞬间',
    color: '#3b82f6',
    icon: '⚡',
    prompt: '分享一个让你觉得"游戏规则变了"的瞬间...',
    textColor: '#ffffff' // 添加文本颜色
  },
  {
    id: 'prophecy',
    name: '预言胶囊',
    description: '对未来技术或行业的预测',
    color: '#8b5cf6',
    icon: '🔮',
    prompt: '预测一下未来5-10年自动驾驶的发展...',
    textColor: '#ffffff' // 添加文本颜色
  },
  {
    id: 'culture',
    name: '团队文化',
    description: '公司内外的团队故事与文化',
    color: '#f59e0b',
    icon: '👥',
    prompt: '分享一个体现你们团队文化的故事...',
    textColor: '#ffffff' // 添加文本颜色
  },
  {
    id: 'inspiration',
    name: '灵光闪现',
    description: '创意迸发、灵感涌现的时刻',
    color: '#06b6d4',
    icon: '💡',
    prompt: '有没有那么一刻，突然想通了什么...',
    textColor: '#ffffff' // 添加文本颜色
  },
  {
    id: 'darkmoment',
    name: '至暗时刻',
    description: '面临的挑战、失败与反思',
    color: '#ef4444',
    icon: '🕳️',
    prompt: '分享一个最艰难的时刻和你的感悟...',
    textColor: '#ffffff' // 添加文本颜色
  },
  {
    id: 'history',
    name: '历史记录',
    description: '行业发展中的重要历史节点',
    color: '#f97316',
    icon: '📜',
    prompt: '记录一个你认为重要的历史事件...',
    textColor: '#ffffff' // 添加文本颜色
  },
  {
    id: 'onsite',
    name: '现场观察',
    description: '实地测试、路测中的见闻',
    color: '#10b981',
    icon: '📍',
    prompt: '分享一次路测或现场测试的经历...',
    textColor: '#ffffff' // 添加文本颜色
  }
];

export function getTemplateById(id: string): PhotonTemplate | undefined {
  return PHOTON_TEMPLATES.find(template => template.id === id);
}

export function getTemplateColor(id: string): string {
  return getTemplateById(id)?.color || '#6b7280';
}

export function getTemplateIcon(id: string): string {
  return getTemplateById(id)?.icon || '✨';
}
