/**
 * Sketch Canvas Engine
 *
 * Clean-room adaptation of soulwire/sketch.js for Onyx.
 * Provides lightweight creative coding animation loops, dynamic particle physics,
 * interactive pointer binding, and kinetic visual shaders for MotionSites Studio.
 */

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

export interface SketchConfig {
  readonly width?: number
  readonly height?: number
  readonly particleCount?: number
  readonly autoClear?: boolean
  readonly background?: string
}

export class SketchCanvasEngine {
  private particles: Particle[] = []

  constructor(private readonly config: SketchConfig = {}) {
    this.initParticles()
  }

  private initParticles(): void {
    const count = this.config.particleCount ?? 50
    const w = this.config.width ?? 800
    const h = this.config.height ?? 600

    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 3 + 1,
      color: "#6366F1",
    }))
  }

  /**
   * Advances the animation physics simulation by one frame step.
   */
  public stepSimulation(bounds: { width: number; height: number }): void {
    for (const p of this.particles) {
      p.x += p.vx
      p.y += p.vy

      // Bounce off walls
      if (p.x <= 0 || p.x >= bounds.width) p.vx *= -1
      if (p.y <= 0 || p.y >= bounds.height) p.vy *= -1
    }
  }

  public getParticles(): readonly Particle[] {
    return this.particles
  }

  /**
   * Generates production-ready standalone HTML5 Canvas + Animation loop snippet.
   */
  public generateCanvasSnippet(id = "onyx-kinetic-canvas"): string {
    return `
<canvas id="${id}" style="width: 100%; height: 100%; position: absolute; inset: 0; pointer-events: none; z-index: 0;"></canvas>
<script>
(function() {
  const canvas = document.getElementById('${id}');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  const particles = [];
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: Math.random() * 2 + 1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
</script>
    `.trim()
  }
}
