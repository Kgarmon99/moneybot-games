const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-display');
const distanceEl = document.getElementById('distance-display');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalBtn = document.getElementById('modal-btn');
const particlesEl = document.getElementById('particles');
const mascotImg = document.getElementById('mascot-img');

// Game constants
const GRAVITY = 0.5;
const LIFT = -1.2;
const MAX_VELOCITY = 12;
const BASE_SCROLL_SPEED = 5;
const MAX_SCROLL_SPEED = 15;
const OBSTACLE_SPAWN_RATE = 80; // frames
const COIN_SPAWN_RATE = 30; // frames
const MAGNET_SPAWN_RATE = 600; // frames

let state = {
    isPlaying: false,
    frames: 0,
    score: 0,
    distance: 0,
    scrollSpeed: BASE_SCROLL_SPEED,
    isThrusting: false,
    player: { x: 80, y: 200, w: 40, h: 40, vy: 0 },
    obstacles: [],
    coins: [],
    magnets: [],
    particles: [], // Exhaust
    hitStopFrames: 0,
    cameraShake: 0,
    magnetFrames: 0
};

// Parallax Layers
const buildings = {
    bg: [], // Slower, darker
    mg: []  // Faster, lighter
};

function initBuildings() {
    buildings.bg = [];
    buildings.mg = [];
    for(let i=0; i<10; i++) {
        buildings.bg.push({ x: i * 150, w: 100 + Math.random()*100, h: 100 + Math.random()*200 });
        buildings.mg.push({ x: i * 200, w: 80 + Math.random()*100, h: 50 + Math.random()*150 });
    }
}

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    initBuildings();
}
window.addEventListener('resize', resize);
resize();

function spawnText(x, y, text, color = 'var(--mb-green)') {
    const el = document.createElement('div');
    el.className = 'pop-text';
    el.textContent = text;
    el.style.color = color;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    particlesEl.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function spawnExhaust(x, y) {
    state.particles.push({
        x: x, y: y,
        vx: -Math.random() * 2 - state.scrollSpeed,
        vy: Math.random() * 2,
        life: 1.0
    });
}

function resetGame() {
    state = {
        isPlaying: true,
        frames: 0,
        score: 0,
        distance: 0,
        scrollSpeed: BASE_SCROLL_SPEED,
        isThrusting: false,
        player: { x: 80, y: canvas.height / 2, w: 40, h: 40, vy: 0 },
        obstacles: [],
        coins: [],
        magnets: [],
        particles: [],
        hitStopFrames: 0,
        cameraShake: 0,
        magnetFrames: 0
    };
    initBuildings();
    modal.classList.remove('active');
    particlesEl.innerHTML = '';
    requestAnimationFrame(gameLoop);
}

function gameOver(reasonText) {
    state.cameraShake = 15;
    state.hitStopFrames = 10;
    setTimeout(() => {
        state.isPlaying = false;
        modal.classList.add('active');
        modalTitle.textContent = "Bankrupt!";
        modalTitle.style.color = "var(--mb-red)";
        modalDesc.textContent = `${reasonText} Your final Net Worth was $${state.score} over ${Math.floor(state.distance)}m of runway.`;
        modalBtn.textContent = "TRY AGAIN";
    }, 200); // Small delay for hitstop feel
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    // Red flash
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.inset = '0';
    flash.style.backgroundColor = 'rgba(251, 113, 133, 0.5)';
    flash.style.zIndex = '9999';
    flash.style.pointerEvents = 'none';
    flash.style.transition = 'opacity 0.2s';
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '0'; }, 50);
    setTimeout(() => { flash.remove(); }, 250);
}

// Input handling
function handleDown(e) {
    if(e.type !== 'mousedown' || e.button === 0) {
        state.isThrusting = true;
    }
}
function handleUp() { state.isThrusting = false; }

window.addEventListener('mousedown', handleDown);
window.addEventListener('mouseup', handleUp);
window.addEventListener('touchstart', (e) => { 
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        e.preventDefault(); 
    }
    handleDown(e); 
}, {passive: false});
window.addEventListener('touchend', handleUp);
window.addEventListener('keydown', (e) => { if(e.code === 'Space') handleDown(e); });
window.addEventListener('keyup', (e) => { if(e.code === 'Space') handleUp(); });
modalBtn.addEventListener('click', (e) => { e.stopPropagation(); resetGame(); });
modalBtn.addEventListener('touchstart', (e) => { e.stopPropagation(); resetGame(); }, {passive: true});

