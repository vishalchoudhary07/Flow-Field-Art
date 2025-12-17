'use client';

import { NextReactP5Wrapper } from '@p5-wrapper/next';
import { P5CanvasInstance, Sketch } from '@p5-wrapper/react';

// This function contains the entire art logic
const sketch: Sketch = (p5: P5CanvasInstance) => {
  // Configuration
  const particleCount = 800;  
  const noiseScale = 0.01;    
  const flowSpeed = 0.5;      
  const trailStrength = 10;   
  
  // Store our particles here
  let particles: Particle[] = [];

  
  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.background(10); 
    
    // Create the particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(p5));
    }
  };

  // 2. DRAW: Runs 60 times per second
  p5.draw = () => {
    
    p5.noStroke();
    p5.fill(10, trailStrength); 
    p5.rect(0, 0, p5.width, p5.height);

    particles.forEach(p => {
      p.follow(noiseScale, flowSpeed);
      p.update();
      p.edges();
      p.show();
    });
  };

  // --- The Particle Class ---
  class Particle {
    pos: any;
    vel: any;
    acc: any;
    p: P5CanvasInstance;
    colorHue: number;

    constructor(p: P5CanvasInstance) {
      this.p = p;
      // Start at random position
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p.createVector(0, 0);
      this.acc = p.createVector(0, 0);
      // Give each particle a random base color
      this.colorHue = p.random(100, 255); 
    }

    follow(scale: number, strength: number) {
      // PERLIN NOISE: Get a smooth random number based on X/Y position
      // We map that number (0-1) to an angle (0 to 2*PI radians)
      const angle = this.p.noise(this.pos.x * scale, this.pos.y * scale, this.p.frameCount * 0.0005) * this.p.TWO_PI * 2;
      
      // Turn that angle into a force vector
      const force = this.p.createVector(1, 0);
      force.rotate(angle);
      force.setMag(strength);
      this.acc.add(force);
    }

    update() {
      this.vel.add(this.acc);
      this.vel.limit(2); // Speed limit
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
      
      this.p.stroke(this.colorHue, 200, 255, 150); 
      this.p.strokeWeight(2);
      this.p.point(this.pos.x, this.pos.y);
    }
  }
};

export default function FlowField() {
  return <NextReactP5Wrapper sketch={sketch} />;
}
