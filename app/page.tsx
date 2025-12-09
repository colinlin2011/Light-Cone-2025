"use client";

import { useState, useEffect } from "react";
import StarBackground from "@/components/StarBackground";
import DatabaseStatus from "@/components/DatabaseStatus";
import PhotonForm from "@/components/PhotonForm";
import PhotonList from "@/components/PhotonList";
import StarFieldVisualization from "@/components/StarFieldVisualization";
import PhotonCard from "@/components/PhotonCard";
import { supabase } from "@/lib/supabase";
import { COMPANY_COLORS } from "@/lib/companyColors";
import { PHOTON_TEMPLATES, PhotonTemplate } from "@/lib/templates";
import { DbStatus } from "@/lib/types";
import { formatPhotonFromDB, getInitialPhotons } from "@/utils/photonUtils";

// 主题颜色映射（用于星空视图）
const THEME_COLORS: Record<string, string> = {
  'moment': '#3b82f6',      // 那个瞬间 - 蓝色
  'prophecy': '#8b5cf6',    // 预言胶囊 - 紫色
  'culture': '#f59e0b',     // 行业黑话 - 橙色
  'onsite': '#10b981',      // 我在现场 - 绿色
  'inspiration': '#06b6d4', // 灵光闪现 - 青色
  'history': '#f97316',     // 历史回顾 - 橙色
  'darkmoment': '#ef4444',  // 至暗时刻 - 红色
  'default': '#6b7280'
};

