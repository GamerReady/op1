/* Compatibility shim for the legacy loader path.
 * js/jb.js historically requested /rpc_worker.js, while the worker lived in
 * /js. Keep this tiny entry point so cached and uncached loads resolve the
 * same worker implementation.
 */
importScripts("js/rpc_worker.js");