function update() {
    if (state.hitStopFrames > 0) {
        state.hitStopFrames--;
        return;
    }

    state.frames++;
    state.distance += state.scrollSpeed * 0.05;
    
    // Speed progression
    if (state.frames % 300 === 0 && state.scrollSpeed < MAX_SCROLL_SPEED) {
        state.scrollSpeed += 0.5;
    }

    // Player physics
    const p = state.player;
    if (state.isThrusting) {
        p.vy += LIFT;
        spawnExhaust(p.x, p.y + p.h - 5);
        spawnExhaust(p.x + 10, p.y + p.h - 5);
    } else {
        p.vy += GRAVITY;
    }
    
    // Clamp velocity
    if (p.vy > MAX_VELOCITY) p.vy = MAX_VELOCITY;
    if (p.vy < -MAX_VELOCITY) p.vy = -MAX_VELOCITY;
    
    p.y += p.vy;

    // Boundaries
    if (p.y < 0) { p.y = 0; p.vy = 0; }
    if (p.y + p.h > canvas.height) { 
        p.y = canvas.height - p.h; 
        gameOver("You hit the ground (Living Expenses outpaced income).");
        return;
    }

    // Spawning
    if (state.frames % Math.max(30, Math.floor(OBSTACLE_SPAWN_RATE - (state.scrollSpeed - BASE_SCROLL_SPEED)*2)) === 0) {
        // Random height obstacle
        const h = Math.random() * (canvas.height / 2.5) + 50;
        const y = Math.random() > 0.5 ? 0 : canvas.height - h;
        state.obstacles.push({ x: canvas.width, y: y, w: 40, h: h });
    }

    if (state.frames % COIN_SPAWN_RATE === 0) {
        const y = Math.random() * (canvas.height - 100) + 50;
        state.coins.push({ x: canvas.width, y: y, r: 15, vx: -state.scrollSpeed, vy: 0 });
    }

    if (state.frames % MAGNET_SPAWN_RATE === 0) {
        const y = Math.random() * (canvas.height - 200) + 100;
        state.magnets.push({ x: canvas.width, y: y, r: 20 });
    }

    // Magnet Active Timer
    if (state.magnetFrames > 0) state.magnetFrames--;

    // Hitbox padding (make collisions slightly forgiving)
    const paddingX = 8;
    const paddingY = 6;
    const hitX = p.x + paddingX;
    const hitY = p.y + paddingY;
    const hitW = p.w - paddingX*2;
    const hitH = p.h - paddingY*2;

    // Moving and collision
    // Obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
        let obs = state.obstacles[i];
        obs.x -= state.scrollSpeed;
        
        // AABB Collision with tighter hitbox
        if (hitX < obs.x + obs.w && hitX + hitW > obs.x &&
            hitY < obs.y + obs.h && hitY + hitH > obs.y) {
            gameOver("You hit a Debt Laser.");
            return;
        }

        if (obs.x + obs.w < 0) state.obstacles.splice(i, 1);
    }

    // Powerup (Magnets)
    for (let i = state.magnets.length - 1; i >= 0; i--) {
        let mag = state.magnets[i];
        mag.x -= state.scrollSpeed;
        
        if (hitX < mag.x + mag.r*2 && hitX + hitW > mag.x &&
            hitY < mag.y + mag.r*2 && hitY + hitH > mag.y) {
            state.magnetFrames = 400; // ~6.5 seconds of magnet
            spawnText(p.x, p.y - 20, "CASHFLOW SURGE!", "var(--mb-gold)");
            state.magnets.splice(i, 1);
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            continue;
        }

        if (mag.x + mag.r*2 < 0) state.magnets.splice(i, 1);
    }

    // Coins
    for (let i = state.coins.length - 1; i >= 0; i--) {
        let coin = state.coins[i];
        
        if (state.magnetFrames > 0) {
            // Magnet pull physics
            const dx = (p.x + p.w/2) - (coin.x + coin.r);
            const dy = (p.y + p.h/2) - (coin.y + coin.r);
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 400) { // Pull radius
                coin.vx += (dx / dist) * 1.5;
                coin.vy += (dy / dist) * 1.5;
            } else {
                coin.vx = -state.scrollSpeed;
                coin.vy = 0;
            }
        } else {
            coin.vx = -state.scrollSpeed;
            coin.vy = 0;
        }

        coin.x += coin.vx;
        coin.y += coin.vy;
        
        // Circle/Rect approx collision
        if (hitX < coin.x + coin.r*2 && hitX + hitW > coin.x &&
            hitY < coin.y + coin.r*2 && hitY + hitH > coin.y) {
            state.score += 10;
            spawnText(p.x, p.y, "+$10");
            state.coins.splice(i, 1);
            if (navigator.vibrate) navigator.vibrate(10);
            continue;
        }

        if (coin.x + coin.r*2 < 0) state.coins.splice(i, 1);
    }

    // Particles update
    for (let i = state.particles.length - 1; i >= 0; i--) {
        let pt = state.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.05;
        if (pt.life <= 0) state.particles.splice(i, 1);
    }

    // Parallax update
    buildings.bg.forEach(b => {
        b.x -= state.scrollSpeed * 0.2;
        if (b.x + b.w < 0) { b.x = canvas.width + Math.random()*100; b.h = 100 + Math.random()*200; }
    });
    buildings.mg.forEach(b => {
        b.x -= state.scrollSpeed * 0.5;
        if (b.x + b.w < 0) { b.x = canvas.width + Math.random()*50; b.h = 50 + Math.random()*150; }
    });

    // Camera shake decay
    if (state.cameraShake > 0) state.cameraShake -= 1;

    // Update HUD
    scoreEl.textContent = '$' + state.score;
    distanceEl.textContent = Math.floor(state.distance) + 'm';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    if (state.cameraShake > 0) {
        ctx.translate((Math.random()-0.5)*state.cameraShake, (Math.random()-0.5)*state.cameraShake);
    }
    
    // Draw background layers
    ctx.fillStyle = '#060E1A';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    ctx.fillStyle = '#0A1526';
    buildings.bg.forEach(b => ctx.fillRect(b.x, canvas.height - b.h, b.w, b.h));
    
    ctx.fillStyle = '#0F1E36';
    buildings.mg.forEach(b => ctx.fillRect(b.x, canvas.height - b.h, b.w, b.h));

    // Floor line
    ctx.fillStyle = 'rgba(105, 240, 174, 0.2)';
    ctx.fillRect(0, canvas.height - 4, canvas.width, 4);

    // Obstacles
    ctx.fillStyle = '#FB7185';
    state.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        // Laser core
        ctx.fillStyle = '#FFF';
        ctx.fillRect(obs.x + obs.w/4, obs.y, obs.w/2, obs.h);
        ctx.fillStyle = '#FB7185';
    });

    // Coins
    ctx.fillStyle = '#00E676';
    state.coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x + coin.r, coin.y + coin.r, coin.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#07111F';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', coin.x + coin.r, coin.y + coin.r);
        ctx.fillStyle = '#00E676';
    });

    // Magnets
    state.magnets.forEach(mag => {
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(mag.x + mag.r, mag.y + mag.r, mag.r, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FBBF24';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#07111F';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', mag.x + mag.r, mag.y + mag.r);
    });

    // Particles
    state.particles.forEach(pt => {
        ctx.fillStyle = `rgba(251, 191, 36, ${pt.life})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3 * pt.life, 0, Math.PI * 2);
        ctx.fill();
    });

    // Player
    const p = state.player;
    ctx.translate(p.x + p.w/2, p.y + p.h/2);
    ctx.rotate(p.vy * 0.04);
    
    // Magnet Aura
    if (state.magnetFrames > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w + 10 + Math.sin(state.frames * 0.2) * 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 4;
        ctx.stroke();
    }
    
    if(mascotImg.complete && mascotImg.naturalHeight !== 0) {
        ctx.drawImage(mascotImg, -p.w/2, -p.h/2, p.w, p.h);
    } else {
        ctx.fillStyle = '#00E676';
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    }

    ctx.restore();
}

function gameLoop() {
    if (!state.isPlaying && state.hitStopFrames <= 0) return;
    update();
    draw();
    if (state.isPlaying || state.hitStopFrames > 0) {
        requestAnimationFrame(gameLoop);
    }
}

// Initial draw
ctx.fillStyle = '#0B1628';
ctx.fillRect(0,0,canvas.width,canvas.height);