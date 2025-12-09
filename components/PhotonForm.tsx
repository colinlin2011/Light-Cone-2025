// components/PhotonForm.tsx
import { useState } from 'react';
import { PhotonTemplate } from '@/lib/templates';
import { COMPANY_COLORS } from '@/lib/companyColors';

interface PhotonFormProps {
  selectedTemplate: PhotonTemplate;
  photonContent: string;
  setPhotonContent: (content: string) => void;
  authorName: string;
  setAuthorName: (name: string) => void;
  authorCompany: string;
  setAuthorCompany: (company: string) => void;
  authorProfession: string;
  setAuthorProfession: (profession: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  submitSuccess: boolean;
}

export default function PhotonForm({
  selectedTemplate,
  photonContent,
  setPhotonContent,
  authorName,
  setAuthorName,
  authorCompany,
  setAuthorCompany,
  authorProfession,
  setAuthorProfession,
  onSubmit,
  isSubmitting,
  submitSuccess
}: PhotonFormProps) {
  return (
    <div className="mb-12 bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <span className="mr-2">🚀</span> 发射你的光子
        <span className="ml-3 text-sm font-normal text-gray-400">(选择模板开始)</span>
      </h3>
      
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
          onClick={onSubmit}
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
  );
}
