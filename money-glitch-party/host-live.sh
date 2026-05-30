#!/bin/bash
echo "🚀 Booting Money Glitch Party Backend..."

# Start the node server in the background
node server.js &
NODE_PID=$!

echo "🌐 Starting Localtunnel on port 3000..."
# Start localtunnel and extract the URL
npx localtunnel --port 3000 > tunnel.log &
TUNNEL_PID=$!

sleep 3
TUNNEL_URL=$(grep -o "https://.*" tunnel.log | head -n 1)

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Failed to start localtunnel. Ensure npm is installed."
    kill $NODE_PID
    kill $TUNNEL_PID
    exit 1
fi

echo ""
echo "================================================="
echo "✅ MONEY GLITCH PARTY IS LIVE!"
echo "================================================="
echo "🔗 Host Screen (Click to open):"
echo "$TUNNEL_URL/host.html?server=$TUNNEL_URL"
echo ""
echo "📱 Players join at:"
echo "$TUNNEL_URL/player.html?server=$TUNNEL_URL"
echo "================================================="
echo "(Press Ctrl+C to stop the server)"

# Wait for Ctrl+C to kill everything
trap "kill $NODE_PID $TUNNEL_PID; rm tunnel.log; exit" INT TERM
wait $NODE_PID
