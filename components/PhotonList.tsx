interface PhotonListProps {
  photons: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onLike: (id: number) => void;
}

export default function PhotonList({ photons, isLoading, onRefresh, onLike }: PhotonListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPhotons, setFilteredPhotons] = useState(photons);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = photons.filter(photon =>
        photon.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photon.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photon.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPhotons(filtered);
    } else {
      setFilteredPhotons(photons);
    }
  }, [searchQuery, photons]);

  return (
    <div className="mb-16">
      {/* 搜索栏 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center mb-4 md:mb-0">
          <span className="mr-3 text-yellow-400">🌟</span> 最新光子流
          <span className="ml-4 text-sm font-normal text-gray-400">
            {isLoading ? '加载中...' : `(共 ${filteredPhotons.length} 条)`}
          </span>
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 搜索光子内容、作者或公司..."
              className="w-full md:w-64 bg-black/40 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition"
          >
            🔄 刷新
          </button>
        </div>
      </div>
      
      {/* 光子列表（保持原有逻辑） */}
      {isLoading ? (
        // 加载状态
      ) : filteredPhotons.length === 0 ? (
        // 无结果状态
        <div className="text-center py-12 bg-gray-900/30 rounded-2xl">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">未找到匹配的光子</h3>
          <p className="text-gray-400 mb-6">换个关键词试试，或发布新的光子</p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition"
            >
              清空搜索
            </button>
          )}
        </div>
      ) : (
        // 显示过滤后的光子列表
        <div className="space-y-6">
          {filteredPhotons.map((photon) => (
            // 原有光子卡片渲染逻辑
          ))}
        </div>
      )}
    </div>
  );
}
