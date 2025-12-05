export default function Home() {
  const photons = [
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
      time: "2023-12-20",
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

  // 光子类型颜色映射
  const typeColors = {
    moment: { bg: "bg-blue-500/20", text: "text-blue-300", label: "那个瞬间" },
    prophecy: { bg: "bg-purple-500/20", text: "text-purple-300", label: "预言胶囊" },
    culture: { bg: "bg-amber-500/20", text: "text-amber-300", label: "行业黑话" }
  };

  // 公司颜色映射
  const companyColors: Record<string, string> = {
    "华为": "border-red-500/30",
    "蔚来": "border-blue-500/30",
    "小鹏": "border-green-500/30",
    "卓驭": "border-orange-500/30",
    "特斯拉": "border-gray-500/30",
    "其他": "border-gray-700/30"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8">
      {/* 星空背景效果 */}
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
        <header className="mb-12 text-center pt-8">
          <div className="inline-block mb-6">
            <div className="text-6xl mb-2">✨</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              光锥计划
            </h1>
          </div>
          <p className="text-gray-300 text-lg md:text-xl mb-6">自动驾驶行业口述史 · 记录每个真实声音</p>
          <p className="text-gray-400 text-sm md:text-base mb-8 max-w-2xl mx-auto">
            在这里，每个从业者都是一个光子，汇聚成行业发展的光谱。
            记录2024-2034这关键的十年，从L2到L4的每一个真实瞬间。
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-blue-500/20">
              ✨ 发射我的光子
            </button>
            <button className="px-6 py-3 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-full font-semibold hover:bg-gray-700/50 transition">
              🌌 探索星空视图
            </button>
          </div>
        </header>
          </div>
        </header>
        {/* ===================== 在这里添加！ ===================== */}
        {/* 光子创建表单 - 临时版 */}
        <div className="mb-12 bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">🚀</span> 发射你的光子
          </h3>
          <p className="text-gray-400 mb-4 text-sm">
            写下你的行业瞬间、预言或只有圈内人才懂的黑话...
          </p>
          
          <textarea 
            className="w-full h-32 bg-black/40 border border-gray-700 rounded-xl p-4 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition"
            placeholder="例：2024年春，第一次看到端到端模型在实车上运行，感觉整个规控架构都要重写了..."
          />
          
          <div className="flex flex-wrap gap-3 mb-4">
            <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition">🔵 那个瞬间</button>
            <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition">🟣 预言胶囊</button>
            <button className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition">🟡 行业黑话</button>
            <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition">🏢 选择公司...</button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              ✨ 每个光子都将成为行业历史的一部分
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-blue-500/20">
              发射光子
            </button>
          </div>
        </div>
        {/* ===================== 添加结束 ===================== */}
        
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
            <div className="text-2xl font-bold text-green-400">6</div>
            <div className="text-gray-400">行业公司</div>
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
            {photons.map((photon) => {
              const type = typeColors[photon.type as keyof typeof typeColors];
              const companyColor = companyColors[photon.company] || companyColors["其他"];
              
              return (
                <div 
                  key={photon.id}
                  className={`bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border ${companyColor} hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${type.bg} ${type.text}`}>
                        {type.label}
                      </span>
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

        {/* 公司标签云 */}
        <div className="mb-16">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <span className="mr-2">🏢</span> 行业公司光谱
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(companyColors).map(([company, color]) => (
              <span 
                key={company}
                className={`px-4 py-2 rounded-full border ${color} bg-gray-900/50 backdrop-blur-lg hover:scale-105 transition cursor-pointer`}
              >
                {company}
              </span>
            ))}
          </div>
        </div>

        {/* 光子类型说明 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20 rounded-2xl p-6">
            <div className="text-2xl mb-3">🔵</div>
            <h4 className="text-lg font-bold mb-2">那个瞬间</h4>
            <p className="text-gray-400 text-sm">记录行业关键突破或顿悟时刻</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 rounded-2xl p-6">
            <div className="text-2xl mb-3">🟣</div>
            <h4 className="text-lg font-bold mb-2">预言胶囊</h4>
            <p className="text-gray-400 text-sm">写给未来行业或自己的预言</p>
          </div>
          <div className="bg-gradient-to-br from-amber-900/20 to-transparent border border-amber-500/20 rounded-2xl p-6">
            <div className="text-2xl mb-3">🟡</div>
            <h4 className="text-lg font-bold mb-2">行业黑话</h4>
            <p className="text-gray-400 text-sm">只有圈内人才懂的痛与梗</p>
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
          </div>
        </footer>
      </div>
    </div>
  );
}
