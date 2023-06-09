import React, { useRef } from "react";
import { Portal } from "@reach/portal";
import { TooltipPopup, useTooltip, Position } from "@reach/tooltip";
import styles from "./TooltipOld.module.css";
import "@reach/tooltip/styles.css";
import cn from "classnames";

interface Props {
  children: Parameters<typeof React.cloneElement>[0];
  label: React.ReactNode;
  color?: "light-blue" | "gray" | "black";
  "aria-label"?: string;
  hidden?: boolean;
  position?: Position;
  trianglePosition?: Position;
  className?: string;
}

/*
 * Based on https://reach.tech/tooltip/#triangle-pointers-and-custom-styles
 */
export function TooltipOld({
  children,
  label,
  "aria-label": ariaLabel,
  color,
  hidden,
  position = centeredTop,
  trianglePosition = arrowOnTopCenteredOnTrigger,
  className,
}: Props) {
  const [trigger, tooltip] = useTooltip();
  const toolTipRef = useRef<HTMLDivElement>(null);

  const _color: Props["color"] = color || "light-blue";
  const tooltipClassName = cn(styles.tooltip, styles[_color], className);
  const tooltipArrowClassName = cn(
    styles["tooltip-arrow"],
    styles[`arrow-${_color}`]
  );

  // Show tooltip if the useTooltip says so and if the parent component
  // wants it
  const showTooltip = tooltip.isVisible && !hidden;
  return (
    <>
      {React.cloneElement(children, trigger)}
      {showTooltip && (
        <Portal>
          <div
            className={tooltipArrowClassName}
            style={trianglePosition(
              tooltip.triggerRect,
              toolTipRef.current?.getBoundingClientRect()
            )}
          />
        </Portal>
      )}
      <TooltipPopup
        ref={toolTipRef}
        id={tooltip.id}
        triggerRect={tooltip.triggerRect}
        isVisible={showTooltip}
        label={label ?? ""}
        aria-label={ariaLabel}
        className={tooltipClassName}
        position={position}
      />
    </>
  );
}

/*
    Positioning Functions
*/

/* Centered on top */

// Center the tooltip, but collisions will win
const centeredTop: Position = (triggerRect, tooltipRect) => {
  if (!triggerRect || !tooltipRect || !triggerRect.y) {
    return {};
  }

  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  const initialLeft = triggerCenter - tooltipRect.width / 2;
  // using client width will take into account the scrollbars if visible
  const screenWidth =
    document.querySelector("body")?.clientWidth || window.innerWidth;
  const maxLeft = screenWidth - tooltipRect.width - 10;
  return {
    left: Math.min(Math.max(10, initialLeft), maxLeft) + window.scrollX,
    bottom: window.innerHeight + 6 - triggerRect.y - window.scrollY,
  };
};

const arrowOnTopCenteredOnTrigger: Position = (triggerRect) => {
  if (!triggerRect || !triggerRect.y) {
    return {};
  }

  return {
    left: triggerRect.left - 6 + triggerRect.width / 2,
    bottom: window.innerHeight - triggerRect.y - window.scrollY,
  };
};

/* Centered below */

// Center the tooltip below, but collisions will win
export const centeredBelow: Position = (triggerRect, tooltipRect) => {
  if (!triggerRect || !tooltipRect || !triggerRect.y) {
    return {};
  }

  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  const initialLeft = triggerCenter - tooltipRect.width / 2;
  // using client width will take into account the scrollbars if visible
  const screenWidth =
    document.querySelector("body")?.clientWidth || window.innerWidth;
  const maxLeft = screenWidth - tooltipRect.width - 6;

  return {
    left: Math.min(Math.max(10, initialLeft), maxLeft) + window.scrollX,
    top: triggerRect.y + triggerRect.height + 6 + window.scrollY,
  };
};

export const arrowBelowCenteredOnTrigger: Position = (triggerRect) => {
  if (!triggerRect || !triggerRect.y) {
    return {};
  }

  return {
    left: triggerRect.left - 8 + triggerRect.width / 2,
    top: triggerRect.y + triggerRect.height + window.scrollY,
    transform: "rotate(180deg)",
  };
};
