/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./Tooltip.module.css";
import "@reach/tooltip/styles.css";
import cn from "classnames";

import React, { useRef, useMemo } from "react";
import { TooltipPopup, useTooltip } from "@reach/tooltip";
import { Position, getPosition } from "shared/getPosition/getPosition";

export interface Props {
  children: Parameters<typeof React.cloneElement>[0];
  label: React.ReactNode;
  "aria-label"?: string;
  hidden?: boolean;
  className?: string;
  position: Position;
  distancePx?: number;
  darkMode?: boolean;
  style?: React.CSSProperties;
}

/*
 * Based on https://reach.tech/tooltip/#triangle-pointers-and-custom-styles
 */
export function Tooltip(props: Props) {
  const {
    children,
    label,
    "aria-label": ariaLabel,
    hidden,
    style,
    className,
  } = props;

  const [trigger, tooltip] = useTooltip();
  const toolTipRef = useRef<HTMLDivElement>(null);

  const tooltipClassName = cn(
    styles.tooltip,
    // Must set .darkMode on the tooltip itself, if only a subset of the
    // page is in dark mode, and the tooltip is there. This is because
    // the tooltip is rendered in a portal, so it only gets color
    // variables from :root.
    props.darkMode && "darkMode",
    className
  );

  const { position, distancePx = 4 } = props;

  const positionFn = useMemo(() => getPosition(position, distancePx), [
    position,
    distancePx,
  ]);

  // Show tooltip if the useTooltip says so and if the parent component
  // wants it
  const showTooltip = tooltip.isVisible && !hidden;

  return (
    <>
      {React.cloneElement(children, trigger)}
      <TooltipPopup
        style={style}
        ref={toolTipRef}
        id={tooltip.id}
        triggerRect={tooltip.triggerRect}
        isVisible={showTooltip}
        label={label ?? ""}
        aria-label={ariaLabel}
        className={tooltipClassName}
        position={positionFn}
      />
    </>
  );
}
