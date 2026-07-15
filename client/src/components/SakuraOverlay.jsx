import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export default function SakuraOverlay() {
  const canvasRef = useRef(null);
  const effect = useSelector((state) => state.auth.floatingEffect);

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

    // Create particles base class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 1.5 - 0.75;
        
        if (effect === 'sakura') {
          this.y = -20;
          this.speedY = Math.random() * 1.5 + 1.0;
          this.angle = Math.random() * 360;
          this.spin = Math.random() * 2 - 1;
          this.windOsc = Math.random() * 0.02;
          this.color = `rgba(255, ${Math.floor(Math.random() * 40 + 175)}, ${Math.floor(Math.random() * 30 + 195)}, ${Math.random() * 0.4 + 0.5})`;
        } else if (effect === 'snow') {
          this.y = -20;
          this.speedY = Math.random() * 1.0 + 0.8;
          this.windOsc = Math.random() * 0.01;
          this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.4})`;
        } else if (effect === 'rain') {
          this.y = -50;
          this.speedY = Math.random() * 8 + 6;
          this.speedX = -1.5; // diagonal rain
          this.color = 'rgba(174, 219, 255, 0.4)';
        } else if (effect === 'fireflies') {
          this.y = Math.random() * canvas.height;
          this.speedY = Math.random() * 0.6 - 0.3;
          this.speedX = Math.random() * 0.6 - 0.3;
          this.glow = Math.random() * 360;
          this.color = `rgba(173, 255, 47, ${Math.random() * 0.4 + 0.3})`;
        } else if (effect === 'hearts') {
          this.y = canvas.height + 20;
          this.speedY = -(Math.random() * 1.2 + 0.8);
          this.speedX = Math.random() * 0.8 - 0.4;
          this.scale = Math.random() * 0.6 + 0.4;
          this.color = `rgba(255, ${Math.floor(Math.random() * 80 + 80)}, ${Math.floor(Math.random() * 100 + 120)}, ${Math.random() * 0.4 + 0.5})`;
        }
      }

      update(time) {
        if (effect === 'sakura') {
          this.y += this.speedY;
          this.x += this.speedX + Math.sin(time * this.windOsc) * 0.5;
          this.angle += this.spin;
          if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
          }
        } else if (effect === 'snow') {
          this.y += this.speedY;
          this.x += this.speedX + Math.sin(time * this.windOsc) * 0.3;
          if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
          }
        } else if (effect === 'rain') {
          this.y += this.speedY;
          this.x += this.speedX;
          if (this.y > canvas.height) {
            this.reset();
          }
        } else if (effect === 'fireflies') {
          this.y += this.speedY;
          this.x += this.speedX;
          this.glow += 2;
          if (this.y < -20 || this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
          }
        } else if (effect === 'hearts') {
          this.y += this.speedY;
          this.x += this.speedX + Math.sin(time * 0.02) * 0.3;
          if (this.y < -20) {
            this.reset();
          }
        }
      }

      draw() {
        ctx.save();
        if (effect === 'sakura') {
          ctx.translate(this.x, this.y);
          ctx.rotate((this.angle * Math.PI) / 180);
          ctx.fillStyle = this.color;
          ctx.beginPath();
          // Draw a sakura petal shape
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size, this.size, 0, this.size * 1.5);
          ctx.bezierCurveTo(this.size, this.size, this.size, -this.size / 2, 0, 0);
          ctx.fill();
        } else if (effect === 'snow') {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        } else if (effect === 'rain') {
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.speedX * 2, this.y + this.speedY * 2);
          ctx.stroke();
        } else if (effect === 'fireflies') {
          const alpha = (Math.sin(this.glow * Math.PI / 180) + 1) / 2 * 0.6 + 0.1;
          ctx.shadowBlur = this.size;
          ctx.shadowColor = 'rgba(173, 255, 47, 0.8)';
          ctx.fillStyle = `rgba(173, 255, 47, ${alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === 'hearts') {
          ctx.translate(this.x, this.y);
          ctx.scale(this.scale, this.scale);
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          // Draw classic heart shape
          ctx.bezierCurveTo(-6, -6, -12, -2, -12, 6);
          ctx.bezierCurveTo(-12, 14, -4, 20, 0, 24);
          ctx.bezierCurveTo(4, 20, 12, 14, 12, 6);
          ctx.bezierCurveTo(12, -2, 6, -6, 0, 0);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      let count = 45;
      if (effect === 'rain') count = 100;
      if (effect === 'snow') count = 60;
      if (effect === 'none') count = 0;

      for (let i = 0; i < count; i++) {
        const p = new Particle();
        // pre-populate Y positions so they don't all start from top
        if (effect !== 'hearts') {
          p.y = Math.random() * canvas.height;
        } else {
          p.y = Math.random() * canvas.height + canvas.height / 2;
        }
        particles.push(p);
      }
    };

    initParticles();

    let lastTime = 0;
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (effect !== 'none') {
        particles.forEach((p) => {
          p.update(time);
          p.draw();
        });
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [effect]);

  if (effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-45"
      style={{ mixBlendMode: 'normal' }}
    />
  );
}
