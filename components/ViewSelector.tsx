"use client";

import { useState } from 'react';

interface ViewSelectorProps {
  currentView: 'starfield' | 'list' | 'company';
  onChange: (view: 'starfield' | 'list' | 'company') => void;
}

export default function ViewSelector({ currentView, onChange }: ViewSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const views = [
    { id: 'starfield', label: '星空视图', icon: '🌌' },
    { id: 'list', label: '列表视图', icon: '📜' },
    { id: 'company', label: '公司视图', icon: '🏢' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
        <div className="relative px-6 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-full font-semibold text-white flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="text-lg">{views.find(v => v.id === currentView)?.icon}</span>
          <span>{views.find(v => v.id === currentView)?.label}</span>
          <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 z-50">
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 min-w-[200px]">
              {views.map(view => (
                <button
                  key={view.id}
                  onClick={() => {
                    onChange(view.id as any);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    currentView === view.id 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{view.icon}</span>
                  <span className="text-white font-medium">{view.label}</span>
                  {currentView === view.id && (
                    <span className="ml-auto text-cyan-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
