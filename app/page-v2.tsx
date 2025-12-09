// app/page-v2.tsx 的完整代码
"use client";

import { useState, useEffect } from 'react';
import StarCanvas from '@/components/StarCanvas';
import ViewSelector from '@/components/ViewSelector';
import TemplateLegend from '@/components/TemplateLegend';
import { supabase } from '@/lib/supabase';
import { PHOTON_TEMPLATES } from '@/lib/templates';
import { COMPANY_COLORS } from '@/lib/companyColors';

type ViewMode = 'starfield' | 'list' | 'company';

interface Photon {
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
}

export default function HomeV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('starfield');
  const [photons, setPhotons] = useState<Photon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState({ start: 2015, end: 2035 });
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  
  // 加载光子数据
  useEffect(() => {
    loadPhotons();
  }, []);
  
  const loadPhotons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('photons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      const formatted: Photon[] = data.map((photon: any) => ({
        id: photon.id,
        content: photon.content,
        author: `${photon.author_name || '匿名'}${photon.author_profession ? ` · ${photon.author_profession}` : ''}${photon.author_company ? ` @ ${photon.author_company}` : ''}`,
        type: photon.template_type || 'moment',
        likes: photon.likes_count || 0,
        time: new Date(photon.created_at).toLocaleDateString('zh-CN'),
        company: photon.author_company || '其他',
        author_name: photon.author_name,
        author_company: photon.author_company,
        author_profession: photon.author_profession,
        isFromDB: true
      }));
      
      setPhotons(formatted);
    } catch (error) {
      console.error('加载失败:', error);
      // 使用示例数据
      setPhotons(getDemoPhotons());
    } finally {
      setIsLoading(false);
    }
  };
  
  // 示例数据
  const getDemoPhotons = (): Photon[] => [
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
  
  // 转换星图数据
  const getStarfieldData = () => {
    return photons.map((photon, index) => {
      const year = parseInt(photon.time.split('-')[0]) || 2024;
      return {
        id: photon.id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.min(40, Math.max(15, photon.likes / 2 + 15)),
        brightness: Math.min(1, Math.max(0.3, photon.likes / 100)),
        type: photon.type,
        company: photon.company,
        year: year,
        content: photon.content,
        author: photon.author,
        likes: photon.likes
      };
    });
  };
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 星空画布 */}
      <div className="absolute inset-0">
        <StarCanvas 
          photons={getStarfieldData()}
          timeRange={timeRange}
          onPhotonClick={(photon) => {
            alert(`光子详情:\n\n${photon.content}\n\n作者: ${photon.author}\n共鸣: ${photon.likes}`);
          }}
          activeCompany={activeCompany}
          activeTemplate={activeTemplate}
        />
      </div>
      
      {/* 顶部标题 */}
      <div className="absolute top-6 left-6 z-30">
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-pulse">🌌</div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              光锥计划
            </h1>
            <p className="text-gray-400 mt-2 text-sm">自动驾驶行业光谱 · 2015-2035</p>
          </div>
        </div>
      </div>
      
      {/* 右上角控制 */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <ViewSelector currentView={viewMode} onChange={setViewMode} />
        
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-white flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="text-lg">✨</span>
          <span>添加光子</span>
        </button>
      </div>
      
      {/* 模板图例 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-4xl">
        <TemplateLegend 
          templates={PHOTON_TEMPLATES}
          activeTemplate={activeTemplate}
          onTemplateClick={setActiveTemplate}
        />
      </div>
    </div>
  );
}
