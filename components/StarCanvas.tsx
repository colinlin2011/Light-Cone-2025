// components/StarCanvas.tsx - 完全重构版
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

// 性能优化：对象池减少GC
class ParticlePool {
  // 实现粒子复用逻辑
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
  
  // 动画时间线
  const startTimeRef = useRef(Date.now());
  
  // 核心渲染系统
  const renderSystem = useRef({
    nebula: null as ImageData | null,
    backgroundStars: [] as any[],
    photonParticles: new Map<string, any>()
  });

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

    // 高DPI支持
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    // 预计算静态背景
    if (!renderSystem.current.nebula) {
      // 生成星云纹理
      const nebulaCanvas = document.createElement('canvas');
      nebulaCanvas.width = dimensions.width;
      nebulaCanvas.height = dimensions.height;
      const nebulaCtx = nebulaCanvas.getContext('2d')!;
      generateNebula(nebulaCtx, dimensions.width, dimensions.height);
      renderSystem.current.nebula = nebulaCtx.getImageData(0, 0, dimensions.width, dimensions.height);
    }

    // 动画循环
    const animate = () => {
      const currentTime = Date.now() - startTimeRef.current;
      const width = dimensions.width;
      const height = dimensions.height;

      // 1. 清空画布（使用半透明实现拖尾效果）
      ctx.fillStyle = 'rgba(5, 5, 15, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // 2. 绘制星云背景
      if (renderSystem.current.nebula) {
        ctx.globalAlpha = 0.3 + Math.sin(currentTime * 0.0005) * 0.1;
        ctx.putImageData(renderSystem.current.nebula, 0, 0);
        ctx.globalAlpha = 1;
      }

      // 3. 绘制粒子场（动态背景）
      drawParticleField(ctx, width, height, currentTime);

      // 4. 过滤和映射光子数据
      const filteredPhotons = photons.filter(p => 
        p.year >= timeRange.start && 
        p.year <= timeRange.end &&
        (!activeCompany || p.company === activeCompany) &&
        (!activeTemplate || p.type === activeTemplate)
      );

      // 5. 绘制光子（核心）
      filteredPhotons.forEach(photon => {
        const x = (photon.x / 100) * width;
        const y = (photon.y / 100) * height;
        
        // 检测鼠标悬停
        const distance = Math.sqrt((mousePos.x - x) ** 2 + (mousePos.y - y) ** 2);
        const isHovered = distance < photon.size * 3;
        
        // 绘制多层次光效
        drawPhotonAura(ctx, x, y, photon, currentTime, isHovered);
        drawPhotonCore(ctx, x, y, photon, isHovered);
        drawPhotonRing(ctx, x, y, photon, currentTime);
        
        if (isHovered) setHoveredPhoton(photon);
      });

      // 6. 绘制扫描线HUD
      drawScanlines(ctx, width, height, currentTime);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 事件监听
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', (e) => {
      if (hoveredPhoton) onPhotonClick(hoveredPhoton);
    });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, photons, timeRange, activeCompany, activeTemplate, mousePos, hoveredPhoton]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />
      
      {/* 科技感HUD覆盖层 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 左上角：系统信息 */}
        <div className="absolute top-6 left-6 font-mono text-xs text-cyan-400/60">
          <div>LIGHT CONE v2.0</div>
          <div>PHOTONS: {photons.length}</div>
          <div>TIME: {timeRange.start}-{timeRange.end}</div>
        </div>
        
        {/* 悬停卡片 */}
        {hoveredPhoton && (
          <div 
            className="absolute z-20 animate-fade-in glass-card p-4 max-w-sm"
            style={{ left: mousePos.x + 16, top: mousePos.y - 100 }}
          >
            <PhotonCompactCard photon={hoveredPhoton} />
          </div>
        )}
      </div>
    </div>
  );
}

// 星云生成算法
function generateNebula(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random();
    if (noise > 0.98) {
      const color = Math.random() > 0.5 ? [59, 130, 246] : [139, 92, 246];
      data[i] = color[0];     // R
      data[i + 1] = color[1]; // G
      data[i + 2] = color[2]; // B
      data[i + 3] = noise * 50; // A
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// 粒子场 (动态背景)
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

// 光子光晕 (多层渐变)
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

// 光子核心
function drawPhotonCore(ctx: CanvasRenderingContext2D, x: number, y: number, photon: StarPhoton, isHovered: boolean) {
  const coreSize = isHovered ? photon.size * 1.3 : photon.size;
  
  // 外层核心
  ctx.beginPath();
  ctx.arc(x, y, coreSize, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(x - coreSize/3, y - coreSize/3, 0, x, y, coreSize);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.7, photon.color);
  gradient.addColorStop(1, `${photon.color}80`);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 内层高光
  ctx.beginPath();
  ctx.arc(x - coreSize * 0.3, y - coreSize * 0.3, coreSize * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  
  // 公司色外圈
  ctx.beginPath();
  ctx.arc(x, y, coreSize * 1.2, 0, Math.PI * 2);
  ctx.strokeStyle = `${photon.companyColor}60`;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = photon.companyColor;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// 共振环
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

// HUD扫描线
function drawScanlines(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const scanY = (time * 0.1) % height;
  ctx.fillStyle = `rgba(6, 182, 212, 0.05)`;
  ctx.fillRect(0, scanY, width, 2);
  
  // 角落装饰
  const cornerSize = 20;
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
  ctx.lineWidth = 1;
  
  // 左上角
  ctx.beginPath();
  ctx.moveTo(0, cornerSize);
  ctx.lineTo(0, 0);
  ctx.lineTo(cornerSize, 0);
  ctx.stroke();
  
  // 右上角
  ctx.beginPath();
  ctx.moveTo(width - cornerSize, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, cornerSize);
  ctx.stroke();
}
