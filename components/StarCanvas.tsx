// components/StarCanvas.tsx - 自包含修复版
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { StarPhoton } from '@/lib/types';

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPhoton, setHoveredPhoton] = useState<StarPhoton | null>(null);
  const startTimeRef = useRef(Date.now());

  // 尺寸自适应
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 鼠标交互
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  // 主渲染循环
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const animate = () => {
      const currentTime = Date.now() - startTimeRef.current;
      const width = dimensions.width;
      const height = dimensions.height;

      // 清空画布（拖尾效果）
      ctx.fillStyle = 'rgba(5, 5, 15, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // 绘制深空背景
      const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
      bgGradient.addColorStop(0, '#000810');
      bgGradient.addColorStop(0.5, '#0a0a1a');
      bgGradient.addColorStop(1, '#000000');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 绘制粒子场
      drawParticleField(ctx, width, height, currentTime);

      // 过滤光子
      const filteredPhotons = photons.filter(p => 
        p.year >= timeRange.start && 
        p.year <= timeRange.end &&
        (!activeCompany || p.company === activeCompany) &&
        (!activeTemplate || p.type === activeTemplate)
      );

      // 绘制光子
      filteredPhotons.forEach(photon => {
        const x = (photon.x / 100) * width;
        const y = (photon.y / 100) * height;
        
        const distance = Math.sqrt((mousePos.x - x) ** 2 + (mousePos.y - y) ** 2);
        const isHovered = distance < photon.size * 3;
        
        drawPhotonAura(ctx, x, y, photon, currentTime, isHovered);
        drawPhotonCore(ctx, x, y, photon, isHovered);
        drawPhotonRing(ctx, x, y, photon, currentTime);
        
        if (isHovered) setHoveredPhoton(photon);
      });

      // 绘制扫描线
      drawScanlines(ctx, width, height, currentTime);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', () => {
      if (hoveredPhoton) onPhotonClick(hoveredPhoton);
    });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, photons, timeRange, activeCompany, activeTemplate, mousePos, hoveredPhoton]);

  // 渲染悬停卡片（内联组件）
  const renderHoverCard = () => {
    if (!hoveredPhoton) return null;

    const typeNames: Record<string, string> = {
      'moment': '那个瞬间',
      'prophecy': '预言胶囊',
      'culture': '团队文化',
      'inspiration': '灵光闪现',
      'darkmoment': '至暗时刻',
      'history': '历史记录',
      'onsite': '现场观察'
    };

    return (
      <div 
        className="absolute z-20 animate-fade-in glass-card p-4 max-w-xs"
        style={{ left: mousePos.x + 16, top: mousePos.y - 100 }}
      >
        <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 text-white max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: hoveredPhoton.color }}
            ></div>
            <span className="text-xs font-medium" style={{ color: hoveredPhoton.color }}>
              {typeNames[hoveredPhoton.type] || hoveredPhoton.type}
            </span>
            <span className="text-xs text-gray-400">{hoveredPhoton.year}</span>
          </div>
          <p className="text-sm mb-3 line-clamp-3">{hoveredPhoton.content}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">{hoveredPhoton.author.split('@')[0]}</span>
            <span className="text-cyan-400 flex items-center gap-1">
              💫 {hoveredPhoton.likes}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
      
      {/* 左上角系统信息 */}
      <div className="absolute top-6 left-6 font-mono text-xs text-cyan-400/60 pointer-events-none">
        <div>LIGHT CONE v2.0</div>
        <div>PHOTONS: {photons.length}</div>
        <div>TIME: {timeRange.start}-{timeRange.end}</div>
      </div>

      {/* 悬停卡片 */}
      {renderHoverCard()}
    </div>
  );
}

// ===== 以下保持所有渲染函数不变 =====

function drawParticleField(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const particleCount = 50;
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 1000;
    const x = ((Math.sin(seed + time * 0.0001) * 0.5 + 0.5) * width);
    const y = ((Math.cos(seed * 1.5 + time * 0.00015) * 0.5 + 0.5) * height);
    const size = Math.sin(time * 0.001 + seed) * 1 + 1.5;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    const alpha = Math.sin(time * 0.002 + seed) * 0.3 + 0.4;
    ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
    ctx.fill();
  }
}

function drawPhotonAura(ctx: CanvasRenderingContext2D, x: number, y: number, photon: StarPhoton, time: number, isHovered: boolean) {
  const baseRadius = photon.size * 3;
  const pulseRadius = baseRadius + Math.sin(time * 0.003 + Number(photon.id)) * 5;
  const finalRadius = isHovered ? pulseRadius * 1.5 : pulseRadius;
  
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, finalRadius);
  gradient.addColorStop(0, `${photon.color}40`);
  gradient.addColorStop(0.5, `${photon.color}20`);
  gradient.addColorStop(1, `${photon.color}00`);
  
  ctx.beginPath();
  ctx.arc(x, y, finalRadius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function drawPhotonCore(ctx: CanvasRenderingContext2D, x: number, y: number, photon: StarPhoton, isHovered: boolean) {
  const coreSize = isHovered ? photon.size * 1.3 : photon.size;
  
  ctx.beginPath();
  ctx.arc(x, y, coreSize, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(x - coreSize/3, y - coreSize/3, 0, x, y, coreSize);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.7, photon.color);
  gradient.addColorStop(1, `${photon.color}80`);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(x - coreSize * 0.3, y - coreSize * 0.3, coreSize * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(x, y, coreSize * 1.2, 0, Math.PI * 2);
  ctx.strokeStyle = `${photon.companyColor}60`;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = photon.companyColor;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPhotonRing(ctx: CanvasRenderingContext2D, x: number, y: number, photon: StarPhoton, time: number) {
  if (photon.likes < 10) return;
  
  const ringCount = Math.min(3, Math.floor(photon.likes / 10));
  for (let i = 0; i < ringCount; i++) {
    const delay = i * 1000;
    const progress = ((time + delay) % 5000) / 5000;
    const radius = photon.size * 2 + progress * 20;
    const alpha = Math.sin(progress * Math.PI) * 0.5;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawScanlines(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const scanY = (time * 0.1) % height;
  ctx.fillStyle = `rgba(6, 182, 212, 0.05)`;
  ctx.fillRect(0, scanY, width, 2);
  
  const cornerSize = 20;
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  ctx.moveTo(0, cornerSize);
  ctx.lineTo(0, 0);
  ctx.lineTo(cornerSize, 0);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(width - cornerSize, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, cornerSize);
  ctx.stroke();
}
