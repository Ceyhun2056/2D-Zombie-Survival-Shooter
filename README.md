# 2D Zombie Survival Shooter

A complete 2D zombie survival shooter game built with HTML5 Canvas, CSS, and JavaScript. Fight waves of zombies, manage your ammo, and survive as long as possible!

## 🎮 Play Now

Simply open `index.html` in your web browser to start playing immediately!

## Features

- **Smooth player movement** with WASD keys
- **Mouse-aimed shooting** with left-click
- **Reload system** with R key
- **Wave-based zombie spawning** with increasing difficulty
- **Health and ammo management**
- **Score tracking** (10 points per zombie kill)
- **Progressive difficulty** - zombies get faster and stronger every 5 waves
- **Game over and restart functionality**
- **Real-time UI** showing health, ammo, score, and wave number
- **Visual feedback** with health bars and hit effects

## Controls

- **W, A, S, D** - Move player
- **Mouse** - Aim
- **Left Click** - Shoot
- **R** - Reload
- **Enter** - Restart game (on Game Over screen)

## Game Mechanics

### Player
- Starts with 100 health (blue circle)
- Pistol with 12 rounds per clip
- Takes damage when touched by zombies
- Dies when health reaches 0
- Health bar displayed above player

### Zombies
- Spawn randomly at screen edges (red squares)
- Move toward player using vector math
- Deal 20 damage per second when touching player
- Health and speed increase with each wave
- Drop 10 points when killed
- Health bars displayed above each zombie

### Waves
- Start with 5 zombies per wave
- Each wave adds 2 more zombies
- Every 5 waves: zombie speed +10, health +25, spawn rate increases
- Infinite waves for endless gameplay

## How to Play

### Option 1: Direct Browser Access
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start playing immediately!

### Option 2: Local Server (Optional)
For better performance, you can serve the files through a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Technical Details

- **Framework**: Pure HTML5 Canvas, CSS3, and ES6+ JavaScript
- **Framerate**: 60 FPS with requestAnimationFrame
- **Resolution**: 1280x720 canvas
- **Physics**: Delta time-based movement for smooth gameplay
- **Collision**: AABB (bounding box) collision detection
- **Architecture**: Object-oriented design with clean class structure
- **Cross-platform**: Works on any device with a modern web browser

## Project Structure

```
2D-Zombie-Survival-Shooter/
├── index.html            # Main HTML file
├── style.css             # Game styling and UI
├── script.js             # Game logic and classes
├── README.md             # This file
├── LICENSE               # License information
└── .gitignore            # Git ignore file
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Gameplay Tips

1. **Keep moving!** Standing still makes you an easy target
2. **Manage your ammo carefully** - reload when safe
3. **Use screen edges** to funnel zombies into narrow paths
4. **Early waves are easier** - use them to practice aiming
5. **Health doesn't regenerate** - avoid damage at all costs
6. **Watch for color changes** in UI elements indicating danger

## Class Overview

### Game
- Main game loop and state management
- Handles events, updates, and rendering
- Manages wave progression and difficulty scaling

### Player
- Movement with WASD keys
- Shooting mechanics with mouse aiming
- Health and ammo management
- Reload system with timing

### Zombie
- AI movement toward player using vector math
- Health system with visual damage feedback
- Collision detection with player

### Bullet
- Physics-based movement
- Collision detection with zombies
- Automatic cleanup when out of bounds

### Vector2
- Utility class for 2D vector mathematics
- Handles position, velocity, and direction calculations

## Future Enhancements

Potential features for expansion:
- Multiple weapon types
- Power-ups and health packs
- Sound effects and music
- Particle effects for explosions
- Leaderboard system with local storage
- Different zombie types with unique behaviors
- Mobile touch controls
- Fullscreen mode

## License

This project is open source. See LICENSE file for details.

## Contributing

Feel free to fork this project and submit pull requests with improvements!