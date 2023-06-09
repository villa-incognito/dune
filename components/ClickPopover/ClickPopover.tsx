import { ControlledClickPopover, ContentProps } from "./ControlledClickPopover";

import { useState } from "react";

import type { ReactNode, ReactElement } from "react";
import type { Position } from "shared/getPosition/getPosition";

export type { ContentProps };

interface Props {
  content: (props: ContentProps) => ReactNode;
  children: ReactElement<any>;
  position: Position;
  distancePx?: number;
  closeOnClickOutside?: boolean;
}

export function ClickPopover(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ControlledClickPopover {...props} isOpen={isOpen} setIsOpen={setIsOpen} />
  );
}
