// app/page-new.tsx - 修复版
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
import PhotonDetailModal from '@/components/PhotonDetailModal';
import DatabaseStatus from '@/components/DatabaseStatus';

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
  color?: string;
  year?: number;
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
  const [selectedPhoton, setSelectedPhoton] = useState<Photon | null>(null);
  
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

      const formattedPhotons: Photon[] = data.map((photon: any) => {
        const date = new Date(photon.created_at);
        const year = date.getFullYear();
        const typeColor = getTypeColor(photon.template_type || 'moment');
        
        return {
          id: photon.id,
          content: photon.content,
          author: `${photon.author_name || '匿名'}${photon.author_profession ? ` · ${photon.author_profession}` : ''}${photon.author_company ? ` @ ${photon.author_company}` : ''}`,
          type: photon.template_type || 'moment',
          likes: photon.likes_count || 0,
          time: date.toLocaleDateString('zh-CN'),
          company: photon.author_company || '其他',
          author_name: photon.author_name,
          author_company: photon.author_company,
          author_profession: photon.author_profession,
          isFromDB: true,
          color: typeColor,
          year: year
        };
      });
      
      // 合并演示数据
      const demoPhotons = getDemoPhotons();
      setPhotons([...formattedPhotons, ...demoPhotons]);
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

  // 获取类型颜色
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'moment': '#3b82f6',
      'prophecy': '#8b5cf6',
      'culture': '#f59e0b',
      'inspiration': '#06b6d4',
      'darkmoment': '#ef4444',
      'history': '#f97316',
      'onsite': '#10b981'
    };
    return colors[type] || '#6b7280';
  };

  // 初始加载
  useEffect(() => {
    loadPhotons();
  }, []);

  // 获取星图数据
  const getStarfieldData = () => {
    return photons.map(photon => {
      // 根据年份计算x位置
      const year = photon.year || 2024;
      const yearProgress = (year - timeRange.start) / (timeRange.end - timeRange.start);
      const x = yearProgress * 80 + 10; // 10%到90%的范围
      
      // 根据公司和类型计算y位置
      const companies = [...new Set(photons.map(p => p.company))];
      const companyIndex = companies.indexOf(photon.company);
      const y = (companyIndex / (companies.length || 1)) * 70 + 15;
      
      return {
        id: photon.id,
        x: x,
        y: y,
        size: Math.min(40, Math.max(15, photon.likes / 2 + 15)),
        brightness: Math.min(1, Math.max(0.3, photon.likes / 100)),
        type: photon.type,
        company: photon.company,
        year: year,
        content: photon.content,
        author: photon.author,
        likes: photon.likes,
        color: photon.color || getTypeColor(photon.type),
        companyColor: COMPANY_COLORS[photon.company] || '#6b7280'
      };
    });
  };

  // 处理光子点击
  const handlePhotonClick = (photonData: any) => {
    const foundPhoton = photons.find(p => p.id === photonData.id);
    if (foundPhoton) {
      setSelectedPhoton({
        ...foundPhoton,
        ...photonData
      });
    }
  };

  // 处理共鸣（点赞）
  const handleLikePhoton = (photonId: string | number) => {
    setPhotons(prev => prev.map(photon => 
      photon.id === photonId 
        ? { ...photon, likes: photon.likes + 1 }
        : photon
    ));
    
    // 这里可以添加API调用更新数据库
    console.log('共鸣了光子:', photonId);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 星空画布背景 */}
      <div className="absolute inset-0 z-0">
        <StarCanvas 
          photons={getStarfieldData()}
          timeRange={timeRange}
          onPhotonClick={handlePhotonClick}
          activeCompany={activeCompany}
          activeTemplate={activeTemplate}
        />
      </div>

      {/* 顶部渐变遮罩 */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/90 to-transparent z-10 pointer-events-none"></div>

      {/* 顶部导航栏 */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-6">
        <div className="flex justify-between items-start">
          {/* 左侧标题 */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="text-5xl animate-pulse">🌌</div>
              <div className="absolute -inset-2 bg-blue-500/20 blur-xl rounded-full"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                光锥计划
              </h1>
              <p className="text-gray-400 mt-2 text-sm">自动驾驶行业光谱 · 记录最真实的声音</p>
            </div>
          </div>

          {/* 右侧控制区 */}
          <div className="flex flex-col items-end gap-4">
            {/* 数据库状态 */}
            <DatabaseStatus 
              status={dbStatus} 
              photonCount={photons.length}
            />
            
            <div className="flex items-center gap-3">
              {/* 视图选择 */}
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-1">
                <ViewSelector 
                  currentView={viewMode}
                  onChange={setViewMode}
                />
              </div>
              
              {/* 添加光子按钮 */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-full font-semibold text-white flex items-center gap-2 hover:scale-105 transition-all duration-200">
                  <span className="text-lg">✨</span>
                  <span>添加光子</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="absolute inset-0 z-10 pt-28 pb-48 px-6">
        {/* 星空视图 */}
        {viewMode === 'starfield' && (
          <div className="h-full relative">
            {/* 时间轴控制 */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-4xl">
                <div className="flex items-center justify-between gap-6">
                  <div className="text-white">
                    <div className="text-sm text-gray-400 mb-1">时间范围</div>
                    <div className="text-2xl font-bold">
                      {timeRange.start} - {timeRange.end}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ 
                          left: `${((timeRange.start - 2015) / 20) * 100}%`,
                          width: `${((timeRange.end - timeRange.start) / 20) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      {[2015, 2020, 2025, 2030, 2035].map(year => (
                        <span key={year}>{year}</span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setTimeRange({ start: 2015, end: 2035 })}
                    className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  >
                    重置
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <div className="h-full bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">
            <PhotonList photons={photons} />
          </div>
        )}

        {/* 公司视图 */}
        {viewMode === 'company' && (
          <div className="h-full bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">
            <CompanyView photons={photons} />
          </div>
        )}
      </div>

      {/* 左侧控制面板 - 公司筛选 */}
      {viewMode === 'starfield' && (
        <div className="absolute left-6 top-48 z-20">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <span>🏢</span>
              <span>公司筛选</span>
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              <button
                onClick={() => setActiveCompany(null)}
                className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all flex items-center gap-2 ${
                  !activeCompany ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/5 text-gray-400'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <span>全部公司</span>
              </button>
              
              {Object.keys(COMPANY_COLORS).map(company => (
                <button
                  key={company}
                  onClick={() => setActiveCompany(activeCompany === company ? null : company)}
                  className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all flex items-center gap-2 ${
                    activeCompany === company 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white' 
                      : 'hover:bg-white/5 text-gray-400'
                  }`}
                  style={{
                    borderLeft: activeCompany === company ? `3px solid ${COMPANY_COLORS[company]}` : 'none'
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COMPANY_COLORS[company] }}
                  ></div>
                  <span>{company}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {photons.filter(p => p.company === company).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 底部图例 */}
      {viewMode === 'starfield' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <TemplateLegend 
            templates={PHOTON_TEMPLATES}
            activeTemplate={activeTemplate}
            onTemplateClick={setActiveTemplate}
          />
        </div>
      )}

      {/* 交互提示 */}
      {viewMode === 'starfield' && photons.length > 0 && (
        <div className="absolute bottom-6 right-6 z-20">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 animate-pulse">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span>✨</span>
              <span>点击光子查看详情</span>
              <span className="text-gray-500">•</span>
              <span>滚轮缩放</span>
              <span className="text-gray-500">•</span>
              <span>拖动平移</span>
            </div>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-spin">🌌</div>
            <div className="text-gray-400">加载光子中...</div>
          </div>
        </div>
      )}

      {/* 光子详情模态框 */}
      {selectedPhoton && (
        <PhotonDetailModal
          photon={selectedPhoton}
          onClose={() => setSelectedPhoton(null)}
          onLike={handleLikePhoton}
          companyColors={COMPANY_COLORS}
        />
      )}

      {/* 添加光子模态框 */}
      {isAddModalOpen && (
        <AddPhotonModal 
          onClose={() => setIsAddModalOpen(false)}
          onSubmitSuccess={() => {
            loadPhotons();
            setIsAddModalOpen(false);
          }}
          templates={PHOTON_TEMPLATES}
          companyColors={COMPANY_COLORS}
        />
      )}
    </div>
  );
}

// 演示数据
function getDemoPhotons(): Photon[] {
  const companies = ["华为", "蔚来", "小鹏", "卓驭", "特斯拉", "百度", "理想"];
  const types = ["moment", "prophecy", "culture", "inspiration", "darkmoment", "history"];
  const typeNames = {
    "moment": "那个瞬间",
    "prophecy": "预言胶囊", 
    "culture": "团队文化",
    "inspiration": "灵光闪现",
    "darkmoment": "至暗时刻",
    "history": "历史记录"
  };
  
  const demoPhotons: Photon[] = [];
  
  // 生成50个虚拟光子
  for (let i = 0; i < 50; i++) {
    const year = Math.floor(Math.random() * (2035 - 2015 + 1)) + 2015;
    const company = companies[Math.floor(Math.random() * companies.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = getTypeColor(type);
    
    const contents = [
      `在${company}的${year}年，我们终于实现了城市NOA的首次大规模推送。`,
      `${year}年${company}的战略会上，我们决定全面转向端到端方案。`,
      `那个深夜的停车场，我们的系统第一次自主完成了泊车。`,
      `预测：到${year + 5}年，80%的新车将标配L2+系统。`,
      `当看到竞品发布类似功能时，整个团队都沉默了。`,
      `凌晨3点的办公室，咖啡机都累了，但算法终于收敛了。`,
      `第一次路测失控，那一刻理解了"责任"二字的分量。`,
      `用户报告的第一个bug，让我们重新思考产品定义。`,
      `从L2到L3，不只是技术升级，更是责任的跨越。`,
      `AI驾驶的时代，数据和算法正在重新定义一切。`
    ];
    
    const authorNames = ["工程师张", "产品王", "算法李", "测试赵", "架构刘"];
    const professions = ["感知算法", "规控开发", "系统架构", "产品经理", "测试工程师"];
    
    demoPhotons.push({
      id: `demo_${i}`,
      content: contents[Math.floor(Math.random() * contents.length)],
      author: `${authorNames[Math.floor(Math.random() * authorNames.length)]} · ${professions[Math.floor(Math.random() * professions.length)]} @ ${company}`,
      type: type,
      likes: Math.floor(Math.random() * 100),
      time: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      company: company,
      author_name: "匿名",
      author_company: company,
      author_profession: "工程师",
      isFromDB: false,
      color: color,
      year: year
    });
  }
  
  // 添加一些特定的高质量数据
  demoPhotons.push(
    {
      id: 'special_1',
      content: "2024年，第一次看到端到端大模型在车上运行，我知道游戏规则要变了。",
      author: "感知算法工程师 @ 华为",
      type: "moment",
      likes: 142,
      time: "2024-03-15",
      company: "华为",
      isFromDB: false,
      color: getTypeColor("moment"),
      year: 2024
    },
    {
      id: 'special_2',
      content: "预言：2027年之前，L4会在特定场景落地，但通用L4仍需10年。",
      author: "系统架构师 @ 蔚来",
      type: "prophecy",
      likes: 89,
      time: "2024-03-14",
      company: "蔚来",
      isFromDB: false,
      color: getTypeColor("prophecy"),
      year: 2024
    },
    {
      id: 'special_3',
      content: "又在这个路口接管了，感知和规控又要打架了。",
      author: "规控工程师 @ 小鹏",
      type: "culture",
      likes: 65,
      time: "2024-03-13",
      company: "小鹏",
      isFromDB: false,
      color: getTypeColor("culture"),
      year: 2024
    }
  );
  
  return demoPhotons;
}

// 类型颜色函数（在组件外部）
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'moment': '#3b82f6',
    'prophecy': '#8b5cf6',
    'culture': '#f59e0b',
    'inspiration': '#06b6d4',
    'darkmoment': '#ef4444',
    'history': '#f97316',
    'onsite': '#10b981'
  };
  return colors[type] || '#6b7280';
}
