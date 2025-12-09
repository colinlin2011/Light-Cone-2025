// components/StarCanvas.tsx - 完整修复版
"use client";

import { useEffect, useRef, useState } from 'react';

interface StarPhoton {
  id: string | number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  type: string;
  company: string;
  year: number;
  content: string;
  author: string;
  likes: number;
  color: string;
  companyColor: string;
}

interface StarCanvasProps {
  photons: StarPhoton[];
  timeRange: { start: number; end: number };
  onPhotonClick: (photon: StarPhoton) => void;
  activeCompany?: string | null;
  activeTemplate?: string | null;
}

// 类型颜色映射
const TYPE_COLORS: Record<string, string> = {
  moment: '#3b82f6',      // 蓝色
  prophecy: '#8b5cf6',    // 紫色
  culture: '#f59e0b',     // 橙色
  onsite: '#10b981',      // 绿色
  inspiration: '#06b6d4', // 青色
  history: '#f97316',     // 橙色
  darkmoment: '#ef4444',  // 红色
};

// 公司颜色映射
const COMPANY_COLORS: Record<string, string> = {
  "华为": "#ef4444",
  "蔚来": "#3b82f6",
  "小鹏": "#10b981",
  "卓驭": "#f59e0b",
  "特斯拉": "#6b7280",
  "百度": "#3b82f6",
  "理想": "#8b5cf6",
  "其他": "#6b7280"
};

