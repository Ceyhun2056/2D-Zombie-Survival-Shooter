// Zombie Management Module
export class Zombie {
    constructor(x, y, type = 'walker') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alive = true;
        this.radius = 15;
        
        // Set properties based on type
        this.setTypeProperties();
        
        this.maxHealth = this.health;
        this.hitFlash = 0;
        this.lastAttackTime = 0;
    }
    
    setTypeProperties() {
        switch (this.type) {
            case 'walker':
                this.health = 50;
                this.speed = 60;
                this.damage = 15;
                this.scoreValue = 10;
                this.xpValue = 5;
                this.color = '#ff4444';
                break;
            case 'runner':
                this.health = 25;
                this.speed = 120;
                this.damage = 10;
                this.scoreValue = 15;
                this.xpValue = 8;
                this.color = '#ff8844';
                this.radius = 12;
                break;
            case 'spitter':
                this.health = 40;
                this.speed = 40;
                this.damage = 8;
                this.scoreValue = 20;
                this.xpValue = 12;
                this.color = '#44ff44';
                this.lastShotTime = 0;
                this.shootCooldown = 2000;
                this.range = 300;
                break;
            case 'brute':
                this.health = 200;
                this.speed = 30;
                this.damage = 30;
                this.scoreValue = 50;
                this.xpValue = 25;
                this.color = '#8844ff';
                this.radius = 25;
                break;
        }
    }
    
    update(deltaTime, player, bulletManager) {
        if (!this.alive) return;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Update hit flash
        if (this.hitFlash > 0) {
            this.hitFlash -= deltaTime * 1000;
        }
        
        // Special behavior for spitter
        if (this.type === 'spitter' && distance <= this.range) {
            this.handleSpitterBehavior(player, bulletManager);
        } else if (distance > this.radius + player.radius) {
            // Move towards player
            const moveX = (dx / distance) * this.speed * deltaTime;
            const moveY = (dy / distance) * this.speed * deltaTime;
            
            this.x += moveX;
            this.y += moveY;
        }
    }
    
    handleSpitterBehavior(player, bulletManager) {
        const now = Date.now();
        if (now - this.lastShotTime >= this.shootCooldown) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            
            bulletManager.addEnemyBullet({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * 200,
                vy: Math.sin(angle) * 200,
                damage: this.damage,
                radius: 6,
                color: '#44ff44',
                lifetime: 3,
                type: 'poison'
            });
            
            this.lastShotTime = now;
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        this.hitFlash = 200;
        
        if (this.health <= 0) {
            this.alive = false;
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        // Flash effect when hit
        const flashIntensity = Math.max(0, this.hitFlash / 200);
        const r = parseInt(this.color.slice(1, 3), 16);
        const g = parseInt(this.color.slice(3, 5), 16);
        const b = parseInt(this.color.slice(5, 7), 16);
        
        const flashR = Math.min(255, r + flashIntensity * 100);
        const flashG = Math.min(255, g + flashIntensity * 100);
        const flashB = Math.min(255, b + flashIntensity * 100);
        
        ctx.fillStyle = `rgb(${flashR}, ${flashG}, ${flashB})`;
        
        // Draw zombie body
        if (this.type === 'brute') {
            ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw health bar for tougher zombies
        if (this.maxHealth > 50) {
            this.renderHealthBar(ctx);
        }
        
        // Draw type-specific features
        this.renderTypeFeatures(ctx);
        
        ctx.restore();
    }
    
    renderHealthBar(ctx) {
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
        
        // Health fill
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth * healthPercent, barHeight);
    }
    
    renderTypeFeatures(ctx) {
        ctx.fillStyle = '#ffffff';
        
        switch (this.type) {
            case 'runner':
                // Draw speed lines
                ctx.fillRect(this.x - this.radius - 5, this.y - 1, 3, 2);
                ctx.fillRect(this.x - this.radius - 8, this.y - 1, 2, 2);
                break;
            case 'spitter':
                // Draw spit glands
                ctx.fillStyle = '#88ff88';
                ctx.beginPath();
                ctx.arc(this.x - 5, this.y - 5, 3, 0, Math.PI * 2);
                ctx.arc(this.x + 5, this.y - 5, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'brute':
                // Draw spikes
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const spikex = this.x + Math.cos(angle) * this.radius;
                    const spikey = this.y + Math.sin(angle) * this.radius;
                    ctx.fillRect(spikex - 2, spikey - 2, 4, 4);
                }
                break;
        }
    }
}

