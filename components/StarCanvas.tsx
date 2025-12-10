// components/StarCanvas.tsx - 绝对定位与布局稳定版
"use client";

import { useEffect, useRef, useState } from 'react';

// 类型定义（与 page-new.tsx 保持一致）
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

export default function StarCanvas({ 
  photons = [],
  timeRange = { start: 2015, end: 2035 },
  onPhotonClick,
  activeCompany,
  activeTemplate 
}: StarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化 Canvas 尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // 只有当尺寸发生显著变化时才更新，防止无限循环
        setDimensions(prev => {
          if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
            return prev;
          }
          return { width, height };
        });
        setIsInitialized(true);
      }
    };

    updateDimensions();
    
    // 使用 ResizeObserver 监听容器变化，比 window resize 更可靠
    const resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(updateDimensions);
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 绘制逻辑
  useEffect(() => {
    if (!isInitialized || dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 处理 DPI 缩放
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    
    // 强制设置 Canvas CSS 尺寸，防止布局抖动
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    let animationFrameId: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;

      // 清空画布
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // 绘制深空背景（确保不是透明导致看起来像 bug）
      const bgGradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
      bgGradient.addColorStop(0, '#020617'); // slate-950
      bgGradient.addColorStop(1, '#000000'); // black
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // 1. 绘制背景微星
      const starCount = 150;
      for (let i = 0; i < starCount; i++) {
        const seed = i * 1337;
        const x = ((Math.sin(seed) * 0.5 + 0.5) * dimensions.width);
        const y = ((Math.cos(seed * 0.7) * 0.5 + 0.5) * dimensions.height);
        const size = (Math.sin(seed * 1.5) + 2) * 0.5;
        const opacity = (Math.sin(elapsedTime * 0.001 + seed) * 0.3 + 0.4);
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      // 2. 绘制光子
      const filteredPhotons = photons
        .filter(photon => photon.year >= timeRange.start && photon.year <= timeRange.end)
        .filter(photon => !activeCompany || photon.company === activeCompany)
        .filter(photon => !activeTemplate || photon.type === activeTemplate);

      filteredPhotons.forEach(photon => {
        const x = (photon.x / 100) * dimensions.width;
        const y = (photon.y / 100) * dimensions.height;
        
        // 公司光圈
        if (photon.companyColor && photon.companyColor.startsWith('#')) {
             ctx.beginPath();
             ctx.arc(x, y, photon.size * 1.3, 0, Math.PI * 2);
             ctx.strokeStyle = `${photon.companyColor}60`; // 添加透明度
             ctx.lineWidth = 1;
             ctx.stroke();
        }

        // 光晕
        const glowRadius = photon.size * 2;
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        glowGradient.addColorStop(0, `${photon.color}80`);
        glowGradient.addColorStop(1, `${photon.color}00`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心
        ctx.beginPath();
        ctx.arc(x, y, photon.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, isInitialized, photons, timeRange, activeCompany, activeTemplate]);

  // 处理点击
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onPhotonClick || dimensions.width === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 查找最近的光子
    let clickedPhoton: StarPhoton | null = null;
    let minDistance = 30; // 点击容差

    photons.forEach(photon => {
      const px = (photon.x / 100) * dimensions.width;
      const py = (photon.y / 100) * dimensions.height;
      const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        clickedPhoton = photon;
      }
    });
    
    if (clickedPhoton) {
      onPhotonClick(clickedPhoton);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden" // 确保容器不溢出
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 block touch-none" // 绝对定位 + block 防止任何间距
      />
    </div>
  );
}
