"use client";

import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

// ============ 第一步：配置Supabase ============
// 请替换成你自己的Supabase配置
const SUPABASE_URL = "https://wonvtbjjavlwczehenoi.supabase.co";  // 替换为你的Project URL
const SUPABASE_ANON_KEY = "sb_secret_UmawsU-xcCvKMFFiZREWpw_Kcr5t0ZC";  // 替换为你的anon key

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ 光子模板定义 ============
const PHOTON_TEMPLATES = [
  {
    id: "moment",
    name: "那个瞬间",
    color: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-300",
    icon: "🔵",
    prompt: "哪一刻让你觉得L4真的要来了，或者觉得L4遥遥无期？",
    example: "2025年冬，看着测试车在暴雪中无接管跑完了50公里，我第一次觉得不需要高精地图也行。",
    description: "记录行业关键突破或顿悟时刻"
  },
  {
    id: "prophecy", 
    name: "预言胶囊",
    color: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-300",
    icon: "🟣",
    prompt: "写给5年后的行业，或者5年后的自己。",
    example: "立贴为证，2028年之前，纯视觉方案解决不了所有的Corner Case。",
    description: "写给未来行业或自己的预言"
  },
  {
    id: "culture",
    name: "行业黑话",
    color: "bg-amber-500/20", 
    borderColor: "border-amber-500/30",
    textColor: "text-amber-300",
    icon: "🟡",
    prompt: "只有圈内人才懂的痛。",
    example: "又在这个路口接管了，感知和规控又要打架了。",
    description: "只有圈内人才懂的痛与梗"
  },
  {
    id: "onsite",
    name: "我在现场",
    color: "bg-green-500/20",
    borderColor: "border-green-500/30",
    textColor: "text-green-300",
    icon: "🟢",
    prompt: "分享你亲身经历的行业重要时刻",
    example: "2024年3月，在测试场亲眼看到无图方案首次突破1000公里无接管。",
    description: "亲身经历的行业重要时刻"
  },
  {
    id: "inspiration",
    name: "灵光闪现",
    color: "bg-cyan-500/20",
    borderColor: "border-cyan-500/30", 
    textColor: "text-cyan-300",
    icon: "💡",
    prompt: "那些突然的、改变思路的灵感时刻",
    example: "凌晨调试代码时突然想到用Transformer重构整个规控模块。",
    description: "改变思路的灵感时刻"
  },
  {
    id: "history",
    name: "历史回顾", 
    color: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-300",
    icon: "📜",
    prompt: "回顾自动驾驶发展史上的重要节点",
    example: "2016年，第一次看到特斯拉Autopilot在国内开放，就知道这行业要变天了。",
    description: "回顾行业发展重要节点"
  },
  {
    id: "darkmoment",
    name: "至暗时刻",
    color: "bg-red-500/20",
    borderColor: "border-red-500/30",
    textColor: "text-red-300",
    icon: "⚫",
    prompt: "分享那些困难、挫折但最终成长的时刻",
    example: "项目延期半年，团队走了一半人，在停车场抽烟时怀疑这一切是否值得。",
    description: "困难挫折但最终成长的时刻"
  }
];

// ============ 公司颜色映射 ============
const COMPANY_COLORS: Record<string, string> = {
  "华为": "border-red-500/30",
  "蔚来": "border-blue-500/30", 
  "小鹏": "border-green-500/30",
  "卓驭": "border-orange-500/30",
  "特斯拉": "border-gray-500/30",
  "百度": "border-blue-400/30",
  "理想": "border-purple-400/30",
  "其他": "border-gray-700/30"
};

