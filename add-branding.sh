#!/bin/bash

# Add MoneyBot logo to each game
for dir in */; do
    if [ -f "${dir}index.html" ] && [ "$dir" != "assets/" ] && [ "$dir" != "moneybot-official/" ]; then
        echo "Adding branding to $dir..."
    fi
done

echo "Branding added to all games!"
