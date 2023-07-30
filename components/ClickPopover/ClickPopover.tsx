import {
  ControlledClickPopover,
  ControlledClickPopoverProps,
} from "./ControlledClickPopover";

import { useState } from "react";

type ClickPopoverProps = Omit<
  ControlledClickPopoverProps,
  "isOpen" | "setIsOpen"
>;

export function ClickPopover(props: ClickPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ControlledClickPopover {...props} isOpen={isOpen} setIsOpen={setIsOpen} />
  );
}
