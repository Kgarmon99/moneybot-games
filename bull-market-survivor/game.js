const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');
const btnStart = document.getElementById('modal-btn');
const timeEl = document.getElementById('time-display');
const goldEl = document.getElementById('gold-display');
const levelEl = document.getElementById('level-display');
const xpFill = document.getElementById('xp-bar-fill');
const particlesEl = document.getElementById('particles');
const lvlModal = document.getElementById('level-up-modal');
const upgradeGrid = document.getElementById('upgrade-cards');

// Joystick
const joyZone = document.getElementById('joystick-zone');
const joyBase = document.getElementById('joystick-base');
const joyStick = document.getElementById('joystick-stick');

let state = {
    isPlaying: false,
    isPaused: false,
    time: 0,
    lastTick: 0,
    camera: { x: 0, y: 0 },
    player: {
        x: 0, y: 0, size: 20, speed: 120, 
        hp: 100, maxHp: 100, 
        level: 1, xp: 0, xpNeeded: 10, gold: 0,
        weapons: {
            dividendBlaster: { level: 1, cooldown: 1.0, damage: 10, timer: 0 },
            compoundAura: { level: 0, cooldown: 0.1, damage: 2, radius: 80, timer: 0 }
        }
    },
    input: { x: 0, y: 0, active: false, startX: 0, startY: 0 },
    keys: { w: false, a: false, s: false, d: false },
    enemies: [],
    bullets: [],
    gems: []
};

// --- INPUT HANDLING ---
function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resize);

joyZone.addEventListener('touchstart', handleTouchStart, {passive: false});
joyZone.addEventListener('touchmove', handleTouchMove, {passive: false});
joyZone.addEventListener('touchend', handleTouchEnd);
joyZone.addEventListener('mousedown', handleTouchStart);
window.addEventListener('mousemove', (e) => { if(state.input.active) handleTouchMove(e); });
window.addEventListener('mouseup', handleTouchEnd);

function handleTouchStart(e) {
    if (!state.isPlaying || state.isPaused) return;
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    state.input.active = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    state.input.startX = clientX;
    state.input.startY = clientY;
    
    joyBase.style.display = 'flex';
    joyBase.style.left = clientX + 'px';
    joyBase.style.top = clientY + 'px';
    joyStick.style.transform = `translate(0px, 0px)`;
}

function handleTouchMove(e) {
    if (!state.input.active) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - state.input.startX;
    const dy = clientY - state.input.startY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxDist = 40;
    
    let nx = dx, ny = dy;
    if (dist > maxDist) {
        nx = (dx / dist) * maxDist;
        ny = (dy / dist) * maxDist;
    }
    
    joyStick.style.transform = `translate(${nx}px, ${ny}px)`;
    
    // Normalize input vector [-1, 1]
    const mag = Math.min(dist, maxDist) / maxDist;
    if (dist > 0) {
        state.input.x = (dx / dist) * mag;
        state.input.y = (dy / dist) * mag;
    }
}

function handleTouchEnd(e) {
    state.input.active = false;
    state.input.x = 0;
    state.input.y = 0;
    joyBase.style.display = 'none';
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') state.keys.w = true;
    if (e.key === 'a' || e.key === 'A') state.keys.a = true;
    if (e.key === 's' || e.key === 'S') state.keys.s = true;
    if (e.key === 'd' || e.key === 'D') state.keys.d = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W') state.keys.w = false;
    if (e.key === 'a' || e.key === 'A') state.keys.a = false;
    if (e.key === 's' || e.key === 'S') state.keys.s = false;
    if (e.key === 'd' || e.key === 'D') state.keys.d = false;
});

// --- GAME LOGIC ---

