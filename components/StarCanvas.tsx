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

// 公司颜色映射（与之前一致）
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

  // 过滤和计算光子位置
  const getFilteredPhotons = () => {
    return photons
      .filter(photon => photon.year >= timeRange.start && photon.year <= timeRange.end)
      .filter(photon => !activeCompany || photon.company === activeCompany)
      .filter(photon => !activeTemplate || photon.type === activeTemplate)
      .map(photon => {
        // 根据年份计算x位置
        const yearProgress = (photon.year - timeRange.start) / (timeRange.end - timeRange.start);
        const x = yearProgress * 80 + 10; // 10%到90%的范围
        
        // 根据公司和类型计算y位置
        const companies = [...new Set(photons.map(p => p.company))];
        const companyIndex = companies.indexOf(photon.company);
        const y = (companyIndex / companies.length) * 70 + 15;
        
        // 增加随机偏移避免完全重叠
        const randomOffset = {
          x: (Math.random() - 0.5) * 5,
          y: (Math.random() - 0.5) * 5
        };
        
        return {
          ...photon,
          x: x + randomOffset.x,
          y: y + randomOffset.y,
          color: TYPE_COLORS[photon.type] || '#6b7280',
          companyColor: COMPANY_COLORS[photon.company] || '#6b7280'
        };
      });
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
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    // 创建背景星星
    const backgroundStars: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
    }> = [];
    
    for (let i = 0; i < 200; i++) {
      backgroundStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    // 动画函数
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制渐变背景
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, '#000810');
      gradient.addColorStop(0.5, '#0a0a1a');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制背景星星
      backgroundStars.forEach(star => {
        star.x -= star.speed;
        if (star.x < -10) star.x = canvas.width + 10;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.3})`;
        ctx.fill();
        
        // 添加光晕
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        const starGlow = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 3
        );
        starGlow.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.1})`);
        starGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = starGlow;
        ctx.fill();
      });
      
      // 获取当前可见的光子
      const visiblePhotons = getFilteredPhotons();
      
      // 绘制时间轴
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0.1 * canvas.width, 0.9 * canvas.height);
      ctx.lineTo(0.9 * canvas.width, 0.9 * canvas.height);
      ctx.stroke();
      
      // 绘制年份标记
      for (let year = timeRange.start; year <= timeRange.end; year += 5) {
        const x = 0.1 + (0.8 * (year - timeRange.start) / (timeRange.end - timeRange.start));
        ctx.beginPath();
        ctx.moveTo(x * canvas.width, 0.9 * canvas.height);
        ctx.lineTo(x * canvas.width, 0.91 * canvas.height);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(year.toString(), x * canvas.width, 0.93 * canvas.height);
      }
      
      // 绘制光子
      visiblePhotons.forEach(photon => {
        const x = (photon.x / 100) * canvas.width;
        const y = (photon.y / 100) * canvas.height;
        const size = photon.size * scale;
        const isHovered = hoveredPhoton?.id === photon.id;
        const isActive = isHovered || mousePos.x >= x - size && mousePos.x <= x + size && 
                                      mousePos.y >= y - size && mousePos.y <= y + size;
        
        // 绘制光晕
        const glowSize = size * (isActive ? 4 : 2);
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glowGradient.addColorStop(0, `${photon.color}${isActive ? '80' : '30'}`);
        glowGradient.addColorStop(1, `${photon.color}00`);
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // 绘制外圈（公司颜色）
        if (photon.companyColor) {
          ctx.beginPath();
          ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
          ctx.strokeStyle = `${photon.companyColor}${isActive ? '80' : '40'}`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        // 绘制光子主体
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        const photonGradient = ctx.createRadialGradient(
          x - size/3, y - size/3, 0,
          x, y, size
        );
        photonGradient.addColorStop(0, `rgba(255, 255, 255, ${photon.brightness})`);
        photonGradient.addColorStop(0.5, `${photon.color}${Math.round(photon.brightness * 255).toString(16).padStart(2, '0')}`);
        photonGradient.addColorStop(1, `${photon.color}80`);
        ctx.fillStyle = photonGradient;
        ctx.fill();
        
        // 绘制内发光
        ctx.beginPath();
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${photon.brightness * 0.3})`;
        ctx.fill();
        
        // 绘制共鸣数（如果有）
        if (photon.likes > 0) {
          ctx.beginPath();
          ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
          ctx.strokeStyle = `${photon.color}30`;
          ctx.lineWidth = 1;
          ctx.stroke();
          
          if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`💫 ${photon.likes}`, x, y - size * 2);
          }
        }
        
        // 如果是悬停状态，显示更多信息
        if (isActive) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(mousePos.x + 10, mousePos.y + 10, 300, 120);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'left';
          
          const lines = [
            photon.content.length > 60 ? photon.content.substring(0, 60) + '...' : photon.content,
            `👤 ${photon.author}`,
            `🏢 ${photon.company}`,
            `🎯 ${photon.likes} 共鸣`
          ];
          
          lines.forEach((line, i) => {
            ctx.fillText(line, mousePos.x + 20, mousePos.y + 40 + i * 20);
          });
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [photons, timeRange, scale, offset, activeCompany, activeTemplate, hoveredPhoton, mousePos]);

  // 鼠标事件处理
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    if (isDragging) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x, y });
    } else {
      // 检测悬停的光子
      const visiblePhotons = getFilteredPhotons();
      const hovered = visiblePhotons.find(photon => {
        const px = (photon.x / 100) * canvas.width;
        const py = (photon.y / 100) * canvas.height;
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        return distance < photon.size * 2;
      });
      setHoveredPhoton(hovered || null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
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
      className="w-full h-full relative cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* 控制提示 */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        <div>滚轮缩放 · 拖动平移 · 点击光子</div>
      </div>
    </div>
  );
}
