"use client";

import React, { useEffect, useRef } from "react";

const CONFIG = {
  wireColor: "#e5e7eb", // Light gray
  particleColor: "#ffffff",
  glowColor: "#3b82f6", // Bright blue
  gridSize: 20,
  particleSpeedMin: 0.004,
  particleSpeedMax: 0.008,
};

class Wire {
  points: { x: number; y: number }[];
  totalLength: number = 0;

  constructor(points: { x: number; y: number }[]) {
    this.points = points;
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
    const totalLength = this.totalLength;
    const currentPos = progress * totalLength;

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

    const x = startPoint.x + (endPoint.x - startPoint.x) * segmentProgress;
    const y = startPoint.y + (endPoint.y - startPoint.y) * segmentProgress;
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    
    return { x, y, angle };
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = CONFIG.wireColor;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (this.points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    const radius = 10;
    for (let i = 1; i < this.points.length - 1; i++) {
      const p2 = this.points[i + 1];
      ctx.arcTo(this.points[i].x, this.points[i].y, p2.x, p2.y, radius);
    }

    const last = this.points[this.points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
}

class Particle {
  wire: Wire;
  speed: number;
  progress: number;
  tailLength: number;
  size: number;

  constructor(wire: Wire, speed: number) {
    this.wire = wire;
    this.speed = speed;
    this.progress = Math.random();
    this.tailLength = 170;
    this.size = 2.0;
  }

  reset() {
    this.progress = 0;
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

    // Comet Glow Tail
    ctx.shadowBlur = 10;
    ctx.shadowColor = CONFIG.glowColor;

    const gradient = ctx.createLinearGradient(-this.tailLength, 0, 0, 0);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0)");
    gradient.addColorStop(0.7, "rgba(59, 130, 246, 0.4)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.9)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-this.tailLength, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Bright Comet Head
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export default function CircuitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wires = useRef<Wire[]>([]);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      
      // Small delay to ensure DOM elements (obj-1, etc) are laid out
      setTimeout(init, 100);
    };

    const getObjPos = (id: string) => {
      const el = document.getElementById(id);
      if (!el) {
        // Return center of canvas as fallback instead of (0,0)
        return { x: canvas.width / 2, y: canvas.height / 2 };
      }
      const rect = el.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      return {
        x: rect.left - canvasRect.left + rect.width / 2,
        y: rect.top - canvasRect.top + rect.height / 2,
      };
    };

    const init = () => {
      wires.current = [];
      particles.current = [];
      const p1 = getObjPos("obj-1");
      const p2 = getObjPos("obj-2");
      const p3 = getObjPos("obj-3");

      const isDesktop = canvas.width > 768;
      const offsets = isDesktop ? [-32, 0, 32] : [-15, 0, 15];
      const wireWidth = isDesktop ? 1.8 : 1.2;
      const stableSpeed = 0.003;
      const margin = 800;
      
      offsets.forEach((offset, idx) => {
        const points = [
          { x: -margin, y: p1.y + offset },
          { x: p1.x - 100, y: p1.y + offset },
          { x: p1.x + (p2.x - p1.x) * 0.45, y: p1.y + offset },
          { x: p1.x + (p2.x - p1.x) * 0.55, y: p2.y + offset },
          { x: p2.x, y: p2.y + offset },
          { x: p2.x + (p3.x - p2.x) * 0.45, y: p2.y + offset },
          { x: p2.x + (p3.x - p2.x) * 0.55, y: p3.y + offset },
          { x: p3.x, y: p3.y + offset },
          { x: canvas.width + margin, y: p3.y + offset },
        ];

        const wire = new Wire(points);
        // Store wireWidth in the wire object for use in drawing
        (wire as any).lineWidth = wireWidth;
        wires.current.push(wire);

        // Add multiple particles per main wire for a continuous stream
        const particlesPerWire = 2;
        for (let i = 0; i < particlesPerWire; i++) {
          const p = new Particle(wire, stableSpeed);
          
          // Base progress syncs all particles in a "wave"
          let baseProgress = i / particlesPerWire;

          // If this is the middle wire (index 1), add a small offset to make it lead
          if (idx === 1) {
             baseProgress += 0.04; // Middle leads by ~4%
          }

          p.progress = baseProgress;
          // Loop progress back to 0-1 range if needed
          if (p.progress > 1) p.progress -= 1;
          
          particles.current.push(p);
        }
      });

      generateOrganicAmbient(8);
    };

    const generateOrganicAmbient = (count: number) => {
      const grid = CONFIG.gridSize;
      const margin = 100;

      for (let i = 0; i < count; i++) {
        let x = Math.round((Math.random() * canvas.width) / grid) * grid;
        let y = Math.round((Math.random() * canvas.height) / grid) * grid;

        const points = [{ x, y }];
        const segments = 2 + Math.floor(Math.random() * 3);

        for (let j = 0; j < segments; j++) {
          const type = Math.random();
          const dist = (1 + Math.floor(Math.random() * 3)) * grid;

          if (type < 0.3) x += dist;
          else if (type < 0.6) y += (Math.random() > 0.5 ? 1 : -1) * dist;
          else {
            x += dist;
            y += (Math.random() > 0.5 ? 1 : -1) * dist;
          }

          x = Math.max(margin, Math.min(canvas.width - margin, x));
          y = Math.max(margin, Math.min(canvas.height - margin, y));

          points.push({ x, y });
        }
        wires.current.push(new Wire(points));
      }
    };

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      wires.current.forEach((w, i) => {
        ctx.globalAlpha = i < 3 ? 0.8 : 0.5;
        ctx.lineWidth = (w as any).lineWidth || (i < 3 ? 1.5 : 0.8);
        w.draw(ctx);
      });

      ctx.globalAlpha = 1.0;
      particles.current.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="circuitCanvas" className="absolute top-0 left-0 w-full h-full z-[1]" />;
}
