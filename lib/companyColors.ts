// lib/companyColors.ts
export const COMPANY_COLORS: Record<string, string> = {
  "华为": "border-red-500/30",
  "蔚来": "border-blue-500/30", 
  "小鹏": "border-green-500/30",
  "卓驭": "border-orange-500/30",
  "特斯拉": "border-gray-500/30",
  "百度": "border-blue-400/30",
  "理想": "border-purple-400/30",
  "其他": "border-gray-700/30"
};

export const getCompanyColor = (company: string = "其他") => {
  return COMPANY_COLORS[company] || COMPANY_COLORS["其他"];
};
