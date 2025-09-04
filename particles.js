// Particle Effects System Module
export class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 200;
        this.vy = options.vy || (Math.random() - 0.5) * 200;
        this.life = options.life || 1;
        this.maxLife = this.life;
        this.size = options.size || 3;
        this.color = options.color || '#ff0000';
        this.gravity = options.gravity || 0;
        this.friction = options.friction || 0.98;
        this.fade = options.fade !== false;
        this.shrink = options.shrink || false;
        this.glow = options.glow || false;
        this.trail = options.trail || false;
        this.trailPoints = [];
        this.maxTrailLength = 10;
    }
    
    update(deltaTime) {
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Apply physics
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity * deltaTime;
        
        // Update life
        this.life -= deltaTime;
        
        // Add to trail
        if (this.trail) {
            this.trailPoints.push({ x: this.x, y: this.y });
            if (this.trailPoints.length > this.maxTrailLength) {
                this.trailPoints.shift();
            }
        }
        
        return this.life > 0;
    }
    
    render(ctx) {
        ctx.save();
        
        const alpha = this.fade ? this.life / this.maxLife : 1;
        const currentSize = this.shrink ? this.size * (this.life / this.maxLife) : this.size;
        
        ctx.globalAlpha = alpha;
        
        // Draw trail
        if (this.trail && this.trailPoints.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = currentSize * 0.5;
            ctx.globalAlpha = alpha * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
            for (let i = 1; i < this.trailPoints.length; i++) {
                ctx.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
            }
            ctx.stroke();
            
            ctx.globalAlpha = alpha;
        }
        
        // Draw glow effect
        if (this.glow) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = currentSize * 2;
        }
        
        // Draw particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }
    
    createBloodSplatter(x, y, intensity = 1) {
        const particleCount = Math.floor(10 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100 * intensity;
            
            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.5,
                size: 2 + Math.random() * 3,
                color: `hsl(${Math.random() * 20}, 80%, ${20 + Math.random() * 30}%)`,
                gravity: 200,
                friction: 0.95
            });
        }
    }
    
    createBulletImpact(x, y, bulletType = 'normal') {
        let particleCount = 5;
        let colors = ['#ffff44', '#ffffff', '#ffa500'];
        
        if (bulletType === 'explosive') {
            particleCount = 15;
            colors = ['#ff4500', '#ff6600', '#ffff00', '#ffffff'];
        }
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 120;
            
            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.3 + Math.random() * 0.4,
                size: 1 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 100,
                friction: 0.97,
                glow: true
            });
        }
    }
    
    createExplosion(x, y, size = 1) {
        const particleCount = Math.floor(20 * size);
        
        // Explosion core
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (100 + Math.random() * 200) * size;
            
            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.8,
                size: (2 + Math.random() * 4) * size,
                color: `hsl(${Math.random() * 60}, 100%, ${50 + Math.random() * 50}%)`,
                gravity: 50,
                friction: 0.96,
                glow: true,
                shrink: true
            });
        }
        
        // Smoke particles
        for (let i = 0; i < particleCount / 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (50 + Math.random() * 100) * size;
            
            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50,
                life: 1 + Math.random() * 2,
                size: (3 + Math.random() * 6) * size,
                color: `rgba(100, 100, 100, 0.${Math.floor(Math.random() * 5) + 3})`,
                gravity: -20,
                friction: 0.99,
                shrink: false
            });
        }
    }
    
    createDashEffect(x, y, direction) {
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            // Create particles behind the dash direction
            const offsetAngle = direction + Math.PI + (Math.random() - 0.5) * 0.5;
            const distance = 20 + Math.random() * 20;
            const startX = x + Math.cos(offsetAngle) * distance;
            const startY = y + Math.sin(offsetAngle) * distance;
            
            this.addParticle(startX, startY, {
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                life: 0.3 + Math.random() * 0.4,
                size: 2 + Math.random() * 3,
                color: `rgba(100, 200, 255, 0.${Math.floor(Math.random() * 5) + 5})`,
                gravity: 0,
                friction: 0.95,
                glow: true,
                fade: true
            });
        }
    }
    
    createMuzzleFlash(x, y, direction, weaponType = 'normal') {
        let particleCount = 5;
        let colors = ['#ffff44', '#ffffff', '#ffa500'];
        let spread = 0.3;
        
        if (weaponType === 'shotgun') {
            particleCount = 8;
            spread = 0.8;
        } else if (weaponType === 'flamethrower') {
            particleCount = 12;
            colors = ['#ff4500', '#ff6600', '#ffff00'];
            spread = 0.4;
        }
        
        for (let i = 0; i < particleCount; i++) {
            const angle = direction + (Math.random() - 0.5) * spread;
            const speed = 100 + Math.random() * 100;
            
            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.1 + Math.random() * 0.2,
                size: 2 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0,
                friction: 0.92,
                glow: true,
                shrink: true
            });
        }
    }
    
    createShellEjection(x, y, direction) {
        const shellCount = 1;
        
        for (let i = 0; i < shellCount; i++) {
            // Eject to the side of the weapon
            const ejectAngle = direction + Math.PI * 0.5 + (Math.random() - 0.5) * 0.3;
            const speed = 80 + Math.random() * 40;
            
            this.addParticle(x, y, {
                vx: Math.cos(ejectAngle) * speed,
                vy: Math.sin(ejectAngle) * speed - 30,
                life: 2 + Math.random(),
                size: 1 + Math.random(),
                color: '#d4af37',
                gravity: 400,
                friction: 0.7,
                glow: false
            });
        }
    }
    
    createHealingEffect(x, y) {
        const particleCount = 6;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 20 + Math.random() * 10;
            
            this.addParticle(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, {
                vx: 0,
                vy: -30 - Math.random() * 20,
                life: 1 + Math.random() * 0.5,
                size: 3 + Math.random() * 2,
                color: '#4CAF50',
                gravity: -20,
                friction: 0.98,
                glow: true,
                fade: true
            });
        }
    }
    
    addParticle(x, y, options) {
        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle
            this.particles.shift();
        }
        
        this.particles.push(new Particle(x, y, options));
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (!particle.update(deltaTime)) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        for (const particle of this.particles) {
            particle.render(ctx);
        }
    }
    
    clear() {
        this.particles = [];
    }
    
    getParticleCount() {
        return this.particles.length;
    }
    
    setMaxParticles(max) {
        this.maxParticles = max;
        
        // Remove excess particles if needed
        while (this.particles.length > this.maxParticles) {
            this.particles.shift();
        }
    }
}
