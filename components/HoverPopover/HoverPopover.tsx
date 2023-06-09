import styles from "./HoverPopover.module.css";
import cn from "classnames";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { getPosition, Position } from "shared/getPosition/getPosition";
import { useForceUpdate } from "lib/hooks/useForceUpdate";

import type { ReactNode, ReactElement } from "react";

export interface ContentProps {
  close: () => void;
}

interface Props {
  content: (props: ContentProps) => ReactNode;
  children: ReactElement;
  position: Position;
  distancePx?: number;
  enabled?: boolean;
}

export function HoverPopover(props: Props) {
  const { position, distancePx = 4, enabled = true } = props;

  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const [popoverNode, setPopoverNode] = useState<HTMLDivElement | null>(null);

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!isOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    const rerenderListenerOptions: AddEventListenerOptions = {
      // Passive because the listeners are non-blocing. This is better
      // for performance.
      passive: true,
    };

    // Re-render to update popover position when the trigger element
    // might have moved
    window.addEventListener("wheel", forceUpdate, rerenderListenerOptions);
    window.addEventListener("scroll", forceUpdate, rerenderListenerOptions);
    window.addEventListener("resize", forceUpdate, rerenderListenerOptions);
    // Close on Escape
    window.addEventListener("keydown", onKey, {
      passive: true,
      // We only need this callback once, since it will close the menu.
      once: true,
    });

    return () => {
      window.removeEventListener("wheel", forceUpdate);
      window.removeEventListener("scroll", forceUpdate);
      window.removeEventListener("resize", forceUpdate);
      window.addEventListener("keydown", onKey);
    };
  }, [isOpen, setIsOpen, forceUpdate]);

  const contentProps: ContentProps = {
    close: () => setIsOpen(false),
  };

  const positionFn = useMemo(
    () =>
      getPosition(
        position,
        /*
         * Don't add a gap between trigger and popover. Instead, we have
         * a padding on the popover. This way we can still have a visual
         * gap, but there is no actual gap between the elements. This
         * enables hovering the popover.
         */
        0,
        /*
         * Still require a gap between the popover and the edge of the
         * screen.
         */
        distancePx
      ),
    [position]
  );

  return (
    <div
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        /*
         * Consider the popover to retain focus if the new focused
         * element is inside it.
         *
         * https://stackoverflow.com/a/60094794/2054731
         */
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsOpen(false);
        }
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {isOpen && enabled && (
        <div
          ref={setPopoverNode}
          className={cn(styles.popover, styles[position])}
          style={
            {
              ...positionFn(
                triggerRef.current?.getBoundingClientRect(),
                popoverNode?.getBoundingClientRect()
              ),
              "--distance": `${distancePx}px`,
            } as React.CSSProperties
          }
        >
          {props.content(contentProps)}
        </div>
      )}

      {React.cloneElement(props.children, {
        ref: triggerRef,
        className: cn(
          props.children.props.className,
          /*
           * When the popover is open, add the .active className to the
           * trigger element. For this to have an effect, the element
           * must have a :global(.active) selector in it's .module.css.
           */
          isOpen ? "active" : ""
        ),
        onKeyDown: (event: KeyboardEvent) => {
          switch (event.key) {
            // Close when tabbing away from trigger
            case "Tab":
              setIsOpen(false);
              return;
          }
        },
      })}
    </div>
  );
}
