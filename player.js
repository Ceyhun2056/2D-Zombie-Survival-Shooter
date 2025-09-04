// Player Module
export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.radius = 20;
        
        // Health system
        this.health = 100;
        this.maxHealth = 100;
        this.lastDamageTime = 0;
        this.healthRegenDelay = 5000; // 5 seconds
        this.healthRegenRate = 5; // HP per second
        
        // Movement
        this.speed = 250;
        this.velocity = { x: 0, y: 0 };
        
        // Dash system
        this.stamina = 100;
        this.maxStamina = 100;
        this.dashCost = 30;
        this.dashSpeed = 500;
        this.dashDuration = 0.2;
        this.dashTime = 0;
        this.isDashing = false;
        this.staminaRegenRate = 25; // Per second
        
        // XP and leveling
        this.xp = 0;
        this.level = 1;
        this.xpToNextLevel = 100;
        this.perks = [];
        this.levelUpPending = false;
        this.availablePerks = null;
        
        // Weapons system
        this.weapons = [
            {
                name: 'Pistol',
                damage: 25,
                fireRate: 300, // ms between shots
                ammo: Infinity,
                maxAmmo: Infinity,
                reloadTime: 1000,
                range: 400,
                spread: 0,
                bulletCount: 1,
                unlocked: true
            },
            {
                name: 'Shotgun',
                damage: 15,
                fireRate: 800,
                ammo: 8,
                maxAmmo: 8,
                reloadTime: 2000,
                range: 200,
                spread: 0.5,
                bulletCount: 5,
                unlocked: false
            },
            {
                name: 'Assault Rifle',
                damage: 20,
                fireRate: 150,
                ammo: 30,
                maxAmmo: 30,
                reloadTime: 1500,
                range: 350,
                spread: 0.1,
                bulletCount: 1,
                unlocked: false
            },
            {
                name: 'Sniper Rifle',
                damage: 80,
                fireRate: 1500,
                ammo: 5,
                maxAmmo: 5,
                reloadTime: 3000,
                range: 600,
                spread: 0,
                bulletCount: 1,
                unlocked: false
            },
            {
                name: 'Flamethrower',
                damage: 5,
                fireRate: 50,
                ammo: 100,
                maxAmmo: 100,
                reloadTime: 2500,
                range: 150,
                spread: 0.3,
                bulletCount: 3,
                unlocked: false
            }
        ];
        
        this.currentWeaponIndex = 0;
        this.lastShotTime = 0;
        this.isReloading = false;
        this.reloadStartTime = 0;
        
        this.buffs = {};
    }
    
    get currentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }
    
    update(deltaTime, keys, mouse) {
        // Update buffs
        this.updateBuffs();
        
        // Handle reloading
        if (this.isReloading) {
            const now = Date.now();
            if (now - this.reloadStartTime >= this.currentWeapon.reloadTime) {
                this.currentWeapon.ammo = this.currentWeapon.maxAmmo;
                this.isReloading = false;
            }
        }
        
        // Calculate rotation to mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        this.rotation = Math.atan2(dy, dx);
        
        // Handle movement
        this.handleMovement(deltaTime, keys);
        
        // Handle stamina regeneration
        if (!this.isDashing && this.stamina < this.maxStamina) {
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * deltaTime);
        }
        
        // Handle health regeneration
        const now = Date.now();
        if (now - this.lastDamageTime > this.healthRegenDelay && this.health < this.maxHealth) {
            this.health = Math.min(this.maxHealth, this.health + this.getModifiedHealthRegen() * deltaTime);
        }
        
        // Update dash
        if (this.isDashing) {
            this.dashTime -= deltaTime;
            if (this.dashTime <= 0) {
                this.isDashing = false;
            }
        }
    }
    
    handleMovement(deltaTime, keys) {
        let moveX = 0;
        let moveY = 0;
        
        if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }
        
        // Handle dash
        if (keys['Space'] && !this.isDashing && this.stamina >= this.dashCost) {
            this.isDashing = true;
            this.dashTime = this.dashDuration;
            this.stamina -= this.dashCost;
        }
        
        // Calculate speed
        const currentSpeed = this.isDashing ? this.dashSpeed : this.getModifiedSpeed();
        
        // Update position
        this.x += moveX * currentSpeed * deltaTime;
        this.y += moveY * currentSpeed * deltaTime;
    }
    
    shoot(targetX, targetY) {
        const now = Date.now();
        const weapon = this.currentWeapon;
        
        // Check if can shoot
        if (this.isReloading || now - this.lastShotTime < weapon.fireRate || weapon.ammo <= 0) {
            return null;
        }
        
        const bullets = [];
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        
        for (let i = 0; i < weapon.bulletCount; i++) {
            const spread = (Math.random() - 0.5) * weapon.spread;
            const bulletAngle = angle + spread;
            const speed = 600;
            
            bullets.push({
                x: this.x + Math.cos(this.rotation) * 25,
                y: this.y + Math.sin(this.rotation) * 25,
                vx: Math.cos(bulletAngle) * speed,
                vy: Math.sin(bulletAngle) * speed,
                damage: this.getModifiedDamage(weapon.damage),
                radius: 3,
                color: '#ffff44',
                lifetime: weapon.range / speed,
                type: weapon.name.toLowerCase().replace(' ', '')
            });
        }
        
        // Consume ammo
        if (weapon.ammo !== Infinity) {
            weapon.ammo--;
        }
        
        this.lastShotTime = now;
        return bullets;
    }
    
    reload() {
        const weapon = this.currentWeapon;
        if (weapon.ammo < weapon.maxAmmo && !this.isReloading) {
            this.isReloading = true;
            this.reloadStartTime = Date.now();
        }
    }
    
    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length && this.weapons[index].unlocked) {
            this.currentWeaponIndex = index;
            this.isReloading = false;
        }
    }
    
    takeDamage(damage) {
        if (this.buffs.shield && this.buffs.shield.endTime > Date.now()) {
            return; // Invincible
        }
        
        this.health -= damage;
        this.lastDamageTime = Date.now();
        
        if (this.health <= 0) {
            this.health = 0;
        }
    }
    
    gainXP(amount) {
        this.xp += amount;
        
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.2);
        
        // Unlock weapons at certain levels
        if (this.level === 3) this.weapons[1].unlocked = true; // Shotgun
        if (this.level === 5) this.weapons[2].unlocked = true; // Assault Rifle
        if (this.level === 8) this.weapons[3].unlocked = true; // Sniper Rifle
        if (this.level === 12) this.weapons[4].unlocked = true; // Flamethrower
        
        // Set level up pending for game to handle
        this.levelUpPending = true;
        this.availablePerks = this.getAvailablePerks();
    }
    
    updateBuffs() {
        const now = Date.now();
        for (const [type, buff] of Object.entries(this.buffs)) {
            if (buff.endTime < now) {
                delete this.buffs[type];
            }
        }
    }
    
    addBuff(type, multiplier, duration) {
        this.buffs[type] = { multiplier, endTime: Date.now() + (duration * 1000) };
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    refillAmmo() {
        Object.values(this.weapons).forEach(weapon => {
            if (weapon.maxAmmo !== Infinity) {
                weapon.ammo = weapon.maxAmmo;
            }
        });
    }
    
    getModifiedDamage(baseDamage) {
        let multiplier = 1;
        if (this.buffs.damage) multiplier *= this.buffs.damage.multiplier;
        this.perks.forEach(perk => {
            if (perk.name === 'Damage Boost') multiplier *= 1.25;
        });
        return baseDamage * multiplier;
    }
    
    getModifiedSpeed() {
        let multiplier = 1;
        if (this.buffs.speed) multiplier *= this.buffs.speed.multiplier;
        this.perks.forEach(perk => {
            if (perk.name === 'Speed Boost') multiplier *= 1.2;
        });
        return this.speed * multiplier;
    }
    
    getModifiedHealthRegen() {
        let multiplier = 1;
        this.perks.forEach(perk => {
            if (perk.name === 'Health Regen') multiplier *= 1.5;
        });
        return this.healthRegenRate * multiplier;
    }
    
    render(ctx) {
        ctx.save();
        
        // Translate to player position
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw player body
        ctx.fillStyle = this.isDashing ? '#00ffff' : '#4a90e2';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.radius - 5, -2, 8, 4);
        
        // Draw weapon
        this.renderWeapon(ctx);
        
        ctx.restore();
        
        // Draw health bar above player
        this.renderHealthBar(ctx);
    }
    
    renderWeapon(ctx) {
        const weapon = this.currentWeapon;
        
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        switch (weapon.name) {
            case 'Pistol':
                ctx.moveTo(15, 0);
                ctx.lineTo(25, 0);
                break;
            case 'Shotgun':
                ctx.moveTo(15, -2);
                ctx.lineTo(30, -2);
                ctx.moveTo(15, 2);
                ctx.lineTo(30, 2);
                break;
            case 'Assault Rifle':
                ctx.moveTo(15, 0);
                ctx.lineTo(35, 0);
                ctx.moveTo(20, -3);
                ctx.lineTo(25, -3);
                break;
            case 'Sniper Rifle':
                ctx.moveTo(15, 0);
                ctx.lineTo(40, 0);
                ctx.arc(45, 0, 3, 0, Math.PI * 2);
                break;
            case 'Flamethrower':
                ctx.moveTo(15, -3);
                ctx.lineTo(30, -3);
                ctx.moveTo(15, 3);
                ctx.lineTo(30, 3);
                ctx.moveTo(30, -3);
                ctx.lineTo(30, 3);
                break;
        }
        
        ctx.stroke();
    }
    
    renderHealthBar(ctx) {
        const barWidth = 40;
        const barHeight = 6;
        const healthPercent = this.health / this.maxHealth;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 15, barWidth, barHeight);
        
        // Health fill
        ctx.fillStyle = healthPercent > 0.6 ? '#4CAF50' : healthPercent > 0.3 ? '#FFC107' : '#F44336';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 15, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth/2, this.y - this.radius - 15, barWidth, barHeight);
    }
    
    getAvailablePerks() {
        const allPerks = [
            { name: 'Health Boost', description: 'Increase maximum health by 25', effect: () => { this.maxHealth += 25; this.health += 25; }},
            { name: 'Speed Boost', description: 'Increase movement speed by 20%', effect: () => { this.speed *= 1.2; }},
            { name: 'Damage Boost', description: 'Increase weapon damage by 25%', effect: () => { this.weapons.forEach(w => w.damage *= 1.25); }},
            { name: 'Fire Rate', description: 'Increase fire rate by 15%', effect: () => { this.weapons.forEach(w => w.fireRate *= 0.85); }},
            { name: 'Stamina Boost', description: 'Increase maximum stamina by 30', effect: () => { this.maxStamina += 30; this.stamina += 30; }},
            { name: 'Health Regen', description: 'Faster health regeneration', effect: () => { this.healthRegenRate *= 1.5; }},
            { name: 'Unlock Shotgun', description: 'Unlock the shotgun weapon', effect: () => { this.weapons[1].unlocked = true; }},
            { name: 'Unlock Rifle', description: 'Unlock the assault rifle', effect: () => { this.weapons[2].unlocked = true; }}
        ];
        
        // Return 3 random perks
        const shuffled = allPerks.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }
    
    selectPerk(index) {
        if (this.availablePerks && this.availablePerks[index]) {
            this.availablePerks[index].effect();
            this.perks.push(this.availablePerks[index]);
            this.availablePerks = null;
        }
    }
    
    getXPForNextLevel() {
        return Math.floor(100 * Math.pow(1.2, this.level - 1));
    }
}
