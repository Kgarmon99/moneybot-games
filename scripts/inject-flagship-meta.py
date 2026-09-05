#!/usr/bin/env python3
import json, re, os, textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'moneybot-official', 'data', 'games.manifest.json')
BASE_URL = 'https://kgarmon99.github.io/moneybot-games'
DEFAULT_THEME = '#07111F'

with open(MANIFEST) as f:
    games = json.load(f)['games']

flagships = [g for g in games if g.get('status') == 'flagship']

TAG_RE = re.compile(
    r'<(?:meta\s+(?:name|property)=["\'](?:description|theme-color|og:title|og:description|og:image|og:url|og:type|twitter:card|twitter:title|twitter:description|twitter:image)["\'][^>]*>|'
    r'<link\s+rel=["\'](?:canonical|icon|shortcut\s+icon|apple-touch-icon)["\'][^>]*>)',
    re.IGNORECASE | re.S
)

def existing_meta(head, name):
    m = re.search(r'<meta[^>]+(?:name|property)=["\']%s["\'][^>]+content=["\']([^"\']+)["\']' % re.escape(name), head, re.I | re.S)
    return m.group(1) if m else ''

def existing_viewport(head):
    m = re.search(r'<meta[^>]+name=["\']viewport["\'][^>]+content=["\']([^"\']+)["\']', head, re.I | re.S)
    return m.group(1) if m else ''

def update_viewport(content):
    parts = [p.strip() for p in content.split(',') if p.strip()]
    keys = {p.split('=')[0].strip(): p for p in parts if '=' in p}
    if 'width' not in keys:
        parts.insert(0, 'width=device-width')
    if 'initial-scale' not in keys:
        parts.append('initial-scale=1')
    if 'viewport-fit' not in keys:
        parts.append('viewport-fit=cover')
    return ', '.join(parts)

for game in flagships:
    gid = game['id']
    d = game['url'].replace('../', '')
    path = os.path.join(ROOT, d, 'index.html')
    if not os.path.exists(path):
        print('SKIP', gid, 'no index.html'); continue
    html = open(path).read()
    head_match = re.search(r'(?i)<head>(.*?)</head>', html, re.S)
    if not head_match:
        print('SKIP', gid, 'no head'); continue
    head = head_match.group(1)

    title_match = re.search(r'(?i)<title>(.*?)</title>', head, re.S)
    title = title_match.group(1).strip() if title_match else game['title']
    description = existing_meta(head, 'description') or game.get('learningObjective') or f'Play {game["title"]} on MoneyBot Games.'
    theme = existing_meta(head, 'theme-color') or DEFAULT_THEME
    viewport = existing_viewport(head)
    if viewport:
        viewport = update_viewport(viewport)
    else:
        viewport = 'width=device-width, initial-scale=1, viewport-fit=cover'

    game_url = f'{BASE_URL}/{d}'
    thumb_url = f'{BASE_URL}/moneybot-official/assets/thumbs-signal/{gid}.webp'

    # Strip old tags
    new_head = TAG_RE.sub('', head)
    # Strip old viewport, description, theme, charset (we inject fresh ones)
    new_head = re.sub(r'<meta[^>]+name=["\']viewport["\'][^>]*>', '', new_head, flags=re.I | re.S)
    new_head = re.sub(r'<meta[^>]+name=["\']description["\'][^>]*>', '', new_head, flags=re.I | re.S)
    new_head = re.sub(r'<meta[^>]+name=["\']theme-color["\'][^>]*>', '', new_head, flags=re.I | re.S)
    new_head = re.sub(r'<meta[^>]+charset=["\'][^"\']+["\'][^>]*>', '', new_head, flags=re.I | re.S)

    block = textwrap.dedent(f'''\
    <meta charset="utf-8" />
    <meta name="viewport" content="{viewport}" />
    <meta name="theme-color" content="{theme}" />
    <meta name="description" content="{description}" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:image" content="{thumb_url}" />
    <meta property="og:url" content="{game_url}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image" content="{thumb_url}" />
    <link rel="canonical" href="{game_url}" />
    <link rel="icon" type="image/webp" href="{thumb_url}" />
    <title>{title}</title>
    ''')

    # Remove any duplicate title tags left in new_head
    new_head = re.sub(r'(?i)<title>.*?</title>\s*', '', new_head, flags=re.S)

    # Inject right after <head>, keep </head>
    full_head = f'<head>\n{block}{new_head.lstrip()}\n</head>'
    new_html = html[:head_match.start()] + full_head + html[head_match.end():]

    # Tidy double blank lines
    new_html = re.sub(r'\n{3,}', '\n\n', new_html)

    with open(path, 'w') as f:
        f.write(new_html)
    print('UPDATED', gid, path)
