const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const read = file => fs.readFileSync(file, 'utf8');
function page(file, { status = 1, online = true, search = '', hash = '', supported = true, appcache = true } = {}) {
  const elements = {};
  function element() {
    return { style: {}, children: [], textContent: '', className: '',
      appendChild(child) { this.children.push(child); }, focus() {},
      set innerHTML(value) { this.children = []; } };
  }
  const handlers = {};
  const ac = { UNCACHED: 0, IDLE: 1, CHECKING: 2, DOWNLOADING: 3, UPDATEREADY: 4, OBSOLETE: 5,
    status, addEventListener(event, callback) { handlers[event] = callback; },
    swapCache() { this.status = 1; this.swapped = true; } };
  const timers = new Map();
  const windowHandlers = {};
  const context = {
    URLSearchParams,
    document: { body: element(), documentElement: { hasAttribute: () => true },
      getElementById(id) { return elements[id] || (elements[id] = element()); },
      createElement: element },
    navigator: { onLine: online, userAgent: supported ? 'PlayStation 4/13.52' : 'Desktop' },
    location: { search, hash, replace(url) { this.target = url; }, reload() { this.reloaded = true; } },
    setTimeout(callback) { timers.set(1, callback); return 1; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener(event, callback) { windowHandlers[event] = callback; },
    removeEventListener(event) { delete windowHandlers[event]; }
  };
  if (appcache) context.applicationCache = ac;
  context.window = context;
  vm.runInNewContext(read(file).match(/<script>([\s\S]*?)<\/script>/)[1], context);
  return { context, elements, ac, timers, handlers, windowHandlers,
    emit(event, nextStatus = ac.status, data = {}) { ac.status = nextStatus; handlers[event](data); } };
}

test('every cached URL exists, including the root, loader and worker graph', () => {
  const entries = read('cache.appcache').split('NETWORK:')[0].split('\n')
    .filter(line => line && !line.startsWith('#') && line !== 'CACHE MANIFEST');
  for (const entry of entries) assert.ok(fs.existsSync(entry.split('?')[0]), entry);
  for (const entry of ['./', 'index.html', 'load.html', 'js/loader.js', 'rpc_worker.js', 'js/rpc_worker.js',
    'bin/hen.bin', 'bin/goldhen.bin', 'bin/patches/1302.bin', 'bin/patches/1350.bin', 'bin/patches/1352.bin']) {
    assert.ok(entries.includes(entry), entry);
  }
  // Regression: mem.js imported an uncached, separate core.js?v=10 instance.
  for (const file of fs.readdirSync('js').filter(file => file.endsWith('.js'))) {
    for (const match of read('js/' + file).matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)) {
      assert.ok(!match[1].includes('?'), file + ': ' + match[1]);
      const resolved = path.posix.normalize('js/' + match[1]);
      assert.ok(entries.includes(resolved), resolved);
    }
  }
});

test('build is reproducible and the committed bundle/manifest are current', () => {
  const bundle = read('js/loader.js');
  const manifest = read('cache.appcache');
  execFileSync(process.execPath, ['scripts/build.cjs']);
  assert.equal(read('js/loader.js'), bundle);
  assert.equal(read('cache.appcache'), manifest);
  assert.equal((bundle.match(/const REVISION =|var REVISION =/g) || []).length, 1);
  new vm.Script(bundle); // Parse only; never execute the jailbreak in tests.
});

test('launcher uses one cache key and preserves repeated/debug options', () => {
  const p = page('index.html', { search: '?log=1&payload=goldhen&g=a:1&g=b:2&slots=100000' });
  p.elements['btn-container'].children[1].onclick();
  const target = new URL(p.context.location.target, 'https://example.test/op1/');
  assert.equal(target.pathname, '/op1/load.html');
  assert.equal(target.search, '');
  const options = new URLSearchParams(target.hash.slice(1));
  assert.equal(options.get('payload'), 'hen');
  assert.equal(options.getAll('payload').length, 1);
  assert.equal(options.get('log'), '1');
  assert.deepEqual(options.getAll('g'), ['a:1', 'b:2']);
  assert.equal(options.get('slots'), '100000');
});

test('offline without a complete cache does not claim offline ready', () => {
  const p = page('index.html', { online: false, status: 0 });
  assert.equal(p.elements['v-cache'].textContent, 'offline cache unavailable');
  assert.match(p.elements.note.textContent, /Connect to Wi-Fi/);
});