function spawnDamageText(x, y, dmg, isCrit=false) {
    const el = document.createElement('div');
    el.className = `dmg-text ${isCrit ? 'crit' : ''}`;
    el.textContent = Math.floor(dmg);
    
    // Map world coords to screen coords
    const screenX = x - state.camera.x;
    const screenY = y - state.camera.y;
    
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;
    particlesEl.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

function spawnEnemy() {
    // Spawn just outside camera view
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(canvas.width, canvas.height) / 2 + 50;
    
    // Difficulty scaling
    const isBear = Math.random() < Math.min(0.3, state.time / 300);
    
    state.enemies.push({
        x: state.player.x + Math.cos(angle) * dist,
        y: state.player.y + Math.sin(angle) * dist,
        size: isBear ? 25 : 15,
        hp: isBear ? 30 + state.time/10 : 10 + state.time/20,
        speed: isBear ? 40 : 60 + Math.random()*20,
        type: isBear ? 'bear' : 'bill',
        damage: isBear ? 15 : 5
    });
}

function spawnGem(x, y, amount) {
    state.gems.push({ x, y, size: 8, amount });
}

function getNearestEnemy(range) {
    let nearest = null;
    let minDist = range;
    state.enemies.forEach(e => {
        const dx = e.x - state.player.x;
        const dy = e.y - state.player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) {
            minDist = dist;
            nearest = e;
        }
    });
    return nearest;
}

function checkLevelUp() {
    if (state.player.xp >= state.player.xpNeeded) {
        state.player.xp -= state.player.xpNeeded;
        state.player.level++;
        state.player.xpNeeded = Math.floor(state.player.xpNeeded * 1.5);
        levelEl.textContent = `LVL ${state.player.level}`;
        showLevelUpModal();
    }
    xpFill.style.width = `${(state.player.xp / state.player.xpNeeded) * 100}%`;
}

