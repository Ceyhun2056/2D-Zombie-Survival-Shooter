// Main Game Module
import { Player } from './player.js';
import { ZombieManager } from './zombie.js';
import { BulletManager } from './bullet.js';
import { UIManager } from './ui.js';
import { PowerUpManager } from './powerup.js';
import { ParticleSystem } from './particles.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to full screen
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Game state
        this.gameState = 'playing'; // 'playing', 'paused', 'gameOver', 'levelUp'
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, pressed: false };
        
        // Game stats
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.waveProgress = 0;
        this.waveZombiesKilled = 0;
        this.waveZombiesTotal = 10;
        
        // Managers
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.zombieManager = new ZombieManager(this.canvas);
        this.bulletManager = new BulletManager();
        this.uiManager = new UIManager();
        this.powerUpManager = new PowerUpManager();
        this.particleSystem = new ParticleSystem();
        
        // Performance optimization
        this.maxZombies = 50;
        this.frameCount = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
        
        // Start background music
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic) {
            bgMusic.volume = 0.3;
            bgMusic.play().catch(() => {
                console.log('Audio autoplay prevented');
            });
        }
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const aspectRatio = 16 / 9;
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }
        
        this.canvas.width = Math.min(width, 1600);
        this.canvas.height = Math.min(height, 900);
        
        // Update player position if canvas size changed
        if (this.player) {
            this.player.x = this.canvas.width / 2;
            this.player.y = this.canvas.height / 2;
        }
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                this.mouse.pressed = true;
                this.handleShoot();
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouse.pressed = false;
            }
        });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // UI Event listeners
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('pauseRestartBtn').addEventListener('click', () => this.restart());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resume());
    }
    
    handleKeyPress(e) {
        switch (e.code) {
            case 'KeyP':
                this.togglePause();
                break;
            case 'KeyR':
                if (this.gameState === 'playing') {
                    this.player.reload();
                }
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
                if (this.gameState === 'playing') {
                    const weaponIndex = parseInt(e.code.slice(-1)) - 1;
                    this.player.switchWeapon(weaponIndex);
                }
                break;
            case 'Escape':
                if (this.gameState === 'playing') {
                    this.pause();
                }
                break;
        }
    }
    
    handleShoot() {
        if (this.gameState === 'playing') {
            const bullets = this.player.shoot(this.mouse.x, this.mouse.y);
            if (bullets) {
                this.bulletManager.addBullet(bullets);
                
                // Play shoot sound
                const shootSound = document.getElementById('shootSound');
                if (shootSound) {
                    shootSound.currentTime = 0;
                    shootSound.volume = 0.2;
                    shootSound.play().catch(() => {});
                }
                
                // Add muzzle flash and shell ejection
                this.particleSystem.createMuzzleFlash(
                    this.player.x, 
                    this.player.y, 
                    this.player.rotation, 
                    this.player.currentWeapon
                );
                this.particleSystem.createShellEjection(
                    this.player.x, 
                    this.player.y, 
                    this.player.rotation
                );
            }
        }
    }
    
    gameLoop(currentTime = 0) {
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1/30); // Cap at 30 FPS
        this.lastTime = currentTime;
        this.frameCount++;
        
        if (this.gameState === 'playing') {
            this.update();
        }
        
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Update player
        this.player.update(this.deltaTime, this.keys, this.mouse);
        
        // Check for dash effect
        if (this.player.isDashing) {
            this.particleSystem.createDashEffect(
                this.player.x, 
                this.player.y, 
                this.player.rotation
            );
        }
        
        // Update managers
        this.zombieManager.update(this.deltaTime, this.player, this.wave);
        this.bulletManager.update(this.deltaTime, this.canvas);
        this.powerUpManager.update(this.deltaTime);
        this.particleSystem.update(this.deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update wave progression
        this.updateWaveProgression();
        
        // Update UI
        this.uiManager.updatePlayerStats(this.player);
        this.uiManager.updateScore(this.score);
        this.uiManager.updateWave(this.wave);
        
        // Check for level up
        if (this.player.levelUpPending) {
            this.showLevelUpScreen();
            this.player.levelUpPending = false;
        }
        
        // Check game over
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }
    
    checkCollisions() {
        const zombies = this.zombieManager.zombies;
        const bullets = this.bulletManager.bullets;
        
        // Bullet vs Zombie collisions
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.active) continue;
            
            for (let j = zombies.length - 1; j >= 0; j--) {
                const zombie = zombies[j];
                if (!zombie.alive) continue;
                
                const dx = bullet.x - zombie.x;
                const dy = bullet.y - zombie.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < bullet.radius + zombie.radius) {
                    // Check for critical hit (headshot)
                    const isCritical = distance < zombie.radius * 0.3;
                    const damage = isCritical ? bullet.damage * 2 : bullet.damage;
                    
                    zombie.takeDamage(damage);
                    bullet.active = false;
                    
                    // Add hit particles
                    this.particleSystem.createBloodSplatter(zombie.x, zombie.y, isCritical ? 2 : 1);
                    this.particleSystem.createBulletImpact(bullet.x, bullet.y, bullet.type);
                    
                    // Check if zombie died
                    if (!zombie.alive) {
                        this.onZombieKilled(zombie, isCritical);
                    }
                    
                    break;
                }
            }
        }
        
        // Enemy bullet vs Player collisions
        this.bulletManager.checkPlayerCollisions(this.player);
        
        // Zombie vs Player collisions
        for (const zombie of zombies) {
            if (!zombie.alive) continue;
            
            const dx = this.player.x - zombie.x;
            const dy = this.player.y - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.radius + zombie.radius) {
                this.player.takeDamage(zombie.damage * this.deltaTime);
                
                // Add blood effect
                this.particleSystem.createBloodSplatter(this.player.x, this.player.y, 0.5);
            }
        }
        
        // Player vs PowerUp collisions
        const collectedPowerUps = this.powerUpManager.checkCollisions(this.player);
        for (const powerUp of collectedPowerUps) {
            this.uiManager.showNotification(`${powerUp.type.toUpperCase()} collected!`, 'success');
            
            // Add healing effect for health power-ups
            if (powerUp.type === 'health') {
                this.particleSystem.createHealingEffect(this.player.x, this.player.y);
            }
        }
    }
    
    onZombieKilled(zombie, isCritical) {
        const baseScore = zombie.scoreValue;
        const scoreGained = isCritical ? baseScore * 2 : baseScore;
        
        this.score += scoreGained;
        this.kills++;
        this.waveZombiesKilled++;
        
        // Give XP
        this.player.gainXP(zombie.xpValue);
        
        // Chance to drop power-up
        this.powerUpManager.trySpawnPowerUp(zombie.x, zombie.y);
        
        // Add death particles
        this.particleSystem.createExplosion(zombie.x, zombie.y, 0.5);
        
        // Show critical hit notification
        if (isCritical) {
            this.uiManager.showNotification('CRITICAL HIT!', 'success');
        }
        
        // Show XP gain
        this.uiManager.showXPGain(zombie.x, zombie.y, zombie.xpValue);
        
        // Show score gain
        this.uiManager.showDamageNumber(zombie.x, zombie.y - 20, scoreGained, '#ffff00');
    }
    
    updateWaveProgression() {
        // Check if wave is complete
        if (this.waveZombiesKilled >= this.waveZombiesTotal && this.zombieManager.zombies.length === 0) {
            this.nextWave();
        }
    }
    
    nextWave() {
        this.wave++;
        this.waveZombiesKilled = 0;
        this.waveZombiesTotal = Math.floor(10 + this.wave * 2.5);
        
        // Increase difficulty
        this.zombieManager.increaseDifficulty();
        this.powerUpManager.adjustSpawnRate(this.wave);
        
        // Show wave notification
        this.uiManager.showNotification(`Wave ${this.wave} incoming!`, 'info');
        
        // Every 5 waves, spawn boss
        if (this.wave % 5 === 0) {
            this.zombieManager.spawnBoss();
            this.uiManager.showNotification('BOSS WAVE!', 'warning');
        }
    }
    
    showLevelUpScreen() {
        this.gameState = 'levelUp';
        const perks = this.player.getAvailablePerks();
        this.uiManager.showLevelUpScreen(this.player.level, perks);
    }
    
    selectPerk(index) {
        this.player.selectPerk(index);
        this.gameState = 'playing';
        this.uiManager.hideLevelUpScreen();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.pause();
        } else if (this.gameState === 'paused') {
            this.resume();
        }
    }
    
    pause() {
        this.gameState = 'paused';
        document.getElementById('pauseScreen').classList.remove('hidden');
    }
    
    resume() {
        this.gameState = 'playing';
        document.getElementById('pauseScreen').classList.add('hidden');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update final stats
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalWave').textContent = this.wave;
        document.getElementById('finalKills').textContent = this.kills;
        document.getElementById('finalLevel').textContent = this.player.level;
        
        // Save high score
        const highScore = localStorage.getItem('zombieShooterHighScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('zombieShooterHighScore', this.score);
            this.uiManager.showNotification('NEW HIGH SCORE!', '#ffaa00');
        }
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    restart() {
        // Reset all game state
        this.gameState = 'playing';
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.waveZombiesKilled = 0;
        this.waveZombiesTotal = 10;
        
        // Reset player
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        
        // Reset managers
        this.zombieManager.reset();
        this.bulletManager.reset();
        this.powerUpManager.reset();
        this.particleSystem.clear();
        
        // Hide screens
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('levelUpScreen').classList.add('hidden');
    }
    
    quit() {
        // For web version, just restart
        this.restart();
    }
    
    render() {
        // Clear canvas with dark background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render game objects
        this.powerUpManager.render(this.ctx);
        this.player.render(this.ctx);
        this.zombieManager.render(this.ctx);
        this.bulletManager.render(this.ctx);
        this.particleSystem.render(this.ctx);
        
        // Render debug info (optional)
        if (this.frameCount % 60 === 0) {
            this.renderDebugInfo();
        }
    }
    
    renderDebugInfo() {
        // Optional: Display FPS and other debug info
        const fps = Math.round(1 / this.deltaTime);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`FPS: ${fps}`, 10, this.canvas.height - 30);
        this.ctx.fillText(`Zombies: ${this.zombieManager.zombies.length}`, 10, this.canvas.height - 15);
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
