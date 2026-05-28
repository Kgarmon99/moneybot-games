const { execSync } = require('child_process');
const fs = require('fs');

async function deployToGlitch() {
    try {
        console.log("Preparing deployment for Glitch...");
        // Ensure glitch configuration exists
        const glitchJson = {
            "install": "npm install",
            "start": "node server.js"
        };
        fs.writeFileSync('glitch.json', JSON.stringify(glitchJson, null, 2));
        
        console.log("Please deploy manually or provide an API token.");
    } catch (e) {
        console.log("Error:", e.message);
    }
}
deployToGlitch();