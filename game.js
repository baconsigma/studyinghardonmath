// Game Configuration
const CONFIG = {
    canvasWidth: 800,
    canvasHeight: 600,
    roadWidth: 400,
    laneWidth: 80,
    playerSpeed: 5,
    initialTrafficSpeed: 3,
    maxTrafficSpeed: 12,
    speedIncreaseRate: 0.001,
    coinChance: 0.02,
    trafficChance: 0.03,
    obstacleChance: 0.015,
    powerUpChance: 0.008,
    coinValue: 10,
    distanceMultiplier: 1,
    speedBoostDuration: 3000,
    speedBoostMultiplier: 2
};

// Game State
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// Game Class
class EscapeRoadGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.speed = CONFIG.initialTrafficSpeed;
        this.isMuted = false;
        
        this.player = null;
        this.roadOffset = 0;
        this.lanes = [];
        this.traffic = [];
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        
        this.keys = {};
        this.touchStartX = 0;
        this.speedBoostActive = false;
        this.speedBoostEndTime = 0;
        
        this.highScore = this.loadHighScore();
        this.updateHighScoreDisplay();
        
        this.setupEventListeners();
        this.initializeGame();
    }
    
    setupCanvas() {
        const updateCanvasSize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            CONFIG.canvasWidth = this.canvas.width;
            CONFIG.canvasHeight = this.canvas.height;
        };
        
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if ((e.key === ' ' || e.key === 'Escape') && this.state === GAME_STATES.PLAYING) {
                this.pauseGame();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Touch controls
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (this.state !== GAME_STATES.PLAYING) return;
            
            const touchX = e.touches[0].clientX;
            const diff = touchX - this.touchStartX;
            
            if (Math.abs(diff) > 30) {
                if (diff > 0) {
                    this.keys['arrowright'] = true;
                    this.keys['arrowleft'] = false;
                } else {
                    this.keys['arrowleft'] = true;
                    this.keys['arrowright'] = false;
                }
                this.touchStartX = touchX;
            }
        });
        
        document.addEventListener('touchend', () => {
            this.keys['arrowleft'] = false;
            this.keys['arrowright'] = false;
        });
        
        // Mobile control buttons
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['arrowleft'] = true;
        });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['arrowleft'] = false;
        });
        
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['arrowright'] = true;
        });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['arrowright'] = false;
        });
        
        // UI Buttons
        document.getElementById('playButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('pauseMenuBtn').addEventListener('click', () => this.returnToMenu());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.returnToMenu());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
    }
    
    initializeGame() {
        // Initialize lanes (5 lanes)
        const numLanes = 5;
        const startX = (CONFIG.canvasWidth - CONFIG.roadWidth) / 2;
        
        for (let i = 0; i < numLanes; i++) {
            this.lanes.push(startX + i * CONFIG.laneWidth + CONFIG.laneWidth / 2);
        }
        
        // Initialize player in middle lane
        this.player = {
            x: this.lanes[2],
            y: CONFIG.canvasHeight - 150,
            width: 40,
            height: 70,
            lane: 2,
            targetLane: 2,
            color: '#ff6b6b'
        };
    }
    
    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.speed = CONFIG.initialTrafficSpeed;
        this.roadOffset = 0;
        this.traffic = [];
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        this.speedBoostActive = false;
        
        this.player.lane = 2;
        this.player.targetLane = 2;
        this.player.x = this.lanes[2];
        
        this.showScreen('gameScreen');
        this.updateHUD();
        this.gameLoop();
    }
    
    pauseGame() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
            document.getElementById('pauseScore').textContent = Math.floor(this.score);
            document.getElementById('pauseCoins').textContent = this.coins;
            this.showScreen('pauseScreen');
        }
    }
    
    resumeGame() {
        if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            this.hideScreen('pauseScreen');
            this.gameLoop();
        }
    }
    
    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            document.getElementById('newHighScore').style.display = 'block';
        } else {
            document.getElementById('newHighScore').style.display = 'none';
        }
        
        // Display final stats
        document.getElementById('finalScore').textContent = Math.floor(this.score);
        document.getElementById('finalCoins').textContent = this.coins;
        document.getElementById('finalDistance').textContent = Math.floor(this.distance) + 'm';
        document.getElementById('gameOverHighScore').textContent = Math.floor(this.highScore);
        
        this.showScreen('gameOverScreen');
    }
    
    returnToMenu() {
        this.state = GAME_STATES.MENU;
        this.hideScreen('pauseScreen');
        this.hideScreen('gameOverScreen');
        this.showScreen('mainMenu');
        this.updateHighScoreDisplay();
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    hideScreen(screenId) {
        document.getElementById(screenId).classList.remove('active');
    }
    
    updateHUD() {
        document.getElementById('scoreDisplay').textContent = Math.floor(this.score);
        document.getElementById('coinsDisplay').textContent = this.coins;
        document.getElementById('speedDisplay').textContent = Math.floor(this.speed * 10) + ' km/h';
    }
    
    updateHighScoreDisplay() {
        document.getElementById('menuHighScore').textContent = Math.floor(this.highScore);
    }
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('escapeRoadHighScore');
            return saved ? parseFloat(saved) : 0;
        } catch (e) {
            console.warn('Unable to load high score from localStorage:', e);
            return 0;
        }
    }
    
    saveHighScore() {
        try {
            localStorage.setItem('escapeRoadHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('Unable to save high score to localStorage:', e);
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen request failed:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('muteBtn');
        btn.textContent = this.isMuted ? '🔇 Sound' : '🔊 Sound';
    }
    
    // Game Loop
    gameLoop() {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update player movement
        this.updatePlayer();
        
        // Update speed
        this.speed += CONFIG.speedIncreaseRate;
        if (this.speed > CONFIG.maxTrafficSpeed) {
            this.speed = CONFIG.maxTrafficSpeed;
        }
        
        // Check speed boost expiration
        if (this.speedBoostActive && Date.now() > this.speedBoostEndTime) {
            this.speedBoostActive = false;
        }
        
        const currentSpeed = this.speedBoostActive ? 
            this.speed * CONFIG.speedBoostMultiplier : this.speed;
        
        // Update road
        this.roadOffset += currentSpeed;
        if (this.roadOffset > 40) {
            this.roadOffset = 0;
        }
        
        // Update distance and score
        this.distance += currentSpeed * 0.1;
        this.score += currentSpeed * CONFIG.distanceMultiplier * 0.1;
        
        // Spawn entities
        this.spawnEntities();
        
        // Update traffic
        this.updateTraffic();
        
        // Update obstacles
        this.updateObstacles();
        
        // Update collectibles
        this.updateCollectibles();
        
        // Update particles
        this.updateParticles();
        
        // Check collisions
        this.checkCollisions();
        
        // Update HUD
        this.updateHUD();
    }
    
    updatePlayer() {
        // Handle lane switching
        if ((this.keys['arrowleft'] || this.keys['a']) && this.player.targetLane > 0) {
            this.player.targetLane--;
            this.keys['arrowleft'] = false;
            this.keys['a'] = false;
        }
        
        if ((this.keys['arrowright'] || this.keys['d']) && this.player.targetLane < this.lanes.length - 1) {
            this.player.targetLane++;
            this.keys['arrowright'] = false;
            this.keys['d'] = false;
        }
        
        // Smooth lane transition
        const targetX = this.lanes[this.player.targetLane];
        if (Math.abs(this.player.x - targetX) > 2) {
            this.player.x += (targetX - this.player.x) * 0.2;
        } else {
            this.player.x = targetX;
            this.player.lane = this.player.targetLane;
        }
    }
    
    spawnEntities() {
        // Spawn traffic
        if (Math.random() < CONFIG.trafficChance) {
            const lane = Math.floor(Math.random() * this.lanes.length);
            this.traffic.push({
                x: this.lanes[lane],
                y: -100,
                width: 40,
                height: 70,
                lane: lane,
                color: this.getRandomColor(),
                isPolice: Math.random() < 0.2
            });
        }
        
        // Spawn obstacles
        if (Math.random() < CONFIG.obstacleChance) {
            const lane = Math.floor(Math.random() * this.lanes.length);
            this.obstacles.push({
                x: this.lanes[lane],
                y: -50,
                width: 50,
                height: 50,
                lane: lane,
                type: Math.floor(Math.random() * 3)
            });
        }
        
        // Spawn coins
        if (Math.random() < CONFIG.coinChance) {
            const lane = Math.floor(Math.random() * this.lanes.length);
            this.collectibles.push({
                x: this.lanes[lane],
                y: -30,
                width: 30,
                height: 30,
                lane: lane,
                type: 'coin',
                rotation: 0
            });
        }
        
        // Spawn power-ups
        if (Math.random() < CONFIG.powerUpChance) {
            const lane = Math.floor(Math.random() * this.lanes.length);
            this.collectibles.push({
                x: this.lanes[lane],
                y: -30,
                width: 40,
                height: 40,
                lane: lane,
                type: 'speedBoost',
                pulse: 0
            });
        }
    }
    
    updateTraffic() {
        const currentSpeed = this.speedBoostActive ? 
            this.speed * CONFIG.speedBoostMultiplier : this.speed;
        
        for (let i = this.traffic.length - 1; i >= 0; i--) {
            const car = this.traffic[i];
            car.y += currentSpeed + (car.isPolice ? 1 : 0);
            
            if (car.y > CONFIG.canvasHeight + 100) {
                this.traffic.splice(i, 1);
            }
        }
    }
    
    updateObstacles() {
        const currentSpeed = this.speedBoostActive ? 
            this.speed * CONFIG.speedBoostMultiplier : this.speed;
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += currentSpeed;
            
            if (obstacle.y > CONFIG.canvasHeight + 100) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    updateCollectibles() {
        const currentSpeed = this.speedBoostActive ? 
            this.speed * CONFIG.speedBoostMultiplier : this.speed;
        
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            item.y += currentSpeed;
            
            if (item.type === 'coin') {
                item.rotation += 0.1;
            } else if (item.type === 'speedBoost') {
                item.pulse += 0.1;
            }
            
            if (item.y > CONFIG.canvasHeight + 100) {
                this.collectibles.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha -= 0.02;
            
            if (p.life <= 0 || p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Reduce collision box by 15% for more forgiving gameplay
        const hitboxReduction = 0.15;
        const playerBox = {
            x: this.player.x - (this.player.width * (1 - hitboxReduction)) / 2,
            y: this.player.y - (this.player.height * (1 - hitboxReduction)) / 2,
            width: this.player.width * (1 - hitboxReduction),
            height: this.player.height * (1 - hitboxReduction)
        };
        
        // Check traffic collisions
        for (const car of this.traffic) {
            const carBox = {
                x: car.x - car.width / 2,
                y: car.y - car.height / 2,
                width: car.width,
                height: car.height
            };
            
            if (this.boxCollision(playerBox, carBox)) {
                this.createExplosion(this.player.x, this.player.y);
                this.gameOver();
                return;
            }
        }
        
        // Check obstacle collisions
        for (const obstacle of this.obstacles) {
            const obstacleBox = {
                x: obstacle.x - obstacle.width / 2,
                y: obstacle.y - obstacle.height / 2,
                width: obstacle.width,
                height: obstacle.height
            };
            
            if (this.boxCollision(playerBox, obstacleBox)) {
                this.createExplosion(this.player.x, this.player.y);
                this.gameOver();
                return;
            }
        }
        
        // Check collectible collisions
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            const itemBox = {
                x: item.x - item.width / 2,
                y: item.y - item.height / 2,
                width: item.width,
                height: item.height
            };
            
            if (this.boxCollision(playerBox, itemBox)) {
                if (item.type === 'coin') {
                    this.coins++;
                    this.score += CONFIG.coinValue;
                    this.createCoinEffect(item.x, item.y);
                } else if (item.type === 'speedBoost') {
                    this.speedBoostActive = true;
                    this.speedBoostEndTime = Date.now() + CONFIG.speedBoostDuration;
                    this.createBoostEffect(item.x, item.y);
                }
                this.collectibles.splice(i, 1);
            }
        }
    }
    
    boxCollision(box1, box2) {
        return box1.x < box2.x + box2.width &&
               box1.x + box1.width > box2.x &&
               box1.y < box2.y + box2.height &&
               box1.y + box1.height > box2.y;
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: '#ff6b6b',
                size: Math.random() * 5 + 2,
                life: 30,
                alpha: 1
            });
        }
    }
    
    createCoinEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: '#feca57',
                size: Math.random() * 3 + 1,
                life: 20,
                alpha: 1
            });
        }
    }
    
    createBoostEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: '#48dbfb',
                size: Math.random() * 4 + 2,
                life: 25,
                alpha: 1
            });
        }
    }
    
    getRandomColor() {
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#00d2d3'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Rendering
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.canvasHeight);
        gradient.addColorStop(0, '#0f3460');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
        
        // Draw buildings/scenery
        this.drawScenery();
        
        // Draw road
        this.drawRoad();
        
        // Draw entities
        this.drawObstacles();
        this.drawTraffic();
        this.drawCollectibles();
        this.drawPlayer();
        this.drawParticles();
        
        // Draw speed boost indicator
        if (this.speedBoostActive) {
            this.drawSpeedBoostIndicator();
        }
    }
    
    drawScenery() {
        const startX = (CONFIG.canvasWidth - CONFIG.roadWidth) / 2;
        
        // Left buildings
        for (let i = 0; i < 5; i++) {
            const y = (i * 150 - this.roadOffset * 2) % (CONFIG.canvasHeight + 150);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(50, y, 80, 120);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(55, y + 5, 70, 110);
        }
        
        // Right buildings
        for (let i = 0; i < 5; i++) {
            const y = (i * 150 - this.roadOffset * 2) % (CONFIG.canvasHeight + 150);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(CONFIG.canvasWidth - 130, y, 80, 120);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(CONFIG.canvasWidth - 125, y + 5, 70, 110);
        }
    }
    
    drawRoad() {
        const startX = (CONFIG.canvasWidth - CONFIG.roadWidth) / 2;
        
        // Road base
        this.ctx.fillStyle = '#2d3436';
        this.ctx.fillRect(startX, 0, CONFIG.roadWidth, CONFIG.canvasHeight);
        
        // Road edges
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(startX - 5, 0, 5, CONFIG.canvasHeight);
        this.ctx.fillRect(startX + CONFIG.roadWidth, 0, 5, CONFIG.canvasHeight);
        
        // Lane markers
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 20]);
        
        for (let i = 1; i < this.lanes.length; i++) {
            const x = startX + i * CONFIG.laneWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, -this.roadOffset);
            this.ctx.lineTo(x, CONFIG.canvasHeight);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawPlayer() {
        this.ctx.save();
        
        // Car body
        this.ctx.fillStyle = this.speedBoostActive ? '#48dbfb' : this.player.color;
        this.ctx.fillRect(
            this.player.x - this.player.width / 2,
            this.player.y - this.player.height / 2,
            this.player.width,
            this.player.height
        );
        
        // Car details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(
            this.player.x - this.player.width / 2 + 5,
            this.player.y - this.player.height / 2 + 10,
            this.player.width - 10,
            20
        );
        
        // Wheels
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(
            this.player.x - this.player.width / 2 - 5,
            this.player.y - this.player.height / 2 + 5,
            5,
            15
        );
        this.ctx.fillRect(
            this.player.x + this.player.width / 2,
            this.player.y - this.player.height / 2 + 5,
            5,
            15
        );
        this.ctx.fillRect(
            this.player.x - this.player.width / 2 - 5,
            this.player.y + this.player.height / 2 - 20,
            5,
            15
        );
        this.ctx.fillRect(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2 - 20,
            5,
            15
        );
        
        this.ctx.restore();
    }
    
    drawTraffic() {
        for (const car of this.traffic) {
            this.ctx.save();
            
            // Car body
            this.ctx.fillStyle = car.isPolice ? '#ee5a6f' : car.color;
            this.ctx.fillRect(
                car.x - car.width / 2,
                car.y - car.height / 2,
                car.width,
                car.height
            );
            
            // Car details
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.fillRect(
                car.x - car.width / 2 + 5,
                car.y + car.height / 2 - 30,
                car.width - 10,
                20
            );
            
            // Police indicator
            if (car.isPolice) {
                this.ctx.fillStyle = '#48dbfb';
                this.ctx.fillRect(
                    car.x - 10,
                    car.y - car.height / 2,
                    20,
                    5
                );
            }
            
            this.ctx.restore();
        }
    }
    
    drawObstacles() {
        for (const obstacle of this.obstacles) {
            this.ctx.save();
            
            if (obstacle.type === 0) {
                // Cone
                this.ctx.fillStyle = '#ff6b6b';
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x, obstacle.y - obstacle.height / 2);
                this.ctx.lineTo(obstacle.x - obstacle.width / 2, obstacle.y + obstacle.height / 2);
                this.ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(obstacle.x - 15, obstacle.y, 30, 8);
            } else if (obstacle.type === 1) {
                // Barrier
                this.ctx.fillStyle = '#feca57';
                this.ctx.fillRect(
                    obstacle.x - obstacle.width / 2,
                    obstacle.y - obstacle.height / 2,
                    obstacle.width,
                    obstacle.height
                );
                
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(
                    obstacle.x - obstacle.width / 2,
                    obstacle.y - obstacle.height / 2,
                    obstacle.width,
                    obstacle.height
                );
            } else {
                // Roadblock
                this.ctx.fillStyle = '#ee5a6f';
                this.ctx.fillRect(
                    obstacle.x - obstacle.width / 2,
                    obstacle.y - obstacle.height / 2,
                    obstacle.width,
                    obstacle.height
                );
                
                this.ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 3; i++) {
                    this.ctx.fillRect(
                        obstacle.x - obstacle.width / 2 + i * 17,
                        obstacle.y - obstacle.height / 2 + 10,
                        12,
                        30
                    );
                }
            }
            
            this.ctx.restore();
        }
    }
    
    drawCollectibles() {
        for (const item of this.collectibles) {
            this.ctx.save();
            
            if (item.type === 'coin') {
                // Coin
                this.ctx.translate(item.x, item.y);
                this.ctx.rotate(item.rotation);
                
                const scale = Math.abs(Math.cos(item.rotation));
                this.ctx.fillStyle = '#feca57';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, item.width / 2 * scale, item.height / 2, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#f39c12';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, item.width / 3 * scale, item.height / 3, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#feca57';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('$', 0, 0);
            } else if (item.type === 'speedBoost') {
                // Speed boost power-up
                const pulseFactor = 1 + Math.sin(item.pulse) * 0.2;
                
                this.ctx.fillStyle = '#48dbfb';
                this.ctx.beginPath();
                this.ctx.arc(item.x, item.y, (item.width / 2) * pulseFactor, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('⚡', item.x, item.y);
            }
            
            this.ctx.restore();
        }
    }
    
    drawParticles() {
        for (const p of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawSpeedBoostIndicator() {
        const timeLeft = this.speedBoostEndTime - Date.now();
        const progress = timeLeft / CONFIG.speedBoostDuration;
        
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(72, 219, 251, 0.3)';
        this.ctx.fillRect(0, 0, CONFIG.canvasWidth * progress, 5);
        
        this.ctx.fillStyle = '#48dbfb';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⚡ SPEED BOOST! ⚡', CONFIG.canvasWidth / 2, 40);
        this.ctx.restore();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new EscapeRoadGame();
});
