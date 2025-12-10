// lib/types.ts - 修复版：集中管理所有类型

// ========== 数据库原始类型 ==========
export interface PhotonFromDB {
  id: string;
  content: string;
  template_type: string;
  author_name: string;
  author_company: string;
  author_profession: string;
  likes_count: number;
  created_at: string;
}

// ========== 前端业务类型 ==========
export interface Photon {
  id: string | number;
  content: string;
  author: string;
  type: string;
  likes: number;
  time: string;
  company: string;
  author_name?: string;
  author_company?: string;
  author_profession?: string;
  isFromDB?: boolean;
  color?: string;
  year?: number;
}

// ========== Canvas渲染专用类型 ==========
export interface StarPhoton {
  id: string | number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  type: string;
  company: string;
  year: number;
  content: string;
  author: string;
  likes: number;
  color: string;
  companyColor: string;
}

// ========== 其他类型 ==========
export type DbStatus = "checking" | "connected" | "error";
