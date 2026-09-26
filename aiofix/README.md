# GamerReady AIO stability test

This directory is an isolated `/aiofix/` endpoint. It does not alter or share
runtime files with the site's main endpoint.

The test build incorporates raw13g's `b5ccefe` stability changes and the three
AIO kernel-patch blobs introduced in `ef1670a`. The patch blobs are deliberately
renamed `*-aiofix.bin` and live under `bin/kpatches/` to prevent either cache or
path collisions with the main build.

Supported test firmwares: 13.02, 13.04, 13.50, and 13.52. The landing and loader
pages retain GamerReady's theme and HEN/GoldHEN payload selector.
