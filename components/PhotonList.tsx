// components/PhotonList.tsx
import { Photon } from '@/lib/types';
import { PHOTON_TEMPLATES } from '@/lib/templates';
import { getCompanyColor } from '@/lib/companyColors';

interface PhotonListProps {
  photons: Photon[];
  isLoading: boolean;
  onRefresh: () => void;
  onLike: (id: number) => void;
}

export default function PhotonList({ photons, isLoading, onRefresh, onLike }: PhotonListProps) {
  return (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="mr-3 text-yellow-400">🌟</span> 最新光子流
          <span className="ml-4 text-sm font-normal text-gray-400">
            {isLoading ? '加载中...' : `(共 ${photons.length} 条)`}
          </span>
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={onRefresh}
            className="px-3 py-1 bg-gray-800/50 rounded-lg text-sm hover:bg-gray-700/50 transition"
          >
            🔄 刷新
          </button>
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
            const companyColor = getCompanyColor(photon.company);
            
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
                      onClick={() => onLike(photon.id)}
                      className="flex items-center text-gray-400 hover:text-red-400 transition group"
                    >
                      <span className="text-xl group-hover:scale-110 transition">❤️</span>
                      <span className="ml-2 font-medium">{photon.likes}</span>
                    </button>
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
  );
}
