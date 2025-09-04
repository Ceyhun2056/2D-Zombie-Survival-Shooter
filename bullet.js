// Bullet Management Module
export class Bullet {
    constructor(data) {
        this.x = data.x;
        this.y = data.y;
        this.vx = data.vx;
        this.vy = data.vy;
        this.damage = data.damage;
        this.radius = data.radius || 3;
        this.color = data.color || '#ffff44';
        this.lifetime = data.lifetime || 2;
        this.maxLifetime = this.lifetime;
        this.active = true;
        this.type = data.type || 'normal';
        this.trail = [];
        this.maxTrailLength = 5;
    }
    
    update(deltaTime, canvas) {
        if (!this.active) return;
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Update lifetime
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.active = false;
        }
        
        // Check bounds
        if (this.x < -50 || this.x > canvas.width + 50 ||
            this.y < -50 || this.y > canvas.height + 50) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Draw trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.radius * 0.5;
            ctx.globalAlpha = 0.5;
            
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }
        
        // Draw bullet
        ctx.globalAlpha = Math.min(1, this.lifetime / this.maxLifetime);
        ctx.fillStyle = this.color;
        
        if (this.type === 'flamethrower') {
            // Draw flame particle
            const size = this.radius * (0.5 + Math.random() * 0.5);
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
        } else {
            // Draw regular bullet
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

export class BulletManager {
    constructor() {
        this.bullets = [];
        this.enemyBullets = [];
        this.bulletPool = [];
        this.maxPoolSize = 100;
    }
    
    addBullet(bulletData) {
        if (Array.isArray(bulletData)) {
            bulletData.forEach(data => {
                this.bullets.push(this.createBullet(data));
            });
        } else {
            this.bullets.push(this.createBullet(bulletData));
        }
    }
    
    addEnemyBullet(bulletData) {
        this.enemyBullets.push(this.createBullet(bulletData));
    }
    
    createBullet(data) {
        // Try to reuse from pool
        if (this.bulletPool.length > 0) {
            const bullet = this.bulletPool.pop();
            Object.assign(bullet, data);
            bullet.active = true;
            bullet.trail = [];
            bullet.lifetime = data.lifetime || 2;
            bullet.maxLifetime = bullet.lifetime;
            return bullet;
        }
        
        return new Bullet(data);
    }
    
    recycleBullet(bullet) {
        if (this.bulletPool.length < this.maxPoolSize) {
            bullet.active = false;
            this.bulletPool.push(bullet);
        }
    }
    
    update(deltaTime, canvas) {
        // Update player bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime, canvas);
            
            if (!bullet.active) {
                this.recycleBullet(bullet);
                this.bullets.splice(i, 1);
            }
        }
        
        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.update(deltaTime, canvas);
            
            if (!bullet.active) {
                this.recycleBullet(bullet);
                this.enemyBullets.splice(i, 1);
            }
        }
    }
    
    checkPlayerCollisions(player) {
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            if (!bullet.active) continue;
            
            const dx = bullet.x - player.x;
            const dy = bullet.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bullet.radius + player.radius) {
                player.takeDamage(bullet.damage);
                bullet.active = false;
                return true;
            }
        }
        return false;
    }
    
    reset() {
        // Return all bullets to pool
        this.bullets.forEach(bullet => this.recycleBullet(bullet));
        this.enemyBullets.forEach(bullet => this.recycleBullet(bullet));
        
        this.bullets = [];
        this.enemyBullets = [];
    }
    
    render(ctx) {
        // Render player bullets
        for (const bullet of this.bullets) {
            bullet.render(ctx);
        }
        
        // Render enemy bullets
        for (const bullet of this.enemyBullets) {
            bullet.render(ctx);
        }
    }
}
