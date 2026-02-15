# 🏎️ Escape Road - Unblocked Game

An exciting 3D endless driving game where you navigate through traffic, avoid obstacles, and escape as far as you can! Built with pure HTML5, CSS3, and vanilla JavaScript.

## 🎮 Game Description

Escape Road is a thrilling endless driving game where you control a vehicle trying to escape through a busy highway filled with traffic, obstacles, and police cars. Collect coins along the way, grab speed boosts, and see how far you can go!

### Features

- **Endless Gameplay**: Procedurally generated road with increasing difficulty
- **3D Perspective**: Pseudo-3D road view with animated scenery
- **Traffic System**: Dynamic traffic cars with police vehicles
- **Obstacles**: Various roadblocks including cones, barriers, and roadblocks
- **Collectibles**: Coins and speed boost power-ups
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Touch Controls**: Mobile-optimized touch controls for easy gameplay
- **Local High Score**: Saves your best score using localStorage
- **Visual Effects**: Particle effects for collisions and collectibles
- **Smooth Animations**: 60 FPS gameplay with smooth transitions

## 🎯 How to Play

### Objective
Drive as far as possible while avoiding traffic and obstacles. Collect coins to increase your score and grab speed boosts for extra points!

### Controls

#### Desktop
- **Arrow Keys** or **WASD**: Move left/right between lanes
- **SPACE** or **ESC**: Pause the game

#### Mobile/Touch
- **Tap Left/Right Buttons**: Move between lanes
- **Swipe Left/Right**: Quick lane changes
- **Pause Button**: Tap to pause

### Game Tips

1. 🪙 **Collect Coins**: Each coin adds 10 points to your score
2. ⚡ **Speed Boosts**: Grab the blue lightning power-ups for temporary speed increase and bonus points
3. 🚗 **Avoid Traffic**: Watch out for regular cars and stay clear
4. 🚓 **Police Cars**: Red cars with blue lights are faster and more dangerous
5. 🚧 **Dodge Obstacles**: Cones, barriers, and roadblocks will end your run
6. 📈 **Progressive Difficulty**: The game gets faster as you progress
7. 🏆 **Beat Your High Score**: Try to beat your personal best!

## 🚀 How to Run

### Option 1: Open Locally
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. No build process required!

### Option 2: Deploy to GitHub Pages
1. Fork this repository
2. Go to repository Settings → Pages
3. Select your branch (usually `main` or `master`)
4. Click Save
5. Your game will be available at: `https://yourusername.github.io/repositoryname`

### Option 3: Deploy to Netlify/Vercel
1. Drag and drop the entire folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository to [Vercel](https://vercel.com)
3. Automatic deployment with every push!

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Structure and Canvas element for rendering
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: Pure ES6+ JavaScript, no frameworks required
- **HTML5 Canvas API**: 2D rendering for game graphics
- **LocalStorage API**: Persistent high score storage

### File Structure
```
/
├── index.html          # Main HTML file with game UI
├── style.css           # Complete styling and responsive design
├── game.js             # Game engine and logic
├── assets/             # Assets folder (for future expansion)
│   ├── images/         # Image assets
│   └── sounds/         # Sound effects (optional)
└── README.md           # This file
```

### Browser Compatibility
- Chrome/Edge (recommended): Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Optimized for touch

### Performance
- Target: 60 FPS on modern devices
- Optimized rendering with requestAnimationFrame
- Efficient collision detection
- Minimal DOM manipulation

## 🎨 Customization

### Modify Game Difficulty
Edit the `CONFIG` object in `game.js`:

```javascript
const CONFIG = {
    initialTrafficSpeed: 3,      // Starting speed
    maxTrafficSpeed: 12,         // Maximum speed
    speedIncreaseRate: 0.001,    // How fast difficulty increases
    trafficChance: 0.03,         // Frequency of traffic spawning
    obstacleChance: 0.015,       // Frequency of obstacles
    coinChance: 0.02,            // Frequency of coins
    // ... more settings
};
```

### Change Colors
Modify the CSS variables and color values in `style.css`:
- Main gradient: `.game-logo h1` background
- Road colors: `.drawRoad()` function in game.js
- Vehicle colors: Player and traffic color arrays

### Add New Features
The code is modular and easy to extend:
- Add new obstacle types in `drawObstacles()`
- Create new power-ups in `spawnEntities()`
- Implement sound effects (currently optional)
- Add weather effects or day/night cycles

## 📱 Mobile Optimization

- Touch controls automatically enabled on mobile devices
- Responsive layout adapts to screen size
- Optimized button sizes for touch interaction
- Landscape and portrait mode support
- Disabled scrolling and zooming for better gameplay

## 🏆 Features Implemented

✅ Complete homepage with game information  
✅ Full game implementation with 3D perspective  
✅ Keyboard and touch controls  
✅ Player vehicle with smooth lane switching  
✅ Traffic cars with police vehicles  
✅ Multiple obstacle types  
✅ Coin collection system  
✅ Speed boost power-ups  
✅ Collision detection  
✅ Score and distance tracking  
✅ Progressive difficulty  
✅ Particle effects  
✅ Pause functionality  
✅ Game over screen  
✅ High score system with localStorage  
✅ Responsive design for all devices  
✅ Mobile touch controls  
✅ Fullscreen mode  
✅ Mute toggle (ready for sound)  
✅ Animated UI and transitions  

## 🎵 Sound Effects (Optional)

The game includes a mute/unmute button for future sound implementation. To add sounds:

1. Add audio files to `assets/sounds/`
2. Create Audio objects in `game.js`:
```javascript
const sounds = {
    engine: new Audio('assets/sounds/engine.mp3'),
    coin: new Audio('assets/sounds/coin.mp3'),
    crash: new Audio('assets/sounds/crash.mp3')
};
```
3. Play sounds at appropriate events

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- Additional vehicle skins
- New obstacle types
- Weather effects (rain, snow)
- Day/night cycle
- Multiplayer leaderboard
- Achievement system
- Different game modes

## 📄 License

This project is open source and available for educational purposes. Feel free to use, modify, and distribute as needed.

## 🎮 Play Now!

Just open `index.html` in your browser and start playing! No installation or build process required.

---

**Enjoy the game and try to beat your high score! 🏁**