export default function StarCanvas({ 
  photons, 
  timeRange, 
  onPhotonClick,
  activeCompany,
  activeTemplate 
}: StarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [hoveredPhoton, setHoveredPhoton] = useState<StarPhoton | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [backgroundStars, setBackgroundStars] = useState<any[]>([]);

  // 初始化背景星星
  useEffect(() => {
    const initBackgroundStars = () => {
      const stars = [];
      for (let i = 0; i < 150; i++) {
        stars.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          speed: Math.random() * 0.05 + 0.01,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2
        });
      }
      return stars;
    };
    
    setBackgroundStars(initBackgroundStars());
  }, []);

  // 过滤和计算光子位置
  const getFilteredPhotons = () => {
    const filtered = photons
      .filter(photon => photon.year >= timeRange.start && photon.year <= timeRange.end)
      .filter(photon => !activeCompany || photon.company === activeCompany)
      .filter(photon => !activeTemplate || photon.type === activeTemplate);

    // 避免重叠：为每个位置分组
    const positionMap = new Map<string, StarPhoton[]>();
    
    filtered.forEach(photon => {
      const key = `${Math.round(photon.x)}_${Math.round(photon.y)}`;
      if (!positionMap.has(key)) {
        positionMap.set(key, []);
      }
      positionMap.get(key)!.push(photon);
    });

    // 处理重叠的光子
    const result: StarPhoton[] = [];
    positionMap.forEach((photonsInSameSpot, key) => {
      if (photonsInSameSpot.length === 1) {
        result.push(photonsInSameSpot[0]);
      } else {
        // 分散排列
        photonsInSameSpot.forEach((photon, index) => {
          const angle = (index / photonsInSameSpot.length) * Math.PI * 2;
          const radius = 2;
          result.push({
            ...photon,
            x: photon.x + Math.cos(angle) * radius,
            y: photon.y + Math.sin(angle) * radius
          });
        });
      }
    });

    return result;
  };

  // 动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    
    updateCanvasSize();
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    let animationId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 绘制深空背景
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      gradient.addColorStop(0, '#000810');
      gradient.addColorStop(0.3, '#0a0a1a');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // 绘制背景星星
      const currentTimeSeconds = currentTime / 1000;
      backgroundStars.forEach(star => {
        // 闪烁效果
        const twinkle = Math.sin(currentTimeSeconds * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        
        // 转换为实际像素坐标
        const x = star.x * width / 100;
        const y = star.y * height / 100;
        
        // 轻微移动
        star.x -= star.speed * deltaTime * 10;
        if (star.x < -5) {
          star.x = 105;
          star.y = Math.random() * 100;
        }
        
        // 绘制星星
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle * 0.3})`;
        ctx.fill();
        
        // 添加微弱光晕
        if (star.size > 1) {
          ctx.beginPath();
          ctx.arc(x, y, star.size * 2, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(x, y, 0, x, y, star.size * 2);
          glow.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.1})`);
          glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glow;
          ctx.fill();
        }
      });
      
      // 获取当前可见的光子
      const visiblePhotons = getFilteredPhotons();
      
      // 绘制银河带
      ctx.beginPath();
      const galaxyGradient = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.7);
      galaxyGradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
      galaxyGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
      galaxyGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      ctx.fillStyle = galaxyGradient;
      ctx.fillRect(0, height * 0.3, width, height * 0.4);
      
      // 绘制时间轴
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.05, height * 0.85);
      ctx.lineTo(width * 0.95, height * 0.85);
      ctx.stroke();
      
      // 绘制年份标记
      for (let year = timeRange.start; year <= timeRange.end; year += 5) {
        const x = width * (0.05 + 0.9 * (year - timeRange.start) / (timeRange.end - timeRange.start));
        ctx.beginPath();
        ctx.moveTo(x, height * 0.85);
        ctx.lineTo(x, height * 0.87);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(year.toString(), x, height * 0.88);
      }
      
      // 绘制光子
      visiblePhotons.forEach(photon => {
        const x = (photon.x / 100) * width;
        const y = (photon.y / 100) * height;
        const baseSize = 20;
        const finalSize = baseSize * scale * (photon.size / 30);
        const isHovered = hoveredPhoton?.id === photon.id;
        const isActive = isHovered || (
          mousePos.x >= x - finalSize * 2 && 
          mousePos.x <= x + finalSize * 2 && 
          mousePos.y >= y - finalSize * 2 && 
          mousePos.y <= y + finalSize * 2
        );
        
        // 绘制外光晕（公司颜色）
        if (photon.companyColor && isActive) {
          const outerGlowSize = finalSize * 3;
          ctx.beginPath();
          ctx.arc(x, y, outerGlowSize, 0, Math.PI * 2);
          const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, outerGlowSize);
          outerGlow.addColorStop(0, `${photon.companyColor}40`);
          outerGlow.addColorStop(0.5, `${photon.companyColor}20`);
          outerGlow.addColorStop(1, `${photon.companyColor}00`);
          ctx.fillStyle = outerGlow;
          ctx.fill();
        }
        
        // 绘制中光晕（类型颜色）
        const midGlowSize = finalSize * 2;
        ctx.beginPath();
        ctx.arc(x, y, midGlowSize, 0, Math.PI * 2);
        const midGlow = ctx.createRadialGradient(x, y, 0, x, y, midGlowSize);
        midGlow.addColorStop(0, `${photon.color}${isActive ? '60' : '30'}`);
        midGlow.addColorStop(1, `${photon.color}00`);
        ctx.fillStyle = midGlow;
        ctx.fill();
        
        // 绘制光子主体
        ctx.beginPath();
        ctx.arc(x, y, finalSize, 0, Math.PI * 2);
        const photonGradient = ctx.createRadialGradient(
          x - finalSize/3, y - finalSize/3, 0,
          x, y, finalSize
        );
        photonGradient.addColorStop(0, `rgba(255, 255, 255, ${photon.brightness * 0.8})`);
        photonGradient.addColorStop(0.7, `${photon.color}${Math.round(photon.brightness * 200).toString(16).padStart(2, '0')}`);
        photonGradient.addColorStop(1, `${photon.color}80`);
        ctx.fillStyle = photonGradient;
        ctx.fill();
        
        // 绘制内发光
        ctx.beginPath();
        ctx.arc(x, y, finalSize * 0.6, 0, Math.PI * 2);
        const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, finalSize * 0.6);
        innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = innerGlow;
        ctx.fill();
        
        // 绘制共鸣光环
        if (photon.likes > 0) {
          ctx.beginPath();
          ctx.arc(x, y, finalSize * 1.8, 0, Math.PI * 2);
          ctx.strokeStyle = `${photon.color}40`;
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // 显示共鸣数
          if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.shadowColor = photon.color;
            ctx.shadowBlur = 10;
            ctx.fillText(`💫 ${photon.likes}`, x, y - finalSize * 2.5);
            ctx.shadowBlur = 0;
          }
        }
        
        // 如果是悬停状态，显示详情卡片
        if (isActive) {
          // 卡片背景
          const cardX = mousePos.x + 20;
          const cardY = mousePos.y + 20;
          const cardWidth = 280;
          const cardHeight = 140;
          
          // 半透明背景
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
          
          // 边框
          ctx.strokeStyle = photon.color;
          ctx.lineWidth = 1;
          ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
          
          // 内容
          ctx.fillStyle = '#ffffff';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'left';
          
          // 内容文本（限制长度）
          const maxContentLength = 80;
          const content = photon.content.length > maxContentLength 
            ? photon.content.substring(0, maxContentLength) + '...'
            : photon.content;
          
          // 绘制文本
          const lines = [
            { text: content, y: cardY + 30 },
            { text: `👤 ${photon.author.split('@')[0]}`, y: cardY + 60 },
            { text: `🏢 ${photon.company}`, y: cardY + 85 },
            { text: `💫 ${photon.likes} 共鸣 · 📅 ${photon.year}`, y: cardY + 110 }
          ];
          
          lines.forEach(line => {
            ctx.fillText(line.text, cardX + 15, line.y);
          });
          
          // 点击提示
          ctx.fillStyle = photon.color;
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('点击查看详情', cardX + cardWidth/2, cardY + cardHeight - 10);
        }
      });
      
      // 绘制引力线（连接相关光子）
      if (hoveredPhoton) {
        const hoveredX = (hoveredPhoton.x / 100) * width;
        const hoveredY = (hoveredPhoton.y / 100) * height;
        
        visiblePhotons.forEach(photon => {
          if (photon.id !== hoveredPhoton.id && 
              (photon.company === hoveredPhoton.company || photon.type === hoveredPhoton.type)) {
            const x = (photon.x / 100) * width;
            const y = (photon.y / 100) * height;
            
            const distance = Math.sqrt((x - hoveredX) ** 2 + (y - hoveredY) ** 2);
            if (distance < 300) {
              ctx.beginPath();
              ctx.moveTo(hoveredX, hoveredY);
              ctx.lineTo(x, y);
              ctx.strokeStyle = `${hoveredPhoton.color}20`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate(0);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [photons, timeRange, scale, offset, activeCompany, activeTemplate, hoveredPhoton, mousePos, backgroundStars]);

  // 鼠标事件处理
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleFactor = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * scaleFactor;
    const y = (e.clientY - rect.top) * scaleFactor;
    
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    if (isDragging) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      setOffset(prev => ({ 
        x: prev.x + dx / 100, 
        y: prev.y + dy / 100 
      }));
      setDragStart({ x, y });
    } else {
      // 检测悬停的光子
      const visiblePhotons = getFilteredPhotons();
      const hovered = visiblePhotons.find(photon => {
        const px = (photon.x / 100) * (canvas.width / scaleFactor);
        const py = (photon.y / 100) * (canvas.height / scaleFactor);
        const distance = Math.sqrt(
          Math.pow(mousePos.x - px, 2) + 
          Math.pow(mousePos.y - py, 2)
        );
        return distance < 40 * scale;
      });
      setHoveredPhoton(hovered || null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      setIsDragging(true);
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleFactor = window.devicePixelRatio || 1;
        setDragStart({ 
          x: (e.clientX - rect.left) * scaleFactor, 
          y: (e.clientY - rect.top) * scaleFactor 
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * delta));
    setScale(newScale);
  };

  const handleClick = () => {
    if (hoveredPhoton && !isDragging) {
      onPhotonClick(hoveredPhoton);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setHoveredPhoton(null);
      }}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* 控制提示 */}
      <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
        <div className="text-xs text-gray-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>滚轮缩放</span>
          </span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>拖动平移</span>
          </span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>点击光子</span>
          </span>
        </div>
      </div>
      
      {/* 缩放指示器 */}
      <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span>缩放: {scale.toFixed(1)}x</span>
          <div className="flex items-center">
            {[0.5, 1, 1.5, 2, 2.5, 3].map((level) => (
              <div 
                key={level}
                className={`w-1 h-3 mx-0.5 rounded-full transition-all ${
                  scale >= level ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 时间范围指示器 */}
      <div className="absolute top-1/2 left-6 transform -translate-y-1/2">
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
          <div className="text-xs text-gray-400 mb-2">时间轴</div>
          <div className="text-white font-bold text-lg">
            {timeRange.start} - {timeRange.end}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getFilteredPhotons().length} 个光子可见
          </div>
        </div>
      </div>
    </div>
  );
}
