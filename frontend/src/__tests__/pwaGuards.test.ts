import test from "node:test";
import assert from "node:assert/strict";
import {
  PWA_SKIP_WAITING_MESSAGE,
  isPwaSkipWaitingMessage,
  isPwaUpdateReady,
  shouldRegisterPwa,
} from "../pwaGuards.ts";

test("registers the PWA only for production browsers with service worker support", () => {
  assert.equal(
    shouldRegisterPwa({ isProduction: true, hasServiceWorker: true }),
    true,
  );
  assert.equal(
    shouldRegisterPwa({ isProduction: false, hasServiceWorker: true }),
    false,
  );
  assert.equal(
    shouldRegisterPwa({ isProduction: true, hasServiceWorker: false }),
    false,
  );
});

test("reports an installed worker as an update only when a controller exists", () => {
  assert.equal(
    isPwaUpdateReady({ hasController: true, workerState: "installed" }),
    true,
  );
  assert.equal(
    isPwaUpdateReady({ hasController: false, workerState: "installed" }),
    false,
  );
  assert.equal(
    isPwaUpdateReady({ hasController: true, workerState: "installing" }),
    false,
  );
});

test("recognizes the skip waiting message without accepting arbitrary payloads", () => {
  assert.equal(isPwaSkipWaitingMessage(PWA_SKIP_WAITING_MESSAGE), true);
  assert.equal(
    isPwaSkipWaitingMessage({ type: PWA_SKIP_WAITING_MESSAGE }),
    true,
  );
  assert.equal(isPwaSkipWaitingMessage({ type: "OTHER_MESSAGE" }), false);
  assert.equal(isPwaSkipWaitingMessage(null), false);
});
