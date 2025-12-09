"use client";

import { useState } from 'react';

interface CompanyViewProps {
  photons: any[];
  isLoading: boolean;
  timeRange: { start: number; end: number };
  companyColors: Record<string, string>;
}

export default function CompanyView({ photons, isLoading, timeRange, companyColors }: CompanyViewProps) {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  
  // 按公司分组
  const companies = [...new Set(photons.map(p => p.company || '其他'))];
  
  // 获取公司光子
  const getCompanyPhotons = (company: string) => {
    return photons
      .filter(p => p.company === company)
      .filter(p => {
        const year = parseInt(p.time.split('-')[0]) || 2024;
        return year >= timeRange.start && year <= timeRange.end;
      });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载公司数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* 公司选择 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCompany(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCompany === null 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            全部公司
          </button>
          {companies.map(company => (
            <button
              key={company}
              onClick={() => setSelectedCompany(company)}
              className={`px-4 py-2 rounded-lg font-medium transition-all border ${
                selectedCompany === company 
                  ? 'scale-105' 
                  : 'hover:scale-105'
              }`}
              style={{
                background: selectedCompany === company 
                  ? `linear-gradient(135deg, ${companyColors[company]?.replace('border-', '').replace('/30', '')}40, transparent)`
                  : 'rgba(255,255,255,0.05)',
                borderColor: companyColors[company] || 'rgba(255,255,255,0.1)',
                color: selectedCompany === company ? '#ffffff' : 'rgba(255,255,255,0.7)'
              }}
            >
              {company}
            </button>
          ))}
        </div>
      </div>
      
      {/* 时间轴 */}
      <div className="mb-8 relative h-2">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full opacity-30"></div>
        <div className="absolute inset-0 flex justify-between items-center">
          {Array.from({ length: timeRange.end - timeRange.start + 1 }, (_, i) => timeRange.start + i).map(year => (
            <div key={year} className="relative">
              {year % 5 === 0 && (
                <>
                  <div className="w-px h-4 bg-white/30 absolute -top-4 left-1/2 transform -translate-x-1/2"></div>
                  <div className="text-xs text-gray-400 absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    {year}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 公司时间线 */}
      <div className="space-y-6">
        {(selectedCompany ? [selectedCompany] : companies).map(company => {
          const companyPhotons = getCompanyPhotons(company);
          if (companyPhotons.length === 0) return null;
          
          return (
            <div key={company} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: companyColors[company]?.replace('border-', '').replace('/30', '') || '#6b7280' }}
                  ></div>
                  <h3 className="text-xl font-semibold text-white">{company}</h3>
                  <span className="text-sm text-gray-400">({companyPhotons.length}个光子)</span>
                </div>
                <div className="text-sm text-gray-400">
                  时间跨度: {Math.min(...companyPhotons.map(p => parseInt(p.time.split('-')[0]) || 2024))} - {Math.max(...companyPhotons.map(p => parseInt(p.time.split('-')[0]) || 2024))}
                </div>
              </div>
              
              {/* 光子时间线 */}
              <div className="relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                
                {companyPhotons.map((photon, index) => {
                  const year = parseInt(photon.time.split('-')[0]) || 2024;
                  const position = ((year - timeRange.start) / (timeRange.end - timeRange.start)) * 100;
                  
                  return (
                    <div 
                      key={photon.id} 
                      className="relative mb-4 group"
                      style={{ left: `${position}%` }}
                    >
                      <div className="absolute -left-5 top-1/2 transform -translate-y-1/2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 group-hover:scale-125 transition-transform flex items-center justify-center">
                          <span className="text-xs">💫</span>
                        </div>
                      </div>
                      
                      <div className="ml-8 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10 group-hover:border-blue-500/50 transition-colors max-w-md">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm text-gray-400">{year}年</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                              {photon.type}
                            </span>
                            <span className="text-sm text-yellow-400">💫 {photon.likes || 0}</span>
                          </div>
                        </div>
                        <p className="text-white mb-2">{photon.content}</p>
                        <div className="text-xs text-gray-400">
                          {photon.author}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
