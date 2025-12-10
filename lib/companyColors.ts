// lib/companyColors.ts
// 使用 Hex 颜色值以同时支持 Tailwind (通过 style) 和 Canvas API
export const COMPANY_COLORS: Record<string, string> = {
  "华为": "#ef4444", // red-500
  "蔚来": "#3b82f6", // blue-500
  "小鹏": "#22c55e", // green-500
  "卓驭": "#f97316", // orange-500
  "特斯拉": "#9ca3af", // gray-400
  "百度": "#60a5fa", // blue-400
  "理想": "#c084fc", // purple-400
  "小米": "#f59e0b", // amber-500
  "Momenta": "#06b6d4", // cyan-500
  "地平线": "#84cc16", // lime-500
  "Mobileye": "#fbbf24", // amber-400
  "其他": "#4b5563"  // gray-600
};

export const getCompanyColor = (company: string = "其他") => {
  return COMPANY_COLORS[company] || COMPANY_COLORS["其他"];
};
