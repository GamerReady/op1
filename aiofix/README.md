# GamerReady AIO Fix

`aiofix/` is the all-in-one PS4 browser host. It uses **exactly the same UI
and payload selector as the main host at the repository root**: one picker
page, one loader page, one look — no matter which firmware the console runs.
Every supported firmware gets the GoldHEN / HEN choice.

## How it works

- `index.html` detects the firmware, offers **GoldHEN** or **HEN**, and opens
  `load.html` with the choice.
- `load.html` is the single loader page. It picks the matching exploit engine
  for the firmware and runs it. Engines report through hidden status hooks, so
  the spinner / success / failure screens are identical for every version,
  just like the main host. Add `?log=1` (or `#log=1`) to watch the engine log
  on engines that support it; add `force=1` to force the 13.x loader.

## Supported firmware

| Firmware | Engine path |
| --- | --- |
| 5.05, 5.07 | `legacy/505/` |
| 6.72 | `legacy/672/` |
| 7.00–7.55, 8.00–8.52 | `legacy/700/` |
| 9.00–9.60 | `legacy/900/` |
| 10.00–10.71, 11.02 | `legacy/css/` |
| 11.00–12.02 | `legacy/slopkit/` (lapse) |
| 12.50–13.00 | `legacy/slopkit/` (poops) |
| 13.02–13.52 | `js/` (hardened 13.x loader) |

Routes are exact: an unlisted intermediary firmware shows as unsupported
instead of being sent to a similar-looking offset table.

## Layout

- `index.html` — picker page (UI identical to the root host).
- `load.html` — unified loader and engine dispatcher (UI identical to root).
- `js/` — current 13.02–13.52 engine plus its offsets and worker.
- `bin/kpatches/` — AIO Fix kernel-patch blobs for the 13.x engine.
- `legacy/` — engines for older firmware families only; no separate pages,
  styles, or documents. Payloads are loaded from the shared `../bin/`
  (`goldhen.bin` / `hen.bin`) so there is exactly one copy of each payload in
  the repository.

## Offline use

`cache.appcache` lists every runtime file used by every route, including the
shared payloads in `../bin/`. Refresh the index page while online and allow
caching to complete before going offline. A cache update asks for a page
reload so no run mixes old and new assets.

## Notes

Exploit attempts can crash the browser or console; use only on hardware you
own and keep important data backed up.
