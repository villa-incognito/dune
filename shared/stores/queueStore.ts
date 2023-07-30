import createStore from "zustand";
import produce from "immer";

// This store implements queue.
// If the item is already active, the new item will be queued and activated after the current item is removed.
// This is useful for dialogs that are opened immediately.
// For example Feature Highlights or announcement modals.

interface State {
  active?: string;
  queue: Array<string>;
}

const initialState: State = {
  active: undefined,
  queue: [],
};

export const createQueueStore = () => createStore<State>(() => initialState);

const getActiveItem = (state: State) => state.active;

export function useQueue(useStore: ReturnType<typeof createQueueStore>) {
  return useStore(getActiveItem);
}

export function addToQueue(
  queueKey: string,
  store: ReturnType<typeof createQueueStore>
) {
  store.setState(
    produce((state: State) => {
      if (state.active === queueKey || state.queue.includes(queueKey)) {
        return;
      }

      if (state.active === undefined) {
        state.active = queueKey;
      } else {
        state.queue.push(queueKey);
      }
    })
  );
}

export function removeFromQueue(
  queueKey: string,
  store: ReturnType<typeof createQueueStore>
) {
  store.setState(
    produce((state: State) => {
      state.queue = state.queue.filter(
        (stateDialog) => stateDialog !== queueKey
      );

      if (state.active === queueKey) {
        state.active = state.queue.shift();
      }
    })
  );
}
