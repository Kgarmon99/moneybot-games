const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-display');
const dayEl = document.getElementById('day-display');
const timeEl = document.getElementById('time-display');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalBtn = document.getElementById('modal-btn');

// Game State
let state = {
    isPlaying: false,
    day: 1,
    cash: 0,
    targetCash: 150,
    time: 90, // 1.5 minutes per day
    lastTick: 0,
    frames: 0,
    zones: {},
    grill: [null, null, null, null],
    plates: [null, null, null, null],
    customers: [],
    popTexts: []
};

// Item definitions
const ITEMS = {
    BOND: { id: 'bond', name: 'Bond', emoji: '📄', cooked: '💵', typeColor: '#69F0AE', cookColor: '#00E676', cookTime: 3, burnTime: 8, price: 20 },
    STOCK: { id: 'stock', name: 'Stock', emoji: '🏢', cooked: '📈', typeColor: '#FCD34D', cookColor: '#F59E0B', cookTime: 5, burnTime: 12, price: 40 },
    FOLDER: { id: 'folder', name: 'Portfolio', emoji: '📁', filled: '💼', typeColor: '#38BDF8' },
    LEVERAGE: { id: 'leverage', name: 'Leverage', emoji: '🌶️', typeColor: '#FB7185', price: 15 },
    HEDGE: { id: 'hedge', name: 'Hedge', emoji: '🛡️', typeColor: '#818CF8', price: 15 }
};

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    calculateZones();
}
window.addEventListener('resize', resize);

function calculateZones() {
    const w = canvas.width;
    const h = canvas.height;
    state.zones = {
        customers: { x: 0, y: 0, w: w, h: h * 0.35 },
        grillArea: { x: w * 0.22, y: h * 0.38, w: w * 0.56, h: h * 0.28 },
        prepArea: { x: 0, y: h * 0.7, w: w, h: h * 0.3 },
        
        // Left side supplies
        btnBond: { x: 10, y: h * 0.4, w: 80, h: 60 },
        btnStock: { x: 10, y: h * 0.55, w: 80, h: 60 },
        btnFolder: { x: 10, y: h * 0.75, w: 80, h: 60 },
        
        // Right side condiments
        btnLeverage: { x: w - 90, y: h * 0.4, w: 80, h: 60 },
        btnHedge: { x: w - 90, y: h * 0.55, w: 80, h: 60 },
        trash: { x: w - 90, y: h * 0.75, w: 80, h: 60 },
    };
}

function spawnText(x, y, text, color = '#00E676') {
    state.popTexts.push({ x, y, text, color, life: 1.0 });
}

function spawnCustomer() {
    if (state.customers.length >= 3) return;
    
    const numItems = Math.random() > 0.7 ? 2 : 1;
    const order = [];
    
    for(let i=0; i<numItems; i++) {
        let asset = Math.random() > 0.5 ? 'bond' : 'stock';
        let addon = null;
        
        // Hot Dog Bush style: Addons unlocked per level
        if (state.day >= 2 && Math.random() > 0.5) addon = 'leverage';
        if (state.day >= 3 && Math.random() > 0.5 && !addon) addon = 'hedge';
        
        order.push({ asset, addon });
    }
    
    state.customers.push({ id: Math.random(), patience: 1.0, order: order, maxWait: Math.max(15, 30 - (state.day * 2)) });
}

