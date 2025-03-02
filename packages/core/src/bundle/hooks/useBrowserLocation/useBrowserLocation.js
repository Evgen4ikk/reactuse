import { useCallback, useSyncExternalStore } from 'react';
const WRITABLE_PROPERTIES = [
    'hash',
    'host',
    'hostname',
    'href',
    'pathname',
    'port',
    'protocol',
    'search'
];
let lastTrigger = 'load';
let cachedState = null;
const getCurrentLocationState = (trigger) => {
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
    const shouldUpdate = !cachedState ||
        WRITABLE_PROPERTIES.some((key) => currentState[key] !== cachedState?.[key]) ||
        currentState.trigger !== cachedState.trigger;
    if (shouldUpdate)
        cachedState = currentState;
    return cachedState;
};
const subscribe = (callback) => {
    const handler = (event) => {
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
const getServerSnapshot = () => ({
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
    const setLocation = useCallback((update) => {
        WRITABLE_PROPERTIES.forEach((key) => {
            const value = update[key];
            if (value !== undefined && window.location[key] !== value) {
                window.location[key] = value;
            }
        });
    }, []);
    return { ...locationState, setLocation };
};
