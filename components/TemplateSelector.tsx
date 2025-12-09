// components/TemplateSelector.tsx
import { PHOTON_TEMPLATES, PhotonTemplate } from '@/lib/templates';

interface TemplateSelectorProps {
  selectedTemplate: PhotonTemplate;
  onSelect: (template: PhotonTemplate) => void;
}

export default function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
        {PHOTON_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
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
    </div>
  );
}