function handleClick(e) {
    if (!state.isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    if (isInside(x, y, state.zones.btnBond)) addRawToGrill(ITEMS.BOND);
    else if (isInside(x, y, state.zones.btnStock)) addRawToGrill(ITEMS.STOCK);
    else if (isInside(x, y, state.zones.btnFolder)) addFolderToPlate();
    else if (state.day >= 2 && isInside(x, y, state.zones.btnLeverage)) applyAddon('leverage');
    else if (state.day >= 3 && isInside(x, y, state.zones.btnHedge)) applyAddon('hedge');
    else if (isInside(x, y, state.zones.trash)) { /* Optional: empty held item */ }
    
    for (let i = 0; i < 4; i++) {
        if (isInside(x, y, getGrillSlotRect(i))) handleGrillClick(i);
        if (isInside(x, y, getPlateRect(i))) handlePlateClick(i);
    }
}

canvas.addEventListener('mousedown', handleClick);
canvas.addEventListener('touchstart', (e) => { 
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') e.preventDefault(); 
    handleClick(e); 
}, {passive: false});

function isInside(x, y, rect) { return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h; }

function getGrillSlotRect(i) {
    const z = state.zones.grillArea;
    const w = 70, h = 90;
    const spacing = (z.w - (4 * w)) / 5;
    return { x: z.x + spacing + (i * (w + spacing)), y: z.y + z.h/2 - h/2, w, h };
}

function getPlateRect(i) {
    const z = state.zones.prepArea;
    const w = 90, h = 70;
    const startX = (canvas.width / 2) - (2 * w) - 20;
    return { x: startX + (i * (w + 15)), y: z.y + 10, w, h };
}

function addRawToGrill(itemDef) {
    const idx = state.grill.findIndex(slot => slot === null);
    if (idx !== -1) {
        state.grill[idx] = { type: itemDef.id, timeCooked: 0, state: 'cooking', def: itemDef };
        if (navigator.vibrate) navigator.vibrate(10);
    }
}

function addFolderToPlate() {
    const idx = state.plates.findIndex(p => p === null);
    if (idx !== -1) {
        state.plates[idx] = { asset: null, addon: null }; // Plate state
        if (navigator.vibrate) navigator.vibrate(10);
    }
}

function handleGrillClick(i) {
    const slot = state.grill[i];
    if (!slot) return;
    if (slot.state === 'burned') {
        state.grill[i] = null;
        spawnText(getGrillSlotRect(i).x + 35, getGrillSlotRect(i).y, "LIQUIDATED", "#FB7185");
        return;
    }
    if (slot.state === 'cooked') {
        // Find empty folder
        const pIdx = state.plates.findIndex(p => p !== null && p.asset === null);
        if (pIdx !== -1) {
            state.plates[pIdx].asset = slot.type;
            state.grill[i] = null;
            if (navigator.vibrate) navigator.vibrate(10);
        } else {
            spawnText(getGrillSlotRect(i).x + 35, getGrillSlotRect(i).y - 20, "NEED PORTFOLIO", "#FB7185");
        }
    }
}

function applyAddon(addonType) {
    // Find plate with asset but no addon
    const pIdx = state.plates.findIndex(p => p !== null && p.asset !== null && p.addon === null);
    if (pIdx !== -1) {
        state.plates[pIdx].addon = addonType;
        if (navigator.vibrate) navigator.vibrate(10);
    }
}

function handlePlateClick(i) {
    const plate = state.plates[i];
    if (!plate || plate.asset === null) return;
    
    let served = false;
    for (let c of state.customers) {
        // Find exact match in customer order
        const needIdx = c.order.findIndex(item => item.asset === plate.asset && item.addon === plate.addon);
        if (needIdx !== -1) {
            c.order.splice(needIdx, 1);
            
            // Calculate price
            const basePrice = ITEMS[plate.asset.toUpperCase()].price;
            const addonPrice = plate.addon ? ITEMS[plate.addon.toUpperCase()].price : 0;
            const total = basePrice + addonPrice;
            
            state.cash += total;
            spawnText(canvas.width/2, canvas.height/4, `+$${total}`);
            state.plates[i] = null;
            served = true;
            if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
            
            if (c.order.length === 0) {
                const tip = Math.floor(c.patience * 20);
                if (tip > 0) {
                    state.cash += tip;
                    spawnText(canvas.width/2 + 60, canvas.height/4 - 20, `+$${tip} YIELD`, "#FBBF24");
                }
                state.customers = state.customers.filter(cust => cust.id !== c.id);
            }
            break;
        }
    }
    
    if (!served) {
        state.plates[i] = null; // Trash mistake
        spawnText(getPlateRect(i).x + 45, getPlateRect(i).y, "TRASHED", "#FB7185");
    }
}

function update(dt) {
    state.time -= dt;
    if (state.time <= 0) { endDay(); return; }
    
    state.grill.forEach((slot, i) => {
        if (slot) {
            slot.timeCooked += dt;
            if (slot.state === 'cooking' && slot.timeCooked >= slot.def.cookTime) slot.state = 'cooked';
            else if (slot.state === 'cooked' && slot.timeCooked >= slot.def.burnTime) slot.state = 'burned';
        }
    });
    
    state.customers.forEach(c => { c.patience -= dt / c.maxWait; });
    const beforeLen = state.customers.length;
    state.customers = state.customers.filter(c => c.patience > 0);
    if (state.customers.length < beforeLen) {
        spawnText(canvas.width/2, 120, "CLIENT CHURN!", "#FB7185");
        if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
    }
    
    if (Math.random() < 0.012 * (1 + (90 - state.time)/45)) spawnCustomer();
    
    state.popTexts.forEach(p => p.life -= dt * 1.5);
    state.popTexts = state.popTexts.filter(p => p.life > 0);
    
    dayEl.textContent = state.day;
    scoreEl.textContent = `$${state.cash} / $${state.targetCash}`;
    scoreEl.style.color = state.cash >= state.targetCash ? 'var(--mb-green)' : 'var(--mb-white)';
    
    const min = Math.floor(Math.max(0, state.time) / 60);
    const sec = Math.floor(Math.max(0, state.time) % 60);
    timeEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// === PREMIUM RENDERING ===

function drawRoundRect(x, y, w, h, r, fill, stroke, shadowColor, shadowBlur) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if(shadowBlur) { ctx.shadowColor = shadowColor; ctx.shadowBlur = shadowBlur; }
    if(fill) { ctx.fillStyle = fill; ctx.fill(); }
    if(shadowBlur) { ctx.shadowBlur = 0; }
    if(stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

function drawTerminalButton(rect, accent, title, sub) {
    drawRoundRect(rect.x, rect.y, rect.w, rect.h, 12, 'rgba(10, 20, 35, 0.9)', `rgba(${hexToRgb(accent)}, 0.4)`, accent, 10);
    const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    grad.addColorStop(0, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    drawRoundRect(rect.x+2, rect.y+2, rect.w-4, rect.h-4, 10, grad);
    
    ctx.fillStyle = accent;
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(title, rect.x + rect.w/2, rect.y + rect.h/2 - 5);
    
    ctx.fillStyle = '#AAB8C8';
    ctx.font = '600 9px "Inter", sans-serif';
    ctx.fillText(sub, rect.x + rect.w/2, rect.y + rect.h - 12);
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

function drawEmoji(x, y, emoji, size) {
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.fillText(emoji, x, y);
    ctx.shadowBlur = 0;
}

function drawAssetCard(x, y, w, h, slot) {
    const isCooked = slot.state === 'cooked';
    const isBurned = slot.state === 'burned';
    
    ctx.save(); ctx.translate(x, y);
    if (isBurned) {
        drawRoundRect(-w/2, -h/2, w, h, 6, '#1A1A1A', '#FF4B4B', '#FF4B4B', 20);
        drawEmoji(0, 0, '🔥', 36);
        ctx.restore(); return;
    }
    
    const color = isCooked ? slot.def.cookColor : slot.def.typeColor;
    const grad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
    grad.addColorStop(0, color);
    grad.addColorStop(1, '#050A12');
    
    drawRoundRect(-w/2, -h/2, w, h, 8, grad, color, color, isCooked ? 20 : 0);
    drawEmoji(0, 0, isCooked ? slot.def.cooked : slot.def.emoji, 36);
    
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(-w/2 + 8, h/2 - 15, w - 16, 4);
    ctx.fillStyle = color;
    ctx.fillRect(-w/2 + 8, h/2 - 15, (w - 16) * (slot.timeCooked / slot.def.cookTime), 4);
    ctx.restore();
}

function drawPortfolioFolder(x, y, w, h, assetType, addonType) {
    ctx.save(); ctx.translate(x, y);
    
    // Base Folder Fallback
    drawRoundRect(-w/2, -h/2, w, h, 6, 'rgba(10, 24, 42, 0.9)', '#38BDF8', '#38BDF8', 10);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.1)'; ctx.fill();
    ctx.beginPath(); ctx.roundRect(-w/2, -h/2 - 6, w*0.4, 10, 4); ctx.fill(); ctx.stroke();
    
    if (assetType) {
        const def = ITEMS[assetType.toUpperCase()];
        drawEmoji(0, 0, def.cooked, 20);
        
        // Addon splash (Condiment)
        if (addonType) {
            const addDef = ITEMS[addonType.toUpperCase()];
            ctx.fillStyle = addDef.typeColor;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.ellipse(w/4, -h/4, 15, 8, Math.PI/4, 0, Math.PI*2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            drawEmoji(w/4, -h/4, addDef.emoji, 16);
        }
    } else {
        ctx.fillStyle = '#AAB8C8';
        ctx.font = '600 10px "Inter", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('EMPTY', 0, 0);
    }
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.frames++;
    
    // Background
    const bgGrad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
    bgGrad.addColorStop(0, '#0F1E36');
    bgGrad.addColorStop(1, '#050A12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // Grid & Divider
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.03)'; ctx.lineWidth = 1;
    const offset = (state.frames * 0.5) % 40;
    for(let i=0; i<canvas.width; i+=40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for(let i=offset; i<canvas.height; i+=40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.2)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, state.zones.customers.h); ctx.lineTo(canvas.width, state.zones.customers.h); ctx.stroke();
    
    // Yield Engine (Grill)
    const gz = state.zones.grillArea;
    drawRoundRect(gz.x, gz.y, gz.w, gz.h, 24, 'rgba(5, 10, 18, 0.8)', 'rgba(0, 230, 118, 0.4)', '#00E676', 20);
    ctx.fillStyle = 'rgba(0, 230, 118, 0.6)'; ctx.font = '900 14px "Inter", sans-serif';
    ctx.textAlign = 'center'; ctx.fillText("YIELD ENGINE v3.0", gz.x + gz.w/2, gz.y - 12);
    
    // Left Buttons (Raw & Folder)
    drawTerminalButton(state.zones.btnBond, ITEMS.BOND.typeColor, "📄", "BOND");
    drawTerminalButton(state.zones.btnStock, ITEMS.STOCK.typeColor, "🏢", "STOCK");
    drawTerminalButton(state.zones.btnFolder, ITEMS.FOLDER.typeColor, "📁", "PORTFOLIO");
    
    // Right Buttons (Addons)
    if (state.day >= 2) drawTerminalButton(state.zones.btnLeverage, ITEMS.LEVERAGE.typeColor, "🌶️", "LEVERAGE");
    if (state.day >= 3) drawTerminalButton(state.zones.btnHedge, ITEMS.HEDGE.typeColor, "🛡️", "HEDGE");
    drawTerminalButton(state.zones.trash, '#FB7185', "🗑️", "TRASH");

    // Grill Slots
    state.grill.forEach((slot, i) => {
        const r = getGrillSlotRect(i);
        drawRoundRect(r.x, r.y, r.w, r.h, 12, 'rgba(0,0,0,0.6)', 'rgba(255,255,255,0.1)');
        if (slot) {
            drawAssetCard(r.x + r.w/2, r.y + r.h/2, r.w - 16, r.h - 16, slot);
            if (slot.state === 'cooked') {
                const burnPct = (slot.timeCooked - slot.def.cookTime) / (slot.def.burnTime - slot.def.cookTime);
                ctx.fillStyle = `rgba(251, 113, 133, ${burnPct * 0.5})`;
                ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 12); ctx.fill();
            }
        }
    });
    
    // Plates (Assembly Pads)
    state.plates.forEach((plate, i) => {
        const r = getPlateRect(i);
        ctx.fillStyle = 'rgba(0, 230, 118, 0.05)'; ctx.strokeStyle = 'rgba(0, 230, 118, 0.3)';
        ctx.beginPath(); ctx.ellipse(r.x + r.w/2, r.y + r.h/2 + 20, r.w/2, r.h/4, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        
        if (plate) {
            drawPortfolioFolder(r.x + r.w/2, r.y + r.h/2, r.w - 20, r.h - 10, plate.asset, plate.addon);
        }
    });
    
    // Customers (Order Tickets)
    const cw = canvas.width / 3;
    const avatars = ['🤖', '👾', '👽', '🤑', '🧐'];
    state.customers.forEach((c, i) => {
        const cx = i * cw + (cw/2);
        const cy = state.zones.customers.h - 80;
        const tickW = 140; const tickH = 100;
        
        ctx.save(); ctx.translate(cx, cy);
        
        // Avatar Header
        const av = avatars[Math.floor(c.id * avatars.length)];
        drawEmoji(0, -tickH/2 - 20, av, 40);
        
        drawRoundRect(-tickW/2, -tickH/2, tickW, tickH, 16, 'rgba(10, 24, 42, 0.85)', 'rgba(255,255,255,0.15)', 'rgba(0,0,0,0.5)', 20);
        
        // Patience Bar
        const patColor = c.patience > 0.5 ? '#00E676' : (c.patience > 0.25 ? '#FBBF24' : '#FB7185');
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-tickW/2, -tickH/2 + 10, tickW, 6);
        ctx.fillStyle = patColor; ctx.shadowBlur = 10; ctx.shadowColor = patColor;
        ctx.fillRect(-tickW/2, -tickH/2 + 10, tickW * c.patience, 6); ctx.shadowBlur = 0;
        
        // Order Items inside ticket
        const startX = -(c.order.length * 40) / 2 + 20;
        c.order.forEach((item, idx) => {
            drawPortfolioFolder(startX + (idx * 40), 20, 30, 24, item.asset, item.addon);
        });
        
        ctx.restore();
    });
    
    // Particles
    state.popTexts.forEach(p => {
        ctx.fillStyle = p.color; ctx.font = '900 28px "Inter", sans-serif';
        ctx.textAlign = 'center'; ctx.shadowBlur = 15; ctx.shadowColor = p.color;
        ctx.globalAlpha = p.life; ctx.fillText(p.text, p.x, p.y - (1-p.life)*40);
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
    });
}

function gameLoop(now) {
    if (!state.isPlaying) return;
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    update(dt);
    if(state.isPlaying) draw();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    resize();
    state = {
        isPlaying: true, day: 1, cash: 0, targetCash: 150, time: 90, lastTick: performance.now(), frames: 0,
        zones: state.zones, grill: [null, null, null, null], plates: [null, null, null, null],
        customers: [], popTexts: []
    };
    modal.classList.remove('active');
    spawnCustomer();
    requestAnimationFrame(gameLoop);
}

function startNextDay() {
    state.day++;
    state.cash = 0;
    state.targetCash = state.day * 150;
    state.time = 90;
    state.grill = [null, null, null, null];
    state.plates = [null, null, null, null];
    state.customers = [];
    state.popTexts = [];
    state.isPlaying = true;
    state.lastTick = performance.now();
    modal.classList.remove('active');
    spawnCustomer();
    requestAnimationFrame(gameLoop);
}

function endDay() {
    state.isPlaying = false;
    modal.classList.add('active');
    
    if (state.cash >= state.targetCash) {
        modalTitle.textContent = "Day Cleared!";
        modalTitle.style.color = "var(--mb-green)";
        
        let unlockText = "";
        if (state.day === 1) unlockText = "<br><br><b>Unlocked: LEVERAGE (🌶️)</b><br>Squeeze it onto a finished portfolio to boost yield!";
        if (state.day === 2) unlockText = "<br><br><b>Unlocked: HEDGE (🛡️)</b><br>Insure a portfolio to protect against downside!";
        
        modalDesc.innerHTML = `You made <b>$${state.cash}</b> and beat the target of $${state.targetCash}! You're moving up in the financial world.${unlockText}`;
        modalBtn.textContent = `START DAY ${state.day + 1}`;
        modalBtn.onclick = startNextDay;
    } else {
        modalTitle.textContent = "Bankrupt!";
        modalTitle.style.color = "var(--mb-red)";
        modalDesc.innerHTML = `You only made <b>$${state.cash}</b> out of $${state.targetCash}. The SEC shut down your operation.`;
        modalBtn.textContent = "START OVER";
        modalBtn.onclick = startGame;
    }
}

modalBtn.addEventListener('click', startGame);
modalBtn.addEventListener('touchstart', (e) => { e.preventDefault(); modalBtn.click(); }, {passive: false});

resize(); draw();