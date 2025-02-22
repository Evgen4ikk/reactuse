import { useLayoutEffect } from 'react';
import { getElement, isTarget } from '@/utils/helpers';
import { useRefState } from '../useRefState/useRefState';
/**
 * @name useScrollTo
 * @description - Hook for scrolling to a specific element
 * @category Sensors
 *
 * @overload
 * @template Target The target element(s)
 * @param {Target} target The target element for scrolling to
 * @param {number} options.x The horizontal position to scroll to
 * @param {number} options.y The vertical position to scroll to
 * @param {ScrollBehavior} [options.behavior = 'auto'] The scrolling behavior
 * @returns {boolean} The state of scrolling
 *
 * @example
 * const trigger = useScrollTo(ref, options);
 *
 * @overload
 * @template Target The target element(s)
 * @param {number} options.x The horizontal position to scroll to
 * @param {number} options.y The vertical position to scroll to
 * @param {ScrollBehavior} [options.behavior = 'auto'] The scrolling behavior
 * @returns {StateRef<Target>} The state of scrolling
 *
 * @example
 * const { ref, trigger } = useScrollTo(options);
 */
export const useScrollTo = ((...params) => {
    const target = (isTarget(params[0]) ? params[0] : undefined);
    const options = (target ? params[1] : params[0]) ?? {};
    const { x, y, behavior = 'auto', enabled = true } = options;
    const internalRef = useRefState();
    useLayoutEffect(() => {
        if (!enabled)
            return;
        if (!target && !internalRef.state)
            return;
        const element = (target ? getElement(target) : internalRef.current);
        if (!element)
            return;
        element.scrollTo({ top: y, left: x, behavior });
    }, [target, internalRef.state]);
    const trigger = (params) => {
        const element = (target ? getElement(target) : internalRef.current);
        if (!element)
            return;
        const { x, y, behavior } = params ?? {};
        element.scrollTo({ left: x, top: y, behavior });
    };
    if (target)
        return trigger;
    return { ref: internalRef, trigger };
});
