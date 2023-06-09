import createStore from "zustand";
import produce from "immer";

import { Props as NotificationProps } from "components/Notification/Notification";

interface NotificationItem {
  id: number;
  props: NotificationProps;
}

interface State {
  notifications: Array<NotificationItem>;
}

const initialState: State = {
  notifications: [],
};

const store = createStore<State>(() => initialState);
const useStore = store;

const getNotifications = (state: State) => state.notifications;

export function useToastNotifications() {
  return useStore(getNotifications);
}

let i = 0;

export function addToastNotification(props: NotificationProps) {
  store.setState(
    produce((state: State) => {
      state.notifications.push({ id: i++, props });
    })
  );
}

export function removeToastNotification(id: NotificationItem["id"]) {
  store.setState((state: State) => ({
    notifications: state.notifications.filter(
      (remaining) => remaining.id !== id
    ),
  }));
}
