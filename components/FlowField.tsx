'use client';

import { NextReactP5Wrapper } from '@p5-wrapper/next';
import { P5CanvasInstance, Sketch } from '@p5-wrapper/react';

// This function contains the entire art logic
const sketch: Sketch = (p5: P5CanvasInstance) => {
  // Configuration
  const particleCount = 4000;  
  const noiseScale = 0.005;    
  const flowSpeed = 1;      
  const trailStrength = 5;   
  
  // Store our particles here
  let particles: Particle[] = [];

  
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

  // 2. DRAW: Runs 60 times per second
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
    p5.background(10); // Reset background to avoid glitches
  };

  p5.keyReleased = () => {
    // Press 'S' or 's' to save the canvas
    if (p5.key === 's' || p5.key === 'S') {
      p5.saveCanvas('my-flow-field', 'png');
      console.log('Canvas saved!');
    }
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
  return <NextReactP5Wrapper sketch={sketch} />;
}
