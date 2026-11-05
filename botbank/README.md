# BotBank

A MoneyBot 3D game where players run a bank in Bot City and learn real banking.
Presented by American Bank & Trust (Bowling Green, KY).

`dist/index.html` is the whole game in one file, so it runs on school networks that block CDNs.

To rebuild after changing `src/`:

```
python3 build.py
```

All the text kids read (products, lessons, events, sponsor details) is in `src/data.js`.
The sponsor's logo goes in the `SPONSOR` object at the top of that file.
