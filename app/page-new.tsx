"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { PHOTON_TEMPLATES } from '@/lib/templates';
import { COMPANY_COLORS } from '@/lib/companyColors';
import StarCanvas from '@/components/StarCanvas';
import AddPhotonModal from '@/components/AddPhotonModal';
import ViewSelector from '@/components/ViewSelector';
import PhotonList from '@/components/PhotonList';
import CompanyView from '@/components/CompanyView';
import TemplateLegend from '@/components/TemplateLegend';

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

export default function HomePage() {
  // 状态管理
  const [viewMode, setViewMode] = useState<ViewMode>('starfield');
  const [photons, setPhotons] = useState<Photon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error'>('connected');
  const [timeRange, setTimeRange] = useState<{ start: number; end: number }>({ start: 2015, end: 2035 });
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  
  // 加载光子数据
  const loadPhotons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('photons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedPhotons: Photon[] = data.map((photon: any) => ({
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
      
      setPhotons(formattedPhotons);
      setDbStatus('connected');
    } catch (error) {
      console.error('加载失败:', error);
      setDbStatus('error');
      // 使用示例数据
      setPhotons(getDemoPhotons());
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadPhotons();
  }, []);

  // 获取星图数据
  const getStarfieldData = () => {
    return photons.map(photon => ({
      id: photon.id,
      x: Math.random() * 100, // 在实际实现中应根据年份计算
      y: Math.random() * 100,
      size: Math.min(40, Math.max(15, photon.likes / 2 + 15)),
      brightness: Math.min(1, Math.max(0.3, photon.likes / 100)),
      type: photon.type,
      company: photon.company,
      year: parseInt(photon.time.split('-')[0]) || 2024,
      content: photon.content,
      author: photon.author,
      likes: photon.likes
    }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 星空画布背景 */}
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

      {/* 顶部渐变遮罩 */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent z-20"></div>

      {/* 底部渐变遮罩 */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-20"></div>

      {/* 主标题和描述 */}
      <div className="absolute top-8 left-8 z-30">
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

      {/* 数据库状态 */}
      <div className="absolute top-8 right-32 z-30">
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${dbStatus === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {dbStatus === 'connected' ? `✅ ${photons.length}个光子` : '❌ 演示模式'}
        </div>
      </div>

      {/* 右上角控制面板 */}
      <div className="absolute top-8 right-8 z-30 flex items-center gap-3">
        {/* 视图选择 */}
        <ViewSelector 
          currentView={viewMode}
          onChange={setViewMode}
        />
        
        {/* 添加光子按钮 */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-white flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="text-lg">✨</span>
            <span>添加光子</span>
          </div>
        </button>
      </div>

      {/* 时间轴控制 */}
      <div className="absolute left-1/2 bottom-32 transform -translate-x-1/2 z-30">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-6">
            <div className="text-white text-sm">
              <span className="text-gray-400">时间轴:</span> {timeRange.start} - {timeRange.end}
            </div>
            <div className="relative w-64">
              <input
                type="range"
                min="2015"
                max="2035"
                value={timeRange.start}
                onChange={(e) => setTimeRange({ ...timeRange, start: parseInt(e.target.value) })}
                className="absolute w-full appearance-none h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ zIndex: 2 }}
              />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 模板图例 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-4xl">
        <TemplateLegend 
          templates={PHOTON_TEMPLATES}
          activeTemplate={activeTemplate}
          onTemplateClick={setActiveTemplate}
        />
      </div>

      {/* 公司筛选器 */}
      <div className="absolute left-8 bottom-32 z-30">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex flex-wrap gap-2 max-w-xs">
            {Object.keys(COMPANY_COLORS).map(company => (
              <button
                key={company}
                onClick={() => setActiveCompany(activeCompany === company ? null : company)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${activeCompany === company ? 'scale-105' : ''}`}
                style={{
                  background: activeCompany === company ? 
                    `linear-gradient(135deg, ${COMPANY_COLORS[company].replace('border-', '').replace('/30', '')}80, transparent)` :
                    'rgba(255,255,255,0.05)',
                  border: `1px solid ${COMPANY_COLORS[company]}`
                }}
              >
                {company}
              </button>
            ))}
            {activeCompany && (
              <button
                onClick={() => setActiveCompany(null)}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-800/50 hover:bg-gray-700/50 transition"
              >
                ✕ 清空
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 列表视图占位符（暂时简化） */}
{viewMode === 'list' && (
  <div className="absolute inset-x-8 top-24 bottom-32 bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 overflow-y-auto">
    <div className="text-center py-16">
      <div className="text-6xl mb-6">📜</div>
      <h3 className="text-2xl font-bold text-white mb-4">列表视图</h3>
      <p className="text-gray-400 mb-8">正在开发中，敬请期待...</p>
      <button 
        onClick={() => setViewMode('starfield')}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:scale-105 transition-transform"
      >
        返回星空视图
      </button>
    </div>
  </div>
)}

{/* 公司视图占位符（暂时简化） */}
{viewMode === 'company' && (
  <div className="absolute inset-x-8 top-24 bottom-32 bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 overflow-y-auto">
    <div className="text-center py-16">
      <div className="text-6xl mb-6">🏢</div>
      <h3 className="text-2xl font-bold text-white mb-4">公司视图</h3>
      <p className="text-gray-400 mb-8">正在开发中，敬请期待...</p>
      <button 
        onClick={() => setViewMode('starfield')}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:scale-105 transition-transform"
      >
        返回星空视图
      </button>
    </div>
  </div>
)}

      {/* 添加光子模态框 */}
      {isAddModalOpen && (
        <AddPhotonModal 
          onClose={() => setIsAddModalOpen(false)}
          onSubmitSuccess={() => {
            loadPhotons();
            setIsAddModalOpen(false);
          }}
          templates={[...PHOTON_TEMPLATES]}
          companyColors={COMPANY_COLORS}
        />
      )}

      {/* 交互提示 */}
      {viewMode === 'starfield' && photons.length > 0 && (
        <div className="absolute bottom-48 right-8 z-30">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 animate-pulse">
            <div className="text-sm text-gray-400">✨ 点击星空中的光子查看详情</div>
            <div className="text-xs text-gray-500 mt-1">滚动缩放 · 拖动平移</div>
          </div>
        </div>
      )}
    </div>
  );
}

// 演示数据
function getDemoPhotons(): Photon[] {
  return [
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
    },
    {
      id: 3,
      content: "又在这个路口接管了，感知和规控又要打架了。",
      author: "规控工程师 @ 小鹏",
      type: "culture",
      likes: 35,
      time: "2024-03-13",
      company: "小鹏",
      isFromDB: false
    }
  ];
}
