import { useEffect } from "react";

let shortcuts: Array<{
  element: HTMLElement;
  keyCombo: string;
}> = [];

/*
 * This hook lets you assign a hotkey/shortcut to an element, so that when
 * the key combination is pressed, the element is focused (if it is a form
 * field), or clicked otherwise.
 *
 * It is based on [@github/hotkey](https://github.com/github/hotkey).
 */
export function useHotkey(element: HTMLElement | null, keyCombo: string) {
  useEffect(() => {
    if (!element) {
      return;
    }

    const shortcut = { element, keyCombo };
    shortcuts.push(shortcut);

    if (shortcuts.length === 1) {
      // First shortcut, add listener
      window.addEventListener("keydown", keyDownHandler);
    }

    return () => {
      shortcuts = shortcuts.filter((s) => s !== shortcut);

      if (shortcuts.length === 0) {
        // No shortcuts, remove listener
        window.removeEventListener("keydown", keyDownHandler);
      }
    };
  }, [element, keyCombo]);
}

const keyDownHandler = (event: KeyboardEvent) => {
  if (event.defaultPrevented) {
    return;
  }
  if (event.target instanceof Node && isFormField(event.target)) {
    return;
  }

  shortcuts.forEach((shortcut) => {
    const { element } = shortcut;
    let { keyCombo } = shortcut;

    if (keyCombo.includes("Control+")) {
      if (!event.ctrlKey) {
        return;
      }
      keyCombo = keyCombo.replace("Control+", "");
    }

    if (keyCombo.includes("Command+")) {
      if (!event.metaKey) {
        return;
      }
      keyCombo = keyCombo.replace("Command+", "");
    }

    if (event.key === keyCombo) {
      fireDeterminedAction(element);
      event.preventDefault();
    }
  });
};

function fireDeterminedAction(element: HTMLElement): void {
  if (isFormField(element)) {
    element.focus();
  } else {
    element.click();
  }
}

function isFormField(element: Node): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const name = element.nodeName.toLowerCase();
  const type = (element.getAttribute("type") || "").toLowerCase();
  return (
    name === "select" ||
    name === "textarea" ||
    (name === "input" &&
      type !== "submit" &&
      type !== "reset" &&
      type !== "checkbox" &&
      type !== "radio") ||
    element.isContentEditable
  );
}
