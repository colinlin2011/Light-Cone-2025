"use client";

import { useState, useEffect } from "react";
import StarBackground from "@/components/StarBackground";
import DatabaseStatus from "@/components/DatabaseStatus";
import TemplateSelector from "@/components/TemplateSelector";
import PhotonForm from "@/components/PhotonForm";
import PhotonList from "@/components/PhotonList";
import { supabase } from "@/lib/supabase";
import { PHOTON_TEMPLATES } from "@/lib/templates";
import { COMPANY_COLORS } from "@/lib/companyColors";

// ... 其他状态定义

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState(PHOTON_TEMPLATES[0]);
  const [photonContent, setPhotonContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorCompany, setAuthorCompany] = useState("");
  const [authorProfession, setAuthorProfession] = useState("");
  const [photons, setPhotons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");

  // 加载光子数据
  useEffect(() => {
    loadPhotons();
  }, []);

  const loadPhotons = async () => {
    // ... 加载光子逻辑
  };

  // 选择模板
  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    if (!photonContent.trim()) {
      setPhotonContent(template.example);
    }
  };

  // 提交光子
  const handleSubmit = async () => {
    // ... 提交逻辑
  };

  // 点赞光子
  const handleLikePhoton = async (photonId: number) => {
    // 这里先实现前端效果
    const updatedPhotons = photons.map(photon => 
      photon.id === photonId 
        ? { ...photon, likes: photon.likes + 1 }
        : photon
    );
    setPhotons(updatedPhotons);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8">
      <StarBackground />
      
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
          
          <DatabaseStatus status={dbStatus} photonCount={photons.filter(p => p.isFromDB).length} />
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold transition-all shadow-lg shadow-blue-500/20 ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:opacity-90 hover:scale-105'
              }`}
            >
              {isSubmitting ? '🚀 发射中...' : '✨ 发射我的光子'}
            </button>
            <button className="px-6 py-3 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-full font-semibold hover:bg-gray-700/50 transition">
              🌌 探索星空视图
            </button>
          </div>
        </header>

        {/* 光子创建表单 */}
        <div className="mb-12 bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
          <PhotonForm
            selectedTemplate={selectedTemplate}
            photonContent={photonContent}
            authorName={authorName}
            authorCompany={authorCompany}
            authorProfession={authorProfession}
            isSubmitting={isSubmitting}
            submitSuccess={submitSuccess}
            onTemplateSelect={handleTemplateSelect}
            onContentChange={setPhotonContent}
            onNameChange={setAuthorName}
            onCompanyChange={setAuthorCompany}
            onProfessionChange={setAuthorProfession}
            onSubmit={handleSubmit}
          />
        </div>

        {/* 光子展示区 */}
        <PhotonList
          photons={photons}
          isLoading={isLoading}
          onRefresh={loadPhotons}
          onLike={handleLikePhoton}
          templates={PHOTON_TEMPLATES}
          companyColors={COMPANY_COLORS}
        />

        {/* 底部信息 */}
        <footer className="pt-8 border-t border-gray-800 text-center">
          <div className="mb-6">
            <p className="text-gray-300 text-lg">✨ 每个光子，都是历史的见证</p>
            <p className="text-gray-400 mt-2">光锥计划 · 为行业记录真实声音 · 始于2024年</p>
          </div>
          <div className="text-gray-500 text-sm">
            <p>自动驾驶从业者的数字纪念碑</p>
            <p className="mt-1">记录2024-2034 · 从L2到L4的关键十年</p>
            <p className="mt-2">当前版本: 数据库集成 v2.0 | 新加坡节点</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
