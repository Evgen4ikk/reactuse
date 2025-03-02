import { useCallback, useSyncExternalStore } from 'react';

interface BrowserLocationState {
  /** The hash of the location */
  hash: string;
  /** The host of the location */
  host: string;
  /** The hostname of the location */
  hostname: string;
  /** The href of the location */
  href: string;
  /** The length of the location */
  length?: number;
  /** The origin of the location */
  origin: string;
  /** The pathname of the location */
  pathname: string;
  /** The port of the location */
  port: string;
  /** The protocol of the location */
  protocol: string;
  /** The search of the location */
  search: string;
  /** The state of the location */
  state?: any;
  /** The trigger for the location change */
  trigger: string;
}

const WRITABLE_PROPERTIES = [
  'hash',
  'host',
  'hostname',
  'href',
  'pathname',
  'port',
  'protocol',
  'search'
] as const;

let lastTrigger = 'load';
let cachedState: BrowserLocationState | null = null;

const getCurrentLocationState = (trigger: string): BrowserLocationState => {
  const { state, length } = window.history;
  const { hash, host, hostname, href, pathname, port, protocol, search, origin } = window.location;

  return {
    trigger,
    state,
    length,
    hash,
    host,
    hostname,
    href,
    pathname,
    port,
    protocol,
    search,
    origin
  };
};

const getSnapshot = () => {
  const currentState = getCurrentLocationState(lastTrigger);

  const shouldUpdate =
    !cachedState ||
    WRITABLE_PROPERTIES.some((key) => currentState[key] !== cachedState?.[key]) ||
    currentState.trigger !== cachedState.trigger;

  if (shouldUpdate) cachedState = currentState;

  return cachedState;
};

const subscribe = (callback: () => void) => {
  const handler = (event: HashChangeEvent | PopStateEvent) => {
    lastTrigger = event.type === 'popstate' ? 'popstate' : 'hashchange';
    callback();
  };

  window.addEventListener('popstate', handler);
  window.addEventListener('hashchange', handler);

  return () => {
    window.removeEventListener('popstate', handler);
    window.removeEventListener('hashchange', handler);
  };
};

const getServerSnapshot = (): BrowserLocationState => ({
  trigger: 'server',
  hash: '',
  host: '',
  hostname: '',
  href: '',
  pathname: '/',
  port: '',
  protocol: '',
  search: '',
  origin: '',
  state: null,
  length: 0
});

/**
 * @name useBrowserLocation
 * @description - Hook that returns the current browser location and provides methods to update it
 * @category Browser
 *
 * @returns {BrowserLocationState} The current browser location state
 *
 * @example
 * const location = useBrowserLocation();
 *
 */

export const useBrowserLocation = () => {
  const locationState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocation = useCallback((update: Partial<BrowserLocationState>) => {
    WRITABLE_PROPERTIES.forEach((key) => {
      const value = update[key];
      if (value !== undefined && window.location[key] !== value) {
        window.location[key] = value;
      }
    });
  }, []);

  return { ...locationState, setLocation };
};
