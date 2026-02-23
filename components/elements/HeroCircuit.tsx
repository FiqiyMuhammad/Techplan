"use client";

import React, { useEffect, useRef } from "react";

const CONFIG = {
  wireColor: "rgba(59, 130, 246, 0.08)", // Very subtle blue for wires
  particleColor: "#3b82f6",
  glowColor: "rgba(59, 130, 246, 0.5)",
  gridSize: 40,
  maxWires: 12,
};

class HeroWire {
  points: { x: number; y: number }[];
  totalLength: number = 0;
  opacity: number;

  constructor(points: { x: number; y: number }[]) {
    this.points = points;
    this.opacity = 0.2 + Math.random() * 0.4;
    this.calculateLength();
  }

  calculateLength() {
    this.totalLength = 0;
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      this.totalLength += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
  }

  getPointAndAngle(progress: number) {
    const currentPos = progress * this.totalLength;
    let accumulated = 0;
    let startPoint, endPoint;
    let segmentProgress = 0;

    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

      if (currentPos >= accumulated && currentPos <= accumulated + dist) {
        startPoint = p1;
        endPoint = p2;
        segmentProgress = (currentPos - accumulated) / dist;
        break;
      }
      accumulated += dist;
    }

    if (!startPoint || !endPoint) return null;

    return {
      x: startPoint.x + (endPoint.x - startPoint.x) * segmentProgress,
      y: startPoint.y + (endPoint.y - startPoint.y) * segmentProgress,
      angle: Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x),
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = `rgba(59, 130, 246, ${this.opacity * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.stroke();

    // Draw nodes at points
    ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity * 0.5})`;
    this.points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
  }
}

class HeroParticle {
  wire: HeroWire;
  speed: number;
  progress: number;
  size: number;
  color: string;

  constructor(wire: HeroWire) {
    this.wire = wire;
    this.speed = 0.001 + Math.random() * 0.002;
    this.progress = Math.random();
    this.size = 1.5 + Math.random() * 2;
    this.color = Math.random() > 0.5 ? "#3b82f6" : "#6366f1";
  }

  update() {
    this.progress += this.speed;
    if (this.progress > 1) {
      this.progress = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = this.wire.getPointAndAngle(this.progress);
    if (!pos) return;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.angle);

    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    
    // Tail
    const gradient = ctx.createLinearGradient(-30, 0, 0, 0);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(1, this.color);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.size;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Head
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export default function HeroCircuit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wires = useRef<HeroWire[]>([]);
  const particles = useRef<HeroParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const generatePath = (width: number, height: number) => {
      const grid = CONFIG.gridSize;
      const margin = 100;
      
      let x, y;
      const side = Math.floor(Math.random() * 4);
      if (side === 0) { x = -margin; y = Math.random() * height; } // Left
      else if (side === 1) { x = width + margin; y = Math.random() * height; } // Right
      else if (side === 2) { x = Math.random() * width; y = -margin; } // Top
      else { x = Math.random() * width; y = height + margin; } // Bottom

      x = Math.round(x / grid) * grid;
      y = Math.round(y / grid) * grid;

      const points = [{ x, y }];
      const segments = 4 + Math.floor(Math.random() * 6);
      
      const centerX = width / 2;
      const centerY = height / 2;
      const avoidRadius = 300;

      for (let i = 0; i < segments; i++) {
        const dir = Math.floor(Math.random() * 4);
        const dist = grid * (2 + Math.floor(Math.random() * 5));
        
        let nextX: number = x;
        let nextY: number = y;
        if (dir === 0) nextX += dist;
        else if (dir === 1) nextX -= dist;
        else if (dir === 2) nextY += dist;
        else nextY -= dist;

        // Avoid center area
        const distToCenter = Math.sqrt((nextX - centerX) ** 2 + (nextY - centerY) ** 2);
        if (distToCenter < avoidRadius) {
            // Push away from center
            const angle = Math.atan2(nextY - centerY, nextX - centerX);
            nextX = centerX + Math.cos(angle) * avoidRadius;
            nextY = centerY + Math.sin(angle) * avoidRadius;
            nextX = Math.round(nextX / grid) * grid;
            nextY = Math.round(nextY / grid) * grid;
        }

        x = nextX;
        y = nextY;
        points.push({ x, y });
      }
      return points;
    };

    const init = () => {
      const { offsetWidth: w, offsetHeight: h } = canvas.parentElement || { offsetWidth: 0, offsetHeight: 0 };
      canvas.width = w;
      canvas.height = h;

      wires.current = [];
      particles.current = [];

      for (let i = 0; i < CONFIG.maxWires; i++) {
        const wire = new HeroWire(generatePath(w, h));
        wires.current.push(wire);
        particles.current.push(new HeroParticle(wire));
        if (Math.random() > 0.5) {
            particles.current.push(new HeroParticle(wire));
        }
      }
    };

    const resize = () => {
      init();
    };

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      wires.current.forEach(w => w.draw(ctx));
      particles.current.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      
      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50 dark:opacity-30" 
      style={{ zIndex: 0 }}
    />
  );
}
