// Power-ups and Loot System Module
export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 15;
        this.collected = false;
        this.lifetime = 30; // 30 seconds before despawn
        this.maxLifetime = this.lifetime;
        this.pulseTime = 0;
        this.floatOffset = Math.random() * Math.PI * 2;
        
        // Power-up properties
        const types = {
            health: {
                color: '#4CAF50',
                glowColor: '#81C784',
                effect: 'Restores 50 health'
            },
            ammo: {
                color: '#FF9800',
                glowColor: '#FFB74D',
                effect: 'Refills current weapon ammo'
            },
            damage: {
                color: '#F44336',
                glowColor: '#EF5350',
                effect: 'Increases damage for 30 seconds'
            },
            speed: {
                color: '#2196F3',
                glowColor: '#42A5F5',
                effect: 'Increases movement speed for 30 seconds'
            },
            multishot: {
                color: '#9C27B0',
                glowColor: '#BA68C8',
                effect: 'Fires multiple bullets for 20 seconds'
            },
            shield: {
                color: '#00BCD4',
                glowColor: '#4DD0E1',
                effect: 'Temporary invincibility for 10 seconds'
            },
            xp: {
                color: '#FFEB3B',
                glowColor: '#FFF176',
                effect: 'Grants bonus XP'
            }
        };
        
        this.properties = types[this.type] || types.health;
    }
    
    update(deltaTime) {
        if (this.collected) return;
        
        this.lifetime -= deltaTime;
        this.pulseTime += deltaTime * 2;
        
        // Float animation
        this.floatOffset += deltaTime * 2;
        
        // Check if expired
        if (this.lifetime <= 0) {
            this.collected = true;
        }
    }
    
    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        
        // Calculate position with floating effect
        const floatY = this.y + Math.sin(this.floatOffset) * 3;
        const alpha = this.lifetime < 5 ? 0.3 + Math.sin(this.pulseTime * 10) * 0.7 : 1;
        
        // Draw glow effect
        ctx.globalAlpha = alpha * 0.3;
        ctx.shadowColor = this.properties.glowColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.properties.glowColor;
        ctx.beginPath();
        ctx.arc(this.x, floatY, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw main power-up
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.properties.color;
        ctx.beginPath();
        ctx.arc(this.x, floatY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner glow
        ctx.globalAlpha = alpha * 0.8;
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, floatY, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw type indicator
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const symbol = this.getTypeSymbol();
        ctx.fillText(symbol, this.x, floatY);
        
        ctx.restore();
    }
    
    getTypeSymbol() {
        const symbols = {
            health: '+',
            ammo: '●',
            damage: '!',
            speed: '»',
            multishot: '≡',
            shield: '◊',
            xp: '★'
        };
        return symbols[this.type] || '?';
    }
    
    checkCollision(player) {
        if (this.collected) return false;
        
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.radius + player.radius;
    }
    
    collect(player) {
        if (this.collected) return false;
        
        this.collected = true;
        this.applyEffect(player);
        return true;
    }
    
    applyEffect(player) {
        switch (this.type) {
            case 'health':
                player.heal(50);
                break;
            case 'ammo':
                player.refillAmmo();
                break;
            case 'damage':
                player.addBuff('damage', 1.5, 30);
                break;
            case 'speed':
                player.addBuff('speed', 1.3, 30);
                break;
            case 'multishot':
                player.addBuff('multishot', 3, 20);
                break;
            case 'shield':
                player.addBuff('shield', 1, 10);
                break;
            case 'xp':
                player.gainXP(100);
                break;
        }
    }
}

export class PowerUpManager {
    constructor() {
        this.powerUps = [];
        this.spawnRate = 0.05; // 5% chance per zombie kill
        this.maxPowerUps = 10;
        
        // Drop rate weights
        this.dropWeights = {
            health: 30,
            ammo: 25,
            xp: 20,
            damage: 10,
            speed: 8,
            multishot: 5,
            shield: 2
        };
        
        this.totalWeight = Object.values(this.dropWeights).reduce((a, b) => a + b, 0);
    }
    
    update(deltaTime) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update(deltaTime);
            
            if (powerUp.collected || powerUp.lifetime <= 0) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    checkCollisions(player) {
        const collected = [];
        
        for (const powerUp of this.powerUps) {
            if (powerUp.checkCollision(player)) {
                if (powerUp.collect(player)) {
                    collected.push(powerUp);
                }
            }
        }
        
        return collected;
    }
    
    trySpawnPowerUp(x, y) {
        if (Math.random() < this.spawnRate && this.powerUps.length < this.maxPowerUps) {
            const type = this.getRandomPowerUpType();
            this.spawnPowerUp(x, y, type);
            return true;
        }
        return false;
    }
    
    spawnPowerUp(x, y, type = null) {
        if (!type) {
            type = this.getRandomPowerUpType();
        }
        
        // Add some randomness to position
        const offsetX = (Math.random() - 0.5) * 60;
        const offsetY = (Math.random() - 0.5) * 60;
        
        const powerUp = new PowerUp(x + offsetX, y + offsetY, type);
        this.powerUps.push(powerUp);
        
        return powerUp;
    }
    
    getRandomPowerUpType() {
        let random = Math.random() * this.totalWeight;
        
        for (const [type, weight] of Object.entries(this.dropWeights)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }
        
        return 'health'; // Fallback
    }
    
    spawnHealthPack(x, y) {
        return this.spawnPowerUp(x, y, 'health');
    }
    
    spawnAmmoPack(x, y) {
        return this.spawnPowerUp(x, y, 'ammo');
    }
    
    forceDrop(x, y, type) {
        return this.spawnPowerUp(x, y, type);
    }
    
    adjustSpawnRate(waveNumber) {
        // Increase spawn rate slightly with waves
        this.spawnRate = Math.min(0.15, 0.05 + (waveNumber * 0.01));
    }
    
    clearAll() {
        this.powerUps = [];
    }
    
    render(ctx) {
        for (const powerUp of this.powerUps) {
            powerUp.render(ctx);
        }
    }
    
    getPowerUpCount() {
        return this.powerUps.length;
    }
    
    getPowerUpsByType(type) {
        return this.powerUps.filter(p => p.type === type && !p.collected);
    }
    
    reset() {
        this.powerUps = [];
        this.spawnRate = 0.05;
    }
}
