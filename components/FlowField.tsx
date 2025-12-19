'use client';
import { useState } from 'react';
import { NextReactP5Wrapper } from '@p5-wrapper/next';
import { P5CanvasInstance, Sketch } from '@p5-wrapper/react';

const sketch: Sketch = (p5: P5CanvasInstance) => {
  let particleCount = 2000;  
  let noiseScale = 0.005;    
  let flowSpeed = 1;      
  let trailStrength = 5;   
  
  let particles: Particle[] = [];

  p5.updateWithProps = (props: any) => {
  if (props.flowSpeed !== undefined) flowSpeed = props.flowSpeed;
  if (props.noiseScale !== undefined) noiseScale = props.noiseScale;
  if (props.trailStrength !== undefined) trailStrength = props.trailStrength;
};


  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.colorMode(p5.HSB, 360, 255, 255, 255);
    p5.noiseDetail(8, 0.65);
    p5.background(10);
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(p5));
    }
  };

  p5.draw = () => {
    p5.noStroke();
    p5.fill(10, trailStrength); 
    p5.rect(0, 0, p5.width, p5.height);

    particles.forEach(p => {
      p.follow(noiseScale, flowSpeed);
      p.repel();
      p.update();
      p.edges();
      p.show();
    });
  };

  p5.windowResized = () => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
    p5.background(10);
  };

  p5.keyReleased = () => {
    if (p5.key === 's' || p5.key === 'S') {
      p5.saveCanvas('my-flow-field', 'png');
      console.log('Canvas saved!');
    }
  };

  class Particle {
    pos: any;
    vel: any;
    acc: any;
    p: P5CanvasInstance;
    colorHue: number;

    constructor(p: P5CanvasInstance) {
      this.p = p;
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p.createVector(0, 0);
      this.acc = p.createVector(0, 0);
      this.colorHue = p.random(100, 255); 
    }

    follow(scale: number, strength: number) {
      const angle = this.p.noise(this.pos.x * scale, this.pos.y * scale, this.p.frameCount * 0.0005) * this.p.TWO_PI * 2;
      const force = this.p.createVector(1, 0);
      force.rotate(angle);
      force.setMag(strength);
      this.acc.add(force);
    }

    repel() {
      let mouse = this.p.createVector(this.p.mouseX, this.p.mouseY);
      let dir = this.p.createVector(this.pos.x - mouse.x, this.pos.y - mouse.y);
      let distance = dir.mag();
      
      if (distance < 150 && distance > 0) {
        dir.setMag(150 - distance); 
        dir.mult(0.02); 
        this.acc.add(dir);
      }
    }

    update() {
      this.vel.add(this.acc);
      this.vel.limit(2);
      this.pos.add(this.vel);
      this.acc.mult(0); 
    }

    edges() {
      if (this.pos.x > this.p.width) this.pos.x = 0;
      if (this.pos.x < 0) this.pos.x = this.p.width;
      if (this.pos.y > this.p.height) this.pos.y = 0;
      if (this.pos.y < 0) this.pos.y = this.p.height;
    }

    show() {
      let speed = this.vel.mag();
      let brightness = this.p.map(speed, 0, 2, 50, 255);
      let weight = this.p.map(speed, 0, 2, 1, 3);

      this.p.stroke(this.colorHue, 200, brightness, 150); 
      this.p.strokeWeight(weight);
      this.p.point(this.pos.x, this.pos.y);
    }
  }
};

export default function FlowField() {
  const [speed, setSpeed] = useState(1);
  const [noise, setNoise] = useState(0.005);
  const [trail, setTrail] = useState(5);
  const [particles, setParticles] = useState(4000);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative w-full h-full">
      {/* Canvas */}
      <div className="absolute inset-0">
        <NextReactP5Wrapper 
          sketch={sketch}
          flowSpeed={speed}
          noiseScale={noise}
          trailStrength={trail}
        />
      </div>

      {/* Professional Control Panel */}
<div className="fixed top-6 right-6 z-[9999] pointer-events-auto">
  <div className={`bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 ${isCollapsed ? 'w-12 h-12' : 'w-72'} overflow-hidden`}>
    
    {/* Header */}
    <div className="flex items-center justify-between p-3 border-b border-white/10">
      {!isCollapsed && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <h3 className="text-xs font-semibold text-white tracking-wide">Flow Controls</h3>
        </div>
      )}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="ml-auto p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 group"
      >
        {isCollapsed ? (
          // Hamburger menu icon when collapsed
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          // Minimize icon when open
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        )}
      </button>
    </div>

    {/* Controls Content */}
    {!isCollapsed && (
      <div className="p-4 space-y-4">
        
        {/* Flow Speed Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-white uppercase tracking-wider">Flow Speed</label>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-500/30">
              {speed.toFixed(1)}
            </span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            value={speed} 
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700/50 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-gradient-to-r
              [&::-webkit-slider-thumb]:from-emerald-400
              [&::-webkit-slider-thumb]:to-cyan-400
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-emerald-500/50
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-gradient-to-r
              [&::-moz-range-thumb]:from-emerald-400
              [&::-moz-range-thumb]:to-cyan-400
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-lg
              [&::-moz-range-thumb]:shadow-emerald-500/50
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:transition-all
              [&::-moz-range-thumb]:hover:scale-110"
          />
          <div className="flex justify-between text-[9px] text-white/50 font-mono">
            <span>0.1</span>
            <span>5.0</span>
          </div>
        </div>

        {/* Noise Scale Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-white uppercase tracking-wider">Noise Scale</label>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-md border border-purple-500/30">
              {noise.toFixed(3)}
            </span>
          </div>
          <input 
            type="range" 
            min="0.001" 
            max="0.05" 
            step="0.001" 
            value={noise} 
            onChange={(e) => setNoise(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700/50 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-gradient-to-r
              [&::-webkit-slider-thumb]:from-purple-400
              [&::-webkit-slider-thumb]:to-pink-400
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-purple-500/50
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-gradient-to-r
              [&::-moz-range-thumb]:from-purple-400
              [&::-moz-range-thumb]:to-pink-400
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-lg
              [&::-moz-range-thumb]:shadow-purple-500/50
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:transition-all
              [&::-moz-range-thumb]:hover:scale-110"
          />
          <div className="flex justify-between text-[9px] text-white/50 font-mono">
            <span>0.001</span>
            <span>0.050</span>
          </div>
        </div>

        {/* Trail Fade Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-white uppercase tracking-wider">Trail Fade</label>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-md border border-blue-500/30">
              {trail}
            </span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="50" 
            step="1" 
            value={trail} 
            onChange={(e) => setTrail(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700/50 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-gradient-to-r
              [&::-webkit-slider-thumb]:from-blue-400
              [&::-webkit-slider-thumb]:to-indigo-400
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-blue-500/50
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-gradient-to-r
              [&::-moz-range-thumb]:from-blue-400
              [&::-moz-range-thumb]:to-indigo-400
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-lg
              [&::-moz-range-thumb]:shadow-blue-500/50
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:transition-all
              [&::-moz-range-thumb]:hover:scale-110"
          />
          <div className="flex justify-between text-[9px] text-white/50 font-mono">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        {/* Footer with Tip */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-[9px] text-white/60 text-center font-mono">
            💡 Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-white text-[9px]">S</kbd> to save
          </p>
        </div>
      </div>
    )}
  </div>
</div>
    </div>
  );
}