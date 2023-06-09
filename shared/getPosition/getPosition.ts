import { Position as ReachPosition } from "@reach/tooltip";

// See diagrams below for how each position works, or check out demo at
// https://dune.com/ui/Menu/ClickPopover/position
export const positions = [
  // Most common
  "right-of-center",
  "right-align-top",
  "below-align-left",
  "below-center",
  // Less common
  "below-align-right",
  "left-align-top",
  "left-of-center",
  "left-align-bottom",
  "above-align-right",
  "above-center",
  "above-align-left",
  "right-align-bottom",
] as const;

// Distinguish ReachPosition from this PositionEnum
type PositionEnum = typeof positions[number];

export type { PositionEnum as Position };

/*
 * PRect: Object returned from getBoundingClientRect.
 * @reach uses this type, but they don't export it.
 */
export type PRect = Partial<DOMRect> & {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
};

export function getPosition(
  position: PositionEnum,
  distancePx: number,
  padWall: number = distancePx // How close to the edge of the screen it can go
): ReachPosition {
  // Helpers to stay within screen
  const safeTop = (popover: PRect) => (top: number) => {
    const min = padWall;
    const max = document.body.clientHeight - popover.height - padWall;
    return Math.max(min, Math.min(max, top));
  };

  const safeLeft = (popover: PRect) => (left: number) => {
    const min = padWall;
    const max = document.body.clientWidth - popover.width - padWall;
    return Math.max(min, Math.min(max, left));
  };

  // Y placement
  const below: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    const prefer = trigger.bottom + distancePx;
    const safe = safeTop(popover)(prefer);
    if (safe === prefer) {
      return { top: safe };
    } else {
      // Above, because it didn't fit below
      return {
        top: safeTop(popover)(trigger.top - popover.height - distancePx),
      };
    }
  };

  const above: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    const prefer = trigger.top - popover.height - distancePx;
    const safe = safeTop(popover)(prefer);
    if (safe === prefer) {
      return { top: safe };
    } else {
      // Below, because it didn't fit above
      return { top: safeTop(popover)(trigger.bottom + distancePx) };
    }
  };

  const alignTop: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    return { top: safeTop(popover)(trigger.top) };
  };

  const alignBottom: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    return { top: safeTop(popover)(trigger.bottom - popover.height) };
  };

  const centerY: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    return {
      top: safeTop(popover)(
        Math.round(trigger.top + trigger.height / 2 - popover.height / 2)
      ),
    };
  };

  // X position
  const onRight: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    const prefer = trigger.right + distancePx;
    const safe = safeLeft(popover)(prefer);
    if (safe === prefer) {
      return { left: safe };
    } else {
      // On left, because it didn't fit on right
      return {
        left: safeLeft(popover)(trigger.left - popover.width - distancePx),
      };
    }
  };

  const onLeft: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    const prefer = trigger.left - popover.width - distancePx;
    const safe = safeLeft(popover)(prefer);
    if (safe === prefer) {
      return { left: safe };
    } else {
      // On right, because it didn't fit left
      return { left: safeLeft(popover)(trigger.right + distancePx) };
    }
  };

  const alignLeft: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    return { left: safeLeft(popover)(trigger.left) };
  };

  const alignRight: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    return { left: safeLeft(popover)(trigger.right - popover.width) };
  };

  const centerX: ReachPosition = (trigger, popover) => {
    if (!trigger || !popover) return { top: 0, left: 0 };
    return {
      left: safeLeft(popover)(
        Math.round(trigger.left + trigger.width / 2 - popover.width / 2)
      ),
    };
  };

  switch (position) {
    /*
     *   [ Trigger ]
     *    __________________
     *   |                 |
     *   |                 |
     *   |     Popover     |
     *   |                 |
     *   |_________________|
     */
    case "below-align-left":
      return (trigger, popover) => {
        return {
          ...below(trigger, popover),
          ...alignLeft(trigger, popover),
        };
      };

    /*
     *       [ Trigger ]
     *    __________________
     *   |                 |
     *   |                 |
     *   |     Popover     |
     *   |                 |
     *   |_________________|
     */
    case "below-center":
      return (trigger, popover) => {
        return {
          ...below(trigger, popover),
          ...centerX(trigger, popover),
        };
      };

    /*
     *           [ Trigger ]
     *    __________________
     *   |                 |
     *   |                 |
     *   |     Popover     |
     *   |                 |
     *   |_________________|
     */
    case "below-align-right":
      return (trigger, popover) => {
        return {
          ...below(trigger, popover),
          ...alignRight(trigger, popover),
        };
      };

    /*    __________________
     *   |                 |
     *   |                 |
     *   |     Popover     |
     *   |                 |
     *   |_________________|
     *
     *   [ Trigger ]
     */
    case "above-align-left":
      return (trigger, popover) => {
        return {
          ...above(trigger, popover),
          ...alignLeft(trigger, popover),
        };
      };

    /*    __________________
     *   |                 |
     *   |                 |
     *   |     Popover     |
     *   |                 |
     *   |_________________|
     *
     *       [ Trigger ]
     */
    case "above-center":
      return (trigger, popover) => {
        return {
          ...above(trigger, popover),
          ...centerX(trigger, popover),
        };
      };

    /*    __________________
     *   |                 |
     *   |                 |
     *   |     Popover     |
     *   |                 |
     *   |_________________|
     *
     *           [ Trigger ]
     */
    case "above-align-right":
      return (trigger, popover) => {
        return {
          ...above(trigger, popover),
          ...alignRight(trigger, popover),
        };
      };

    /*                __________________
     *   [ Trigger ] |                 |
     *               |                 |
     *               |     Popover     |
     *               |                 |
     *               |_________________|
     */
    case "right-align-top":
      return (trigger, popover) => {
        return {
          ...onRight(trigger, popover),
          ...alignTop(trigger, popover),
        };
      };

    /*                __________________
     *               |                 |
     *               |                 |
     *   [ Trigger ] |     Popover     |
     *               |                 |
     *               |_________________|
     */
    case "right-of-center":
      return (trigger, popover) => {
        return {
          ...onRight(trigger, popover),
          ...centerY(trigger, popover),
        };
      };

    /*                __________________
     *               |                 |
     *               |                 |
     *               |     Popover     |
     *               |                 |
     *   [ Trigger ] |_________________|
     */
    case "right-align-bottom":
      return (trigger, popover) => {
        return {
          ...onRight(trigger, popover),
          ...alignBottom(trigger, popover),
        };
      };

    /*   __________________
     *  |                 | [ Trigger ]
     *  |                 |
     *  |     Popover     |
     *  |                 |
     *  |_________________|
     */
    case "left-align-top":
      return (trigger, popover) => {
        return {
          ...onLeft(trigger, popover),
          ...alignTop(trigger, popover),
        };
      };

    /*   __________________
     *  |                 |
     *  |                 |
     *  |     Popover     | [ Trigger ]
     *  |                 |
     *  |_________________|
     */
    case "left-of-center":
      return (trigger, popover) => {
        return {
          ...onLeft(trigger, popover),
          ...centerY(trigger, popover),
        };
      };

    /*   __________________
     *  |                 |
     *  |                 |
     *  |     Popover     |
     *  |                 |
     *  |_________________| [ Trigger ]
     */
    case "left-align-bottom":
      return (trigger, popover) => {
        return {
          ...onLeft(trigger, popover),
          ...alignBottom(trigger, popover),
        };
      };
  }
}
