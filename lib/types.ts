// lib/types.ts
export interface Photon {
  id: number;
  content: string;
  author: string;
  type: string;
  likes: number;
  time: string;
  company: string;
  author_name?: string;
  author_company?: string;
  author_profession?: string;
  created_at?: string;
  isFromDB?: boolean;
}

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

export type DbStatus = "checking" | "connected" | "error";
