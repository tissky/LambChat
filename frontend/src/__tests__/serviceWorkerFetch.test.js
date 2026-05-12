import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadServiceWorker({ caches, fetchImpl, skipWaitingImpl }) {
  const listeners = new Map();
  const self = {
    location: { origin: "https://lambchat.com" },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    clients: {
      claim: () => Promise.resolve(),
      matchAll: () => Promise.resolve([]),
      openWindow: () => Promise.resolve(),
    },
    registration: {},
    skipWaiting: skipWaitingImpl || (() => Promise.resolve()),
  };

  const context = vm.createContext({
    caches,
    fetch: fetchImpl,
    Headers,
    Promise,
    Request,
    Response,
    self,
    URL,
  });

  const source = readFileSync(new URL("../../public/sw.js", import.meta.url));
  vm.runInContext(source, context);

  return listeners;
}

async function dispatchFetch(listeners, request) {
  let responsePromise;
  const event = {
    request,
    respondWith(promise) {
      responsePromise = Promise.resolve(promise);
    },
  };

  listeners.get("fetch")(event);
  return responsePromise;
}

async function dispatchMessage(listeners, data) {
  let waitUntilPromise;
  const event = {
    data,
    waitUntil(promise) {
      waitUntilPromise = Promise.resolve(promise);
    },
  };

  listeners.get("message")(event);
  await waitUntilPromise;
}

test("serves navigation from the network when CacheStorage open fails", async () => {
  const listeners = loadServiceWorker({
    caches: {
      open: () => Promise.reject(new Error("cache unavailable")),
    },
    fetchImpl: () =>
      Promise.resolve(
        new Response("<!doctype html><title>LambChat</title>", {
          headers: { "Content-Type": "text/html" },
        }),
      ),
  });

  const response = await dispatchFetch(
    listeners,
    new Request(
      "https://lambchat.com/chat/fe426faa-4410-42e8-8634-a1a1d199a378",
      {
        headers: { Accept: "text/html" },
      },
    ),
  );

  assert.equal(response.status, 200);
  assert.match(await response.text(), /LambChat/);
});

test("activates a waiting service worker when the page requests it", async () => {
  let skipWaitingCalls = 0;
  const listeners = loadServiceWorker({
    caches: {
      open: () => Promise.reject(new Error("cache unavailable")),
    },
    fetchImpl: () => Promise.reject(new Error("network unavailable")),
    skipWaitingImpl: () => {
      skipWaitingCalls += 1;
      return Promise.resolve();
    },
  });

  await dispatchMessage(listeners, { type: "SKIP_WAITING" });

  assert.equal(skipWaitingCalls, 1);
});
