/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./ClickPopover.module.css";
import cn from "classnames";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
  CSSProperties,
} from "react";
import { getPosition, Position } from "shared/getPosition/getPosition";
import { useClickOutside } from "lib/hooks/useClickOutside";
import { useForceUpdate } from "lib/hooks/useForceUpdate";

import type { ReactNode, ReactElement } from "react";

export interface ContentProps {
  close: () => void;
}

interface Props {
  content: (props: ContentProps) => ReactNode;
  children: ReactElement<any>;
  position: Position;
  distancePx?: number;
  closeOnClickOutside?: boolean;
  disableEscKey?: boolean;

  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ControlledClickPopover(props: Props) {
  const { position, distancePx = 4, isOpen, setIsOpen } = props;

  const triggerRef = useRef<HTMLDivElement>(null);
  const [popoverNode, setPopoverNode] = useState<HTMLDivElement | null>(null);

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!isOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !props.disableEscKey) {
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

  const positionFn = useMemo(() => getPosition(position, distancePx), [
    position,
    distancePx,
  ]);

  const [style, setStyle] = useState<CSSProperties>({});

  // Re-calculate the style after rendering since the position may
  // have changed
  useLayoutEffect(() => {
    const newStyle = positionFn(
      triggerRef.current?.getBoundingClientRect(),
      popoverNode?.getBoundingClientRect()
    );

    if (style.top !== newStyle.top || style.left !== newStyle.left) {
      setStyle(newStyle);
    }
  });

  // Close when clicking outside (i.e. not in the trigger, and not in
  // the popover).
  const { closeOnClickOutside = true } = props;
  useClickOutside(
    [triggerRef.current, popoverNode],
    closeOnClickOutside ? () => setIsOpen(false) : () => {}
  );

  return (
    <>
      {isOpen && (
        <div ref={setPopoverNode} className={styles.popover} style={style}>
          {props.content(contentProps)}
        </div>
      )}
      {React.cloneElement(props.children, {
        ref: triggerRef,
        className: cn(
          props.children.props.className,
          styles.trigger,
          /*
           * When the popover is open, add the .active className to the
           * trigger element. For this to have an effect, the element
           * must have a :global(.active) selector in it's .module.css.
           */
          isOpen ? "active" : ""
        ),
        onMouseDown: () => setIsOpen(!isOpen),
        onKeyDown: (event: KeyboardEvent) => {
          switch (event.key) {
            /*
             * Open with Space or Enter
             *
             * Would normally capture this with onClick, but we can't
             * use both onMouseDown and onClick, since they both get
             * called when you click the element.
             */
            case " ":
            case "Enter":
              setIsOpen(!isOpen);
              return;
            // Close when tabbing away from trigger
            case "Tab":
              setIsOpen(false);
              return;
          }
        },
      })}
    </>
  );
}
