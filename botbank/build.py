#!/usr/bin/env python3
"""Assemble BotBank into one self-contained index.html (works on school networks that block CDNs)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
VENDOR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'vendor')
src = lambda n: open(os.path.join(HERE, 'src', n), encoding='utf8').read()
html = src('template.html')
assets = json.load(open(os.path.join(VENDOR, 'fyp_assets.json')))
for k in ('outfits', 'ibm', 'rootm'):
    assets.pop(k, None)                         # skinned outfits are not used here
game = ''.join(src(n) + '\n' for n in ['econ.js', 'data.js', 'world.js', 'gfx.js', 'actors.js', 'jobs.js', 'ui.js', 'learn.js', 'floors.js', 'replay.js', 'uikit.js', 'main.js'])
libs = open(os.path.join(VENDOR, 'three.bundle.js'), encoding='utf8').read().replace('</script>', '<\\/script>')
html = (html.replace('/*FONT*/', open(os.path.join(VENDOR, 'fredoka.css')).read().split('</style>')[0])
            .replace('/*LIBS*/', libs)
            .replace('/*ASSETS*/', 'window.MB_ASSETS=' + json.dumps(assets, separators=(',', ':')))
            .replace('/*GAME*/', game))
out = os.path.join(HERE, 'dist', 'index.html')
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf8').write(html)
print('built', out, round(len(html) / 1e6, 2), 'MB')
