"use client";

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkle: number;
  color: string;
}

interface PhotonData {
  id: number | string;
  year: number;
  x: number;
  y: number;
  size: number;
  theme: string;
  color: string;
  title: string;
  character: string;
  company: string;
  description: string;
  resonance: number;
}

interface StarFieldVisualizationProps {
  photons?: PhotonData[];
  onPhotonClick?: (photon: PhotonData) => void;
  className?: string;
}

const StarFieldVisualization: React.FC<StarFieldVisualizationProps> = ({
  photons = [],
  onPhotonClick,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);
  
  // 默认光子数据（如果未提供）
  const defaultPhotonData: PhotonData[] = [
    {
      id: 1,
      year: 2015,
      x: 15,
      y: 25,
      size: 25,
      theme: '历史回顾',
      color: '#6b7280',
      title: '特斯拉Autopilot首次发布',
      character: 'Elon Musk',
      company: 'Tesla',
      description: '特斯拉推出第一代Autopilot系统，开启了商用自动驾驶的新纪元',
      resonance: 156
    },
    // ... 可以添加更多默认数据
  ];

  const displayPhotons = photons.length > 0 ? photons : defaultPhotonData;

  // 主题颜色映射
  const themeColors: Record<string, string> = {
    '至暗时刻': '#ef4444',
    '高光瞬间': '#eab308',
    '路线之争': '#a855f7',
    '预言胶囊': '#06b6d4',
    '我在现场': '#22c55e',
    '灵光闪现': '#f97316',
    '此刻心情': '#ec4899',
    '历史回顾': '#6b7280',
    'moment': '#3b82f6',      // 那个瞬间 - 蓝色
    'prophecy': '#8b5cf6',    // 预言胶囊 - 紫色
    'culture': '#f59e0b',     // 行业黑话 - 橙色
    'onsite': '#10b981',      // 我在现场 - 绿色
    'inspiration': '#06b6d4', // 灵光闪现 - 青色
    'history': '#f97316',     // 历史回顾 - 橙色
    'darkmoment': '#ef4444',  // 至暗时刻 - 红色
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    // 创建星星
    const stars: Star[] = [];
    const numStars = 300;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 0.5,
        speed: Math.random() * 0.8 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.8 ? '#3b82f6' : '#ffffff'
      });
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // 绘制渐变背景
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width / 2
      );
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // 绘制星星
      stars.forEach(star => {
        star.opacity += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));
        
        star.x -= star.speed;
        if (star.x < 0) {
          star.x = width;
        }
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color === '#3b82f6' ? 
          `rgba(59, 130, 246, ${star.opacity})` : 
          `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // 添加光晕效果
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = star.color === '#3b82f6' ? 
            `rgba(59, 130, 246, ${star.opacity * 0.1})` : 
            `rgba(255, 255, 255, ${star.opacity * 0.1})`;
          ctx.fill();
        }
      });

      // 绘制光子（简化版）
      displayPhotons.forEach(photon => {
        const x = (photon.x / 100) * width;
        const y = (photon.y / 100) * height;
        const size = photon.size;
        
        // 绘制光晕
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        glowGradient.addColorStop(0, photon.color + '80');
        glowGradient.addColorStop(1, photon.color + '00');
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // 绘制光子主体
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        const photonGradient = ctx.createRadialGradient(
          x - size/3, y - size/3, 0,
          x, y, size
        );
        photonGradient.addColorStop(0, '#ffffff');
        photonGradient.addColorStop(0.5, photon.color + 'E0');
        photonGradient.addColorStop(1, photon.color + '80');
        ctx.fillStyle = photonGradient;
        ctx.fill();
        
        // 绘制内发光
        ctx.beginPath();
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff40';
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [displayPhotons]);

  // 处理点击事件
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onPhotonClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 简单检测点击了哪个光子
    displayPhotons.forEach(photon => {
      const photonX = (photon.x / 100) * canvas.width;
      const photonY = (photon.y / 100) * canvas.height;
      const distance = Math.sqrt((x - photonX) ** 2 + (y - photonY) ** 2);
      
      if (distance < photon.size * 2) {
        onPhotonClick(photon);
      }
    });
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full ${className}`}
      style={{ background: 'linear-gradient(to bottom, #0a0a0a, #000000)' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onClick={handleCanvasClick}
        style={{ cursor: 'pointer' }}
      />
      
      {/* 覆盖层用于显示信息 */}
      <div className="absolute bottom-6 left-6 text-white">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30">
          <div className="text-sm text-gray-300 mb-2">✨ 星空可视化模式</div>
          <div className="text-xs text-gray-400">点击光子查看详情 • 拖动浏览</div>
        </div>
      </div>
    </div>
  );
};

export default StarFieldVisualization;
