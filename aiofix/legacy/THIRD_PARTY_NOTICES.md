# AIOFIX legacy-engine notices

The files in this directory remain separate from the current 13.x AIOFIX
engine because they are different, firmware-specific implementations. Do not
mix files, workers, patch blobs, or offsets across these directories.

## `slopkit/` — rawgame4

Imported from [`rawgame4/rawgame4.github.io`](https://github.com/rawgame4/rawgame4.github.io),
using its `lapse` and `poops` chains, offset table, patch blobs, and payload
for the 11.00–13.00 routes. `licenses/rawgame4-MIT.txt` is the upstream
license and contains its third-party attributions. The bundled SLOPKIT
primitive files, GoldHEN payload, and kernel patch blobs retain their upstream
terms.

## `505/`, `672/`, `700/`, `900/`, and `css/` — GamerHack

Imported from [`GamerHack/GamerHack.github.io`](https://github.com/GamerHack/GamerHack.github.io),
with only runtime dependencies required by AIOFIX's explicit firmware routes.
The `700/` and `900/` PSFree source files retain their original
`AGPL-3.0-or-later` headers; the canonical license is available at
<https://www.gnu.org/licenses/agpl-3.0.html>. The GamerHack checkout used for
this import did not contain a repository-wide license; its source headers and
upstream attribution are retained.

Where an upstream host bundled the same GoldHEN v2.4b18.12 binary, its code was
changed only to use `../bin/goldhen.bin` rather than adding duplicate payload
files.
