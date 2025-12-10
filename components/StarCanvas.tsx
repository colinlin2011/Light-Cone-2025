// components/StarCanvas.tsx - 修复版（解决黑屏问题）
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

export default function StarCanvas({ 
  photons = [],
  timeRange = { start: 2015, end: 2035 },
  onPhotonClick,
  activeCompany,
  activeTemplate 
}: StarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化 Canvas 尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        setIsInitialized(true);
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 绘制背景星星
  const drawBackgroundStars = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // 创建固定数量的背景星星
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
      // 使用确定性随机数确保星星位置固定
      const seed = i * 1000;
      const x = (Math.sin(seed) * 0.5 + 0.5) * width;
      const y = (Math.cos(seed) * 0.5 + 0.5) * height;
      const size = Math.sin(seed * 0.1) * 1.5 + 1;
      const opacity = Math.sin(time * 0.001 + seed) * 0.3 + 0.5;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
      ctx.fill();
      
      // 添加光晕
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.1})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  };

  // 绘制光子
  const drawPhotons = (ctx: CanvasRenderingContext2D, width: number, height: number, filteredPhotons: StarPhoton[]) => {
    filteredPhotons.forEach((photon, index) => {
      const x = (photon.x / 100) * width;
      const y = (photon.y / 100) * height;
      
      // 绘制光晕
      const glowRadius = photon.size * 2;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      glowGradient.addColorStop(0, `${photon.color}80`);
      glowGradient.addColorStop(1, `${photon.color}00`);
      ctx.fillStyle = glowGradient;
      ctx.fill();
      
      // 绘制光子主体
      ctx.beginPath();
      ctx.arc(x, y, photon.size, 0, Math.PI * 2);
      const photonGradient = ctx.createRadialGradient(
        x - photon.size/3, y - photon.size/3, 0,
        x, y, photon.size
      );
      photonGradient.addColorStop(0, `rgba(255, 255, 255, ${photon.brightness})`);
      photonGradient.addColorStop(0.7, `${photon.color}${Math.round(photon.brightness * 200).toString(16).padStart(2, '0')}`);
      photonGradient.addColorStop(1, `${photon.color}80`);
      ctx.fillStyle = photonGradient;
      ctx.fill();
      
      // 绘制公司颜色外圈
      ctx.beginPath();
      ctx.arc(x, y, photon.size * 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = `${photon.companyColor}60`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  // 动画循环
  useEffect(() => {
    if (!isInitialized || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 Canvas 尺寸
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    let animationFrameId: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;

      // 清空画布
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // 绘制深空背景
      const bgGradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
      bgGradient.addColorStop(0, '#000810');
      bgGradient.addColorStop(0.5, '#0a0a1a');
      bgGradient.addColorStop(1, '#000000');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // 绘制背景星星
      drawBackgroundStars(ctx, dimensions.width, dimensions.height, elapsedTime);
      
      // 过滤光子
      const filteredPhotons = photons
        .filter(photon => photon.year >= timeRange.start && photon.year <= timeRange.end)
        .filter(photon => !activeCompany || photon.company === activeCompany)
        .filter(photon => !activeTemplate || photon.type === activeTemplate);
      
      // 绘制光子
      if (filteredPhotons.length > 0) {
        drawPhotons(ctx, dimensions.width, dimensions.height, filteredPhotons);
      }
      
      // 绘制时间轴
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dimensions.width * 0.1, dimensions.height * 0.9);
      ctx.lineTo(dimensions.width * 0.9, dimensions.height * 0.9);
      ctx.stroke();
      
      // 继续动画循环
      animationFrameId = requestAnimationFrame(animate);
    };

    // 启动动画
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [dimensions, isInitialized, photons, timeRange, activeCompany, activeTemplate]);

  // 如果没有光子数据，显示占位符
  if (photons.length === 0) {
    return (
      <div ref={containerRef} className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🌌</div>
          <div className="text-gray-400">加载光子数据中...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* 调试信息 */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-black/40 p-2 rounded">
        <div>光子数: {photons.length}</div>
        <div>画布尺寸: {Math.round(dimensions.width)}×{Math.round(dimensions.height)}</div>
      </div>
    </div>
  );
}
