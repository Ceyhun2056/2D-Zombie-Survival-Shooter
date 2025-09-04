// User Interface and HUD Management Module
export class UIManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.elements = {
            healthBar: document.getElementById('healthFill'),
            staminaBar: document.getElementById('staminaFill'),
            xpBar: document.getElementById('xpFill'),
            scoreValue: document.getElementById('scoreText'),
            levelValue: document.getElementById('playerLevel'),
            waveValue: document.getElementById('waveText'),
            weaponName: document.getElementById('weaponName'),
            ammoCount: document.getElementById('ammoText'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            finalScore: document.getElementById('finalScore'),
            pauseScreen: document.getElementById('pauseScreen'),
            levelUpScreen: document.getElementById('levelUpScreen'),
            levelUpLevel: document.getElementById('levelUpLevel'),
            perk1: document.getElementById('perk1'),
            perk2: document.getElementById('perk2'),
            perk3: document.getElementById('perk3'),
            notificationContainer: document.getElementById('notifications')
        };
        
        this.weaponColors = {
            pistol: '#888',
            shotgun: '#8B4513',
            rifle: '#4169E1',
            minigun: '#DC143C',
            flamethrower: '#FF4500'
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Level Up Screen perk selection
        if (this.elements.perk1) {
            this.elements.perk1.addEventListener('click', () => this.selectPerk(0));
        }
        if (this.elements.perk2) {
            this.elements.perk2.addEventListener('click', () => this.selectPerk(1));
        }
        if (this.elements.perk3) {
            this.elements.perk3.addEventListener('click', () => this.selectPerk(2));
        }
    }
    
    updateHealthBar(health, maxHealth) {
        const percentage = (health / maxHealth) * 100;
        this.elements.healthBar.style.width = `${percentage}%`;
        
        // Change color based on health
        if (percentage > 60) {
            this.elements.healthBar.style.backgroundColor = '#4CAF50';
        } else if (percentage > 30) {
            this.elements.healthBar.style.backgroundColor = '#FF9800';
        } else {
            this.elements.healthBar.style.backgroundColor = '#F44336';
        }
    }
    
    updateStaminaBar(stamina, maxStamina) {
        const percentage = (stamina / maxStamina) * 100;
        this.elements.staminaBar.style.width = `${percentage}%`;
    }
    
    updateXPBar(xp, maxXP) {
        const percentage = (xp / maxXP) * 100;
        this.elements.xpBar.style.width = `${percentage}%`;
    }
    
    updateScore(score) {
        this.elements.scoreValue.textContent = score.toLocaleString();
    }
    
    updateLevel(level) {
        this.elements.levelValue.textContent = level;
    }
    
    updateWave(wave) {
        this.elements.waveValue.textContent = wave;
    }
    
    updateWeapon(weaponName, ammo) {
        if (!weaponName) {
            weaponName = 'Unknown';
        }
        
        this.elements.weaponName.textContent = weaponName.toUpperCase();
        this.elements.weaponName.style.color = this.weaponColors[weaponName.toLowerCase()] || '#fff';
        
        if (ammo !== undefined) {
            this.elements.ammoCount.textContent = ammo === Infinity ? '∞' : ammo;
        } else {
            this.elements.ammoCount.textContent = '?';
        }
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration,
            timeLeft: duration
        };
        
        this.notifications.push(notification);
        
