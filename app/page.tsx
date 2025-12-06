"use client";

import { useState } from "react";

// 光子模板定义
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

// 初始光子数据
const INITIAL_PHOTONS = [
  {
    id: 1,
    content: "2024年，第一次看到端到端大模型在车上运行，我知道游戏规则要变了。",
    author: "感知算法工程师 @ 华为",
    type: "moment",
    likes: 42,
    time: "2024-03-15",
    company: "华为"
  },
  {
    id: 2, 
    content: "预言：2027年之前，L4会在特定场景落地，但通用L4仍需10年。",
    author: "系统架构师 @ 蔚来",
    type: "prophecy",
    likes: 28,
    time: "2024-03-14",
    company: "蔚来"
  },
  {
    id: 3,
    content: "今天又在这个路口接管的记录被清空了，感知和规控继续扯皮。",
    author: "测试工程师 @ 小鹏", 
    type: "culture",
    likes: 36,
    time: "2024-03-13",
    company: "小鹏"
  },
  {
    id: 4,
    content: "2023年底，看着测试车在暴雪中无接管跑完50公里，我第一次觉得不需要高精地图也行。",
    author: "规控算法 @ 卓驭",
    type: "moment", 
    likes: 56,
    time: "2024-03-12",
    company: "卓驭"
  },
  {
    id: 5,
    content: "立贴为证：2028年之前，纯视觉方案解决不了所有的Corner Case。",
    author: "传感器专家 @ 特斯拉",
    type: "prophecy",
    likes: 39,
    time: "2024-03-10",
    company: "特斯拉"
  }
];

// 公司颜色映射
const COMPANY_COLORS: Record<string, string> = {
  "华为": "border-red-500/30",
  "蔚来": "border-blue-500/30", 
  "小鹏": "border-green-500/30",
  "卓驭": "border-orange-500/30",
  "特斯拉": "border-gray-500/30",
  "其他": "border-gray-700/30"
};

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState(PHOTON_TEMPLATES[0]);
  const [photonContent, setPhotonContent] = useState("");
  
  const handleTemplateSelect = (template: typeof PHOTON_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    // 如果内容为空，可以自动填入示例
    if (!photonContent.trim()) {
      setPhotonContent(template.example);
    }
  };

  const handleSubmit = () => {
    if (!photonContent.trim()) {
      alert("请先写下你的光子内容！");
      return;
    }
    
    // 这里暂时用alert模拟提交，后续会连接数据库
    alert(`✨ 光子发射成功！\n\n模板：${selectedTemplate.name}\n内容：${photonContent}\n\n（目前是演示模式，后续会保存到数据库）`);
    setPhotonContent("");
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              ✨ 发射我的光子
            </button>
            <button className="px-6 py-3 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-full font-semibold hover:bg-gray-700/50 transition">
              🌌 探索星空视图
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
          
          {/* 公司选择 */}
          <div className="mb-6">
            <p className="text-gray-400 mb-3 text-sm">🏢 选择所属公司（可选）</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(COMPANY_COLORS).map((company) => (
                <button
                  key={company}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${COMPANY_COLORS[company]} bg-gray-900/50 hover:opacity-80 transition`}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>
          
          {/* 提交按钮 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
            <div className="text-gray-500 text-sm">
              ✨ 每个光子都将成为行业历史的一部分
            </div>
            <button 
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
            >
              发射光子
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-blue-400">5</div>
            <div className="text-gray-400">当前光子数</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-purple-400">201</div>
            <div className="text-gray-400">总共鸣数</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-green-400">{PHOTON_TEMPLATES.length}</div>
            <div className="text-gray-400">光子模板</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-amber-400">18</div>
            <div className="text-gray-400">在线同行</div>
          </div>
        </div>

        {/* 光子展示区 */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <span className="mr-3 text-yellow-400">🌟</span> 最新光子流
              <span className="ml-4 text-sm font-normal text-gray-400">(按时间倒序)</span>
            </h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-800/50 rounded-lg text-sm">全部</button>
              <button className="px-3 py-1 bg-blue-500/20 rounded-lg text-sm">那个瞬间</button>
              <button className="px-3 py-1 bg-purple-500/20 rounded-lg text-sm">预言胶囊</button>
            </div>
          </div>
          
          <div className="space-y-6">
            {INITIAL_PHOTONS.map((photon) => {
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
                      <span className="px-3 py-1 rounded-full text-sm bg-gray-800/50">
                        {photon.company}
                      </span>
                      <span className="text-gray-400 text-sm">{photon.time}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-gray-400 hover:text-red-400 transition group">
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 光子类型说明 */}
        <div className="mb-16">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <span className="mr-2">🎨</span> 光子模板说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PHOTON_TEMPLATES.map((template) => (
              <div 
                key={template.id}
                className={`p-4 rounded-xl border ${template.borderColor} ${template.color} backdrop-blur-lg`}
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{template.icon}</span>
                  <h4 className="font-bold">{template.name}</h4>
                </div>
                <p className="text-sm text-gray-300 mb-2">{template.description}</p>
                <p className="text-xs text-gray-400">{template.prompt}</p>
              </div>
            ))}
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
            <p className="mt-2">当前版本：光子模板系统 v1.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