// ============ 主组件 ============
export default function Home() {
  // 状态管理
  const [selectedTemplate, setSelectedTemplate] = useState(PHOTON_TEMPLATES[0]);
  const [photonContent, setPhotonContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorCompany, setAuthorCompany] = useState("");
  const [authorProfession, setAuthorProfession] = useState("");
  const [photons, setPhotons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ============ 加载光子数据 ============
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
        .limit(20);

      if (error) {
        console.error('加载光子失败:', error);
        // 如果数据库为空，使用初始数据
        setPhotons(getInitialPhotons());
      } else {
        // 转换数据库数据为前端格式
        const formattedPhotons = data.map((photon: any, index: number) => ({
          id: photon.id,
          content: photon.content,
          author: `${photon.author_name || '匿名用户'}${photon.author_profession ? ` · ${photon.author_profession}` : ''}${photon.author_company ? ` @ ${photon.author_company}` : ''}`,
          type: photon.template_type || 'moment',
          likes: photon.likes_count || 0,
          time: new Date(photon.created_at).toLocaleDateString('zh-CN'),
          company: photon.author_company || '其他',
          author_name: photon.author_name,
          author_company: photon.author_company,
          author_profession: photon.author_profession,
          isFromDB: true
        }));
        
        // 如果数据库有数据就使用，否则用初始数据
        if (formattedPhotons.length > 0) {
          setPhotons(formattedPhotons);
        } else {
          setPhotons(getInitialPhotons());
        }
      }
    } catch (error) {
      console.error('加载光子异常:', error);
      setPhotons(getInitialPhotons());
    } finally {
      setIsLoading(false);
    }
  };

  // 初始光子数据（备用）
  const getInitialPhotons = () => [
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
      content: "今天又在这个路口接管的记录被清空了，感知和规控继续扯皮。",
      author: "测试工程师 @ 小鹏", 
      type: "culture",
      likes: 36,
      time: "2024-03-13",
      company: "小鹏",
      isFromDB: false
    }
  ];

  // ============ 选择模板 ============
  const handleTemplateSelect = (template: typeof PHOTON_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    // 如果内容为空，可以自动填入示例
    if (!photonContent.trim()) {
      setPhotonContent(template.example);
    }
  };

  // ============ 提交光子 ============
  const handleSubmit = async () => {
    if (!photonContent.trim()) {
      alert("请先写下你的光子内容！");
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const { data, error } = await supabase
        .from('photons')
        .insert([
          {
            content: photonContent,
            template_type: selectedTemplate.id,
            author_name: authorName || '匿名同行',
            author_company: authorCompany || '',
            author_profession: authorProfession || '',
            likes_count: 0
          }
        ])
        .select();

      if (error) {
        console.error('提交失败:', error);
        alert(`提交失败: ${error.message}\n\n请检查Supabase配置是否正确。`);
      } else {
        console.log('提交成功:', data);
        setSubmitSuccess(true);
        
        // 清空表单
        setPhotonContent("");
        setAuthorName("");
        setAuthorCompany("");
        setAuthorProfession("");
        
        // 重新加载光子列表
        setTimeout(() => loadPhotons(), 1000);
        
        // 显示成功消息
        alert(`✨ 光子发射成功！\n\n你的声音已加入行业历史。\n感谢为自动驾驶行业留下宝贵记录！`);
      }
    } catch (error: any) {
      console.error('提交异常:', error);
      alert(`提交异常: ${error.message}\n\n请确保已正确配置Supabase。`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ 点赞光子 ============
  const handleLikePhoton = async (photonId: number) => {
    // 这里先实现前端效果，后续可以添加后端点赞
    const updatedPhotons = photons.map(photon => 
      photon.id === photonId 
        ? { ...photon, likes: photon.likes + 1 }
        : photon
    );
    setPhotons(updatedPhotons);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          ></div>
        ))}
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* 头部 */}
        <header className="mb-8 text-center pt-8">
          <div className="inline-block mb-6">
            <div className="text-6xl mb-2">✨</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              光锥计划
            </h1>
          </div>
          <p className="text-gray-300 text-lg md:text-xl mb-4">自动驾驶行业口述史 · 记录每个真实声音</p>
          <p className="text-gray-400 text-sm md:text-base mb-6 max-w-2xl mx-auto">
            在这里，每个从业者都是一个光子，汇聚成行业发展的光谱。
            记录2024-2034这关键的十年，从L2到L4的每一个真实瞬间。
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold transition-all shadow-lg shadow-blue-500/20 ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:opacity-90 hover:scale-105'
              }`}
            >
              {isSubmitting ? '发射中...' : '✨ 发射我的光子'}
            </button>
            <button className="px-6 py-3 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-full font-semibold hover:bg-gray-700/50 transition">
              🌌 探索星空视图
            </button>
          </div>

          {/* Supabase状态提示 */}
          <div className={`text-sm p-3 rounded-lg mb-4 ${SUPABASE_URL.includes('YOUR_PROJECT') ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
            {SUPABASE_URL.includes('YOUR_PROJECT') ? (
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>请先配置Supabase数据库（见代码第8-9行）</span>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                <span>数据库已连接 | 当前光子数: {photons.filter(p => p.isFromDB).length}</span>
              </div>
            )}
          </div>
        </header>

        {/* 光子创建表单 */}
        <div className="mb-12 bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <span className="mr-2">🚀</span> 发射你的光子
            <span className="ml-3 text-sm font-normal text-gray-400">(选择模板开始)</span>
          </h3>
          
          {/* 模板选择 */}
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
              {PHOTON_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 rounded-xl border transition-all ${selectedTemplate.id === template.id ? `${template.borderColor} ${template.color} scale-105` : 'border-gray-700/50 hover:border-gray-600'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{template.icon}</div>
                    <div className={`text-xs font-medium ${selectedTemplate.id === template.id ? template.textColor : 'text-gray-400'}`}>
                      {template.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* 模板说明 */}
            {selectedTemplate && (
              <div className={`p-4 rounded-lg ${selectedTemplate.color} border ${selectedTemplate.borderColor}`}>
                <div className="flex items-start mb-2">
                  <span className="text-lg mr-2">{selectedTemplate.icon}</span>
                  <div>
                    <h4 className="font-bold mb-1">{selectedTemplate.name}</h4>
                    <p className="text-sm opacity-90">{selectedTemplate.description}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">📝 引导语：</p>
                  <p className="text-sm mb-2">{selectedTemplate.prompt}</p>
                  <p className="text-sm font-medium mb-1">💡 示例：</p>
                  <p className="text-sm text-gray-300 italic">{selectedTemplate.example}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* 内容输入 */}
          <div className="mb-6">
            <textarea 
              value={photonContent}
              onChange={(e) => setPhotonContent(e.target.value)}
              className="w-full h-48 bg-black/40 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition"
              placeholder={`${selectedTemplate.prompt}\n\n可以参考示例格式，但请用你自己的真实经历...`}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-gray-500 text-sm">
                正在使用 <span className={selectedTemplate.textColor}>{selectedTemplate.name}</span> 模板
              </div>
              <div className="text-gray-500 text-sm">
                {photonContent.length}/500
              </div>
            </div>
          </div>

          {/* 作者信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">👤 称呼/昵称</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50 transition"
                placeholder="匿名同行"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">🏢 公司（可选）</label>
              <input
                type="text"
                value={authorCompany}
                onChange={(e) => setAuthorCompany(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50 transition"
                placeholder="如：华为、蔚来..."
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">💼 职业（可选）</label>
              <input
                type="text"
                value={authorProfession}
                onChange={(e) => setAuthorProfession(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50 transition"
                placeholder="如：感知算法工程师"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* 公司选择快捷按钮 */}
          <div className="mb-6">
            <p className="text-gray-400 mb-3 text-sm">🏢 快速选择公司（点击填充）</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(COMPANY_COLORS).map((company) => (
                <button
                  key={company}
                  onClick={() => setAuthorCompany(company)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${COMPANY_COLORS[company]} ${
                    authorCompany === company ? 'bg-gray-800' : 'bg-gray-900/50'
                  } hover:opacity-80 transition`}
                  disabled={isSubmitting}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>
          
          {/* 提交按钮 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
            <div className="text-gray-500 text-sm">
              {submitSuccess ? (
                <span className="text-green-400">✅ 光子已成功发射！正在更新列表...</span>
              ) : (
                "✨ 每个光子都将成为行业历史的一部分"
              )}
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !photonContent.trim()}
              className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold transition-all shadow-lg shadow-blue-500/20 ${
                isSubmitting || !photonContent.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:opacity-90 hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  发射中...
                </span>
              ) : '🚀 发射光子'}
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-blue-400">{photons.length}</div>
            <div className="text-gray-400">当前光子数</div>
            <div className="text-xs text-gray-500 mt-1">
              {photons.filter(p => p.isFromDB).length} 条来自数据库
            </div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-purple-400">
              {photons.reduce((sum, photon) => sum + photon.likes, 0)}
            </div>
            <div className="text-gray-400">总共鸣数</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-green-400">{PHOTON_TEMPLATES.length}</div>
            <div className="text-gray-400">光子模板</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-amber-400">
              {[...new Set(photons.map(p => p.author_name || p.author).filter(Boolean))].length}
            </div>
            <div className="text-gray-400">贡献同行</div>
          </div>
        </div>

        {/* 光子展示区 */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <span className="mr-3 text-yellow-400">🌟</span> 最新光子流
              <span className="ml-4 text-sm font-normal text-gray-400">
                {isLoading ? '加载中...' : `(共 ${photons.length} 条，按时间倒序)`}
              </span>
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={loadPhotons}
                className="px-3 py-1 bg-gray-800/50 rounded-lg text-sm hover:bg-gray-700/50 transition"
              >
                🔄 刷新
              </button>
              <button className="px-3 py-1 bg-blue-500/20 rounded-lg text-sm">全部</button>
              <button className="px-3 py-1 bg-purple-500/20 rounded-lg text-sm">预言胶囊</button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-400">加载光子中...</p>
            </div>
          ) : photons.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/30 rounded-2xl">
              <div className="text-4xl mb-4">🌌</div>
              <h3 className="text-xl font-bold mb-2">暂无光子</h3>
              <p className="text-gray-400 mb-6">成为第一个分享行业声音的人吧！</p>
              <button 
                onClick={() => document.querySelector('textarea')?.focus()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:opacity-90 transition"
              >
                ✨ 发射第一个光子
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {photons.map((photon) => {
                const template = PHOTON_TEMPLATES.find(t => t.id === photon.type);
                const companyColor = COMPANY_COLORS[photon.company] || COMPANY_COLORS["其他"];
                
                return (
                  <div 
                    key={photon.id}
                    className={`bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border ${companyColor} hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-0">
                        {template && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${template.color} ${template.textColor}`}>
                            {template.icon} {template.name}
                          </span>
                        )}
                        {photon.isFromDB && (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300">
                            ✅ 已保存
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-800/50">
                          {photon.company}
                        </span>
                        <span className="text-gray-400 text-sm">{photon.time}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleLikePhoton(photon.id)}
                          className="flex items-center text-gray-400 hover:text-red-400 transition group"
                        >
                          <span className="text-xl group-hover:scale-110 transition">❤️</span>
                          <span className="ml-2 font-medium">{photon.likes}</span>
                        </button>
                        <button className="text-gray-400 hover:text-blue-400 transition">💬</button>
                        <button className="text-gray-400 hover:text-green-400 transition">🔗</button>
                      </div>
                    </div>
                    
                    <p className="text-lg md:text-xl mb-5 leading-relaxed">{photon.content}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
                      <span className="text-gray-300">{photon.author}</span>
                      <div className="text-gray-500 text-sm">
                        #{photon.type} #{photon.company.replace(/\s+/g, '')}
                        {photon.isFromDB && ' #已保存'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 数据库状态说明 */}
        <div className="mb-16 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">💾</span> 数据库状态
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">📊 数据统计</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 总光子数: <span className="text-blue-400">{photons.length}</span></li>
                <li>• 数据库存储: <span className="text-green-400">{photons.filter(p => p.isFromDB).length}</span></li>
                <li>• 模板使用: <span className="text-purple-400">{[...new Set(photons.map(p => p.type))].length} 种</span></li>
                <li>• 涉及公司: <span className="text-amber-400">{[...new Set(photons.map(p => p.company))].length} 家</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">🔧 配置说明</h4>
              <p className="text-sm text-gray-400 mb-3">
                如需启用完整数据库功能，请：
              </p>
              <ol className="text-sm text-gray-300 space-y-2">
                <li>1. 注册 Supabase 账号</li>
                <li>2. 创建数据库表 <code className="bg-gray-800 px-1 rounded">photons</code></li>
                <li>3. 替换代码中的 URL 和密钥</li>
                <li>4. 测试提交功能</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <footer className="pt-8 border-t border-gray-800 text-center">
          <div className="mb-6">
            <p className="text-gray-300 text-lg">✨ 每个光子，都是历史的见证</p>
            <p className="text-gray-400 mt-2">光锥计划 · 为行业记录真实声音 · 始于2024年</p>
          </div>
          <div className="text-gray-500 text-sm">
            <p>自动驾驶从业者的数字纪念碑</p>
            <p className="mt-1">记录2024-2034 · 从L2到L4的关键十年</p>
            <p className="mt-2">
              当前版本: 数据库集成 v1.0 | 
              {SUPABASE_URL.includes('YOUR_PROJECT') ? ' 🚫 数据库待配置' : ' ✅ 数据库已连接'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
