const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-display');
const timeEl = document.getElementById('time-display');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalBtn = document.getElementById('modal-btn');
const particlesEl = document.getElementById('particles');

// Game State
let state = {
    isPlaying: false,
    cash: 0,
    time: 120, // 2 minutes
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
    RAW_TBILL: { id: 'tbill', name: 'Bond', typeColor: '#69F0AE', cookColor: '#00E676', cookTime: 3, burnTime: 8, price: 20 },
    RAW_CHIP: { id: 'chip', name: 'Stock', typeColor: '#FCD34D', cookColor: '#F59E0B', cookTime: 5, burnTime: 12, price: 50 },
    FOLDER: { id: 'folder', name: 'Portfolio', typeColor: '#38BDF8' }
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
        btnTBill: { x: 20, y: h * 0.4, w: 90, h: 70 },
        btnChip: { x: 20, y: h * 0.55, w: 90, h: 70 },
        btnFolder: { x: 20, y: h * 0.75, w: 90, h: 70 },
        trash: { x: w - 110, y: h * 0.75, w: 90, h: 70 },
    };
}

function spawnText(x, y, text, color = '#00E676') {
    state.popTexts.push({ x, y, text, color, life: 1.0 });
}

function spawnCustomer() {
    if (state.customers.length >= 3) return;
    const numItems = Math.floor(Math.random() * 2) + 1;
    const order = [];
    for(let i=0; i<numItems; i++) { order.push(Math.random() > 0.4 ? 'tbill' : 'chip'); }
    state.customers.push({ id: Math.random(), patience: 1.0, order: order, maxWait: 25 + (Math.random() * 15) });
}

