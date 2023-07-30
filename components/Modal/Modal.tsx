import { ControlledModal, ControlledModalProps } from "./ControlledModal";

import { useState } from "react";

type ModalProps = Omit<ControlledModalProps, "isOpen" | "setIsOpen">;

export function Modal(props: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return <ControlledModal {...props} isOpen={isOpen} setIsOpen={setIsOpen} />;
}
