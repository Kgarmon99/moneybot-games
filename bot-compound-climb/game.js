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
let highScore = localStorage.getItem('mb_compound_climb_highscore') || 0;
let highestY = 0;
let shakeTime = 0;

// Physics & Tuning
const GRAVITY = 0.4;
const JUMP_VELOCITY = -12.5;
const SPRING_VELOCITY = -22;
const PLATFORM_WIDTH = 65;
const PLATFORM_HEIGHT = 15;

// Audio Context (Juice!)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'spring') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'break') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'die') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now); osc.stop(now + 0.8);
    }
}

// Entities
let player = {
    x: 0, y: 0, 
    vx: 0, vy: 0, 
    radius: 20,
    targetX: 0,
    rotation: 0
};
let platforms = [];
let particles = [];
let floatingTexts = [];
let cameraY = 0;

// Parallax Stars
let stars = [];

// Mascot image
const mascotImg = new Image();
mascotImg.src = 'assets/mascot/operator-transparent.png';

// Colors (MoneyBot Palette)
const COLORS = {
    bg: '#07111F',
    solid: '#00E676',       // Normal Asset
    crumble: '#FB7185',     // Debt Trap (breaks)
    moving: '#38BDF8',      // Volatile Asset
    spring: '#FBBF24',      // Compound Interest
    player: '#F8FAFC',
    trail: 'rgba(0, 230, 118, 0.4)'
};

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Init stars
    stars = [];
    for(let i=0; i<100; i++) {
        stars.push({x: Math.random()*width, y: Math.random()*height, size: Math.random()*2+1, speed: Math.random()*0.5 + 0.1});
    }
}
window.addEventListener('resize', resize);
resize();

function formatMoney(amount) {
    return '$' + Math.floor(amount).toLocaleString();
}

function initGame() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    player.x = width / 2;
    player.y = height - 150;
    player.targetX = width / 2;
    player.vy = 0;
    player.vx = 0;
    player.rotation = 0;
    
    cameraY = 0;
    highestY = player.y;
    score = 0;
    shakeTime = 0;
    platforms = [];
    particles = [];
    floatingTexts = [];

    // Base platform
    platforms.push({ x: width/2 - PLATFORM_WIDTH/2, y: height - 50, type: 'solid' });

    // Generate initial platforms
    let currentY = height - 150;
    while(currentY > -height) {
        spawnPlatform(currentY);
        currentY -= Math.random() * 60 + 30;
    }

    uiStart.classList.add('hidden');
    uiGameOver.classList.add('hidden');
    uiHud.classList.remove('hidden');
    
    // Create high score element if it doesn't exist
    if(!document.getElementById('high-score')) {
        let hs = document.createElement('div');
        hs.id = 'high-score';
        hs.style.color = COLORS.moving;
        hs.style.fontSize = '14px';
        hs.style.marginTop = '5px';
        hs.innerText = 'High Score: ' + formatMoney(highScore);
        document.getElementById('score').appendChild(hs);
    } else {
        document.getElementById('high-score').innerText = 'All-Time High: ' + formatMoney(highScore);
    }

    isPlaying = true;
    requestAnimationFrame(loop);
}

function spawnPlatform(yPos) {
    let xPos = Math.random() * (width - PLATFORM_WIDTH);
    let type = 'solid';
    
    let r = Math.random();
    if(score > 3000 && r < 0.2) type = 'crumble';
    else if(score > 1500 && r < 0.35) type = 'moving';
    
    let hasSpring = (type === 'solid' && Math.random() < 0.12);

    platforms.push({
        x: xPos,
        y: yPos,
        type: type,
        hasSpring: hasSpring,
        broken: false,
        vx: type === 'moving' ? (Math.random() > 0.5 ? 2.5 : -2.5) : 0
    });
}