function handleClick(e) {
    if (!state.isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    if (isInside(x, y, state.zones.btnTBill)) addRawToGrill(ITEMS.RAW_TBILL);
    else if (isInside(x, y, state.zones.btnChip)) addRawToGrill(ITEMS.RAW_CHIP);
    else if (isInside(x, y, state.zones.btnFolder)) addFolderToPlate();
    else if (isInside(x, y, state.zones.trash)) { /* Trash tapped, maybe clear held item in future */ }
    
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
    return { x: startX + (i * (w + 15)), y: z.y + 20, w, h };
}

function addRawToGrill(itemDef) {
    const idx = state.grill.findIndex(slot => slot === null);
    if (idx !== -1) {
        state.grill[idx] = { type: itemDef.id, timeCooked: 0, state: 'cooking', def: itemDef };
        if (navigator.vibrate) navigator.vibrate(15);
    }
}

function addFolderToPlate() {
    const idx = state.plates.findIndex(p => p === null);
    if (idx !== -1) {
        state.plates[idx] = { state: 'empty_folder' };
        if (navigator.vibrate) navigator.vibrate(15);
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
        const pIdx = state.plates.findIndex(p => p !== null && p.state === 'empty_folder');
        if (pIdx !== -1) {
            state.plates[pIdx] = { state: 'filled', type: slot.type, def: slot.def };
            state.grill[i] = null;
            if (navigator.vibrate) navigator.vibrate(15);
        } else {
            spawnText(getGrillSlotRect(i).x + 35, getGrillSlotRect(i).y - 20, "NEED PORTFOLIO", "#FB7185");
        }
    }
}

function handlePlateClick(i) {
    const plate = state.plates[i];
    if (!plate) return;
    if (plate.state === 'filled') {
        let served = false;
        for (let c of state.customers) {
            const needIdx = c.order.indexOf(plate.type);
            if (needIdx !== -1) {
                c.order.splice(needIdx, 1);
                state.cash += plate.def.price;
                spawnText(canvas.width/2, canvas.height/4, `+$${plate.def.price}`);
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
            state.plates[i] = null;
            spawnText(getPlateRect(i).x + 45, getPlateRect(i).y, "TRASHED", "#FB7185");
        }
    }
}

function update(dt) {
    state.time -= dt;
    if (state.time <= 0) { gameOver(); return; }
    
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
    
    if (Math.random() < 0.012 * (1 + (120 - state.time)/60)) spawnCustomer();
    
    state.popTexts.forEach(p => p.life -= dt * 1.5);
    state.popTexts = state.popTexts.filter(p => p.life > 0);
    
    scoreEl.textContent = '$' + state.cash;
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
    // Outer glow
    drawRoundRect(rect.x, rect.y, rect.w, rect.h, 16, 'rgba(10, 20, 35, 0.9)', `rgba(${hexToRgb(accent)}, 0.4)`, accent, 15);
    // Inner styling
    const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    grad.addColorStop(0, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    drawRoundRect(rect.x+2, rect.y+2, rect.w-4, rect.h-4, 14, grad);
    
    ctx.fillStyle = accent;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(title, rect.x + rect.w/2, rect.y + rect.h/2 - 8);
    
    ctx.fillStyle = '#AAB8C8';
    ctx.font = '600 10px "Inter", sans-serif';
    ctx.fillText(sub, rect.x + rect.w/2, rect.y + rect.h - 18);
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

function drawAssetCard(x, y, w, h, slot) {
    const isCooked = slot.state === 'cooked';
    const isBurned = slot.state === 'burned';
    
    ctx.save(); ctx.translate(x, y);
    if (isBurned) {
        drawRoundRect(-w/2, -h/2, w, h, 6, '#1A1A1A', '#FF4B4B', '#FF4B4B', 20);
        ctx.fillStyle = '#FF4B4B'; ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('CRASH', 0, 0);
        ctx.restore(); return;
    }
    
    const color = isCooked ? slot.def.cookColor : slot.def.typeColor;
    const grad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
    grad.addColorStop(0, color);
    grad.addColorStop(1, '#050A12');
    
    drawRoundRect(-w/2, -h/2, w, h, 8, grad, color, color, isCooked ? 20 : 0);
    
    // Tech lines inside card
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 10px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(slot.def.name.toUpperCase(), -w/2 + 8, -h/2 + 16);
    
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(-w/2 + 8, h/2 - 15, w - 16, 4);
    ctx.fillStyle = color;
    ctx.fillRect(-w/2 + 8, h/2 - 15, (w - 16) * (slot.timeCooked / slot.def.cookTime), 4);
    ctx.restore();
}

function drawPortfolioFolder(x, y, w, h, slotType) {
    ctx.save(); ctx.translate(x, y);
    // Base Folder
    drawRoundRect(-w/2, -h/2, w, h, 6, 'rgba(10, 24, 42, 0.9)', '#38BDF8', '#38BDF8', 10);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.fill();
    
    // Top tab
    ctx.beginPath(); ctx.roundRect(-w/2, -h/2 - 6, w*0.4, 10, 4); ctx.fill(); ctx.stroke();
    
    if (slotType) {
        const def = Object.values(ITEMS).find(d => d.id === slotType);
        ctx.fillStyle = def.cookColor;
        ctx.font = 'bold 12px "Inter", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10; ctx.shadowColor = def.cookColor;
        ctx.fillText(def.name, 0, 0);
        ctx.shadowBlur = 0;
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
    
    // Subtle Grid
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.03)';
    ctx.lineWidth = 1;
    const offset = (state.frames * 0.5) % 40;
    for(let i=0; i<canvas.width; i+=40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for(let i=offset; i<canvas.height; i+=40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
    
    // Divider Lines
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, state.zones.customers.h); ctx.lineTo(canvas.width, state.zones.customers.h); ctx.stroke();
    
    // Draw Yield Engine
    const gz = state.zones.grillArea;
    drawRoundRect(gz.x, gz.y, gz.w, gz.h, 24, 'rgba(5, 10, 18, 0.8)', 'rgba(0, 230, 118, 0.4)', '#00E676', 20);
    ctx.fillStyle = 'rgba(0, 230, 118, 0.6)';
    ctx.font = '900 14px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("COMPOUND ENGINE V3", gz.x + gz.w/2, gz.y - 12);
    
    // Buttons
    drawTerminalButton(state.zones.btnTBill, ITEMS.RAW_TBILL.typeColor, "BND", "BUY BOND");
    drawTerminalButton(state.zones.btnChip, ITEMS.RAW_CHIP.typeColor, "STK", "BUY STOCK");
    drawTerminalButton(state.zones.btnFolder, ITEMS.FOLDER.typeColor, "PRT", "PORTFOLIO");
    drawTerminalButton(state.zones.trash, '#FB7185', "LIQ", "LIQUIDATE");

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
        // Draw holographic pad
        ctx.fillStyle = 'rgba(0, 230, 118, 0.05)';
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.3)';
        ctx.beginPath(); ctx.ellipse(r.x + r.w/2, r.y + r.h/2 + 20, r.w/2, r.h/4, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        
        if (plate) {
            if (plate.state === 'empty_folder') drawPortfolioFolder(r.x + r.w/2, r.y + r.h/2, r.w - 20, r.h - 10, null);
            else if (plate.state === 'filled') drawPortfolioFolder(r.x + r.w/2, r.y + r.h/2, r.w - 20, r.h - 10, plate.type);
        }
    });
    
    // Customers (Order Tickets)
    const cw = canvas.width / 3;
    state.customers.forEach((c, i) => {
        const cx = i * cw + (cw/2);
        const cy = state.zones.customers.h - 80;
        
        const tickW = 140;
        const tickH = 100;
        
        // Ticket Background
        ctx.save(); ctx.translate(cx, cy);
        drawRoundRect(-tickW/2, -tickH/2, tickW, tickH, 16, 'rgba(10, 24, 42, 0.85)', 'rgba(255,255,255,0.15)', 'rgba(0,0,0,0.5)', 20);
        
        // Header
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.roundRect(-tickW/2, -tickH/2, tickW, 30, {tl: 16, tr: 16, bl: 0, br: 0}); ctx.fill();
        ctx.fillStyle = '#AAB8C8';
        ctx.font = 'bold 11px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`ORDER #${Math.floor(c.id*1000)}`, 0, -tickH/2 + 15);
        
        // Patience Bar
        const patColor = c.patience > 0.5 ? '#00E676' : (c.patience > 0.25 ? '#FBBF24' : '#FB7185');
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-tickW/2, -tickH/2 + 30, tickW, 4);
        ctx.fillStyle = patColor;
        ctx.shadowBlur = 10; ctx.shadowColor = patColor;
        ctx.fillRect(-tickW/2, -tickH/2 + 30, tickW * c.patience, 4);
        ctx.shadowBlur = 0;
        
        // Order Items inside ticket
        const startX = -(c.order.length * 40) / 2 + 20;
        c.order.forEach((type, idx) => {
            const ix = startX + (idx * 40);
            const def = Object.values(ITEMS).find(d => d.id === type);
            drawPortfolioFolder(ix, 15, 30, 24, type);
        });
        
        ctx.restore();
    });
    
    // Particles
    state.popTexts.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.font = '900 28px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15; ctx.shadowColor = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillText(p.text, p.x, p.y - (1-p.life)*40);
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
        isPlaying: true, cash: 0, time: 120, lastTick: performance.now(), frames: 0,
        zones: state.zones, grill: [null, null, null, null], plates: [null, null, null, null],
        customers: [], popTexts: []
    };
    modal.classList.remove('active');
    spawnCustomer();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    state.isPlaying = false;
    modal.classList.add('active');
    modalTitle.textContent = "Market Closed!";
    modalTitle.style.color = "var(--mb-white)";
    modalDesc.innerHTML = `Great shift! You generated <b>$${state.cash}</b> in yield today.`;
    modalBtn.textContent = "PLAY AGAIN";
}

modalBtn.addEventListener('click', startGame);
modalBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); }, {passive: false});

resize(); draw();