function showLevelUpModal() {
    state.isPaused = true;
    lvlModal.classList.add('active');
    
    const UPGRADES = [
        { id: 'blaster_dmg', icon: '💥', title: 'Dividend Boost', desc: '+5 Blaster Damage', apply: () => state.player.weapons.dividendBlaster.damage += 5 },
        { id: 'blaster_spd', icon: '⚡', title: 'High Frequency', desc: '-15% Blaster Cooldown', apply: () => state.player.weapons.dividendBlaster.cooldown *= 0.85 },
        { id: 'aura_unlock', icon: '🟢', title: 'Compound Aura', desc: 'Unlock/Upgrade close-range damage aura', apply: () => {
            state.player.weapons.compoundAura.level++;
            state.player.weapons.compoundAura.damage += 2;
            state.player.weapons.compoundAura.radius += 10;
        }},
        { id: 'speed', icon: '🏃', title: 'Runway Extension', desc: '+15 Move Speed', apply: () => state.player.speed += 15 },
        { id: 'heal', icon: '❤️', title: 'Bailout', desc: 'Heal 50% HP', apply: () => state.player.hp = Math.min(state.player.maxHp, state.player.hp + state.player.maxHp*0.5) }
    ];
    
    // Pick 3 random
    const shuffled = UPGRADES.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    upgradeGrid.innerHTML = '';
    shuffled.forEach(up => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <div class="upgrade-icon">${up.icon}</div>
            <div class="upgrade-info">
                <div class="upgrade-title">${up.title}</div>
                <div class="upgrade-desc">${up.desc}</div>
            </div>
        `;
        // Handle touch/click cleanly
        const selectUpgrade = (e) => {
            e.preventDefault(); e.stopPropagation();
            up.apply();
            lvlModal.classList.remove('active');
            state.isPaused = false;
            if(navigator.vibrate) navigator.vibrate(20);
        };
        card.addEventListener('mousedown', selectUpgrade);
        card.addEventListener('touchstart', selectUpgrade, {passive: false});
        upgradeGrid.appendChild(card);
    });
}

function update(dt) {
    if (state.isPaused) return;
    state.time += dt;
    
    // Movement
    let dx = 0, dy = 0;
    if (state.keys.w) dy -= 1;
    if (state.keys.s) dy += 1;
    if (state.keys.a) dx -= 1;
    if (state.keys.d) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx*dx + dy*dy);
        dx = (dx/len); dy = (dy/len);
    } else if (state.input.active) {
        dx = state.input.x;
        dy = state.input.y;
    }
    
    state.player.x += dx * state.player.speed * dt;
    state.player.y += dy * state.player.speed * dt;
    
    // Camera follow
    state.camera.x = state.player.x - canvas.width / 2;
    state.camera.y = state.player.y - canvas.height / 2;
    
    // Weapons
    const w1 = state.player.weapons.dividendBlaster;
    w1.timer -= dt;
    if (w1.timer <= 0) {
        const target = getNearestEnemy(300);
        if (target) {
            const tx = target.x - state.player.x;
            const ty = target.y - state.player.y;
            const len = Math.sqrt(tx*tx + ty*ty);
            state.bullets.push({
                x: state.player.x, y: state.player.y,
                vx: (tx/len) * 300, vy: (ty/len) * 300,
                life: 1.5, damage: w1.damage
            });
            w1.timer = w1.cooldown;
        }
    }
    
    const w2 = state.player.weapons.compoundAura;
    if (w2.level > 0) {
        w2.timer -= dt;
        if (w2.timer <= 0) {
            // Damage all inside radius
            state.enemies.forEach(e => {
                const tx = e.x - state.player.x;
                const ty = e.y - state.player.y;
                if (Math.sqrt(tx*tx + ty*ty) < w2.radius) {
                    e.hp -= w2.damage;
                    e.hitFlash = 0.1;
                }
            });
            w2.timer = w2.cooldown;
        }
    }
    
    // Bullets
    for (let i = state.bullets.length - 1; i >= 0; i--) {
        let b = state.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        
        // Check collisions
        let hit = false;
        for (let e of state.enemies) {
            const tx = e.x - b.x;
            const ty = e.y - b.y;
            if (Math.sqrt(tx*tx + ty*ty) < e.size + 10) {
                e.hp -= b.damage;
                e.hitFlash = 0.1;
                hit = true;
                spawnDamageText(e.x, e.y, b.damage, Math.random()>0.9);
                break;
            }
        }
        
        if (hit || b.life <= 0) state.bullets.splice(i, 1);
    }
    
    // Spawner
    if (Math.random() < 0.02 + (state.time * 0.0005)) spawnEnemy();
    
    // Enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
        let e = state.enemies[i];
        if (e.hitFlash > 0) e.hitFlash -= dt;
        
        if (e.hp <= 0) {
            spawnGem(e.x, e.y, e.type === 'bear' ? 5 : 1);
            if (e.type==='bear') state.player.gold += 5;
            state.enemies.splice(i, 1);
            continue;
        }
        
        // Move towards player
        const tx = state.player.x - e.x;
        const ty = state.player.y - e.y;
        const dist = Math.sqrt(tx*tx + ty*ty);
        
        if (dist > e.size + state.player.size) {
            e.x += (tx/dist) * e.speed * dt;
            e.y += (ty/dist) * e.speed * dt;
        } else {
            // Damage player
            state.player.hp -= e.damage * dt;
            if (state.player.hp <= 0) {
                gameOver();
                return;
            }
        }
    }
    
    // Gems (Pickup)
    const pickupRadius = 60;
    for (let i = state.gems.length - 1; i >= 0; i--) {
        let g = state.gems[i];
        const tx = state.player.x - g.x;
        const ty = state.player.y - g.y;
        const dist = Math.sqrt(tx*tx + ty*ty);
        
        if (dist < state.player.size + g.size) {
            state.player.xp += g.amount;
            checkLevelUp();
            state.gems.splice(i, 1);
            if (navigator.vibrate) navigator.vibrate(5);
        } else if (dist < pickupRadius) {
            // Magnet pull
            g.x += (tx/dist) * 200 * dt;
            g.y += (ty/dist) * 200 * dt;
        }
    }
    
    // HUD
    const min = Math.floor(state.time / 60);
    const sec = Math.floor(state.time % 60);
    timeEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    goldEl.textContent = state.player.gold;
}

function drawEmoji(x, y, emoji, size) {
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y);
}

function draw() {
    ctx.fillStyle = '#07111F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);
    
    // Draw Grid (Floor)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    const gridS = 100;
    const cx = Math.floor(state.camera.x / gridS) * gridS;
    const cy = Math.floor(state.camera.y / gridS) * gridS;
    for(let i = -gridS; i < canvas.width + gridS; i+=gridS) {
        ctx.beginPath(); ctx.moveTo(cx + i, state.camera.y); ctx.lineTo(cx + i, state.camera.y + canvas.height); ctx.stroke();
    }
    for(let i = -gridS; i < canvas.height + gridS; i+=gridS) {
        ctx.beginPath(); ctx.moveTo(state.camera.x, cy + i); ctx.lineTo(state.camera.x + canvas.width, cy + i); ctx.stroke();
    }
    
    // Draw Aura
    const w2 = state.player.weapons.compoundAura;
    if (w2.level > 0) {
        ctx.fillStyle = 'rgba(0, 230, 118, 0.1)';
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.3)';
        ctx.beginPath(); ctx.arc(state.player.x, state.player.y, w2.radius, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
    }
    
    // Draw Gems
    state.gems.forEach(g => {
        ctx.fillStyle = '#00E676';
        ctx.shadowBlur = 10; ctx.shadowColor = '#00E676';
        ctx.beginPath(); ctx.arc(g.x, g.y, g.size, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // Draw Enemies
    state.enemies.forEach(e => {
        if (e.hitFlash > 0) {
            ctx.fillStyle = '#FFF';
            ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI*2); ctx.fill();
        } else {
            drawEmoji(e.x, e.y, e.type === 'bear' ? '🐻' : '📄', e.size * 2);
        }
    });
    
    // Draw Bullets
    state.bullets.forEach(b => {
        drawEmoji(b.x, b.y, '💵', 20);
    });
    
    // Draw Player
    drawEmoji(state.player.x, state.player.y, '🤖', state.player.size * 2.5);
    
    // Player HP Bar
    const hpW = 40;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(state.player.x - hpW/2, state.player.y + state.player.size + 10, hpW, 6);
    ctx.fillStyle = '#FB7185';
    ctx.fillRect(state.player.x - hpW/2, state.player.y + state.player.size + 10, hpW * (Math.max(0, state.player.hp) / state.player.maxHp), 6);
    
    ctx.restore();
}

function gameLoop(now) {
    if (!state.isPlaying) return;
    const dt = Math.min((now - state.lastTick) / 1000, 0.1);
    state.lastTick = now;
    
    update(dt);
    draw();
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    resize();
    state = {
        isPlaying: true, isPaused: false, time: 0, lastTick: performance.now(),
        camera: { x: 0, y: 0 },
        player: {
            x: 0, y: 0, size: 15, speed: 150, hp: 100, maxHp: 100, 
            level: 1, xp: 0, xpNeeded: 10, gold: 0,
            weapons: {
                dividendBlaster: { level: 1, cooldown: 0.8, damage: 15, timer: 0 },
                compoundAura: { level: 0, cooldown: 0.1, damage: 2, radius: 80, timer: 0 }
            }
        },
        input: { x: 0, y: 0, active: false, startX: 0, startY: 0 },
        keys: { w: false, a: false, s: false, d: false },
        enemies: [], bullets: [], gems: []
    };
    xpFill.style.width = '0%';
    levelEl.textContent = 'LVL 1';
    modal.classList.remove('active');
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    state.isPlaying = false;
    modal.classList.add('active');
    document.getElementById('modal-title').textContent = "Liquidated!";
    document.getElementById('modal-title').style.color = "var(--mb-red)";
    document.getElementById('modal-desc').innerHTML = `The bear market got you.<br><br>Survived: <b>${timeEl.textContent}</b><br>Level Reached: <b>${state.player.level}</b>`;
    btnStart.textContent = "TRY AGAIN";
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

btnStart.addEventListener('click', startGame);
btnStart.addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); }, {passive: false});

resize();
ctx.fillStyle = '#07111F';
ctx.fillRect(0,0,canvas.width, canvas.height);