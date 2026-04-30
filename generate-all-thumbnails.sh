#!/bin/bash
# Generate unique thumbnails for all 73 MoneyBot games
# Run this script to create all game thumbnails

GAMES_DIR="$(cd "$(dirname "$0")" && pwd)"
THUMB_DIR="$GAMES_DIR/assets/thumbnails"
SCRIPT_DIR="/Users/kahlilgarmon/MoneyBotClaw-1/scripts"

mkdir -p "$THUMB_DIR"

# Function to generate a thumbnail
generate_thumb() {
    local game_dir=$1
    local game_name=$2
    local prompt=$3
    local output_file="$THUMB_DIR/${game_dir}.png"
    
    # Skip if already exists
    if [ -f "$output_file" ]; then
        echo "✓ $game_name (already exists)"
        return
    fi
    
    echo "Generating: $game_name..."
    
    # Generate the thumbnail
    if bash "$SCRIPT_DIR/create-image.sh" --prompt "$prompt" --resolution 1K --no-send-telegram 2>&1 | grep -q "SAVED_IMAGE_PATH:"; then
        # Find the generated file and copy it
        latest_file=$(ls -t /Users/kahlilgarmon/.openclaw/media/generated/*.png 2>/dev/null | head -1)
        if [ -n "$latest_file" ]; then
            cp "$latest_file" "$output_file"
            echo "  ✓ Saved to $output_file"
        fi
    else
        echo "  ✗ Failed to generate"
    fi
}

echo "=========================================="
echo "MoneyBot Games Thumbnail Generator"
echo "=========================================="
echo ""

# Generate thumbnails for each unique game
generate_thumb "bot-achievement-hunt" "Achievement Hunt" "A vibrant mobile game thumbnail showing a golden trophy with stars and confetti, achievement celebration theme, green money theme (#22C55E), clean modern app icon style, square format, bright colors, professional game art"

generate_thumb "bot-asset-allocator" "Asset Allocator" "A colorful pie chart split into sections with coins and money symbols, investment portfolio visualization, green (#22C55E) and gold colors, clean modern game icon style, square format, professional app icon"

generate_thumb "bot-bill-splitter" "Bill Splitter" "Scissors cutting through a bill or receipt with coins, money splitting concept, green (#22C55E) cash theme, clean mobile game icon design, square format, professional art"

generate_thumb "bot-budget-blaster" "Budget Blaster" "A laser blaster shooting at falling coins and expenses, arcade game style, green (#22C55E) money theme, action packed game icon, square format, retro-futuristic art"

generate_thumb "bot-budget-breakout" "Budget Breakout" "Brick breaker game style with money bricks and a glowing ball, retro arcade aesthetic, green (#22C55E) and gold colors, classic game icon, square format"

generate_thumb "bot-budget-duel" "Budget Duel" "Two crossed swords with coins and budget symbols clashing, competitive money game, green (#22C55E) theme, epic game icon style, square format, dynamic action art"

generate_thumb "bot-budget-hero" "Budget Hero" "A superhero character with a flowing cape made of dollar bills, flying through the sky, budget hero concept, green (#22C55E) theme, comic book game icon, square format"

generate_thumb "bot-budget-planner" "Budget Planner" "A calendar with coins and checkmarks, planning and scheduling concept, green (#22C55E) money theme, clean app icon style, square format, organized professional look"

generate_thumb "bot-budget-slice" "Budget Slice" "A sharp knife slicing through a pie chart made of money and coins, budget division concept, green (#22C55E) theme, satisfying game icon, square format"

generate_thumb "bot-bull-bear-battle" "Bull Bear Battle" "A fierce bull and bear facing each other with stock market graphs between them, market battle concept, green and red colors, epic versus game icon, square format"

generate_thumb "bot-business-tycoon" "Business Tycoon" "A skyscraper made of stacked money with a golden crown on top, business empire concept, green (#22C55E) and gold, tycoon game style icon, square format"

generate_thumb "bot-car-buyer" "Car Buyer" "A shiny new car with dollar signs and price tags floating around it, car shopping concept, green (#22C55E) money theme, clean game icon, square format"

generate_thumb "bot-career-climber" "Career Climber" "A ladder leading up to coins and money bags at the top, career progression concept, green (#22C55E) theme, motivational game icon, square format"

generate_thumb "bot-cash-craze" "Cash Craze" "Exploding coins and cash in a frenzy with sparkles, chaotic money celebration, green (#22C55E) and gold sparkles, exciting dynamic game icon, square format"

generate_thumb "bot-cash-dash" "Cash Dash" "A running figure made of money with speed lines behind, fast cash concept, green (#22C55E) theme, dynamic motion game icon, square format"

generate_thumb "bot-cash-jump" "Cash Jump" "A kangaroo or jumping character leaping over obstacles with money, platformer game style, green (#22C55E) theme, playful game icon, square format"

generate_thumb "bot-cash-swipe" "Cash Swipe" "A finger swiping through stacks of cash and coins, mobile swipe gesture, green (#22C55E) money theme, clean app icon style, square format"

generate_thumb "bot-coin-fall" "Coin Fall" "Golden coins falling like autumn leaves from the sky, money rain concept, golden coins on green (#22C55E) background, peaceful game icon, square format"

generate_thumb "bot-coin-hoarder" "Coin Hoarder" "A treasure chest overflowing with gold coins and gems, pirate treasure theme, rich golden colors with green (#22C55E) accents, game icon, square format"

generate_thumb "bot-coin-merge" "Coin Merge" "Coins merging together into bigger golden coins, 2048-style merging game, golden coins on green (#22C55E), satisfying game icon, square format"

generate_thumb "bot-coin-pong" "Coin Pong" "A ping pong table with golden coins as the ball, retro arcade style, green (#22C55E) table theme, classic game icon, square format"

generate_thumb "bot-coin-rush" "Coin Rush" "A running character collecting scattered coins in a rush, endless runner style, green (#22C55E) and gold, action game icon, square format"

generate_thumb "bot-college-fund" "College Fund" "A graduation cap with coins falling into it like a piggy bank, education savings concept, green (#22C55E) and gold, academic game icon, square format"

generate_thumb "bot-compound-champion" "Compound Champion" "A golden trophy with compounding interest graph arrows spiraling upward, winner concept, green (#22C55E) and gold, champion game icon, square format"

generate_thumb "bot-crypto-climb" "Crypto Climb" "A mountain climber scaling a chart going to the moon, cryptocurrency theme, green (#22C55E) upward trend, adventure game icon, square format"

generate_thumb "bot-debt-crusher" "Debt Crusher" "A powerful hammer smashing debt chains and bills, debt freedom concept, strong green (#22C55E) theme, satisfying game icon, square format"

generate_thumb "bot-debt-destroyer" "Debt Destroyer" "Exploding debt bombs being destroyed with sparks, action packed, green (#22C55E) victory theme, explosive dynamic game icon, square format"

generate_thumb "bot-diversification-drop" "Diversification Drop" "Different colored coins falling into separate baskets, diversification concept, colorful with green (#22C55E), puzzle game icon, square format"

generate_thumb "bot-dividend-defense" "Dividend Defense" "A shield protecting money bags with dividend arrows, tower defense style, green (#22C55E) theme, strategy game icon, square format"

generate_thumb "bot-dividend-hunter" "Dividend Hunter" "A hunter aiming at dividend targets with a bow and arrow, hunting theme, green (#22C55E) and gold, target game icon, square format"

generate_thumb "bot-dollar-drop" "Dollar Drop" "Dollar bills falling from above into a collection basket, money rain, green (#22C55E) theme, casual game icon, square format"

generate_thumb "bot-emergency-fund" "Emergency Fund" "An emergency kit or safe with money inside, preparedness concept, green (#22C55E) with alert elements, safety game icon, square format"

generate_thumb "bot-expense-tracker" "Expense Tracker" "A magnifying glass over expense receipts and charts, detective tracking theme, green (#22C55E), analytical game icon, square format"

generate_thumb "bot-family-planner" "Family Planner" "A family silhouette with a house and money tree, family finance concept, warm green (#22C55E) theme, wholesome game icon, square format"

generate_thumb "bot-first-home" "First Home" "A house with a key and coins, first home purchase concept, green (#22C55E) and warm colors, dream home game icon, square format"

generate_thumb "bot-fiscal-frogger" "Fiscal Frogger" "A frog jumping across logs made of dollar bills, frogger style game, green (#22C55E) theme, retro game icon, square format"

generate_thumb "bot-flappy-cash" "Flappy Cash" "A bird made of money flying through pipes, flappy bird style, green (#22C55E) and gold, addictive game icon, square format"

generate_thumb "bot-goal-tracker" "Goal Tracker" "A target with an arrow hitting bullseye and coins bursting out, goal achievement, green (#22C55E) and gold, focused game icon, square format"

generate_thumb "bot-grocery-guru" "Grocery Guru" "A shopping cart full of groceries with price tags and coins, supermarket theme, green (#22C55E) savings theme, shopping game icon, square format"

generate_thumb "bot-insurance-master" "Insurance Master" "An umbrella shielding money from rain, insurance protection concept, green (#22C55E) and blue, protective game icon, square format"

generate_thumb "bot-invest-island" "Invest Island" "A tropical island with palm trees made of money, vacation investment theme, green (#22C55E) and blue, relaxing game icon, square format"

generate_thumb "bot-invest-showdown" "Invest Showdown" "Two investors facing off with stock charts between them, competitive investing, green (#22C55E) theme, versus game icon, square format"

generate_thumb "bot-ipo-launch" "IPO Launch" "A rocket launching with dollar signs as smoke, IPO success concept, green (#22C55E) and gold, startup game icon, square format"

generate_thumb "bot-job-hunter" "Job Hunter" "Binoculars searching for jobs among money opportunities, job search theme, green (#22C55E), career game icon, square format"

generate_thumb "bot-market-racer" "Market Racer" "A race car on a stock chart track going upward, racing game style, green (#22C55E) speed theme, fast-paced game icon, square format"

generate_thumb "bot-market-surfers" "Market Surfers" "A surfer riding a wave made of stock charts, surfing the market, blue and green (#22C55E), cool game icon, square format"

generate_thumb "bot-market-timing" "Market Timing" "A clock with market arrows and coins, perfect timing concept, green (#22C55E) and gold, precision game icon, square format"

generate_thumb "bot-money-masters" "Money Masters" "A king's crown made of gold coins and bills, mastery concept, royal green (#22C55E) and gold, premium game icon, square format"

generate_thumb "bot-money-match" "Money Match" "Matching pairs of coins and money symbols in a grid, memory match game, colorful tiles with green (#22C55E), puzzle game icon, square format"

generate_thumb "bot-money-stack" "Money Stack" "Tall stacks of coins and bills being built higher, stacking game, green (#22C55E) and gold, satisfying game icon, square format"

generate_thumb "bot-portfolio-pro" "Portfolio Pro" "A briefcase full of diverse investments and charts, professional portfolio, green (#22C55E) business theme, pro game icon, square format"

generate_thumb "bot-profit-pinball" "Profit Pinball" "A pinball machine with coins as balls, retro arcade style, flashing lights, classic game icon, square format"

generate_thumb "bot-retirement-planner" "Retirement Planner" "A beach chair with umbrella and retirement savings, future planning, warm sunset colors with green (#22C55E), relaxing game icon, square format"

generate_thumb "bot-risk-manager" "Risk Manager" "Scales balancing risk and reward with coins, justice balance theme, green (#22C55E) and gold, strategic game icon, square format"

generate_thumb "bot-risk-tetris" "Risk Tetris" "Tetris blocks made of different risk levels falling, puzzle game style, colorful blocks with green (#22C55E), classic game icon, square format"

generate_thumb "bot-salary-negotiator" "Salary Negotiator" "Two hands shaking with money exchanging, negotiation success, green (#22C55E) business theme, deal game icon, square format"

generate_thumb "bot-save-challenge" "Save Challenge" "A trophy with piggy bank and savings goals, challenge accepted, green (#22C55E) and gold, motivational game icon, square format"

generate_thumb "bot-save-master" "Save Master" "A sparkling diamond made of saved coins, mastery of saving, green (#22C55E) and gold, premium game icon, square format"

generate_thumb "bot-savings-snake" "Savings Snake" "A snake made of coins growing longer, classic snake game, green (#22C55E) snake on grid, retro game icon, square format"

generate_thumb "bot-savings-sprint" "Savings Sprint" "A runner sprinting toward a savings goal finish line, race concept, green (#22C55E) track theme, speed game icon, square format"

generate_thumb "bot-side-hustle" "Side Hustle" "Multiple briefcases and money streams flowing, side income concept, green (#22C55E) business theme, entrepreneur game icon, square format"

generate_thumb "bot-spending-challenge" "Spending Challenge" "A challenge badge with shopping cart and limits, spending control, green (#22C55E) and red, discipline game icon, square format"

generate_thumb "bot-stock-master" "Stock Master" "A master wizard controlling stock chart magic, stock mastery, green (#22C55E) magical theme, powerful game icon, square format"

generate_thumb "bot-stock-stack" "Stock Stack" "Stock bars stacking higher like a tower, growth concept, green (#22C55E) ascending theme, building game icon, square format"

generate_thumb "bot-stock-tycoon" "Stock Tycoon" "A tycoon character on top of a stock market building, empire building, green (#22C55E) and gold, business game icon, square format"

generate_thumb "bot-tax-tetris" "Tax Tetris" "Tax forms and documents fitting together like Tetris blocks, paperwork puzzle, blue and green (#22C55E), organized game icon, square format"

generate_thumb "bot-trading-battle" "Trading Battle" "Two traders battling with stock charts as weapons, competitive trading, green (#22C55E) versus theme, battle game icon, square format"

generate_thumb "bot-wealth-builder" "Wealth Builder" "Construction crane building a tower of money, wealth building, green (#22C55E) construction theme, builder game icon, square format"

generate_thumb "bot-wealth-race" "Wealth Race" "Racing cars made of different currencies, international race, colorful with green (#22C55E), competitive game icon, square format"

generate_thumb "bot-wealth-run" "Wealth Run" "An endless runner collecting wealth items, subway surfer style, green (#22C55E) path, runner game icon, square format"

generate_thumb "bot-wealth-tap" "Wealth Tap" "A finger tapping on a growing money pile, idle clicker style, green (#22C55E) and gold, tapping game icon, square format"

generate_thumb "bot-wealth-tower" "Wealth Tower" "A skyscraper being built floor by floor with money, tower building, green (#22C55E) and gold, stacking game icon, square format"

generate_thumb "bot-wealth-wheel" "Wealth Wheel" "A colorful spinning wheel with money prizes, fortune wheel, bright colors with green (#22C55E), luck game icon, square format"

echo ""
echo "=========================================="
echo "Thumbnail generation complete!"
echo "=========================================="
echo "Generated thumbnails are in: $THUMB_DIR"
echo ""
echo "To use thumbnails in the game list:"
echo "1. Update moneybot-official/index.html to use <img> tags"
echo "2. Point src to '../assets/thumbnails/GAME-NAME.png'"
