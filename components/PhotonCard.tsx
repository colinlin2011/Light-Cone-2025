"use client";

import { useState } from 'react';

interface PhotonCardProps {
  photon: {
    id: number | string;
    title: string;
    year: number;
    character: string;
    company: string;
    description: string;
    theme: string;
    resonance: number;
    color: string;
  };
  onResonate?: (id: number | string) => void;
  className?: string;
}

export default function PhotonCard({ photon, onResonate, className = "" }: PhotonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const companyNames: Record<string, string> = {
    'Tesla': '特斯拉',
    'Waymo': 'Waymo',
    'Huawei': '华为',
    'XPeng': '小鹏汽车',
    'LiAuto': '理想汽车',
    'NIO': '蔚来',
    'Xiaomi': '小米',
    'Baidu': '百度',
    'other': '其他'
  };

  return (
    <div 
      className={`bg-black/80 backdrop-blur-xl rounded-xl p-6 border transition-all duration-300 ${className}`}
      style={{ 
        borderColor: `${photon.color}40`,
        boxShadow: isHovered ? `0 0 30px ${photon.color}40` : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xl font-bold text-white mb-2">{photon.title}</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: `${photon.color}30` }}>
              {photon.theme}
            </span>
            <span className="text-gray-400">{photon.year}年</span>
          </div>
        </div>
        <button 
          onClick={() => onResonate?.(photon.id)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
          style={{ backgroundColor: `${photon.color}20`, color: photon.color }}
        >
          <span>💫</span>
          <span>{photon.resonance}</span>
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-300 leading-relaxed">{photon.description}</p>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
        <div className="text-sm text-gray-400">
          <span className="font-medium text-blue-300">{photon.character}</span>
          {' • '}
          <span className="font-medium text-green-300">{companyNames[photon.company] || photon.company}</span>
        </div>
        <div className="text-xs text-gray-500">
          光子ID: {photon.id}
        </div>
      </div>
    </div>
  );
}
