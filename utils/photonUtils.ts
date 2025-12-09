// utils/photonUtils.ts
import { Photon, PhotonFromDB } from '@/lib/types';

export const formatPhotonFromDB = (photon: PhotonFromDB): Photon => {
  return {
    id: parseInt(photon.id, 16) || 0, // 简单转换，实际应用中可能需要更好的id转换
    content: photon.content,
    author: `${photon.author_name || '匿名用户'}${photon.author_profession ? ` · ${photon.author_profession}` : ''}${photon.author_company ? ` @ ${photon.author_company}` : ''}`,
    type: photon.template_type || 'moment',
    likes: photon.likes_count || 0,
    time: new Date(photon.created_at).toLocaleDateString('zh-CN'),
    company: photon.author_company || '其他',
    author_name: photon.author_name,
    author_company: photon.author_company,
    author_profession: photon.author_profession,
    created_at: photon.created_at,
    isFromDB: true
  };
};

export const getInitialPhotons = (): Photon[] => [
  {
    id: 1,
    content: "2024年，第一次看到端到端大模型在车上运行，我知道游戏规则要变了。",
    author: "感知算法工程师 @ 华为",
    type: "moment",
    likes: 42,
    time: "2024-03-15",
    company: "华为",
    isFromDB: false
  },
  {
    id: 2, 
    content: "预言：2027年之前，L4会在特定场景落地，但通用L4仍需10年。",
    author: "系统架构师 @ 蔚来",
    type: "prophecy",
    likes: 28,
    time: "2024-03-14",
    company: "蔚来",
    isFromDB: false
  }
];
