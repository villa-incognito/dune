import {
  removeFromQueue,
  createQueueStore,
  addToQueue,
  useQueue,
} from "shared/stores/queueStore";

const modalsQueue = createQueueStore();

export const useModalQueue = () => useQueue(modalsQueue);

export const addToModalQueue = (modal: string) =>
  addToQueue(modal, modalsQueue);

export const removeFromModalQueue = (modal: string) =>
  removeFromQueue(modal, modalsQueue);