export default function Home() {
  // 状态管理
  const [selectedTemplate, setSelectedTemplate] = useState<PhotonTemplate>(PHOTON_TEMPLATES[0]);
  const [photonContent, setPhotonContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorCompany, setAuthorCompany] = useState("");
  const [authorProfession, setAuthorProfession] = useState("");
  const [photons, setPhotons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState<DbStatus>("checking");
  const [viewMode, setViewMode] = useState<'list' | 'starfield'>('list');

  // 加载光子数据
  useEffect(() => {
    loadPhotons();
  }, []);

  const loadPhotons = async () => {
    setIsLoading(true);
    setDbStatus("checking");
    
    try {
      console.log("正在连接Supabase...");
      
      // 先测试连接
      const { data: testData, error: testError } = await supabase
        .from('photons')
        .select('count', { count: 'exact', head: true });
        
      if (testError) {
        console.error("Supabase连接测试失败:", testError);
        setDbStatus("error");
        setPhotons(getInitialPhotons());
        return;
      }
      
      console.log("Supabase连接成功!");
      setDbStatus("connected");
      
      // 加载光子数据
      const { data, error } = await supabase
        .from('photons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('加载光子失败:', error);
        setPhotons(getInitialPhotons());
      } else if (data && data.length > 0) {
        // 转换数据库数据
        const formattedPhotons = data.map((photon: any) => formatPhotonFromDB(photon));
        
        setPhotons(formattedPhotons);
        console.log("从数据库加载了", formattedPhotons.length, "个光子");
      } else {
        console.log("数据库为空，使用示例数据");
        setPhotons(getInitialPhotons());
      }
    } catch (error) {
      console.error('加载光子异常:', error);
      setDbStatus("error");
      setPhotons(getInitialPhotons());
    } finally {
      setIsLoading(false);
    }
  };

  // 选择模板
  const handleTemplateSelect = (template: PhotonTemplate) => {
    setSelectedTemplate(template);
    if (!photonContent.trim()) {
      setPhotonContent(template.example);
    }
  };

  // 提交光子
  const handleSubmit = async () => {
    if (!photonContent.trim()) {
      alert("请先写下你的光子内容！");
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      console.log("正在提交光子到Supabase...");
      
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
        alert(`❌ 提交失败: ${error.message}\n\n请检查控制台查看详细错误。`);
      } else {
        console.log('✅ 提交成功:', data);
        setSubmitSuccess(true);
        
        // 清空表单
        setPhotonContent("");
        setAuthorName("");
        setAuthorCompany("");
        setAuthorProfession("");
        
        // 重新加载光子列表
        setTimeout(() => {
          loadPhotons();
          alert(`✨ 光子发射成功！\n\n你的声音已永久保存到行业历史中。`);
        }, 500);
      }
    } catch (error: any) {
      console.error('提交异常:', error);
      alert(`⚠️ 提交异常: ${error.message}\n\n请按F12打开控制台查看错误详情。`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 点赞光子（暂时只前端）
  const handleLikePhoton = async (photonId: number | string) => {
    const updatedPhotons = photons.map(photon => 
      photon.id === photonId 
        ? { ...photon, likes: photon.likes + 1 }
        : photon
    );
    setPhotons(updatedPhotons);
  };

  // 转换光子数据为星空视图格式
  const getStarfieldPhotons = () => {
    return photons.map((photon, index) => {
      const theme = photon.type || 'moment';
      const color = THEME_COLORS[theme] || THEME_COLORS.default;
      
      // 解析年份
      let year = 2024;
      if (photon.time && typeof photon.time === 'string') {
        const yearMatch = photon.time.match(/\d{4}/);
        if (yearMatch) year = parseInt(yearMatch[0]);
      }
      
      return {
        id: photon.id,
        year: year,
        x: (index % 10) * 8 + 15 + Math.random() * 5, // 基于索引分布
        y: Math.floor(index / 10) * 12 + 20 + Math.random() * 10,
        size: Math.min(40, Math.max(20, (photon.likes || 0) / 5 + 20)),
        theme: theme,
        color: color,
        title: photon.content.length > 50 ? photon.content.substring(0, 50) + '...' : photon.content,
        character: photon.author_name || '匿名同行',
        company: photon.author_company || '其他',
        description: photon.content,
        resonance: photon.likes || 0
      };
    });
  };

  // 处理星空视图中的光子点击
  const handleStarfieldPhotonClick = (photon: any) => {
    alert(`✨ 光子详情\n\n📝 内容: ${photon.description}\n\n👤 作者: ${photon.character}\n🏢 公司: ${photon.company}\n🎯 共鸣数: ${photon.resonance}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8">
      <StarBackground />
      
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
          
          <DatabaseStatus 
            status={dbStatus} 
            photonCount={photons.filter(p => p.isFromDB).length} 
          />
          
          {/* 视图切换和功能按钮 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20' 
                  : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
              }`}
            >
              📜 列表视图
            </button>
            <button 
              onClick={() => setViewMode('starfield')}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                viewMode === 'starfield' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20' 
                  : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
              }`}
            >
              🌌 星空视图
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold transition-all shadow-lg shadow-blue-500/20 ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:opacity-90 hover:scale-105'
              }`}
            >
              {isSubmitting ? '🚀 发射中...' : '✨ 发射我的光子'}
            </button>
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
                  disabled={isSubmitting}
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

        {/* 根据视图模式显示不同内容 */}
        {viewMode === 'list' ? (
          // 列表视图
          <PhotonList
            photons={photons}
            isLoading={isLoading}
            onRefresh={loadPhotons}
            onLike={handleLikePhoton}
            templates={PHOTON_TEMPLATES}
            companyColors={COMPANY_COLORS}
          />
        ) : (
          // 星空视图
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <span className="mr-3 text-yellow-400">🌌</span> 星空视图
                <span className="ml-4 text-sm font-normal text-gray-400">
                  {isLoading ? '加载中...' : `(共 ${photons.length} 个光子)`}
                </span>
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={loadPhotons}
                  className="px-3 py-1 bg-gray-800/50 rounded-lg text-sm hover:bg-gray-700/50 transition"
                >
                  🔄 刷新
                </button>
              </div>
            </div>
            
            {/* 星空可视化画布 */}
            <div className="h-[600px] rounded-2xl overflow-hidden border border-gray-700/50 relative mb-8">
              <StarFieldVisualization
                photons={getStarfieldPhotons()}
                onPhotonClick={handleStarfieldPhotonClick}
                className="w-full h-full"
              />
              
              {/* 星空视图说明 */}
              <div className="absolute top-4 right-4">
                <div className="bg-black/60 backdrop-blur-lg rounded-lg p-3 max-w-xs">
                  <div className="text-sm font-medium text-gray-300 mb-2">✨ 使用说明</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• 点击光子查看详情</li>
                    <li>• 亮度表示热度</li>
                    <li>• 大小表示重要性</li>
                    <li>• 颜色表示类型</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* 在星空视图下也显示几个光子卡片作为预览 */}
            {photons.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">✨ 精选光子预览</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {photons.slice(0, 2).map((photon) => (
                    <PhotonCard
                      key={photon.id}
                      photon={{
                        id: photon.id,
                        title: photon.content.length > 50 ? photon.content.substring(0, 50) + '...' : photon.content,
                        year: new Date().getFullYear(),
                        character: photon.author_name || '匿名同行',
                        company: photon.author_company || '其他',
                        description: photon.content,
                        theme: photon.type || 'moment',
                        resonance: photon.likes || 0,
                        color: '#3b82f6'
                      }}
                      onResonate={() => handleLikePhoton(photon.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 底部信息 */}
        <footer className="pt-8 border-t border-gray-800 text-center">
          <div className="mb-6">
            <p className="text-gray-300 text-lg">✨ 每个光子，都是历史的见证</p>
            <p className="text-gray-400 mt-2">光锥计划 · 为行业记录真实声音 · 始于2024年</p>
          </div>
          <div className="text-gray-500 text-sm">
            <p>自动驾驶从业者的数字纪念碑</p>
            <p className="mt-1">记录2024-2034 · 从L2到L4的关键十年</p>
            <p className="mt-2">当前版本: v3.0 | 星空视图已启用 | 新加坡节点</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
