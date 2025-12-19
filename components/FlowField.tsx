'use client';
import { useState } from 'react';
import { NextReactP5Wrapper } from '@p5-wrapper/next';
import { P5CanvasInstance, Sketch } from '@p5-wrapper/react';

// This function contains the entire art logic
const sketch: Sketch = (p5: P5CanvasInstance) => {
  // Configuration
  let particleCount = 4000;  
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
    
    // Create the particles
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

  return (
    <div className="relative w-full h-full">
      {/* Canvas wrapper with pointer-events-none */}
      <div className="absolute inset-0 pointer-events-none">
        <NextReactP5Wrapper 
          sketch={sketch}
          flowSpeed={speed}
          noiseScale={noise}
          trailStrength={trail}
        />
      </div>

      {/* Control Panel with pointer-events-auto */}
      <div className="fixed top-5 right-5 z-[9999] bg-neutral-900/80 p-5 rounded-lg border border-white/10 backdrop-blur-sm text-white w-64 shadow-2xl pointer-events-auto">
        <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-neutral-400">Controls</h3>
        
        <div className="mb-4">
          <label className="block text-xs mb-1">Flow Speed: {speed}</label>
          <input 
            type="range" min="0.1" max="5" step="0.1" 
            value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs mb-1">Noise Scale: {noise}</label>
          <input 
            type="range" min="0.001" max="0.05" step="0.001" 
            value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
        </div>

        <div className="mb-0">
          <label className="block text-xs mb-1">Trail Fade: {trail}</label>
          <input 
            type="range" min="1" max="50" step="1" 
            value={trail} onChange={(e) => setTrail(parseInt(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
