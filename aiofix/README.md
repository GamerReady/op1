# GamerReady AIOFIX

`aiofix/` is a self-contained PS4 browser host. It detects the PS4 firmware
from the browser User-Agent and routes to the matching implementation. The
modern 13.x AIOFIX path is unchanged; older firmware families are isolated
under `aiofix/legacy/` so their incompatible exploit primitives, kernel patches,
and workers cannot collide with it.

## Supported firmware routes

| Firmware | Engine | Payload choice |
| --- | --- | --- |
| 5.05, 5.07 | GamerHack 5.05 engine | GoldHEN |
| 6.72 | GamerHack 6.72 engine | GoldHEN |
| 7.00, 7.01, 7.02, 7.50, 7.51, 7.55 | GamerHack PSFree 7.x engine | GoldHEN |
| 8.00, 8.01, 8.03, 8.50, 8.52 | GamerHack PSFree 8.x engine | GoldHEN |
| 9.00, 9.03, 9.04, 9.50, 9.51, 9.60 | GamerHack PSFree 9.x engine | GoldHEN |
| 10.00, 10.01, 10.50, 10.70, 10.71 | GamerHack CSS engine | GoldHEN |
| 11.00 | rawgame4 `lapse` | rawgame4 payload |
| 11.02 | GamerHack CSS engine | GoldHEN |
| 11.50, 12.00, 12.02 | rawgame4 `lapse` | rawgame4 payload |
| 12.50, 12.52, 13.00 | rawgame4 `poops` | rawgame4 payload |
| 13.02, 13.04, 13.50, 13.52 | AIOFIX hardened 13.x engine | GoldHEN or HEN |

Routes are deliberately exact. An unlisted intermediary firmware is shown as
unsupported instead of being sent to a similar-looking offset table. The
legacy engines use GoldHEN where their upstream hosts used it; only the
existing 13.x AIOFIX engine presents the HEN/GoldHEN selector.

## Layout

- `index.html` — firmware dispatcher and offline-cache entry point.
- `load.html`, `js/`, `bin/kpatches/` — retained AIOFIX 13.02–13.52 engine.
- `legacy/505/`, `legacy/672/` — GamerHack’s dedicated 5.05/5.07 and 6.72
  engines.
- `legacy/700/`, `legacy/900/`, `legacy/css/` — GamerHack PSFree/CSS runtime
  trees. Only files used by the selected runtime are included.
- `legacy/slopkit/` — rawgame4’s compact 11.00–13.00 `lapse`/`poops` engine
  and its five patch blobs.
- `legacy/THIRD_PARTY_NOTICES.md` — upstream attribution and licensing notes.

The legacy engines reuse the existing `bin/goldhen.bin` whenever the source
host shipped the identical GoldHEN v2.4b18.12 payload. This avoids duplicate
payload binaries while keeping each engine’s code and patch assets grouped.

## Offline use

`cache.appcache` includes every runtime file used by every route. Refresh the
AIOFIX index page while online and allow the cache to complete before relying
on it offline. A cache update asks for a page reload so a route cannot run with
a mixed old/new asset set.

## Sources and attribution

- Lower 11.00–13.00 support: [rawgame4/rawgame4.github.io](https://github.com/rawgame4/rawgame4.github.io)
- Older engine families: [GamerHack/GamerHack.github.io](https://github.com/GamerHack/GamerHack.github.io)

See `legacy/THIRD_PARTY_NOTICES.md` and the copied upstream license for the
applicable terms. Exploit attempts can crash the browser or console; use only
on hardware you own and keep important data backed up.