export class ZombieManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.zombies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // ms
        this.waveMultiplier = 1;
        this.maxZombies = 50;
    }
    
    update(deltaTime, player, wave) {
        // Update spawn timer
        this.spawnTimer += deltaTime * 1000;
        
        // Spawn zombies
        if (this.spawnTimer >= this.spawnInterval && this.zombies.length < this.maxZombies) {
            this.spawnZombie(wave);
            this.spawnTimer = 0;
        }
        
        // Update existing zombies
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const zombie = this.zombies[i];
            zombie.update(deltaTime, player, this);
            
            // Remove dead zombies
            if (!zombie.alive) {
                this.zombies.splice(i, 1);
            }
        }
        
        // Remove zombies that are too far from player
        this.cleanupDistantZombies(player);
    }
    
    spawnZombie(wave) {
        const spawnPos = this.getRandomSpawnPosition();
        let type = 'walker';
        
        // Determine zombie type based on wave
        const rand = Math.random();
        if (wave >= 3 && rand < 0.2) type = 'runner';
        if (wave >= 5 && rand < 0.1) type = 'spitter';
        if (wave >= 10 && rand < 0.05) type = 'brute';
        
        const zombie = new Zombie(spawnPos.x, spawnPos.y, type);
        
        // Scale zombie stats with wave
        zombie.health = Math.floor(zombie.health * (1 + (wave - 1) * 0.1));
        zombie.maxHealth = zombie.health;
        zombie.speed *= (1 + (wave - 1) * 0.05);
        zombie.damage = Math.floor(zombie.damage * (1 + (wave - 1) * 0.08));
        
        this.zombies.push(zombie);
    }
    
    spawnBoss() {
        const spawnPos = this.getRandomSpawnPosition();
        const boss = new Zombie(spawnPos.x, spawnPos.y, 'brute');
        
        // Make boss extra tough
        boss.health *= 3;
        boss.maxHealth = boss.health;
        boss.damage *= 2;
        boss.scoreValue *= 5;
        boss.xpValue *= 5;
        boss.radius *= 1.5;
        
        this.zombies.push(boss);
    }
    
    getRandomSpawnPosition() {
        const margin = 100;
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // Top
                return { x: Math.random() * this.canvas.width, y: -margin };
            case 1: // Right
                return { x: this.canvas.width + margin, y: Math.random() * this.canvas.height };
            case 2: // Bottom
                return { x: Math.random() * this.canvas.width, y: this.canvas.height + margin };
            case 3: // Left
                return { x: -margin, y: Math.random() * this.canvas.height };
        }
    }
    
    cleanupDistantZombies(player) {
        const maxDistance = Math.max(this.canvas.width, this.canvas.height) * 1.5;
        
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const zombie = this.zombies[i];
            const dx = zombie.x - player.x;
            const dy = zombie.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > maxDistance) {
                this.zombies.splice(i, 1);
            }
        }
    }
    
    increaseDifficulty() {
        this.spawnInterval = Math.max(500, this.spawnInterval * 0.95);
        this.maxZombies = Math.min(100, this.maxZombies + 5);
    }
    
    reset() {
        this.zombies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000;
        this.maxZombies = 50;
    }
    
    render(ctx) {
        for (const zombie of this.zombies) {
            zombie.render(ctx);
        }
    }
}
