// app/page-new.tsx - v3.0 适配无限画布逻辑
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PHOTON_TEMPLATES } from '@/lib/templates';
import { COMPANY_COLORS } from '@/lib/companyColors';
import StarCanvas from '@/components/StarCanvas';
import AddPhotonModal from '@/components/AddPhotonModal';
import ViewSelector from '@/components/ViewSelector';
import PhotonList from '@/components/PhotonList';
import CompanyView from '@/components/CompanyView';
import TemplateLegend from '@/components/TemplateLegend';
import DatabaseStatus from '@/components/DatabaseStatus';
import { Photon, DbStatus } from '@/lib/types';

interface ExtendedPhoton extends Photon {
  color?: string;
  year?: number;
  likes: number;
}

// 对应 StarCanvas 的 Props 类型
interface StarPhotonData {
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

function PhotonDetailModal({ photon, onClose, onLike, companyColors }: any) {
  // ... (模态框代码保持不变，为节省篇幅略去，请保留您原有的代码) ...
  // 如果您需要我也把模态框代码贴出来，请告诉我，通常这部分不需要改动
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-black/80 border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white">✕</button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full relative flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]" style={{ background: `radial-gradient(circle at 30% 30%, white, ${photon.color})` }}>
            <span className="text-xl">✨</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: companyColors[photon.company] || '#666' }}></span>
               <span className="text-sm font-bold text-gray-300">{photon.company}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{photon.year}年 · {photon.type}</div>
          </div>
        </div>
        <div className="mb-8 relative">
          <p className="text-xl text-white leading-relaxed font-light italic relative z-10 px-2">"{photon.content}"</p>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center text-xs">👤</div>
             <div className="text-sm text-gray-400">{photon.author}</div>
          </div>
          <button onClick={() => onLike(photon.id)} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-medium text-white flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-purple-900/20">
            <span>💫</span><span>{photon.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'starfield' | 'list' | 'company'>('starfield');
  const [photons, setPhotons] = useState<ExtendedPhoton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<DbStatus>('connected');
  const [timeRange, setTimeRange] = useState<{ start: number; end: number }>({ start: 2015, end: 2035 });
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [selectedPhoton, setSelectedPhoton] = useState<ExtendedPhoton | null>(null);
  
  const loadPhotons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('photons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const dbPhotons: ExtendedPhoton[] = (data || []).map((p: any) => ({
        id: p.id,
        content: p.content,
        author: p.author_name || '匿名',
        type: p.template_type || 'moment',
        likes: p.likes_count || 0,
        time: new Date(p.created_at).toLocaleDateString(),
        company: p.author_company || '其他',
        year: new Date(p.created_at).getFullYear(),
        color: getTypeColor(p.template_type || 'moment'),
        isFromDB: true
      }));

      const demoPhotons = getDemoPhotons();
      setPhotons(error ? demoPhotons : [...dbPhotons, ...demoPhotons]);
      setDbStatus(error ? 'error' : 'connected');
    } catch (err) {
      console.error(err);
      setPhotons(getDemoPhotons());
      setDbStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'moment': '#3b82f6', 'prophecy': '#8b5cf6', 'culture': '#f59e0b',
      'inspiration': '#06b6d4', 'darkmoment': '#ef4444', 'history': '#f97316', 'onsite': '#10b981'
    };
    return colors[type] || '#6b7280';
  };

  useEffect(() => { loadPhotons(); }, []);

  // 关键更新：生成无限画布坐标
  const getStarfieldData = (): StarPhotonData[] => {
    // 定义总画布宽度 (对应20年时间跨度)
    // 假设每年占 200px，总共 4000px 宽
    const PIXELS_PER_YEAR = 200;
    
    return photons.map(photon => {
      const safeYear = photon.year || 2024;
      // 添加随机偏移，让同一年份的点不要垂直排成一列，显得更自然
      const yearRandomOffset = (Math.random() - 0.5) * PIXELS_PER_YEAR * 0.8;
      
      // 计算 X 轴绝对坐标
      // 公式：(年份 - 起始年份) * 每年像素 + 随机偏移
      const x = (safeYear - timeRange.start) * PIXELS_PER_YEAR + yearRandomOffset;
      
      // 计算 Y 轴 (0-100%)
      let y;
      if (activeCompany && photon.company === activeCompany) {
         y = 30 + Math.random() * 40; // 选中公司时聚集在中间
      } else {
         // 根据公司哈希值决定基础轨道，确保同一公司的点大致在同一高度层
         const hash = photon.company.split('').reduce((a,b)=>a+b.charCodeAt(0),0);
         const baseY = (hash % 70) + 15; // 15% - 85% 范围
         y = baseY + (Math.random() - 0.5) * 15; // 加上随机扰动
      }
      
      return {
        ...photon,
        x, // 这是绝对坐标，可能很大 (e.g., 3500)
        y, // 这是相对百分比
        year: safeYear,
        color: photon.color || getTypeColor(photon.type),
        size: Math.min(60, Math.max(12, photon.likes / 3 + 10)), // 调大一点尺寸
        brightness: Math.min(1, Math.max(0.5, photon.likes / 50)),
        companyColor: COMPANY_COLORS[photon.company] || '#6b7280'
      };
    });
  };

  const handleLikePhoton = (id: string | number) => {
    setPhotons(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden text-white font-sans selection:bg-blue-500/30 touch-none">
      
      {/* 1. 背景层：星空画布 */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${viewMode === 'starfield' ? 'opacity-100' : 'opacity-20 blur-sm'}`}>
        <StarCanvas 
          photons={getStarfieldData()}
          timeRange={timeRange}
          onPhotonClick={(p) => setSelectedPhoton(p as any)}
          activeCompany={activeCompany}
          activeTemplate={activeTemplate}
        />
      </div>

      {/* 2. 顶部导航 (不变) */}
      <div className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse">
              <span className="text-xl">🌌</span>
             </div>
             <div>
               <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-purple-100">光锥计划</h1>
               <div className="text-[10px] text-blue-300/60 uppercase tracking-widest font-medium">The Plan of Light Cone</div>
             </div>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <DatabaseStatus status={dbStatus} photonCount={photons.length} />
          <div className="flex items-center gap-2">
            <ViewSelector currentView={viewMode} onChange={setViewMode} />
            <button onClick={() => setIsAddModalOpen(true)} className="h-10 px-5 bg-white text-black rounded-full font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2">
              <span>✨</span><span>添加</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. 底部控制 (星空模式) */}
      {viewMode === 'starfield' && (
        <div className="absolute bottom-0 left-0 right-0 z-30 p-6 pointer-events-none">
          <div className="flex flex-col items-center gap-6">
            <div className="pointer-events-auto">
              <TemplateLegend templates={PHOTON_TEMPLATES} activeTemplate={activeTemplate} onTemplateClick={setActiveTemplate} />
            </div>
            {/* 提示文案更新 */}
            <div className="w-full max-w-xl flex justify-center text-xs text-white/40 font-mono animate-pulse">
              <span>← 按住拖拽，探索 2015-2035 行业光谱 →</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. 遮罩层：列表视图 */}
      {viewMode === 'list' && (
        <div className="absolute inset-0 z-20 pt-32 px-6 pb-6 bg-black/60 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="h-full max-w-7xl mx-auto bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <PhotonList photons={photons} />
          </div>
        </div>
      )}

      {/* 5. 遮罩层：公司视图 */}
      {viewMode === 'company' && (
        <div className="absolute inset-0 z-20 pt-32 px-6 pb-6 bg-black/60 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="h-full max-w-7xl mx-auto bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <CompanyView photons={photons} />
          </div>
        </div>
      )}

      {isAddModalOpen && <AddPhotonModal onClose={() => setIsAddModalOpen(false)} onSubmitSuccess={loadPhotons} templates={PHOTON_TEMPLATES} companyColors={COMPANY_COLORS} />}
      
      {selectedPhoton && <PhotonDetailModal photon={selectedPhoton} onClose={() => setSelectedPhoton(null)} onLike={handleLikePhoton} companyColors={COMPANY_COLORS} />}
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="text-blue-400 font-mono text-sm animate-pulse">Initializing Light Cone...</div>
          </div>
        </div>
      )}
    </div>
  );
}

// 演示数据 - 保持原有丰富度
function getDemoPhotons(): ExtendedPhoton[] {
  const companies = ["华为", "蔚来", "小鹏", "卓驭", "特斯拉", "百度", "理想", "Momenta", "地平线", "小米"];
  const types = ["moment", "prophecy", "culture", "inspiration", "darkmoment", "history"];
  
  return Array.from({ length: 50 }).map((_, i) => {
    const year = 2015 + Math.floor(Math.random() * 21);
    const company = companies[Math.floor(Math.random() * companies.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: -(i + 1),
      content: `这是第 ${i} 个光子，记录了 ${company} 在 ${year} 年的一个关键时刻。从L2到L4，我们见证了无数个不眠之夜。`,
      author: `工程师 ${i}`,
      type,
      likes: Math.floor(Math.random() * 100),
      time: `${year}-05-20`,
      company,
      year,
      color: '#3b82f6',
      isFromDB: false
    };
  });
}
