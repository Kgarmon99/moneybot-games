const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const uiStart = document.getElementById('start-screen');
const uiGameOver = document.getElementById('game-over-screen');
const uiHud = document.getElementById('hud');
const scoreEl = document.getElementById('score-value');
const finalScoreEl = document.getElementById('final-score');

// Game State
let width, height;
let isPlaying = false;
let score = 0;
let highestY = 0;

// Physics & Tuning
const GRAVITY = 0.4;
const JUMP_VELOCITY = -11;
const SPRING_VELOCITY = -20;
const PLATFORM_WIDTH = 65;
const PLATFORM_HEIGHT = 15;

// Entities
let player = {
    x: 0, y: 0, 
    vx: 0, vy: 0, 
    radius: 20,
    targetX: 0
};
let platforms = [];
let particles = [];
let cameraY = 0;

// Mascot image
const mascotImg = new Image();
mascotImg.src = 'assets/mascot/operator.png';

// Colors (MoneyBot Palette)
const COLORS = {
    bg: '#07111F',
    solid: '#00E676',       // Normal Asset
    crumble: '#FB7185',     // Debt Trap (breaks)
    moving: '#38BDF8',      // Volatile Asset
    spring: '#FBBF24',      // Compound Interest
    player: '#F8FAFC'
};

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

function formatMoney(amount) {
    return '$' + Math.floor(amount).toLocaleString();
}

function initGame() {
    player.x = width / 2;
    player.y = height - 150;
    player.targetX = width / 2;
    player.vy = 0;
    
    cameraY = 0;
    highestY = player.y;
    score = 0;
    platforms = [];
    particles = [];

    // Base platform
    platforms.push({ x: width/2 - PLATFORM_WIDTH/2, y: height - 50, type: 'solid' });

    // Generate initial platforms
    let currentY = height - 150;
    while(currentY > -height) {
        spawnPlatform(currentY);
        currentY -= Math.random() * 80 + 40;
    }

    uiStart.classList.add('hidden');
    uiGameOver.classList.add('hidden');
    uiHud.classList.remove('hidden');
    isPlaying = true;
    requestAnimationFrame(loop);
}

function spawnPlatform(yPos) {
    let xPos = Math.random() * (width - PLATFORM_WIDTH);
    let type = 'solid';
    
    let r = Math.random();
    if(score > 5000 && r < 0.15) type = 'crumble';
    else if(score > 2000 && r < 0.3) type = 'moving';
    
    let hasSpring = (type === 'solid' && Math.random() < 0.1);

    platforms.push({
        x: xPos,
        y: yPos,
        type: type,
        hasSpring: hasSpring,
        broken: false,
        vx: type === 'moving' ? (Math.random() > 0.5 ? 2 : -2) : 0
    });
}

function spawnParticles(x, y, color) {
    for(let i=0; i<15; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1.0,
            color: color
        });
    }
}

function update() {
    if(!isPlaying) return;

    // Player Horizontal Movement (Lerp to target)
    player.x += (player.targetX - player.x) * 0.15;
    
    // Screen Wrap
    if(player.x < -player.radius) player.x = width + player.radius;
    if(player.x > width + player.radius) player.x = -player.radius;

    // Player Vertical Physics
    player.vy += GRAVITY;
    player.y += player.vy;

    // Camera follow (only go up)
    if(player.y < height / 2) {
        let diff = (height / 2) - player.y;
        player.y += diff;
        platforms.forEach(p => p.y += diff);
        particles.forEach(p => p.y += diff);
        
        // Score is based on height climbed
        score += diff;
        scoreEl.innerText = formatMoney(score);
    }

    // Platform logic
    for(let i = platforms.length - 1; i >= 0; i--) {
        let p = platforms[i];
        
        // Move moving platforms
        if(p.type === 'moving') {
            p.x += p.vx;
            if(p.x < 0 || p.x + PLATFORM_WIDTH > width) p.vx *= -1;
        }

        // Collision detection (only when falling)
        if(player.vy > 0 && !p.broken) {
            if(player.x + player.radius > p.x && 
               player.x - player.radius < p.x + PLATFORM_WIDTH && 
               player.y + player.radius > p.y && 
               player.y + player.radius < p.y + PLATFORM_HEIGHT + player.vy) { // check prev frame essentially
                
                // Hit platform!
                if(p.type === 'crumble') {
                    p.broken = true;
                    spawnParticles(p.x + PLATFORM_WIDTH/2, p.y, COLORS.crumble);
                } else {
                    if(p.hasSpring && player.x > p.x && player.x < p.x + PLATFORM_WIDTH) {
                        player.vy = SPRING_VELOCITY;
                        p.hasSpring = false; // consume spring
                        spawnParticles(player.x, player.y, COLORS.spring);
                    } else {
                        player.vy = JUMP_VELOCITY;
                    }
                }
            }
        }

        // Remove off-screen platforms and spawn new ones
        if(p.y > height) {
            platforms.splice(i, 1);
            let highestPlatformY = Math.min(...platforms.map(plat => plat.y));
            spawnPlatform(highestPlatformY - (Math.random() * 80 + 40));
        }
    }

    // Particles update
    for(let i = particles.length - 1; i >= 0; i--) {
        let pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.03;
        if(pt.life <= 0) particles.splice(i, 1);
    }

    // Game Over condition
    if(player.y > height + player.radius) {
        gameOver();
    }
}

function draw() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    // Grid background
    ctx.strokeStyle = 'rgba(105, 240, 174, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
    let yOffset = score % 40;
    for(let i=0; i<height; i+=40) { ctx.beginPath(); ctx.moveTo(0, i + yOffset); ctx.lineTo(width, i + yOffset); ctx.stroke(); }

    if(!isPlaying) return;

    // Draw Platforms
    platforms.forEach(p => {
        if(p.broken) return;
        
        ctx.fillStyle = COLORS[p.type];
        
        // Round rect
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT, 8);
        ctx.fill();

        // Draw spring if it has one
        if(p.hasSpring) {
            ctx.fillStyle = COLORS.spring;
            ctx.fillRect(p.x + PLATFORM_WIDTH/2 - 8, p.y - 12, 16, 12);
        }
    });

    // Draw Particles
    particles.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    // Draw Player
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // Stretch based on velocity (juice!)
    let stretch = Math.max(0.5, Math.min(1.5, 1 + (player.vy * 0.02)));
    ctx.scale(1/stretch, stretch);

    if(mascotImg.complete && mascotImg.naturalHeight > 0) {
        // Draw mascot
        ctx.drawImage(mascotImg, -player.radius, -player.radius, player.radius*2, player.radius*2);
    } else {
        // Fallback circle
        ctx.fillStyle = COLORS.player;
        ctx.beginPath();
        ctx.arc(0, 0, player.radius, 0, Math.PI*2);
        ctx.fill();
    }
    
    ctx.restore();
}

function loop() {
    update();
    draw();
    if(isPlaying) requestAnimationFrame(loop);
}

function gameOver() {
    isPlaying = false;
    uiHud.classList.add('hidden');
    uiGameOver.classList.remove('hidden');
    finalScoreEl.innerText = formatMoney(score);
}

// Controls
function handleInput(e) {
    if(!isPlaying) return;
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    player.targetX = clientX;
}

document.addEventListener('mousemove', handleInput);
document.addEventListener('touchmove', handleInput, {passive: true});
document.addEventListener('touchstart', handleInput, {passive: true});

document.getElementById('start-btn').addEventListener('click', initGame);
document.getElementById('restart-btn').addEventListener('click', initGame);

// Initial draw
draw();