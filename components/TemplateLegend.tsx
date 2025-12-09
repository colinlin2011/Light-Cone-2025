"use client";

interface Template {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  textColor: string;
  icon: string;
  prompt: string;
  example: string;
  description: string;
}

interface TemplateLegendProps {
  templates: readonly Template[];
  activeTemplate: string | null;
  onTemplateClick: (templateId: string | null) => void;
}

export default function TemplateLegend({ templates, activeTemplate, onTemplateClick }: TemplateLegendProps) {
  return (
    <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">光子类型图例</h3>
        <p className="text-sm text-gray-400">点击筛选 · 颜色代表不同类型的光子</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onTemplateClick(activeTemplate === template.id ? null : template.id)}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden ${
              activeTemplate === template.id 
                ? `${template.borderColor} ${template.color} scale-105 ring-2 ring-white/30` 
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* 背景光效 */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${template.color}`}></div>
            
            <div className="relative z-10">
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">
                  {template.icon}
                </div>
                <div className={`text-sm font-medium mb-1 ${activeTemplate === template.id ? template.textColor : 'text-gray-300'}`}>
                  {template.name}
                </div>
                <div className="text-xs text-gray-400 text-center leading-tight">
                  {template.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {activeTemplate && (
        <div className="mt-4 text-center">
          <button
            onClick={() => onTemplateClick(null)}
            className="px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors"
          >
            ✕ 清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
