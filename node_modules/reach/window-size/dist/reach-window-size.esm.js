import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from '@reach/utils/can-use-dom';
import { useIsomorphicLayoutEffect } from '@reach/utils/use-isomorphic-layout-effect';

/**
 * Measure the current window dimensions.
 *
 * @see Docs   https://reach.tech/window-size
 * @see Source https://github.com/reach/reach-ui/tree/main/packages/window-size
 */

/**
 * WindowSize
 *
 * @see Docs https://reach.tech/window-size#windowsize
 * @param props
 */

var WindowSize = function WindowSize(_ref) {
  var children = _ref.children;
  var dimensions = useWindowSize();
  return children(dimensions);
};
/**
 * @see Docs https://reach.tech/window-size#windowsize-props
 */


if (process.env.NODE_ENV !== "production") {
  WindowSize.displayName = "WindowSize";
  WindowSize.propTypes = {
    children: PropTypes.func.isRequired
  };
} ////////////////////////////////////////////////////////////////////////////////

/**
 * useWindowSize
 *
 * @see Docs https://reach.tech/window-size#usewindowsize
 */


function useWindowSize() {
  var _React$useRef = useRef(canUseDOM()),
      hasWindow = _React$useRef.current;

  var _React$useState = useState({
    width: hasWindow ? window.innerWidth : 0,
    height: hasWindow ? window.innerHeight : 0
  }),
      dimensions = _React$useState[0],
      setDimensions = _React$useState[1];

  useIsomorphicLayoutEffect(function () {
    var resize = function resize() {
      return setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", resize);
    return function () {
      return window.removeEventListener("resize", resize);
    };
  }, []);
  return dimensions;
} // TODO: Remove in 1.0

export default WindowSize;
export { WindowSize, useWindowSize };
