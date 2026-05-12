import {
  PWA_SKIP_WAITING_MESSAGE,
  PWA_UPDATE_AVAILABLE_EVENT,
  isPwaUpdateReady,
  shouldRegisterPwa,
} from "./pwaGuards";

export interface LambChatPwaUpdateEventDetail {
  registration: ServiceWorkerRegistration;
}

function notifyPwaUpdateAvailable(registration: ServiceWorkerRegistration) {
  window.dispatchEvent(
    new CustomEvent<LambChatPwaUpdateEventDetail>(PWA_UPDATE_AVAILABLE_EVENT, {
      detail: { registration },
    }),
  );
}

function watchForPwaUpdates(registration: ServiceWorkerRegistration) {
  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    if (!worker) return;

    worker.addEventListener("statechange", () => {
      if (
        isPwaUpdateReady({
          hasController: Boolean(navigator.serviceWorker.controller),
          workerState: worker.state,
        })
      ) {
        notifyPwaUpdateAvailable(registration);
      }
    });
  });
}

export function activateWaitingLambChatPwaUpdate(
  registration: ServiceWorkerRegistration,
): boolean {
  if (!registration.waiting) return false;

  registration.waiting.postMessage({ type: PWA_SKIP_WAITING_MESSAGE });
  return true;
}

export function registerLambChatPwa(): void {
  const hasServiceWorker =
    typeof navigator !== "undefined" && "serviceWorker" in navigator;

  if (
    !shouldRegisterPwa({
      isProduction: import.meta.env.PROD,
      hasServiceWorker,
    })
  ) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(watchForPwaUpdates)
      .catch((error) => {
        console.warn("[PWA] Service worker registration failed:", error);
      });
  });
}