function spawnParticles(x, y, color, count, burstPower) {
    for(let i=0; i<count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * burstPower,
            vy: (Math.random() - 0.5) * burstPower - 2,
            life: 1.0,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

function spawnText(x, y, text, color) {
    floatingTexts.push({ x: x, y: y, text: text, color: color, life: 1.0, vy: -2 });
}

function update() {
    if(!isPlaying) return;

    if(shakeTime > 0) shakeTime--;

    // Player Horizontal Movement (Lerp to target for smooth velocity)
    let oldX = player.x;
    player.x += (player.targetX - player.x) * 0.15;
    player.vx = player.x - oldX;
    
    // Tilt mascot based on velocity
    player.rotation = player.vx * 0.05;
    
    // Screen Wrap
    if(player.x < -player.radius) { player.x = width + player.radius; player.targetX = player.x; }
    if(player.x > width + player.radius) { player.x = -player.radius; player.targetX = player.x; }

    // Player Vertical Physics
    player.vy += GRAVITY;
    player.y += player.vy;
    
    // Trail juice when moving fast
    if(Math.abs(player.vy) > 8 || Math.abs(player.vx) > 5) {
        if(Math.random() > 0.5) {
            particles.push({
                x: player.x + (Math.random()-0.5)*10, y: player.y + 10,
                vx: -player.vx * 0.1, vy: -player.vy * 0.1,
                life: 0.6, color: COLORS.trail, size: 6
            });
        }
    }

    // Camera follow (only go up)
    if(player.y < height / 2) {
        let diff = (height / 2) - player.y;
        player.y += diff;
        platforms.forEach(p => p.y += diff);
        particles.forEach(p => p.y += diff);
        floatingTexts.forEach(t => t.y += diff);
        
        // Move parallax stars
        stars.forEach(s => {
            s.y += diff * s.speed;
            if(s.y > height) { s.y = 0; s.x = Math.random()*width; }
        });
        
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
            // Generous hitbox
            if(player.x + player.radius > p.x - 5 && 
               player.x - player.radius < p.x + PLATFORM_WIDTH + 5 && 
               player.y + player.radius > p.y && 
               player.y + player.radius < p.y + PLATFORM_HEIGHT + player.vy + 5) {
                
                // Hit platform!
                if(p.type === 'crumble') {
                    p.broken = true;
                    playSound('break');
                    shakeTime = 10; // Screen shake
                    spawnParticles(p.x + PLATFORM_WIDTH/2, p.y, COLORS.crumble, 20, 8);
                    spawnText(p.x + 30, p.y, "DEBT!", COLORS.crumble);
                } else {
                    if(p.hasSpring && player.x > p.x && player.x < p.x + PLATFORM_WIDTH) {
                        player.vy = SPRING_VELOCITY;
                        p.hasSpring = false; // consume spring
                        playSound('spring');
                        shakeTime = 5;
                        spawnParticles(player.x, player.y, COLORS.spring, 30, 10);
                        spawnText(player.x, player.y, "+$500 COMPOUND!", COLORS.spring);
                        score += 500;
                    } else {
                        player.vy = JUMP_VELOCITY;
                        playSound('jump');
                        spawnParticles(player.x, player.y + 20, COLORS.player, 5, 3);
                    }
                }
            }
        }

        // Remove off-screen platforms and spawn new ones
        if(p.y > height) {
            platforms.splice(i, 1);
            let highestPlatformY = Math.min(...platforms.map(plat => plat.y));
            spawnPlatform(highestPlatformY - (Math.random() * 60 + 30));
        }
    }

    // Particles update
    for(let i = particles.length - 1; i >= 0; i--) {
        let pt = particles[i];
        pt.vy += 0.1; // gravity for particles
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.02;
        pt.size *= 0.95; // shrink
        if(pt.life <= 0 || pt.size < 0.5) particles.splice(i, 1);
    }
    
    // Texts update
    for(let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life -= 0.02;
        if(ft.life <= 0) floatingTexts.splice(i, 1);
    }

    // Game Over condition
    if(player.y > height + player.radius) {
        gameOver();
    }
}

function draw() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    
    // Apply screen shake
    if(shakeTime > 0) {
        let dx = (Math.random() - 0.5) * 10;
        let dy = (Math.random() - 0.5) * 10;
        ctx.translate(dx, dy);
    }

    // Draw Parallax Stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    stars.forEach(s => {
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Grid background
    ctx.strokeStyle = 'rgba(105, 240, 174, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
    let yOffset = (score * 0.5) % 40; // parallax grid
    for(let i=0; i<height; i+=40) { ctx.beginPath(); ctx.moveTo(0, i + yOffset); ctx.lineTo(width, i + yOffset); ctx.stroke(); }

    if(!isPlaying && score === 0 && !document.getElementById('start-screen').classList.contains('hidden')) {
        ctx.restore();
        return; // Don't draw game if haven't started first time
    }

    // Draw Platforms
    platforms.forEach(p => {
        if(p.broken) return;
        
        // Shadow/Glow
        ctx.shadowColor = COLORS[p.type];
        ctx.shadowBlur = 10;
        ctx.fillStyle = COLORS[p.type];
        
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT, 8);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(p.x + 4, p.y + 2, PLATFORM_WIDTH - 8, 4);

        // Draw spring if it has one
        if(p.hasSpring) {
            ctx.fillStyle = COLORS.spring;
            ctx.shadowColor = COLORS.spring;
            ctx.shadowBlur = 15;
            ctx.fillRect(p.x + PLATFORM_WIDTH/2 - 8, p.y - 12, 16, 12);
            ctx.shadowBlur = 0;
        }
    });

    // Draw Particles
    particles.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    // Draw Floating Texts
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    floatingTexts.forEach(ft => {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.life;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
    });

    // Draw Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    
    // Stretch based on velocity (juice!)
    let stretchY = Math.max(0.6, Math.min(1.4, 1 + (player.vy * 0.02)));
    let stretchX = 1 / stretchY; // preserve volume
    ctx.scale(stretchX, stretchY);

    if(mascotImg.complete && mascotImg.naturalHeight > 0) {
        // Draw mascot shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 10;
        
        // Draw the image significantly larger than the physical hitbox for better visibility
        let visRadius = player.radius * 2.0; 
        ctx.drawImage(mascotImg, -visRadius, -visRadius, visRadius*2, visRadius*2);
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
    } else {
        // Fallback circle
        ctx.fillStyle = COLORS.player;
        ctx.beginPath();
        ctx.arc(0, 0, player.radius, 0, Math.PI*2);
        ctx.fill();
    }
    
    ctx.restore();
    ctx.restore(); // restore global shake
}

function loop() {
    update();
    draw();
    if(isPlaying) requestAnimationFrame(loop);
}

function gameOver() {
    isPlaying = false;
    playSound('die');
    shakeTime = 20; // Massive shake
    
    // Check High Score
    if(score > highScore) {
        highScore = score;
        localStorage.setItem('mb_compound_climb_highscore', highScore);
        document.getElementById('high-score').innerText = 'NEW HIGH SCORE!';
    }
    
    uiHud.classList.add('hidden');
    uiGameOver.classList.remove('hidden');
    finalScoreEl.innerText = formatMoney(score);
    
    draw(); // Draw final frame with shake
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