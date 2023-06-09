// Types
type ModifierKey = "cmd" | "option" | "ctrl" | "alt" | "shift";

type RegularKey =
  | "escape"
  | "enter"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export type Key = RegularKey | ModifierKey;

type KeyCombination =
  | RegularKey
  | `${ModifierKey}+${RegularKey}`
  | `${ModifierKey}+${ModifierKey}+${RegularKey}`;

export type Shortcut =
  | KeyCombination
  | { pc: KeyCombination; mac: KeyCombination };

// Helper functions
export function isMac() {
  return (
    typeof window !== "undefined" && window.navigator.platform === "MacIntel"
  );
}

export function getKeyCombination(shortcut: Shortcut): KeyCombination {
  switch (typeof shortcut) {
    case "string":
      return shortcut;
    case "object":
      return isMac() ? shortcut.mac : shortcut.pc;
  }
}

export function getKeys(shortcut: Shortcut): Key[] {
  return getKeyCombination(shortcut).split("+") as Key[];
}

export function createShortcutListener(
  shortcut: Shortcut,
  callback: () => void
) {
  const keys = getKeys(shortcut);

  const isPressed = (event: KeyboardEvent) => (key: Key) => {
    switch (key) {
      case "cmd":
        return event.metaKey;
      case "ctrl":
        return event.ctrlKey;
      case "option":
      case "alt":
        return event.altKey;
      case "shift":
        return event.shiftKey;
      default:
        // non-modifier keys
        return key === event.key.toLowerCase();
    }
  };

  return (event: KeyboardEvent) => {
    if (keys.every(isPressed(event))) {
      callback();
    }
  };
}
