// components/StarCanvas.tsx - v3.0 完整功能版
"use client";

import { useEffect, useRef, useState } from 'react';

// 类型定义
interface StarPhoton {
  id: string | number;
  x: number; // 绝对坐标 (0 - 3000+)
  y: number; // 相对高度 (0 - 100)
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
  timeRange,
  onPhotonClick,
  activeCompany,
  activeTemplate 
}: StarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 状态管理
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [cameraOffset, setCameraOffset] = useState(0); // 摄像机位置
  const [hoveredPhoton, setHoveredPhoton] = useState<{data: StarPhoton, x: number, y: number} | null>(null);
  
  // 拖拽逻辑 Ref
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const startX = useRef(0); // 用于区分点击和拖拽
  const rafRef = useRef<number>();

  // 1. 初始化尺寸 (保持之前的防抖逻辑)
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) setDimensions({ width, height });
      }
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 2. 交互事件处理
  const handleStart = (clientX: number) => {
    isDragging.current = true;
    lastX.current = clientX;
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    // 处理悬停检测 (仅非拖拽状态)
    if (!isDragging.current) {
      checkHover(clientX);
      return;
    }
    
    // 处理拖拽
    const delta = lastX.current - clientX;
    setCameraOffset(prev => Math.max(0, prev + delta)); // 禁止拖到负数区域
    lastX.current = clientX;
    setHoveredPhoton(null); // 拖拽时隐藏卡片
  };

  const handleEnd = (clientX: number) => {
    isDragging.current = false;
    // 如果移动距离很小，视为点击
    if (Math.abs(clientX - startX.current) < 5) {
      checkClick(clientX);
    }
  };

  // 3. 核心：坐标映射与碰撞检测
  const getRenderCoords = (photon: StarPhoton) => {
    // x: 绝对坐标 - 摄像机偏移 + 初始留白
    const renderX = photon.x - cameraOffset + (dimensions.width * 0.1);
    // y: 百分比转像素
    const renderY = (photon.y / 100) * dimensions.height;
    return { x: renderX, y: renderY };
  };

  const checkHover = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    
    // 简单的 Y 轴假设：通常鼠标在屏幕垂直中间附近活动较多，这里简化为只传X给checkHover不够精确
    // 我们需要在 onMouseMove 里获取完整的 e.clientY
  };

  // 真正的鼠标移动处理（包含悬停逻辑）
  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    if (isDragging.current) {
      handleMove(clientX);
    } else {
      // 悬停检测
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      let found: StarPhoton | null = null;
      // 反向遍历，优先选中上层的点
      for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i];
        if (activeCompany && p.company !== activeCompany) continue;
        if (activeTemplate && p.type !== activeTemplate) continue;

        const { x: px, y: py } = getRenderCoords(p);
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        
        // 判定半径：点的大小 + 10px 容错
        if (dist < p.size + 10) {
          found = p;
          break;
        }
      }

      if (found) {
        const coords = getRenderCoords(found);
        setHoveredPhoton({ data: found, x: coords.x, y: coords.y });
        // 鼠标变手型
        if (canvasRef.current) canvasRef.current.style.cursor = 'pointer';
      } else {
        setHoveredPhoton(null);
        if (canvasRef.current) canvasRef.current.style.cursor = isDragging.current ? 'grabbing' : 'grab';
      }
    }
  };

  const checkClick = (clientX: number) => {
    if (hoveredPhoton) {
      onPhotonClick(hoveredPhoton.data);
    }
  };

  // 4. 渲染循环 (Canvas 绘制)
  useEffect(() => {
    if (!dimensions.width || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // 分辨率适配
    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = dimensions.width * dpr;
    canvasRef.current.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let start = 0;
    const animate = (time: number) => {
      if (!start) start = time;
      const elapsed = time - start;

      // 清空
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // A. 绘制背景星尘 (视差滚动)
      const starCount = 100;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for(let i=0; i<starCount; i++) {
        const seed = i * 1337;
        // 背景星星移动速度较慢 (x * 0.2)
        let sx = ((Math.sin(seed) * 0.5 + 0.5) * dimensions.width * 2) - (cameraOffset * 0.1); 
        sx = ((sx % dimensions.width) + dimensions.width) % dimensions.width;
        const sy = ((Math.cos(seed * 0.9) * 0.5 + 0.5) * dimensions.height);
        const size = (Math.sin(seed) + 2) * 0.5;
        const blink = Math.sin(elapsed * 0.002 + seed);
        
        ctx.globalAlpha = Math.max(0.1, blink * 0.5 + 0.3);
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // B. 绘制时间轴参考线 (底部)
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(0, dimensions.height * 0.9);
      ctx.lineTo(dimensions.width, dimensions.height * 0.9);
      ctx.stroke();

      // C. 绘制光子 (核心)
      photons.forEach(p => {
        // 过滤
        if (activeCompany && p.company !== activeCompany) return;
        if (activeTemplate && p.type !== activeTemplate) return;

        const { x, y } = getRenderCoords(p);

        // 视口剔除优化
        if (x < -50 || x > dimensions.width + 50) return;

        // 1. 绘制公司光圈 (环)
        if (p.companyColor) {
          ctx.beginPath();
          ctx.arc(x, y, p.size * 1.4, 0, Math.PI * 2);
          ctx.strokeStyle = p.companyColor + '40'; // 25% 透明度
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 2. 绘制光晕 (Glow)
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2.5);
        gradient.addColorStop(0, p.color + '60');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 3. 绘制实体核心
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // 4. 悬停高亮效果
        if (hoveredPhoton && hoveredPhoton.data.id === p.id) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 1.6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 绘制时间年份标记 (根据 offset 计算)
      // 简单实现：每隔 500px 画一个年份
      const pxPerYear = 200; // 假设每200px一年
      const startYear = 2015;
      for (let i = 0; i <= 20; i++) { // 20年跨度
        const yearX = (i * pxPerYear) - cameraOffset + (dimensions.width * 0.1);
        if (yearX > -50 && yearX < dimensions.width + 50) {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.font = '12px monospace';
          ctx.fillText((startYear + i).toString(), yearX, dimensions.height * 0.9 + 20);
          // 刻度线
          ctx.beginPath();
          ctx.moveTo(yearX, dimensions.height * 0.9);
          ctx.lineTo(yearX, dimensions.height * 0.9 - 10);
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dimensions, cameraOffset, photons, activeCompany, activeTemplate, hoveredPhoton]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden bg-black select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block touch-none"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={onPointerMove}
        onMouseUp={(e) => handleEnd(e.clientX)}
        onMouseLeave={() => { isDragging.current = false; setHoveredPhoton(null); }}
        
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={onPointerMove}
        onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
      />

      {/* 悬浮卡片 (HTML Overlay) - 这就是找回的“卡片功能” */}
      {hoveredPhoton && (
        <div 
          className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full pb-4 transition-opacity duration-200"
          style={{ 
            left: hoveredPhoton.x, 
            top: hoveredPhoton.y,
          }}
        >
          <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 w-64 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                {hoveredPhoton.data.year}
              </span>
              <span 
                className="text-xs font-bold"
                style={{ color: hoveredPhoton.data.color }}
              >
                {hoveredPhoton.data.type}
              </span>
            </div>
            <p className="text-sm text-white line-clamp-3 leading-relaxed mb-2">
              {hoveredPhoton.data.content}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/10 pt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{background: hoveredPhoton.data.companyColor}}></span>
                {hoveredPhoton.data.company}
              </span>
              <span className="flex items-center gap-1 text-yellow-500">
                💫 {hoveredPhoton.data.likes}
              </span>
            </div>
          </div>
          {/* 连接线小三角 */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white/20"></div>
        </div>
      )}
    </div>
  );
}
