import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export default function BackgroundGarden() {
  const canvasRef = useRef(null);
  const { theme, floatingEffect } = useSelector((state) => state.auth);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Cherry blossom falling particle class
    class SakuraPetal {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 1.5 + 0.8;
        this.speedX = Math.random() * 1.0 - 0.5;
        this.angle = Math.random() * 360;
        this.spin = Math.random() * 1.5 - 0.75;
        this.windOsc = Math.random() * 0.01;
        this.color = `rgba(255, ${Math.floor(Math.random() * 30 + 180)}, ${Math.floor(Math.random() * 25 + 195)}, ${Math.random() * 0.4 + 0.45})`;
      }

      update(time) {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(time * this.windOsc) * 0.4;
        this.angle += this.spin;
        if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.angle * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size, this.size, 0, this.size * 1.5);
        ctx.bezierCurveTo(this.size, this.size, this.size, -this.size / 2, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }

    // Firefly floating particle class (for dark mode)
    class Firefly {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 3;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.glow = Math.random() * 360;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.glow += 1.5;
        if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        const alpha = (Math.sin(this.glow * Math.PI / 180) + 1) / 2 * 0.6 + 0.15;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = 'rgba(173, 255, 47, 0.8)';
        ctx.fillStyle = `rgba(173, 255, 47, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      // Always have falling petals in this anime garden
      for (let i = 0; i < 30; i++) {
        const p = new SakuraPetal();
        p.y = Math.random() * canvas.height;
        particles.push(p);
      }
      // If dark mode, add fireflies
      if (theme === 'dark') {
        for (let i = 0; i < 20; i++) {
          particles.push(new Firefly());
        }
      }
    };

    initParticles();

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        if (p.update) {
          p.update(time);
          p.draw();
        }
      });
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [theme, floatingEffect]);

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. SKY GRADIENT (Day/Sunset vs. Moonlit Purple) */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isDark 
            ? 'bg-gradient-to-b from-[#110e24] via-[#1b153b] to-[#2b1f4c]' 
            : 'bg-gradient-to-b from-[#b3e5fc] via-[#ffd54f]/30 to-[#fce4ec]'
        }`} 
      />

      {/* 2. SUNSHINE RAYS / STARS & MOON */}
      {!isDark ? (
        // Sunshine rays
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse-soft" />
      ) : (
        // Moon & Stars
        <>
          <div className="absolute top-10 right-16 w-16 h-16 rounded-full bg-yellow-100/90 shadow-[0_0_20px_rgba(254,240,138,0.7)] flex items-center justify-center animate-float-slow" />
          {/* Layered Stars */}
          <div className="absolute inset-0 bg-[radial-gradient(1.5px_1.5px_at_10%_15%,#fff_100%,transparent_0),radial-gradient(1.5px_1.5px_at_40%_25%,#fff_100%,transparent_0),radial-gradient(2px_2px_at_65%_45%,#ffd54f_100%,transparent_0),radial-gradient(1.5px_1.5px_at_80%_15%,#fff_100%,transparent_0)] opacity-70" />
        </>
      )}

      {/* 3. DRIFTING CLOUDS */}
      <div className="absolute inset-x-0 top-16 h-28 overflow-hidden opacity-45 dark:opacity-15">
        <div className="absolute w-[200px] h-[60px] bg-white rounded-full blur-[2px] animate-float-slow left-[10%]" style={{ animationDuration: '30s' }} />
        <div className="absolute w-[300px] h-[80px] bg-white rounded-full blur-[3px] animate-float-slow left-[55%]" style={{ animationDuration: '45s' }} />
      </div>

      {/* 4. BACKGROUND MOUNTAINS */}
      <svg 
        viewBox="0 0 1440 320" 
        className="absolute bottom-16 w-full h-40 fill-current transition-colors duration-1000 select-none text-[#cfd8dc] dark:text-[#231a38]"
        preserveAspectRatio="none"
      >
        <path d="M0,288L120,245.3C240,203,480,117,720,117C960,117,1200,203,1320,245.3L1440,288L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
      </svg>
      <svg 
        viewBox="0 0 1440 320" 
        className="absolute bottom-8 w-full h-32 fill-current transition-colors duration-1000 select-none text-[#b0bec5] dark:text-[#18122b] opacity-80"
        preserveAspectRatio="none"
      >
        <path d="M0,160L240,224L480,96L720,192L960,128L1200,224L1440,160L1440,320L1200,320C960,320,720,320,480,320C240,320,120,320,0,320Z"></path>
      </svg>

      {/* 5. RIVER & WOODEN BRIDGE */}
      <div className="absolute bottom-0 w-full h-24 select-none">
        {/* River */}
        <svg 
          viewBox="0 0 1440 100" 
          className="absolute bottom-0 w-full h-24 fill-current text-[#81d4fa]/60 dark:text-[#3949ab]/40 transition-colors duration-1000"
          preserveAspectRatio="none"
        >
          <path d="M0,40 C300,90 900,10 1440,50 L1440,100 L0,100 Z" />
        </svg>

        {/* Red Wooden Bridge (Center) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-48 h-12 flex flex-col justify-end">
          {/* Bridge arch */}
          <div className="w-full h-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-full border-t border-red-300 shadow-md relative">
            {/* Handrails / Balusters */}
            <div className="absolute -top-6 inset-x-4 flex justify-between px-2">
              <div className="w-1.5 h-6 bg-red-700 rounded-t" />
              <div className="w-1.5 h-6 bg-red-700 rounded-t" />
              <div className="w-1.5 h-6 bg-red-700 rounded-t" />
              <div className="w-1.5 h-6 bg-red-700 rounded-t" />
              <div className="w-1.5 h-6 bg-red-700 rounded-t" />
            </div>
            {/* Top rail */}
            <div className="absolute -top-7 left-3 right-3 h-1.5 bg-red-800 rounded-full" />
          </div>
          {/* Cozy bench next to bridge */}
          <div className="absolute -left-12 bottom-0 w-10 h-6 border-b-4 border-amber-800 dark:border-slate-800 flex items-end">
            <div className="w-full h-1.5 bg-amber-700 rounded" />
          </div>
        </div>
      </div>

      {/* 6. CHERRY BLOSSOM TREES ON SIDES */}
      {/* Left Tree */}
      <div className="absolute bottom-0 -left-12 w-64 h-80 pointer-events-none select-none opacity-90">
        <svg viewBox="0 0 200 250" className="w-full h-full">
          {/* Trunk */}
          <path d="M20,250 Q60,200 80,180 T100,100 Q80,70 90,30" fill="none" stroke="#5d4037" strokeWidth="12" strokeLinecap="round" />
          {/* Foliage (Sakura Blossoms) */}
          <circle cx="90" cy="50" r="45" fill="#ffb8c7" opacity="0.9" />
          <circle cx="65" cy="80" r="35" fill="#ffc1cc" opacity="0.9" />
          <circle cx="120" cy="70" r="40" fill="#ffd9e1" opacity="0.8" />
          <circle cx="90" cy="95" r="30" fill="#ffb8c7" opacity="0.9" />
          {/* Lantern hanging from tree (glows in dark mode) */}
          <g className={`transition-opacity duration-1000 ${isDark ? 'opacity-100' : 'opacity-30'}`}>
            <line x1="120" y1="110" x2="120" y2="130" stroke="#37474f" strokeWidth="2" />
            <rect x="112" y="130" width="16" height="24" rx="4" fill="#ffd54f" className="animate-pulse shadow-lg" />
            <rect x="110" y="127" width="20" height="4" fill="#37474f" />
          </g>
        </svg>
      </div>

      {/* Right Tree */}
      <div className="absolute bottom-0 -right-16 w-80 h-96 pointer-events-none select-none opacity-95">
        <svg viewBox="0 0 200 250" className="w-full h-full transform -scale-x-1">
          <path d="M20,250 Q70,180 90,140 T110,80 Q100,50 110,10" fill="none" stroke="#4e342e" strokeWidth="14" strokeLinecap="round" />
          <circle cx="110" cy="40" r="55" fill="#ffb8c7" opacity="0.95" />
          <circle cx="80" cy="70" r="45" fill="#ffc1cc" opacity="0.9" />
          <circle cx="140" cy="60" r="48" fill="#ffd9e1" opacity="0.85" />
          <circle cx="110" cy="90" r="35" fill="#ffb8c7" opacity="0.95" />
          {/* Right lantern */}
          <g className={`transition-opacity duration-1000 ${isDark ? 'opacity-100' : 'opacity-30'}`}>
            <line x1="140" y1="108" x2="140" y2="128" stroke="#37474f" strokeWidth="2" />
            <rect x="132" y="128" width="16" height="24" rx="4" fill="#ffd54f" className="animate-pulse" />
            <rect x="130" y="125" width="20" height="4" fill="#37474f" />
          </g>
        </svg>
      </div>

      {/* 7. BUTTERFLIES AND BEES (Light Mode Animating) */}
      {!isDark && (
        <>
          {/* Butterfly 1 */}
          <div className="absolute w-4 h-4 text-xs animate-float-slow top-1/3 left-1/4 select-none" style={{ animationDuration: '7s' }}>
            🦋
          </div>
          {/* Butterfly 2 */}
          <div className="absolute w-4 h-4 text-xs animate-float-slow top-1/2 right-1/4 select-none" style={{ animationDuration: '9s' }}>
            🦋
          </div>
          {/* Cute Bee 1 */}
          <div className="absolute w-4 h-4 text-xs animate-float-slow bottom-1/3 left-1/3 select-none" style={{ animationDuration: '5s' }}>
            🐝
          </div>
        </>
      )}

      {/* 8. ACTIVE PARTICLES CANVAS (Sakura Petals & Fireflies) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />
    </div>
  );
}
