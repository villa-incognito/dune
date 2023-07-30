import { addToModalQueue, removeFromModalQueue, useModalQueue } from "./store";
import React, { useEffect } from "react";
import { ModalWithoutTrigger, ModalWithoutTriggerProps } from "./";

interface Props extends ModalWithoutTriggerProps {
  // Used to create a queue of modals where only one is visible at a time
  queueKey: string;
}

export const ModalWithQueue = ({ queueKey, ...modalProps }: Props) => {
  const activeQueueKey = useModalQueue();

  const onDismiss = () => {
    if (queueKey !== undefined) {
      removeFromModalQueue(queueKey);
    }

    if (modalProps.onDismiss) {
      return modalProps.onDismiss();
    }
  };

  useEffect(() => {
    if (modalProps.isOpen) {
      if (queueKey !== undefined) {
        addToModalQueue(queueKey);
      }

      return () => {
        onDismiss();
      };
    }
  }, [modalProps.isOpen, queueKey]);

  if (queueKey !== undefined && queueKey !== activeQueueKey) {
    return null;
  }

  return <ModalWithoutTrigger {...modalProps} onDismiss={onDismiss} />;
};