        // Remove old notifications if too many
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.shift();
        }
        
        this.renderNotifications();
        
        // Auto-remove notification
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
    }
    
    removeNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            this.renderNotifications();
        }
    }
    
    renderNotifications() {
        this.elements.notificationContainer.innerHTML = '';
        
        this.notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = `notification notification-${notification.type}`;
            notificationElement.textContent = notification.message;
            this.elements.notificationContainer.appendChild(notificationElement);
        });
    }
    
    showGameOverScreen(score, wave, level) {
        this.elements.finalScore.textContent = score.toLocaleString();
        this.elements.gameOverScreen.style.display = 'flex';
        
        // Save high score
        const highScore = localStorage.getItem('zombieShooterHighScore') || 0;
        if (score > highScore) {
            localStorage.setItem('zombieShooterHighScore', score);
            this.showNotification('NEW HIGH SCORE!', 'success', 5000);
        }
    }
    
    hideGameOverScreen() {
        this.elements.gameOverScreen.style.display = 'none';
    }
    
    showPauseScreen() {
        this.elements.pauseScreen.style.display = 'flex';
    }
    
    hidePauseScreen() {
        this.elements.pauseScreen.style.display = 'none';
    }
    
    showLevelUpScreen(level, perks) {
        this.elements.levelUpLevel.textContent = level;
        
        // Set perk options
        this.elements.perk1.querySelector('h3').textContent = perks[0].name;
        this.elements.perk1.querySelector('p').textContent = perks[0].description;
        this.elements.perk1.title = perks[0].description;
        
        this.elements.perk2.querySelector('h3').textContent = perks[1].name;
        this.elements.perk2.querySelector('p').textContent = perks[1].description;
        this.elements.perk2.title = perks[1].description;
        
        this.elements.perk3.querySelector('h3').textContent = perks[2].name;
        this.elements.perk3.querySelector('p').textContent = perks[2].description;
        this.elements.perk3.title = perks[2].description;
        
        this.elements.levelUpScreen.style.display = 'flex';
    }
    
    hideLevelUpScreen() {
        this.elements.levelUpScreen.style.display = 'none';
    }
    
    selectPerk(index) {
        this.hideLevelUpScreen();
        window.game.selectPerk(index);
    }
    
    updatePlayerStats(player) {
        // Comprehensive safety check for player object
        if (!player) {
            console.error('Player object is null or undefined');
            return;
        }
        
        // Check if all required properties exist
        if (typeof player.health === 'undefined' || typeof player.maxHealth === 'undefined') {
            console.error('Player health properties are undefined');
            return;
        }
        
        this.updateHealthBar(player.health, player.maxHealth);
        this.updateStaminaBar(player.stamina, player.maxStamina);
        this.updateXPBar(player.xp, player.getXPForNextLevel());
        this.updateLevel(player.level);
        
        // Safety check for currentWeapon with debugging
        if (player.currentWeapon && player.currentWeapon.name && typeof player.currentWeapon.ammo !== 'undefined') {
            this.updateWeapon(player.currentWeapon.name, player.currentWeapon.ammo);
        } else {
            console.error('Player currentWeapon is invalid:', {
                player: !!player,
                currentWeapon: player.currentWeapon,
                currentWeaponIndex: player.currentWeaponIndex,
                weaponsLength: player.weapons ? player.weapons.length : 'weapons is undefined',
                firstWeapon: player.weapons && player.weapons[0] ? player.weapons[0] : 'no first weapon'
            });
            // Fallback update
            this.updateWeapon('Unknown', 0);
        }
    }
    
    showDamageNumber(x, y, damage, color = '#ff0000') {
        // Create floating damage number
        const damageElement = document.createElement('div');
        damageElement.className = 'damage-number';
        damageElement.textContent = `-${Math.round(damage)}`;
        damageElement.style.left = `${x}px`;
        damageElement.style.top = `${y}px`;
        damageElement.style.color = color;
        damageElement.style.position = 'absolute';
        damageElement.style.fontSize = '16px';
        damageElement.style.fontWeight = 'bold';
        damageElement.style.pointerEvents = 'none';
        damageElement.style.zIndex = '1000';
        damageElement.style.animation = 'floatUp 1s ease-out forwards';
        
        document.body.appendChild(damageElement);
        
        // Remove after animation
        setTimeout(() => {
            if (damageElement.parentNode) {
                damageElement.parentNode.removeChild(damageElement);
            }
        }, 1000);
    }
    
    showXPGain(x, y, xp) {
        this.showDamageNumber(x, y, xp, '#00ff00');
    }
    
    reset() {
        this.notifications = [];
        this.renderNotifications();
        this.hideGameOverScreen();
        this.hidePauseScreen();
        this.hideLevelUpScreen();
    }
}
