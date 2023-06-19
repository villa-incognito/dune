import { ControlledModal, ContentProps, TriggerProps } from "./ControlledModal";

import { useState } from "react";

import type { ReactElement } from "react";

interface Props {
  size: "S" | "M" | "L";
  label: string;
  content: (props: ContentProps) => ReactElement;
  trigger: (props: TriggerProps) => ReactElement;
  onDismiss?: () => void;
}

export function Modal(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return <ControlledModal {...props} isOpen={isOpen} setIsOpen={setIsOpen} />;
}