test('offline with a complete cache stays ready after an update error', () => {
  const p = page('index.html', { online: false });
  p.emit('error', 1);
  assert.match(p.elements['v-cache'].textContent, /offline ready/);
  assert.equal(p.elements.picker.style.display, 'block');
});

test('IDLE at startup still subscribes to updates, progress and obsolete events', () => {
  const p = page('index.html');
  p.emit('downloading', 3);
  assert.equal(p.elements.picker.style.display, 'none');
  p.emit('progress', 3, { loaded: 1, total: 2 });
  assert.equal(p.elements['v-cache'].textContent, 'caching 50%');
  p.emit('updateready', 4);
  assert.ok(p.ac.swapped);
  assert.equal(p.elements['btn-container'].children[0].textContent, 'Reload Page');
  p.elements['btn-container'].children[0].onclick();
  assert.ok(p.context.location.reloaded);
  p.emit('obsolete', 5);
  assert.equal(p.elements['v-cache'].textContent, 'offline cache unavailable');
});

test('initial download gates launch until cached, and reports failures honestly', () => {
  const p = page('index.html', { status: 3 });
  assert.equal(p.elements.picker.style.display, 'none');
  p.emit('cached', 1);
  assert.match(p.elements['v-cache'].textContent, /offline ready/);
  assert.equal(p.elements.picker.style.display, 'block');
  p.emit('error', 0);
  assert.equal(p.elements['v-cache'].textContent, 'offline cache unavailable');
});

test('unsupported devices still get cache events; modern browsers get an honest status', () => {
  const p = page('index.html', { supported: false });
  p.emit('cached', 1);
  assert.equal(p.elements['btn-container'].children[0].textContent, 'Run Anyway');
  const modern = page('index.html', { appcache: false });
  assert.equal(modern.elements['v-cache'].textContent, 'offline caching not supported');
});

test('legacy query links normalize before starting the loader', () => {
  const p = page('load.html', { search: '?payload=hen&log=1' });
  assert.equal(p.context.location.target, 'load.html#payload=hen&log=1');
  assert.equal(p.context.document.body.children.length, 0);
});

test('bootstrap loads the classic bundle and validates payload choices', () => {
  for (const payload of ['hen', 'goldhen', '../invalid']) {
    const p = page('load.html', { hash: '#payload=' + payload });
    assert.equal(p.context.document.body.children[0].src, 'js/loader.js');
    assert.equal(p.context.selectedPayload, payload === '../invalid' ? undefined : payload);
    p.context.loaderStarted = true;
    p.context.document.body.children[0].onload();
    assert.equal(p.timers.size, 0);
    assert.notEqual(p.context.document.body.className, 'fail');
  }
});

test('missing, broken or stalled scripts show a recovery message instead of spinning', () => {
  for (const failure of ['network', 'syntax', 'timeout', 'not-started']) {
    const p = page('load.html');
    if (failure === 'network') p.context.document.body.children[0].onerror();
    if (failure === 'syntax') p.windowHandlers.error();
    if (failure === 'timeout') p.timers.get(1)();
    if (failure === 'not-started') p.context.document.body.children[0].onload();
    assert.equal(p.context.document.body.className, 'fail');
    assert.match(p.elements.msg.textContent, /Reconnect Wi-Fi/);
  }
});

test('binary downloads use cache-compatible XHR and reject HTTP/empty/network failures', async () => {
  for (const outcome of ['ok', 'http', 'empty', 'error', 'timeout', 'abort']) {
    let request;
    class XHR {
      constructor() { request = this; }
      open(method, url, async) { assert.equal(method, 'GET'); assert.equal(url, 'bin/hen.bin'); assert.equal(async, true); }
      send() {
        this.status = outcome === 'http' ? 404 : 200;
        this.response = new ArrayBuffer(outcome === 'empty' ? 0 : 3);
        if (['error', 'timeout', 'abort'].includes(outcome)) this['on' + outcome]();
        else this.onload();
      }
    }
    const context = { XMLHttpRequest: XHR };
    vm.runInNewContext(read('js/cached-binary.js').replace('export function', 'function'), context);
    const promise = context.cachedBinary('bin/hen.bin');
    if (outcome === 'ok') assert.equal((await promise).byteLength, 3);
    else await assert.rejects(promise, /Cannot load cached file/);
    assert.equal(request.responseType, 'arraybuffer');
    assert.equal(request.timeout, 30000);
  }
});
