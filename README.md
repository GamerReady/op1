# GamerReady offline loader

This static site targets the PS4 browser's **Application Cache**. Modern desktop
browsers generally no longer support that API; they can load the site online,
but are not a substitute for testing its offline cache on a PS4.

## Build and deploy

```sh
npm ci
npm run build
npm test
```

Deploy `index.html`, `load.html`, `cache.appcache`, `rpc_worker.js`, `js/`, and
`bin/` together, preserving the relative paths. The generated `js/loader.js` is
checked in so static hosting does not need Node.js. Do not edit it directly.
Run the build after changing any deployed file: it bundles the loader and updates
the manifest revision from the cached files' contents.

The server must serve `cache.appcache` with `Content-Type: text/cache-manifest`
and allow it to revalidate (avoid immutable/long-lived HTTP caching for the
manifest). Every listed resource, including `./` and legacy query-string URLs,
must return the actual file successfully, not a login page or a SPA fallback.
A single missing resource can abort the entire cache update. Keep the same site
URL, scheme, hostname, and path when reconnecting offline.

## Refresh the cache on the console

1. Connect to Wi-Fi and open the site's `index.html`.
2. Keep the page open while the cache downloads. If **Cache Updated** appears,
   select **Reload Page**. An older version of the page may need another reload
   to pick up this fix.
3. Wait for **cached -- offline ready** before disconnecting.
4. Disable Wi-Fi, close/reopen the browser at the same URL, and select a payload.
   Also verify a direct `load.html` visit, and a launch with `#payload=hen&log=1`.
5. If the old page persists after reconnecting and reloading, clear the browser's
   website cache/data while online, reopen the site, and let it cache completely
   again. Clearing site data removes the offline copy.

## What changed

- Removed `core.js?v=10` from `mem.js`: it was not in the manifest and created a
  separate instance of the core module's shared state.
- Serve a single classic-script bundle instead of relying on legacy WebKit's
  module-fetch cache behavior. Binary reads use XHR's legacy cache path too.
- Pass loader options in the fragment, not the query string, so all new launches
  and retries request the same `load.html` cache key. Keep common old query links
  in the manifest for compatibility. Arbitrary old query bookmarks must be
  reopened online once or changed to fragment URLs.
- Always listen for cache events, and never infer cache readiness merely from
  `navigator.onLine`. Initial downloads wait before showing launch buttons.
- Show recovery instructions for loader-script errors/timeouts instead of an
  unexplained permanent startup spinner. The timeout covers script startup,
  not the duration of the jailbreak itself.

`npm test` checks the manifest graph, deterministic bundle, navigation, simulated
AppCache lifecycle, startup failure UI, and binary request handling. It does not
execute the jailbreak or emulate the PS4's Application Cache implementation;
final offline operation must be verified on the console.
