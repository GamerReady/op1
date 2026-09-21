// Fetch implementations in older WebKit builds do not consistently consult
// Application Cache. XHR uses the same legacy cache path as classic scripts.
export function cachedBinary(url) {
  return new Promise(function (resolve, reject) {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.timeout = 30000;
    request.onload = function () {
      if (request.status >= 200 && request.status < 300 && request.response && request.response.byteLength) {
        resolve(new Uint8Array(request.response));
      } else {
        reject(new Error("Cannot load cached file " + url + " (HTTP " + request.status + ")"));
      }
    };
    request.onerror = request.ontimeout = request.onabort = function () {
      reject(new Error("Cannot load cached file " + url + "; reconnect and refresh the offline cache"));
    };
    request.send();
  });
}
