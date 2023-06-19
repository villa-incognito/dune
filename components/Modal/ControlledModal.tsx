import { ModalWithoutTrigger } from "./ModalWithoutTrigger";

import type { ReactElement } from "react";

export interface ContentProps {
  close: () => void;
}

export interface TriggerProps {
  isOpen: boolean;
  onClick: () => void;
}

interface Props {
  size: "S" | "M" | "L";
  label: string;
  content: (props: ContentProps) => ReactElement;
  trigger: (props: TriggerProps) => ReactElement;

  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDismiss?: () => void;
}

export function ControlledModal(props: Props) {
  const { size, label, content, trigger, isOpen, setIsOpen, onDismiss } = props;

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);

    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <>
      {trigger({ isOpen, onClick: open })}

      <ModalWithoutTrigger
        size={size}
        label={label}
        content={content({ close })}
        isOpen={isOpen}
        onDismiss={close}
      />
    </>
  );
}
